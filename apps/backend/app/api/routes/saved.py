from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import FeedItem, SavedItem, User
from app.schemas import FeedItemOut, SaveItemRequest

router = APIRouter(prefix="/saved", tags=["saved"])


@router.get("", response_model=list[FeedItemOut])
def list_saved(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(FeedItem)
        .join(SavedItem, SavedItem.feed_item_id == FeedItem.id)
        .where(SavedItem.user_id == user.id)
        .order_by(SavedItem.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.post("", status_code=201)
def save_item(payload: SaveItemRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.get(FeedItem, payload.feed_item_id):
        raise HTTPException(status_code=404, detail="Feed item not found")
    db.add(SavedItem(user_id=user.id, feed_item_id=payload.feed_item_id, reminder_at=payload.reminder_at))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Item already saved")
    return {"saved": True}


@router.delete("/{feed_item_id}", status_code=204)
def remove_saved(feed_item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(SavedItem).where(SavedItem.user_id == user.id, SavedItem.feed_item_id == feed_item_id))
    if item:
        db.delete(item)
        db.commit()
    return Response(status_code=204)
