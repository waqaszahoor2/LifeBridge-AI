from contextlib import asynccontextmanager
import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.middleware import (
    RateLimitMiddleware,
    RequestIdMiddleware,
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
)
from app.services.collector_manager import refresh_enabled_sources
from app.services.seed import seed_if_empty

settings = get_settings()
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)


async def scheduler_loop(stop_event: asyncio.Event):
    interval_seconds = max(300, min(
        settings.disaster_refresh_minutes,
        settings.weather_refresh_minutes,
        settings.job_refresh_minutes,
        settings.scholarship_refresh_minutes,
    ) * 60)
    while not stop_event.is_set():
        try:
            with SessionLocal() as db:
                result = await refresh_enabled_sources(db)
                logger.info("Scheduled source refresh: %s", result)
        except Exception:
            logger.exception("Scheduled source refresh failed")
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except TimeoutError:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # For production use Alembic migrations; create_all keeps local setup simple.
    Base.metadata.create_all(bind=engine)
    if settings.enable_demo_seed:
        with SessionLocal() as db:
            created = seed_if_empty(db)
            logger.info("Seeded %s synthetic feed items", created)
    stop_event = asyncio.Event()
    scheduler_task = None
    if settings.enable_scheduler:
        scheduler_task = asyncio.create_task(scheduler_loop(stop_event))
    yield
    if scheduler_task:
        stop_event.set()
        await scheduler_task


app = FastAPI(
    title=settings.app_name,
    version="1.1.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    lifespan=lifespan,
)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=120)
app.add_middleware(RequestSizeLimitMiddleware, max_bytes=settings.max_request_bytes)
app.add_middleware(SecurityHeadersMiddleware, production=settings.is_production)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Admin-Key", "X-Request-ID"],
)
if settings.force_https:
    app.add_middleware(HTTPSRedirectMiddleware)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/", include_in_schema=False)
def root():
    return {
        "service": settings.app_name,
        "version": "1.1.0",
        "health": f"{settings.api_v1_prefix}/health",
        "documentation": None if settings.is_production else "/docs",
    }
