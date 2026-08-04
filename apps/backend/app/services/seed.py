import csv
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import FeedItem

settings = get_settings()


def parse_dt(value: str):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def seed_if_empty(db: Session) -> int:
    if db.scalar(select(func.count()).select_from(FeedItem)):
        return 0
    path = settings.seed_csv_path
    if not path.exists():
        return 0
    created = 0
    with path.open(encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            db.add(
                FeedItem(
                    external_id=row["external_id"],
                    category=row["category"],
                    title=row["title"],
                    summary=row["summary"],
                    source_name=row["source_name"],
                    source_url=row["source_url"],
                    published_at=parse_dt(row["published_at"]),
                    collected_at=parse_dt(row["collected_at"]),
                    last_checked_at=parse_dt(row["last_checked_at"]),
                    expires_at=parse_dt(row["expires_at"]),
                    location=row["location"],
                    tags=row["tags"],
                    severity=row["severity"],
                    verification_status=row["verification_status"],
                    source_reliability=float(row["source_reliability"]),
                )
            )
            created += 1
    db.commit()
    return created
