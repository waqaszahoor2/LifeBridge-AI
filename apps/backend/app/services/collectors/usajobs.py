from datetime import UTC, datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, text

settings = get_settings()


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not (settings.usajobs_enabled and settings.usajobs_api_key and settings.usajobs_user_agent_email):
        return 0
    url = "https://data.usajobs.gov/api/search"
    headers = {
        "Authorization-Key": settings.usajobs_api_key,
        "User-Agent": settings.usajobs_user_agent_email,
        "Host": "data.usajobs.gov",
    }
    response = await client.get(url, headers=headers, params={"ResultsPerPage": 100, "SortField": "opendate"})
    response.raise_for_status()
    created = 0
    for result in response.json().get("SearchResult", {}).get("SearchResultItems", []):
        descriptor = result.get("MatchedObjectDescriptor", {})
        details = descriptor.get("UserArea", {}).get("Details", {})
        locations = descriptor.get("PositionLocation", [])
        location = ", ".join(loc.get("LocationName", "") for loc in locations if loc.get("LocationName"))[:180]
        salary = descriptor.get("PositionRemuneration", [])
        salary_text = ""
        if salary:
            salary_text = f"{salary[0].get('MinimumRange', '')}–{salary[0].get('MaximumRange', '')} {salary[0].get('Description', '')}"[:120]
        created += int(upsert_feed_item(db, {
            "external_id": f"usajobs-{descriptor.get('PositionID') or result.get('MatchedObjectId')}",
            "category": "job",
            "title": text(descriptor.get("PositionTitle") or "Government opportunity", 250),
            "summary": text(details.get("JobSummary") or descriptor.get("OrganizationName") or "USAJOBS vacancy"),
            "source_name": "USAJOBS",
            "source_url": descriptor.get("PositionURI") or "https://www.usajobs.gov/",
            "published_at": parse_datetime(descriptor.get("PublicationStartDate"), datetime.now(UTC)),
            "expires_at": parse_datetime(descriptor.get("ApplicationCloseDate")) if descriptor.get("ApplicationCloseDate") else None,
            "location": location or "United States",
            "country_code": "US",
            "tags": "government;job;career;" + text(descriptor.get("JobCategory", [{}])[0].get("Name", ""), 100).lower(),
            "employment_type": ", ".join(item.get("Name", "") for item in descriptor.get("PositionSchedule", []))[:80],
            "salary_text": salary_text,
            "severity": "low",
            "verification_status": "verified",
            "source_reliability": 0.96,
            "raw_json": descriptor,
        }))
    db.commit()
    return created
