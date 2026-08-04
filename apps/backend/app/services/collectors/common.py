from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
import hashlib
from typing import Any


def parse_datetime(value: str | None, fallback: datetime | None = None) -> datetime:
    fallback = fallback or datetime.now(UTC)
    if not value:
        return fallback
    cleaned = value.strip()
    try:
        result = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        return result if result.tzinfo else result.replace(tzinfo=UTC)
    except ValueError:
        try:
            result = parsedate_to_datetime(cleaned)
            return result if result.tzinfo else result.replace(tzinfo=UTC)
        except (TypeError, ValueError):
            return fallback


def stable_id(prefix: str, *parts: Any) -> str:
    raw = "|".join(str(part or "") for part in parts)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]
    return f"{prefix}-{digest}"


def text(value: Any, limit: int = 4000) -> str:
    if value is None:
        return ""
    return " ".join(str(value).split())[:limit]
