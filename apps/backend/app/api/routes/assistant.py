import json
import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.rate_limit import check_rate_limit
from app.models import SkillRoadmap
from app.schemas import AssistantChatRequest, AssistantChatResponse, ChatMessage
from app.services.groq_service import call_groq_chat, stream_groq_chat_async

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])

# Provider verification cache
LAST_VERIFIED_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "verified": False,
    "status": "configuration_missing",
}


@router.get("/health")
def assistant_health():
    """Health check endpoint proving Groq provider configuration and cached verification."""
    settings = get_settings()
    api_key = settings.groq_api_key.strip() if settings.groq_api_key else ""
    model = settings.groq_model or "llama-3.1-8b-instant"
    has_key = bool(api_key and api_key != "PASTE_KEY_HERE" and not api_key.startswith("your_"))
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    now = time.time()
    if has_key and (now - LAST_VERIFIED_CACHE["timestamp"] > 120):
        try:
            from groq import Groq

            client = Groq(api_key=api_key)
            models_page = client.models.list()
            available_models = [m.id for m in getattr(models_page, "data", [])] if hasattr(models_page, "data") else []

            if not available_models:
                LAST_VERIFIED_CACHE["verified"] = False
                LAST_VERIFIED_CACHE["status"] = "verification_unknown"
            elif model in available_models:
                LAST_VERIFIED_CACHE["verified"] = True
                LAST_VERIFIED_CACHE["status"] = "ready"
            else:
                LAST_VERIFIED_CACHE["verified"] = False
                LAST_VERIFIED_CACHE["status"] = "verification_failed"

            LAST_VERIFIED_CACHE["timestamp"] = now
        except Exception as err:
            logger.warning(f"Groq health check verification failed: {type(err).__name__}")
            LAST_VERIFIED_CACHE["verified"] = False
            LAST_VERIFIED_CACHE["status"] = "verification_failed"
            LAST_VERIFIED_CACHE["timestamp"] = now

    last_verified = (
        time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(LAST_VERIFIED_CACHE["timestamp"]))
        if LAST_VERIFIED_CACHE["timestamp"] > 0
        else None
    )

    if not has_key:
        if settings.assistant_demo_mode:
            current_status = "demo"
            provider = "local_demo"
        else:
            current_status = "configuration_missing"
            provider = "unavailable"
        is_ready = False
    else:
        current_status = LAST_VERIFIED_CACHE.get("status", "verification_unknown")
        is_ready = current_status == "ready"
        if is_ready:
            provider = "groq"
        elif current_status in ["verification_failed", "verification_unknown"]:
            provider = "groq"
        else:
            provider = "unavailable"

    return {
        "status": current_status,
        "provider": provider,
        "configured": has_key,
        "provider_verified": is_ready,
        "model": model if has_key else ("local_demo_engine" if settings.assistant_demo_mode else "none"),
        "request_id": req_id,
        "verified_at": last_verified,
        "verification_ttl_seconds": 120,
        "last_verified_at": last_verified,
    }


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    check_rate_limit(request, limit_type="chat")

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == payload.roadmap_id).first()
        if roadmap:
            roadmap_context = f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}, Phase: {roadmap.current_phase_number}"

    messages_data = [msg.model_dump() for msg in payload.messages]

    try:
        start_t = time.time()
        result = call_groq_chat(
            messages=messages_data,
            mode=payload.mode,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            roadmap_context=roadmap_context,
        )
        duration_ms = int((time.time() - start_t) * 1000)
        logger.info(f"Chat request processed successfully: provider={result.get('provider')}, model={result.get('model')}, duration={duration_ms}ms")
        return AssistantChatResponse(
            message=ChatMessage(
                role=result["message"]["role"],
                content=result["message"]["content"],
            ),
            reply=result["reply"],
            model=result.get("model", "llama-3.1-8b-instant"),
            model_used=result.get("model_used", "llama-3.1-8b-instant"),
            conversation_id=result.get("conversation_id", f"conv_{uuid.uuid4().hex[:8]}"),
            provider=result.get("provider", "groq"),
            citations=result.get("citations", []),
            disclaimer=result.get("disclaimer", "AI guidance is for informational purposes. Verify important decisions independently."),
            status=result.get("status", "success"),
        )
    except HTTPException:
        raise
    except Exception as err:
        request_id = f"req_{uuid.uuid4().hex[:8]}"
        logger.error(f"[Req {request_id}] Backend chat error: {type(err).__name__}")
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "ASSISTANT_SERVICE_ERROR",
                "message": "The AI assistant service encountered an error while processing your request. Please try again.",
                "request_id": request_id,
            },
        )


@router.post("/chat/stream")
async def assistant_chat_stream(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    """Streaming response endpoint delivering real-time non-blocking SSE tokens directly from Groq."""
    check_rate_limit(request, limit_type="stream")

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == payload.roadmap_id).first()
        if roadmap:
            roadmap_context = f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}"

    messages_data = [msg.model_dump() for msg in payload.messages]
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    async def event_generator():
        stream_aiter = stream_groq_chat_async(
            messages=messages_data,
            mode=payload.mode,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            roadmap_context=roadmap_context,
            request_id=req_id,
        ).__aiter__()

        try:
            while True:
                if await request.is_disconnected():
                    logger.info(f"[Req {req_id}] Client disconnected before fetching next token. Halting stream.")
                    break

                fetch_task = asyncio.create_task(stream_aiter.__anext__())
                disconnect_task = asyncio.create_task(request.is_disconnected())

                done, pending = await asyncio.wait(
                    [fetch_task, disconnect_task],
                    return_when=asyncio.FIRST_COMPLETED
                )

                if disconnect_task in done and disconnect_task.result():
                    logger.info(f"[Req {req_id}] Client disconnect detected during token fetch. Cancelling stream.")
                    fetch_task.cancel()
                    break

                if not disconnect_task.done():
                    disconnect_task.cancel()

                try:
                    event = await fetch_task
                    yield f"data: {json.dumps(event)}\n\n"
                except StopAsyncIteration:
                    break
        except Exception as err:
            logger.error(f"[Req {req_id}] Generator error: {type(err).__name__}")
            err_data = {
                "type": "error",
                "message": "The live AI assistant stream is temporarily unavailable.",
                "request_id": req_id,
            }
            yield f"data: {json.dumps(err_data)}\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)
