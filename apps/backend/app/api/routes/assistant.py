import asyncio
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
from app.services.groq_service import (
    call_groq_chat,
    stream_groq_chat_async,
    map_error_to_safe_code,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])

# ---------------------------------------------------------------------------
# Process-local provider verification cache (TTL = 120 s).
# In a multi-process deployment this is per-worker; the Redis-backed health
# cache is the authoritative shared state.  This dict only accelerates
# single-worker lookups.
# ---------------------------------------------------------------------------
LAST_VERIFIED_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "verified": False,
    "status": "configuration_missing",
}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

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
            available_models = (
                [m.id for m in getattr(models_page, "data", [])]
                if hasattr(models_page, "data")
                else []
            )

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


# ---------------------------------------------------------------------------
# Non-streaming chat
# ---------------------------------------------------------------------------

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
        logger.info(
            f"Chat request processed: provider={result.get('provider')}, "
            f"model={result.get('model')}, duration={duration_ms}ms"
        )
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


# ---------------------------------------------------------------------------
# Streaming chat — continuous disconnect watcher
# ---------------------------------------------------------------------------

@router.post("/chat/stream")
async def assistant_chat_stream(
    payload: AssistantChatRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Streaming SSE endpoint: meta → token… → done.

    Implements a continuous disconnect watcher that races every Groq token
    fetch against a fresh is_disconnected() check so the watcher remains
    active for the entire stream lifetime.
    """
    check_rate_limit(request, limit_type="stream")

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = (
            db.query(SkillRoadmap)
            .filter(SkillRoadmap.roadmap_id == payload.roadmap_id)
            .first()
        )
        if roadmap:
            roadmap_context = (
                f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}"
            )

    messages_data = [msg.model_dump() for msg in payload.messages]
    req_id = f"req_{uuid.uuid4().hex[:8]}"

    async def event_generator():
        # Obtain the async generator from groq_service
        groq_gen = stream_groq_chat_async(
            messages=messages_data,
            mode=payload.mode,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            roadmap_context=roadmap_context,
            request_id=req_id,
        )
        stream_aiter = groq_gen.__aiter__()

        # Active tasks set — always cleaned up in `finally`
        active_tasks: List[asyncio.Task] = []

        try:
            while True:
                # -----------------------------------------------------------------
                # Race: next Groq event  vs  client disconnect check.
                # A FRESH disconnect task is created on every iteration so the
                # watcher is continuous for the entire stream lifetime.
                # -----------------------------------------------------------------
                fetch_task = asyncio.create_task(stream_aiter.__anext__(), name="fetch")
                disconnect_task = asyncio.create_task(
                    request.is_disconnected(), name="disconnect"
                )
                active_tasks = [fetch_task, disconnect_task]

                done, pending = await asyncio.wait(
                    active_tasks,
                    return_when=asyncio.FIRST_COMPLETED,
                )

                # Cancel all tasks still pending
                for t in pending:
                    t.cancel()
                # Await cancellations so no "task destroyed but pending" warnings
                if pending:
                    await asyncio.gather(*pending, return_exceptions=True)
                active_tasks = []

                # --- Check disconnect first ---
                if disconnect_task in done:
                    try:
                        disconnected = disconnect_task.result()
                    except Exception:
                        disconnected = False

                    if disconnected:
                        logger.info(
                            f"[Req {req_id}] Client disconnect detected during stream. Halting."
                        )
                        # Cancel the fetch task if it also completed (rare race)
                        if fetch_task in done:
                            pass  # already done, result ignored
                        return  # Generator exits; no 'done' event emitted

                # --- Process the Groq event ---
                if fetch_task in done:
                    try:
                        event = fetch_task.result()
                    except StopAsyncIteration:
                        # Stream exhausted cleanly — done event was already yielded
                        # by stream_groq_chat_async; nothing more to do
                        return
                    except Exception as fetch_err:
                        safe_code, safe_msg = map_error_to_safe_code(fetch_err)
                        err_data = {
                            "type": "error",
                            "code": safe_code,
                            "message": safe_msg,
                            "request_id": req_id,
                        }
                        yield f"data: {json.dumps(err_data)}\n\n"
                        return

                    yield f"data: {json.dumps(event)}\n\n"

                    # If this was the 'done' or 'error' sentinel, stop the loop
                    if isinstance(event, dict) and event.get("type") in ("done", "error"):
                        return

        except Exception as outer_err:
            logger.error(f"[Req {req_id}] Generator outer error: {type(outer_err).__name__}")
            safe_code, safe_msg = map_error_to_safe_code(outer_err)
            err_data = {
                "type": "error",
                "code": safe_code,
                "message": safe_msg,
                "request_id": req_id,
            }
            try:
                yield f"data: {json.dumps(err_data)}\n\n"
            except Exception:
                pass
        finally:
            # Cancel and await any tasks that might still be running
            for t in active_tasks:
                if not t.done():
                    t.cancel()
            if active_tasks:
                await asyncio.gather(*active_tasks, return_exceptions=True)

            # Close the async generator explicitly
            if hasattr(groq_gen, "aclose"):
                try:
                    await groq_gen.aclose()
                except Exception:
                    pass

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)
