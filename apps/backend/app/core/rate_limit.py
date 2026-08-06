import os
import time
import uuid
import logging
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import HTTPException, Request

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Application-lifetime singleton Redis client
_redis_client_instance = None
_memory_history: Dict[str, List[float]] = defaultdict(list)


def init_redis_client(client=None):
    global _redis_client_instance
    if client is not None:
        _redis_client_instance = client
        return _redis_client_instance

    redis_url = os.getenv("REDIS_URL", "").strip()
    if not redis_url:
        _redis_client_instance = None
        return None

    if _redis_client_instance is None:
        try:
            import redis
            _redis_client_instance = redis.Redis.from_url(redis_url, decode_responses=True)
            _redis_client_instance.ping()
            logger.info("[RateLimiter] Connected and cached persistent Redis client.")
        except Exception as err:
            logger.warning(f"[RateLimiter] Persistent Redis connection failed: {type(err).__name__}")
            _redis_client_instance = None
    return _redis_client_instance


def close_redis_client():
    global _redis_client_instance
    if _redis_client_instance is not None:
        try:
            _redis_client_instance.close()
        except Exception:
            pass
        _redis_client_instance = None


def extract_client_ip(request: Request) -> str:
    """
    Extract client IP safely according to trusted platform headers.
    In production, trust ONLY explicit platform proxy headers (X-Render-Client-IP, CF-Connecting-IP).
    Do NOT trust unverified X-Forwarded-For or X-Real-IP headers on direct requests.
    """
    settings = get_settings()
    is_prod = settings.app_env.lower() == "production" or os.getenv("REQUIRE_REDIS", "").lower() in ("true", "1")

    # 1. Render platform trusted header
    render_ip = request.headers.get("x-render-client-ip")
    if render_ip:
        return render_ip.strip()

    # 2. Cloudflare trusted header
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    # In development mode only, allow X-Forwarded-For / X-Real-IP for local testing
    if not is_prod:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            ips = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
            if ips:
                return ips[0]

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(request: Request, limit_type: str = "chat", max_requests: int = 30, window_seconds: int = 60):
    """Enforce atomic sliding window rate limiting via persistent Redis (mandatory in production) or in-memory fallback."""
    settings = get_settings()
    is_prod = settings.app_env.lower() == "production" or os.getenv("REQUIRE_REDIS", "").lower() in ("true", "1")

    client_ip = extract_client_ip(request)
    key = f"rate_limit:{limit_type}:{client_ip}"
    now = time.time()
    member = f"{now}:{uuid.uuid4().hex[:8]}"

    redis_client = init_redis_client()

    if is_prod and not redis_client:
        raise HTTPException(
            status_code=503,
            detail="The service is temporarily unavailable. Please try again later.",
        )

    if redis_client:
        try:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, now - window_seconds)
            pipe.zadd(key, {member: now})
            pipe.zcard(key)
            pipe.zrange(key, 0, 0, withscores=True)
            pipe.expire(key, window_seconds + 5)
            results = pipe.execute()

            count = results[2]
            oldest_range = results[3]

            if count > max_requests:
                oldest_score = oldest_range[0][1] if oldest_range else now - window_seconds
                retry_after = max(1, int(window_seconds - (now - oldest_score)))
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded for {limit_type}. Please wait {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )
            return
        except HTTPException:
            raise
        except Exception as err:
            logger.error(f"[RateLimiter] Redis command failed ({type(err).__name__})")
            if is_prod:
                raise HTTPException(
                    status_code=503,
                    detail="The service is temporarily unavailable. Please try again later.",
                )

    # Development-only in-memory sliding window fallback
    timestamps = _memory_history[key]
    valid_timestamps = [t for t in timestamps if now - t < window_seconds]
    _memory_history[key] = valid_timestamps

    if len(valid_timestamps) >= max_requests:
        oldest = valid_timestamps[0]
        retry_after = max(1, int(window_seconds - (now - oldest)))
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {limit_type}. Please wait {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    _memory_history[key].append(now)
