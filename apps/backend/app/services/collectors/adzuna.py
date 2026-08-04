from datetime import UTC, datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, text

settings = get_settings()


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not (settings.adzuna_enabled and settings.adzuna_app_id and settings.adzuna_app_key):
        return 0
    url = f"https://api.adzuna.com/v1/api/jobs/{settings.adzuna_country}/search/1"
    response = await client.get(url, params={
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "results_per_page": 100,
        "sort_by": "date",
        "content-type": "application/json",
    })
    response.raise_for_status()
    created = 0
    for item in response.json().get("results", []):
        company = (item.get("company") or {}).get("display_name", "")
        location = (item.get("location") or {}).get("display_name", "Remote/Global")
        salary_min, salary_max = item.get("salary_min"), item.get("salary_max")
        salary = ""
        if salary_min or salary_max:
            salary = f"{salary_min or ''}–{salary_max or ''}".strip("–")
        created += int(upsert_feed_item(db, {
            "external_id": f"adzuna-{item.get('id')}",
            "category": "job",
            "title": text(item.get("title") or "Job opportunity", 250),
            "summary": text(item.get("description") or company or "Adzuna job listing"),
            "source_name": f"Adzuna / {company}"[:180],
            "source_url": item.get("redirect_url") or "https://www.adzuna.com/",
            "published_at": parse_datetime(item.get("created"), datetime.now(UTC)),
            "location": text(location, 180),
            "tags": "job;career;" + text((item.get("category") or {}).get("label", ""), 200).lower(),
            "salary_text": salary[:120],
            "severity": "low",
            "verification_status": "verified",
            "source_reliability": 0.82,
            "raw_json": item,
        }))
    db.commit()
    return created
