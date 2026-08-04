from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, desc, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import FeedItem
from app.schemas import FeedItemOut, RecommendationOut, RecommendationRequest
from app.services.recommendation import score_item

router = APIRouter(tags=["feed"])


@router.get("/feed", response_model=list[FeedItemOut])
def get_feed(
    category: str | None = None,
    search: str | None = Query(default=None, max_length=100),
    location: str | None = Query(default=None, max_length=100),
    verified_only: bool = False,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0, le=5000),
    db: Session = Depends(get_db),
):
    urgency = case(
        (FeedItem.severity == "critical", 4),
        (FeedItem.severity == "high", 3),
        (FeedItem.severity == "medium", 2),
        else_=1,
    )
    stmt = select(FeedItem).where(FeedItem.is_active.is_(True))
    if category and category != "all":
        stmt = stmt.where(FeedItem.category == category)
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(or_(FeedItem.title.ilike(term), FeedItem.summary.ilike(term), FeedItem.tags.ilike(term)))
    if location:
        stmt = stmt.where(or_(FeedItem.location.ilike(f"%{location.strip()}%"), FeedItem.location.ilike("%Global%")))
    if verified_only:
        stmt = stmt.where(FeedItem.verification_status == "verified")
    stmt = stmt.where(or_(FeedItem.expires_at.is_(None), FeedItem.expires_at >= datetime.now(UTC)))
    stmt = stmt.order_by(desc(urgency), FeedItem.published_at.desc()).offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


@router.get("/feed/{item_id}", response_model=FeedItemOut)
def get_feed_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(FeedItem, item_id)
    if item is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Feed item not found")
    return item


@router.post("/recommendations", response_model=list[RecommendationOut])
def recommendations(payload: RecommendationRequest, db: Session = Depends(get_db)):
    items = db.scalars(select(FeedItem).where(FeedItem.is_active.is_(True))).all()
    ranked = []
    for item in items:
        score, reasons = score_item(item, payload)
        if score > 0:
            ranked.append(RecommendationOut(item=FeedItemOut.model_validate(item), score=score, reasons=reasons))
    ranked.sort(key=lambda value: value.score, reverse=True)
    return ranked[: payload.limit]
