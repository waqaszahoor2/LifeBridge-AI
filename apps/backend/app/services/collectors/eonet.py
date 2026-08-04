from datetime import UTC, datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, text

settings = get_settings()


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not settings.nasa_eonet_enabled:
        return 0
    url = "https://eonet.gsfc.nasa.gov/api/v3/events"
    response = await client.get(url, params={"status": "open", "limit": 100, "days": 30})
    response.raise_for_status()
    created = 0
    for event in response.json().get("events", []):
        geometry = event.get("geometry") or []
        point = geometry[-1] if geometry else {}
        coordinates = point.get("coordinates") or []
        longitude = latitude = None
        if len(coordinates) >= 2 and all(isinstance(v, (int, float)) for v in coordinates[:2]):
            longitude, latitude = coordinates[0], coordinates[1]
        categories = ", ".join(c.get("title", "Event") for c in event.get("categories", []))
        sources = event.get("sources") or []
        source_url = sources[0].get("url") if sources else event.get("link", url)
        created += int(upsert_feed_item(db, {
            "external_id": f"eonet-{event.get('id')}",
            "category": "disaster",
            "title": text(event.get("title") or "Natural event", 250),
            "summary": text(event.get("description") or f"Open natural-event record. Categories: {categories}."),
            "source_name": "NASA EONET",
            "source_url": source_url or url,
            "published_at": parse_datetime(point.get("date"), datetime.now(UTC)),
            "location": "Global",
            "latitude": latitude,
            "longitude": longitude,
            "tags": categories.lower().replace(", ", ";"),
            "severity": "medium",
            "verification_status": "verified",
            "source_reliability": 0.95,
            "raw_json": event,
        }))
    db.commit()
    return created
