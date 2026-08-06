import os
import time
import uuid
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Fallback in-memory store for development
_memory_history: Dict[str, List[float]] = defaultdict(list)


def get_redis_client():
    redis_url = os.getenv("REDIS_URL", "").strip()
    if not redis_url:
        return None
    try:
        import redis
        client = redis.Redis.from_url(redis_url, decode_responses=True)
        client.ping()
        return client
    except Exception as err:
        logger.warning(f"[RateLimiter] Redis connection check failed: {type(err).__name__}")
        return None


def extract_client_ip(request: Request) -> str:
    """
    Extract client IP safely according to trusted platform headers.
    Host platforms: Render (X-Render-Client-IP), Cloudflare (CF-Connecting-IP).
    """
    # 1. Render platform trusted header
    render_ip = request.headers.get("x-render-client-ip")
    if render_ip:
        return render_ip.strip()

    # 2. Cloudflare trusted header
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    # 3. Standard forwarded header (leftmost IP)
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
    """Enforce atomic sliding window rate limiting via Redis (mandatory in production) or in-memory fallback."""
    settings = get_settings()
    is_prod = settings.app_env.lower() == "production" or os.getenv("REQUIRE_REDIS", "").lower() in ("true", "1")

    client_ip = extract_client_ip(request)
    key = f"rate_limit:{limit_type}:{client_ip}"
    now = time.time()
    member = f"{now}:{uuid.uuid4().hex[:8]}"

    redis_client = get_redis_client()

    if is_prod and not redis_client:
        raise HTTPException(
            status_code=503,
            detail="Distributed Redis rate limiter is required in production but unavailable.",
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
                    detail="Distributed Redis rate limiter command failed in production.",
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
