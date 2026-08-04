from fastapi import APIRouter

from app.api.routes import admin, ai, auth, feed, health, notifications, profile, saved, services, sources

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(feed.router)
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(saved.router)
api_router.include_router(ai.router)
api_router.include_router(services.router)
api_router.include_router(notifications.router)
api_router.include_router(sources.router)
api_router.include_router(admin.router)
