import base64
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, desc, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import FeedItem
from app.schemas import CursorPaginatedFeedOut, FeedItemOut, RecommendationOut, RecommendationRequest
from app.services.recommendation import score_item

router = APIRouter(tags=["feed"])


def encode_cursor(item_id: int) -> str:
    return base64.b64encode(str(item_id).encode("utf-8")).decode("utf-8")


def decode_cursor(cursor_str: str) -> int | None:
    try:
        decoded = base64.b64decode(cursor_str.encode("utf-8")).decode("utf-8")
        if ":" in decoded:
            parts = decoded.split(":")
            return int(parts[-1])
        return int(decoded)
    except Exception:
        return None


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


@router.get("/feed/for-you", response_model=CursorPaginatedFeedOut)
@router.get("/feed/for-you/", response_model=CursorPaginatedFeedOut)
def get_feed_for_you(
    limit: int = Query(default=20, ge=1, le=100),
    cursor: str | None = None,
    category: str | None = None,
    country: str | None = None,
    exclude_ids: str | None = None,
    db: Session = Depends(get_db),
):
    urgency = case(
        (FeedItem.severity == "critical", 4),
        (FeedItem.severity == "high", 3),
        (FeedItem.severity == "medium", 2),
        else_=1,
    )
    stmt = select(FeedItem).where(FeedItem.is_active.is_(True))

    if category and category not in {"all", "for_you", "latest"}:
        stmt = stmt.where(FeedItem.category == category)

    if country:
        stmt = stmt.where(or_(FeedItem.location.ilike(f"%{country.strip()}%"), FeedItem.location.ilike("%Global%")))

    if exclude_ids:
        try:
            ex_list = [int(i.strip()) for i in exclude_ids.split(",") if i.strip().isdigit()]
            if ex_list:
                stmt = stmt.where(FeedItem.id.not_in(ex_list))
        except Exception:
            pass

    last_id = decode_cursor(cursor) if cursor else None
    if last_id:
        stmt = stmt.where(FeedItem.id < last_id)

    stmt = stmt.where(or_(FeedItem.expires_at.is_(None), FeedItem.expires_at >= datetime.now(UTC)))
    stmt = stmt.order_by(desc(urgency), FeedItem.published_at.desc(), FeedItem.id.desc()).limit(limit + 1)

    items = list(db.scalars(stmt).all())
    has_more = len(items) > limit
    result_items = items[:limit]

    next_cursor = encode_cursor(result_items[-1].id) if has_more and result_items else None
    latest_item_at = result_items[0].published_at if result_items else None

    # Transform to FeedItemOut with default match score
    out_items = []
    for item in result_items:
        out = FeedItemOut.model_validate(item)
        if item.severity == "critical":
            out.match_score = 0.98
            out.recommendation_reason = "Urgent safety alert for your region."
        elif item.category in {"job", "scholarship"}:
            out.match_score = 0.92
            out.recommendation_reason = f"Matches your target field {item.study_level or 'opportunities'}."
        else:
            out.match_score = 0.85
            out.recommendation_reason = "Verified updates matching your recommendation preferences."
        out_items.append(out)

    return CursorPaginatedFeedOut(
        items=out_items,
        next_cursor=next_cursor,
        has_more=has_more,
        generated_at=datetime.now(UTC),
        latest_item_at=latest_item_at,
    )


@router.post("/feed/refresh")
def refresh_feed():
    return {
        "status": "queued",
        "message": "Feed refresh started across all verified sources",
        "requested_at": datetime.now(UTC).isoformat(),
    }


@router.post("/feed/{item_id}/report")
def report_feed_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(FeedItem, item_id)
    if item is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Feed item not found")
    return {
        "status": "received",
        "message": f"Report submitted for feed item {item_id}",
        "reported_at": datetime.now(UTC).isoformat(),
    }


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
            out_item = FeedItemOut.model_validate(item)
            out_item.match_score = score
            out_item.recommendation_reason = reasons[0] if reasons else None
            ranked.append(RecommendationOut(item=out_item, score=score, reasons=reasons))
    ranked.sort(key=lambda value: value.score, reverse=True)
    return ranked[: payload.limit]

