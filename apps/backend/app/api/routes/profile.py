from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import NotificationToken, SavedItem, User
from app.schemas import UserProfileOut, UserProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserProfileOut)
def read_profile(user: User = Depends(get_current_user)):
    return user


@router.patch("", response_model=UserProfileOut)
def update_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    values = payload.model_dump(exclude_unset=True)
    for field in ("skills", "interests", "preferred_categories", "accessibility_preferences"):
        if field in values and values[field] is not None:
            values[field] = ";".join(value.strip() for value in values[field] if value.strip())
    for key, value in values.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/export")
def export_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.scalars(select(SavedItem).where(SavedItem.user_id == user.id)).all()
    tokens = db.scalars(select(NotificationToken).where(NotificationToken.user_id == user.id)).all()
    return {
        "profile": UserProfileOut.model_validate(user).model_dump(mode="json"),
        "saved_items": [
            {"feed_item_id": item.feed_item_id, "created_at": item.created_at, "reminder_at": item.reminder_at}
            for item in saved
        ],
        "notification_registrations": [
            {"platform": item.platform, "topics": item.topics, "enabled": item.enabled, "created_at": item.created_at}
            for item in tokens
        ],
        "note": "Notification tokens are intentionally omitted from the export.",
    }


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
