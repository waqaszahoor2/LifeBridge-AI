import time
from collections import defaultdict
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import SkillRoadmap
from app.schemas import AssistantChatRequest, AssistantChatResponse
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
            detail="Rate limit exceeded. Please wait a minute before sending more chat messages.",
        )
    request_history[client_ip].append(now)


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(payload: AssistantChatRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_rate_limit(client_ip)

    roadmap_context = None
    if payload.roadmap_id:
        roadmap = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == payload.roadmap_id).first()
        if roadmap:
            roadmap_context = f"Skill: {roadmap.primary_skill}, Target Role: {roadmap.target_role}, Current Phase: {roadmap.current_phase_number}"

    messages_data = [msg.model_dump() for msg in payload.messages]

    try:
        result = call_groq_chat(
            messages=messages_data,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            roadmap_context=roadmap_context,
        )
        return AssistantChatResponse(
            reply=result["reply"],
            model_used=result["model_used"],
            provider=result.get("provider", "Groq AI"),
            citations=result.get("citations", []),
            disclaimer=result.get("disclaimer", "AI guidance may contain mistakes. Verify important decisions."),
            status=result.get("status", "success"),
        )
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Assistant chat completion failed: {str(err)}",
        )
