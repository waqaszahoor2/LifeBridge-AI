from datetime import UTC, datetime
import xml.etree.ElementTree as ET

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, stable_id, text

settings = get_settings()
FEED_URL = "https://www.gdacs.org/xml/rss.xml"


def _find(item: ET.Element, name: str) -> str:
    for child in item.iter():
        if child.tag.split("}")[-1].lower() == name.lower():
            return child.text or ""
    return ""


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not settings.gdacs_enabled:
        return 0
    response = await client.get(FEED_URL)
    response.raise_for_status()
    # The GDACS feed is public XML. stdlib parser is sufficient because external entities are not resolved.
    root = ET.fromstring(response.content)
    created = 0
    for item in root.findall(".//item")[:100]:
        title = _find(item, "title") or "GDACS disaster alert"
        link = _find(item, "link") or "https://www.gdacs.org/"
        guid = _find(item, "guid") or stable_id("gdacs", link, title)
        alert_level = (_find(item, "alertlevel") or "green").lower()
        severity = {"red": "critical", "orange": "high", "green": "medium"}.get(alert_level, "medium")
        latitude = _find(item, "point").split(" ")[0] if _find(item, "point") else None
        longitude = _find(item, "point").split(" ")[1] if len(_find(item, "point").split(" ")) > 1 else None
        created += int(upsert_feed_item(db, {
            "external_id": f"gdacs-{stable_id('', guid).replace('--', '')}",
            "category": "disaster",
            "title": text(title, 250),
            "summary": text(_find(item, "description") or f"GDACS {alert_level} alert."),
            "source_name": "GDACS",
            "source_url": link,
            "published_at": parse_datetime(_find(item, "pubDate"), datetime.now(UTC)),
            "location": text(_find(item, "country") or "Global", 180),
            "latitude": float(latitude) if latitude else None,
            "longitude": float(longitude) if longitude else None,
            "tags": ";".join(filter(None, ["disaster", _find(item, "eventtype").lower(), alert_level])),
            "severity": severity,
            "verification_status": "verified",
            "source_reliability": 0.94,
            "raw_json": {"guid": guid, "alert_level": alert_level},
        }))
    db.commit()
    return created
