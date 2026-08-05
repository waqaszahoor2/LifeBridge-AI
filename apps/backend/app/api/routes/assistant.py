import json
import logging
import time
import uuid
from collections import defaultdict
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import SkillRoadmap
from app.schemas import AssistantChatRequest, AssistantChatResponse, ChatMessage
from app.services.groq_service import call_groq_chat, stream_groq_chat_async

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])

# Sliding window rate limiter
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 30
request_history: Dict[str, List[float]] = defaultdict(list)

# Provider verification cache
LAST_VERIFIED_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "verified": False,
}


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(client_ip: str):
    now = time.time()
    timestamps = request_history[client_ip]
    request_history[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="The assistant has reached its usage rate limit. Please wait 60 seconds and try again.",
        )
    request_history[client_ip].append(now)


@router.get("/health")
def assistant_health():
    """Health check endpoint proving Groq provider configuration and cached verification."""
    settings = get_settings()
    api_key = settings.groq_api_key.strip() if settings.groq_api_key else ""
    model = settings.groq_model or "llama-3.1-8b-instant"
    has_key = bool(api_key and api_key != "PASTE_KEY_HERE" and not api_key.startswith("your_"))

    now = time.time()
    if has_key and (now - LAST_VERIFIED_CACHE["timestamp"] > 120):
        try:
            from groq import Groq

            client = Groq(api_key=api_key)
            models_page = client.models.list()
            available_models = [m.id for m in getattr(models_page, "data", [])] if hasattr(models_page, "data") else []
            model_exists = model in available_models if available_models else True

            LAST_VERIFIED_CACHE["verified"] = model_exists
            LAST_VERIFIED_CACHE["timestamp"] = now
        except Exception as err:
            logger.warning(f"Groq health check verification failed: {type(err).__name__}")
            LAST_VERIFIED_CACHE["verified"] = False
            LAST_VERIFIED_CACHE["timestamp"] = now

    last_verified = (
        time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(LAST_VERIFIED_CACHE["timestamp"]))
        if LAST_VERIFIED_CACHE["timestamp"] > 0
        else None
    )

    is_ready = has_key and LAST_VERIFIED_CACHE.get("verified", False)

    return {
        "status": "ready" if is_ready else "demo",
        "provider": "groq" if is_ready else "local_demo",
        "configured": has_key,
        "provider_verified": LAST_VERIFIED_CACHE.get("verified", False) if has_key else False,
        "model": model,
        "last_verified_at": last_verified,
    }


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)
    check_rate_limit(client_ip)

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
    client_ip = get_client_ip(request)
    check_rate_limit(client_ip)

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == payload.roadmap_id).first()
        if roadmap:
            roadmap_context = f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}"

    messages_data = [msg.model_dump() for msg in payload.messages]
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    async def event_generator():
        try:
            stream = stream_groq_chat_async(
                messages=messages_data,
                mode=payload.mode,
                temperature=payload.temperature,
                max_tokens=payload.max_tokens,
                roadmap_context=roadmap_context,
                request_id=req_id,
            )

            async for event in stream:
                if await request.is_disconnected():
                    logger.info(f"[Req {req_id}] Client disconnected during SSE stream. Stopping generator.")
                    break
                yield f"data: {json.dumps(event)}\n\n"

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
