from datetime import UTC, datetime

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item

settings = get_settings()


def weather_severity(current: dict) -> tuple[str, list[str]]:
    reasons: list[str] = []
    severity = "low"
    wind = float(current.get("wind_speed_10m") or 0)
    rain = float(current.get("precipitation") or 0)
    apparent = float(current.get("apparent_temperature") or current.get("temperature_2m") or 0)
    if wind >= 70 or rain >= 25 or apparent >= 45 or apparent <= -15:
        severity = "high"
    elif wind >= 40 or rain >= 10 or apparent >= 38 or apparent <= 0:
        severity = "medium"
    if wind >= 40:
        reasons.append(f"strong wind {wind:g} km/h")
    if rain >= 10:
        reasons.append(f"heavy precipitation {rain:g} mm")
    if apparent >= 38:
        reasons.append(f"high apparent temperature {apparent:g}°C")
    return severity, reasons


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not settings.open_meteo_enabled:
        return 0
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": settings.default_latitude,
        "longitude": settings.default_longitude,
        "current": "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
        "forecast_days": 3,
        "timezone": "UTC",
    }
    response = await client.get(url, params=params)
    response.raise_for_status()
    payload = response.json()
    current = payload.get("current", {})
    now = datetime.now(UTC)
    severity, reasons = weather_severity(current)
    summary = (
        f"Temperature {current.get('temperature_2m', 'n/a')}°C; feels like "
        f"{current.get('apparent_temperature', 'n/a')}°C; precipitation "
        f"{current.get('precipitation', 'n/a')} mm; wind {current.get('wind_speed_10m', 'n/a')} km/h."
    )
    if reasons:
        summary += " Watch indicators: " + ", ".join(reasons) + "."
    created = upsert_feed_item(db, {
        "external_id": f"open-meteo-{settings.default_location_name}-{now.strftime('%Y%m%d%H')}",
        "category": "weather",
        "title": f"Weather update — {settings.default_location_name}"[:250],
        "summary": summary,
        "source_name": "Open-Meteo",
        "source_url": url,
        "published_at": now,
        "location": settings.default_location_name,
        "latitude": settings.default_latitude,
        "longitude": settings.default_longitude,
        "tags": "weather;temperature;precipitation;wind",
        "severity": severity,
        "verification_status": "verified",
        "source_reliability": 0.90,
        "raw_json": payload,
    })
    db.commit()
    return int(created)
