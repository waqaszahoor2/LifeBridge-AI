"""Optional Redis cache with safe no-cache fallback."""
from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
_client = None


async def _redis():
    global _client
    if _client is not None:
        return _client
    try:
        from redis.asyncio import Redis
        _client = Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=1.5)
        await _client.ping()
        return _client
    except Exception:
        logger.debug("Redis unavailable; continuing without shared cache", exc_info=True)
        _client = False
        return None


async def get_json(key: str) -> Any | None:
    client = await _redis()
    if not client:
        return None
    try:
        raw = await client.get(key)
        return json.loads(raw) if raw else None
    except Exception:
        logger.debug("Redis read failed", exc_info=True)
        return None


async def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    client = await _redis()
    if not client:
        return
    try:
        await client.set(key, json.dumps(value, ensure_ascii=False, default=str), ex=max(30, ttl_seconds))
    except Exception:
        logger.debug("Redis write failed", exc_info=True)
