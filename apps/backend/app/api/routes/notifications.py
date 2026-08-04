from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_user
from app.models import NotificationToken, User
from app.schemas import NotificationTokenCreate

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/tokens", status_code=201)
def register_token(
    payload: NotificationTokenCreate,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    existing = db.scalar(select(NotificationToken).where(NotificationToken.token == payload.token))
    if existing:
        existing.last_seen_at = datetime.now(UTC)
        existing.enabled = True
        existing.topics = ";".join(payload.topics)
        if user:
            existing.user_id = user.id
    else:
        db.add(NotificationToken(
            user_id=user.id if user else None,
            token=payload.token,
            platform=payload.platform,
            topics=";".join(payload.topics),
        ))
    db.commit()
    return {"registered": True}
