import json
import logging
import time
import uuid
from collections import defaultdict
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import SkillRoadmap
from app.schemas import AssistantChatRequest, AssistantChatResponse, AssistantHealthResponse, ChatMessage
from app.services.groq_service import call_groq_chat

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])

# Sliding window rate limiter
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 30
request_history: Dict[str, List[float]] = defaultdict(list)


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


@router.get("/health", response_model=AssistantHealthResponse)
def assistant_health():
    """Health check for assistant service configuration without exposing secrets."""
    settings = get_settings()
    has_key = bool(settings.groq_api_key and settings.groq_api_key.strip() != "PASTE_KEY_HERE" and not settings.groq_api_key.startswith("your_"))
    return AssistantHealthResponse(
        status="ready" if has_key else "demo",
        provider="groq" if has_key else "local_demo",
        model_configured=bool(settings.groq_model),
        api_key_configured=has_key,
    )


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
        result = call_groq_chat(
            messages=messages_data,
            mode=payload.mode,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            roadmap_context=roadmap_context,
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
        logger.error(f"[Req {request_id}] Backend chat error: {err}")
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "ASSISTANT_SERVICE_ERROR",
                "message": "The AI assistant service encountered an error while processing your request. Please try again.",
                "request_id": request_id,
            },
        )


@router.post("/chat/stream")
def assistant_chat_stream(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    """Streaming response endpoint returning real-time SSE tokens."""
    client_ip = get_client_ip(request)
    check_rate_limit(client_ip)

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == payload.roadmap_id).first()
        if roadmap:
            roadmap_context = f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}"

    messages_data = [msg.model_dump() for msg in payload.messages]

    def event_generator():
        try:
            result = call_groq_chat(
                messages=messages_data,
                mode=payload.mode,
                temperature=payload.temperature,
                max_tokens=payload.max_tokens,
                roadmap_context=roadmap_context,
            )
            reply_text = result.get("reply", "")
            provider = result.get("provider", "groq")
            status = result.get("status", "success")

            # Stream metadata header
            meta = {
                "type": "meta",
                "provider": provider,
                "status": status,
                "model": result.get("model", "llama-3.1-8b-instant"),
                "citations": result.get("citations", []),
            }
            yield f"data: {json.dumps(meta)}\n\n"

            # Stream text in progressive chunks
            chunk_size = 15
            for i in range(0, len(reply_text), chunk_size):
                chunk = reply_text[i : i + chunk_size]
                chunk_data = {"type": "token", "content": chunk}
                yield f"data: {json.dumps(chunk_data)}\n\n"
                time.sleep(0.02)

            # Stream done signal
            yield "data: {\"type\": \"done\"}\n\n"

        except Exception as err:
            req_id = f"req_{uuid.uuid4().hex[:8]}"
            logger.error(f"[Stream Req {req_id}] Error: {err}")
            err_data = {
                "type": "error",
                "message": "The live AI assistant is temporarily unavailable.",
                "request_id": req_id,
            }
            yield f"data: {json.dumps(err_data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
