from __future__ import annotations

import csv
import io
import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_optional_user
from app.models import AuditLog, FeedItem, User
from app.schemas import FeedItemCreate, FeedItemOut
from app.services.collector_manager import refresh_enabled_sources

router = APIRouter(prefix="/admin", tags=["admin"])
settings = get_settings()
MAX_CSV_BYTES = 2_000_000
MAX_CSV_ROWS = 500


def require_admin_access(
    x_admin_key: str | None = Header(default=None),
    user: User | None = Depends(get_optional_user),
):
    if user and user.is_admin:
        return True
    if x_admin_key and secrets.compare_digest(x_admin_key, settings.admin_api_key):
        return True
    if not x_admin_key and user is None:
        raise HTTPException(status_code=401, detail="Administrator authentication required")
    raise HTTPException(status_code=403, detail="Administrator access required")


def _upsert(db: Session, payload: FeedItemCreate) -> FeedItem:
    existing = db.scalar(select(FeedItem).where(FeedItem.external_id == payload.external_id))
    values = payload.model_dump()
    values["source_url"] = str(values["source_url"])
    values["image_url"] = str(values["image_url"]) if values.get("image_url") else None
    values["tags"] = ";".join(values["tags"])
    if existing:
        for key, value in values.items():
            setattr(existing, key, value)
        existing.last_checked_at = datetime.now(UTC)
        return existing
    item = FeedItem(**values)
    db.add(item)
    return item


@router.post(
    "/feed-items",
    response_model=FeedItemOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin_access)],
)
def create_feed_item(payload: FeedItemCreate, db: Session = Depends(get_db)):
    item = _upsert(db, payload)
    db.add(AuditLog(actor="admin", action="feed.upsert", resource_type="feed_item", resource_id=payload.external_id))
    db.commit()
    db.refresh(item)
    return item


@router.post("/feed-items/import-csv", dependencies=[Depends(require_admin_access)])
async def import_feed_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Import verified opportunities from the documented CSV template.

    Intended for official scholarship/job records that do not expose an API.
    The endpoint validates each row through ``FeedItemCreate`` and caps upload
    size/row count to limit abuse.
    """
    if file.content_type not in {"text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"}:
        raise HTTPException(status_code=415, detail="Upload a CSV file")
    raw = await file.read(MAX_CSV_BYTES + 1)
    if len(raw) > MAX_CSV_BYTES:
        raise HTTPException(status_code=413, detail="CSV exceeds 2 MB")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV must use UTF-8") from exc

    reader = csv.DictReader(io.StringIO(text))
    imported = 0
    errors: list[dict[str, str | int]] = []
    for row_number, row in enumerate(reader, start=2):
        if row_number > MAX_CSV_ROWS + 1:
            errors.append({"row": row_number, "error": f"Maximum {MAX_CSV_ROWS} data rows"})
            break
        try:
            data = {
                **row,
                "tags": [value.strip() for value in (row.get("tags") or "").split(";") if value.strip()],
                "latitude": float(row["latitude"]) if row.get("latitude") else None,
                "longitude": float(row["longitude"]) if row.get("longitude") else None,
                "source_reliability": float(row.get("source_reliability") or 0.8),
                "expires_at": row.get("expires_at") or None,
                "image_url": row.get("image_url") or None,
            }
            payload = FeedItemCreate.model_validate(data)
            _upsert(db, payload)
            imported += 1
        except (ValidationError, ValueError, TypeError) as exc:
            errors.append({"row": row_number, "error": str(exc)[:500]})

    db.add(
        AuditLog(
            actor="admin",
            action="feed.import_csv",
            resource_type="feed_item",
            details=f"filename={file.filename}; imported={imported}; errors={len(errors)}",
            status="partial" if errors else "success",
        )
    )
    db.commit()
    return {"imported": imported, "error_count": len(errors), "errors": errors[:50]}


@router.post("/refresh", dependencies=[Depends(require_admin_access)])
async def refresh(db: Session = Depends(get_db)):
    results = await refresh_enabled_sources(db)
    db.add(AuditLog(actor="admin", action="sources.refresh", details=str(results)))
    db.commit()
    return {"results": results, "refreshed_at": datetime.now(UTC)}
