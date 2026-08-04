import hashlib
import re
from datetime import datetime, UTC
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models import FeedItem


def normalize_title(title: str) -> str:
    """Normalize title for fuzzy deduplication."""
    if not title:
        return ""
    cleaned = re.sub(r"[^\w\s]", "", title.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def compute_content_hash(
    title: str,
    source_name: str,
    canonical_url: str | None = None,
    published_at: datetime | str | None = None,
) -> str:
    """Generate deterministic SHA256 content hash for duplicate identification."""
    norm_title = normalize_title(title)
    norm_source = (source_name or "").strip().lower()
    norm_url = (canonical_url or "").strip().lower()

    if isinstance(published_at, datetime):
        pub_str = published_at.strftime("%Y-%m-%d")
    elif isinstance(published_at, str):
        pub_str = published_at[:10]
    else:
        pub_str = ""

    payload = f"{norm_title}|{norm_source}|{norm_url}|{pub_str}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def find_duplicate_item(
    db: Session,
    external_id: str,
    content_hash: str | None = None,
    canonical_url: str | None = None,
) -> FeedItem | None:
    """Check database for existing item matching external_id, content_hash or canonical_url."""
    # Check by external_id first
    item = db.scalar(select(FeedItem).where(FeedItem.external_id == external_id))
    if item:
        return item

    # Check by content_hash
    if content_hash:
        item = db.scalar(select(FeedItem).where(FeedItem.content_hash == content_hash))
        if item:
            return item

    # Check by canonical_url if present and not empty
    if canonical_url and len(canonical_url.strip()) > 10:
        item = db.scalar(
            select(FeedItem).where(
                FeedItem.canonical_url == canonical_url.strip(),
                FeedItem.canonical_url.is_not(None),
            )
        )
        if item:
            return item

    return None
