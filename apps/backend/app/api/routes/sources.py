from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(prefix="/sources", tags=["sources"])
settings = get_settings()


@router.get("")
def source_status():
    return [
        {"key": "nasa_eonet", "enabled": settings.nasa_eonet_enabled, "requires_key": False, "category": "disaster"},
        {"key": "gdacs", "enabled": settings.gdacs_enabled, "requires_key": False, "category": "disaster"},
        {"key": "open_meteo", "enabled": settings.open_meteo_enabled, "requires_key": False, "category": "weather"},
        {"key": "openstreetmap", "enabled": settings.openstreetmap_enabled, "requires_key": False, "category": "service"},
        {"key": "reliefweb", "enabled": settings.reliefweb_enabled, "requires_key": True, "configured": bool(settings.reliefweb_app_name), "category": "disaster"},
        {"key": "usajobs", "enabled": settings.usajobs_enabled, "requires_key": True, "configured": bool(settings.usajobs_api_key), "category": "job"},
        {"key": "adzuna", "enabled": settings.adzuna_enabled, "requires_key": True, "configured": bool(settings.adzuna_app_id and settings.adzuna_app_key), "category": "job"},
        {"key": "rss", "enabled": settings.rss_enabled, "requires_key": False, "category": "job/scholarship"},
        {"key": "firebase", "enabled": settings.firebase_enabled, "requires_key": True, "configured": bool(settings.firebase_service_account_path), "category": "notifications"},
    ]
