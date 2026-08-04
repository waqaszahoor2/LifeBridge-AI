from datetime import UTC, datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, stable_id, text

settings = get_settings()


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not (settings.reliefweb_enabled and settings.reliefweb_app_name):
        return 0
    url = "https://api.reliefweb.int/v2/reports"
    params = {
        "appname": settings.reliefweb_app_name,
        "limit": 100,
        "sort[]": "date:desc",
        "fields[include][]": ["title", "url", "date.created", "date.original", "country", "disaster", "source", "body-html"],
        "filter[field]": "date.created",
        "filter[value][from]": "now-7days",
    }
    response = await client.get(url, params=params)
    response.raise_for_status()
    created = 0
    for entry in response.json().get("data", []):
        fields = entry.get("fields", {})
        countries = ", ".join(item.get("name", "") for item in fields.get("country", []))[:180] or "Global"
        disasters = ", ".join(item.get("name", "") for item in fields.get("disaster", []))
        source_names = ", ".join(item.get("name", "") for item in fields.get("source", []))[:180]
        created += int(upsert_feed_item(db, {
            "external_id": f"reliefweb-{entry.get('id') or stable_id('rw', fields.get('url'), fields.get('title'))}",
            "category": "disaster",
            "title": text(fields.get("title") or "Humanitarian update", 250),
            "summary": text(fields.get("body-html") or f"Humanitarian report. Disaster: {disasters}"),
            "source_name": source_names or "ReliefWeb",
            "source_url": fields.get("url") or "https://reliefweb.int/",
            "published_at": parse_datetime((fields.get("date") or {}).get("original") or (fields.get("date") or {}).get("created"), datetime.now(UTC)),
            "location": countries,
            "tags": ("humanitarian;report;" + disasters.lower().replace(", ", ";"))[:1000],
            "severity": "medium",
            "verification_status": "verified",
            "source_reliability": 0.94,
            "raw_json": fields,
        }))
    db.commit()
    return created
