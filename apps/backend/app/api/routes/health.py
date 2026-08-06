import os
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db

router = APIRouter(tags=["health"])
settings = get_settings()

BUILD_TIMESTAMP = os.getenv("APP_BUILD_TIMESTAMP") or "NOT_CONFIGURED_BUILD_TIMESTAMP"
BUILD_COMMIT = (
    os.getenv("GIT_COMMIT_SHA")
    or os.getenv("RENDER_GIT_COMMIT")
    or os.getenv("VERCEL_GIT_COMMIT_SHA")
    or "development"
)
BUILD_BRANCH = os.getenv("GIT_COMMIT_REF") or "main"
APP_VERSION = os.getenv("APP_VERSION", "1.1.0")


@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/health/ready")
def readiness(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database is not ready") from exc

    # If production or REQUIRE_REDIS=true, check Redis
    require_redis = os.getenv("REQUIRE_REDIS", "").lower() in ("true", "1") or settings.app_env == "production"
    redis_url = os.getenv("REDIS_URL", "").strip()

    if require_redis:
        if not redis_url:
            raise HTTPException(status_code=503, detail="REDIS_URL is required in production but missing")
        try:
            import redis
            r = redis.Redis.from_url(redis_url)
            r.ping()
        except Exception as exc:
            raise HTTPException(status_code=503, detail="Redis rate limiter is not ready") from exc

    return {"status": "ready", "database": "ok", "redis": "ok" if redis_url else "disabled", "timestamp": datetime.now(UTC).isoformat()}


@router.get("/build-info")
def build_info(response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    return {
        "version": APP_VERSION,
        "commit": BUILD_COMMIT,
        "branch": BUILD_BRANCH,
        "environment": settings.app_env,
        "built_at": BUILD_TIMESTAMP,
    }
