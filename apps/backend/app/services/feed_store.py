from datetime import UTC, datetime
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import FeedItem


def upsert_feed_item(db: Session, payload: dict) -> bool:
    """Insert or update a normalized feed item. Returns True only for new records."""
    existing = db.scalar(select(FeedItem).where(FeedItem.external_id == payload["external_id"]))
    now = datetime.now(UTC)
    raw = payload.pop("raw_json", None)
    if raw is not None and not isinstance(raw, str):
        payload["raw_json"] = json.dumps(raw, ensure_ascii=False, default=str)[:20000]
    if existing:
        for key, value in payload.items():
            if key != "external_id" and hasattr(existing, key):
                setattr(existing, key, value)
        existing.last_checked_at = now
        existing.updated_at = now
        return False
    payload.setdefault("collected_at", now)
    payload.setdefault("last_checked_at", now)
    payload.setdefault("updated_at", now)
    db.add(FeedItem(**payload))
    return True
