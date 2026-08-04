"""Backward-compatible collector orchestrator."""
import logging

import httpx
from sqlalchemy.orm import Session

from app.services.collectors import adzuna, eonet, gdacs, open_meteo, reliefweb, rss, usajobs

logger = logging.getLogger(__name__)
TIMEOUT = httpx.Timeout(20.0, connect=7.0, read=20.0)


async def refresh_enabled_sources(db: Session) -> dict[str, int | str]:
    results: dict[str, int | str] = {}
    headers = {"User-Agent": "LifeBridgeAI/1.1 (+academic prototype; contact configured by operator)"}
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=False, headers=headers) as client:
        for name, collector in (
            ("nasa_eonet", eonet.collect),
            ("gdacs", gdacs.collect),
            ("open_meteo", open_meteo.collect),
            ("reliefweb", reliefweb.collect),
            ("usajobs", usajobs.collect),
            ("adzuna", adzuna.collect),
            ("rss", rss.collect),
        ):
            try:
                results[name] = await collector(db, client)
            except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
                logger.warning("Collector %s failed: %s", name, exc)
                db.rollback()
                results[name] = "failed"
    return results
