import os
import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "").strip()
_redis_client = None

if REDIS_URL:
    try:
        import redis
        _redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        # Test ping
        _redis_client.ping()
        logger.info("[RateLimiter] Connected to Redis instance for distributed rate limiting.")
    except Exception as err:
        logger.warning(f"[RateLimiter] Failed to connect to Redis ({type(err).__name__}). Using in-memory rate limit fallback.")
        _redis_client = None

# Fallback in-memory store
_memory_history: Dict[str, List[float]] = defaultdict(list)


def extract_client_ip(request: Request) -> str:
    """Extract client IP safely from trusted proxy headers or socket connection."""
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the leftmost untrusted IP
        ips = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
        if ips:
            return ips[0]

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "127.0.0.1"


def check_rate_limit(request: Request, limit_type: str = "chat", max_requests: int = 30, window_seconds: int = 60):
    """Enforce atomic sliding window rate limiting via Redis or in-memory fallback with Retry-After header."""
    client_ip = extract_client_ip(request)
    key = f"rate_limit:{limit_type}:{client_ip}"
    now = time.time()

    if _redis_client:
        try:
            pipe = _redis_client.pipeline()
            # Redis sorted set for sliding window
            pipe.zremrangebyscore(key, 0, now - window_seconds)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window_seconds + 5)
            results = pipe.execute()
            count = results[2]

            if count > max_requests:
                retry_after = window_seconds
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded for {limit_type}. Please wait {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )
            return
        except HTTPException:
            raise
        except Exception as err:
            logger.warning(f"[RateLimiter] Redis command failed ({type(err).__name__}). Falling back to memory.")

    # In-memory sliding window fallback
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
