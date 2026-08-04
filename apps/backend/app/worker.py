"""Dedicated feed-refresh worker.

Run as ``python -m app.worker`` for a persistent worker or add ``--once``
for a single refresh. Keeping the worker separate prevents duplicate source
polling when the API uses more than one web process.
"""
from __future__ import annotations

import argparse
import asyncio
import logging
import signal

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.services.collector_manager import refresh_enabled_sources

settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("lifebridge.worker")


def _interval_seconds() -> int:
    minutes = min(
        settings.disaster_refresh_minutes,
        settings.weather_refresh_minutes,
        settings.job_refresh_minutes,
        settings.scholarship_refresh_minutes,
    )
    return max(300, minutes * 60)


async def refresh_once() -> dict[str, int | str]:
    with SessionLocal() as db:
        result = await refresh_enabled_sources(db)
        logger.info("Source refresh complete: %s", result)
        return result


async def run_forever() -> None:
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, stop.set)
        except NotImplementedError:  # Windows event loops
            pass

    while not stop.is_set():
        try:
            await refresh_once()
        except Exception:  # worker must stay alive after provider failure
            logger.exception("Source refresh cycle failed")
        try:
            await asyncio.wait_for(stop.wait(), timeout=_interval_seconds())
        except TimeoutError:
            continue


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Refresh enabled sources once and exit")
    args = parser.parse_args()
    if args.once:
        await refresh_once()
    else:
        await run_forever()


if __name__ == "__main__":
    asyncio.run(main())
