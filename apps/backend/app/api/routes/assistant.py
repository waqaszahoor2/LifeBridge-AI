import time
from collections import defaultdict
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import SkillRoadmap
from app.schemas import AssistantChatRequest, AssistantChatResponse, AssistantHealthResponse, ChatMessage
from app.services.groq_service import call_groq_chat

router = APIRouter(prefix="/assistant", tags=["assistant"])

# In-memory sliding window rate limiter: client_ip -> list of timestamps
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 30
request_history: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(client_ip: str):
    now = time.time()
    timestamps = request_history[client_ip]
    # Filter out timestamps outside window
    request_history[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="The assistant has reached its temporary usage limit. Please wait a moment and try again.",
        )
    request_history[client_ip].append(now)


@router.get("/health", response_model=AssistantHealthResponse)
def assistant_health():
    """Health check for assistant service configuration without exposing secrets."""
    settings = get_settings()
    has_key = bool(settings.groq_api_key and settings.groq_api_key.strip() != "PASTE_KEY_HERE" and not settings.groq_api_key.startswith("your_"))
    return AssistantHealthResponse(
        status="ready" if has_key else "demo",
        provider="groq",
        model_configured=bool(settings.groq_model),
        api_key_configured=has_key,
    )


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
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
            conversation_id=result.get("conversation_id", "conv_default"),
            provider=result.get("provider", "Groq AI"),
            citations=result.get("citations", []),
            disclaimer=result.get("disclaimer", "AI guidance is for informational purposes. Verify important decisions."),
            status=result.get("status", "success"),
        )
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"We could not connect to the assistant. Please check server configuration and try again. ({str(err)})",
        )
