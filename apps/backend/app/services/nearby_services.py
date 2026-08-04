from math import asin, cos, radians, sin, sqrt

import httpx

from app.core.config import get_settings
from app.services.cache import get_json, set_json

settings = get_settings()


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))


async def query_nearby(latitude: float, longitude: float, radius_m: int = 5000, service_type: str = "all") -> list[dict]:
    if not settings.openstreetmap_enabled:
        return []
    radius_m = max(100, min(radius_m, 20000))
    # Rounded coordinates avoid excessive public Overpass queries for nearly identical locations.
    cache_key = f"services:{round(latitude, 3)}:{round(longitude, 3)}:{radius_m}:{service_type}"
    cached = await get_json(cache_key)
    if isinstance(cached, list):
        return cached

    filters = {
        "hospital": '["amenity"="hospital"]',
        "clinic": '["amenity"="clinic"]',
        "shelter": '["amenity"="social_facility"]',
        "training": '["amenity"="college"]',
        "all": '["amenity"~"hospital|clinic|social_facility|college|community_centre"]',
    }
    selector = filters.get(service_type, filters["all"])
    query = f"""
    [out:json][timeout:20];
    (
      node(around:{radius_m},{latitude},{longitude}){selector};
      way(around:{radius_m},{latitude},{longitude}){selector};
      relation(around:{radius_m},{latitude},{longitude}){selector};
    );
    out center tags 100;
    """
    headers = {"User-Agent": "LifeBridgeAI/1.1 academic prototype"}
    async with httpx.AsyncClient(timeout=25, follow_redirects=False, headers=headers) as client:
        response = await client.post(settings.overpass_endpoint, content=query, headers={"Content-Type": "text/plain"})
        response.raise_for_status()
    output = []
    for element in response.json().get("elements", []):
        tags = element.get("tags", {})
        lat = element.get("lat") or (element.get("center") or {}).get("lat")
        lon = element.get("lon") or (element.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue
        accessibility = tags.get("wheelchair", "unknown")
        address = " ".join(
            filter(None, [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:city")])
        )
        output.append(
            {
                "external_id": f"osm-{element.get('type')}-{element.get('id')}",
                "name": tags.get("name") or tags.get("amenity", "Service").replace("_", " ").title(),
                "service_type": tags.get("amenity", "service"),
                "latitude": float(lat),
                "longitude": float(lon),
                "distance_km": round(haversine(latitude, longitude, float(lat), float(lon)), 2),
                "accessibility": accessibility,
                "address": address,
                "source_url": f"https://www.openstreetmap.org/{element.get('type')}/{element.get('id')}",
            }
        )
    output.sort(key=lambda item: item["distance_km"])
    result = output[:100]
    await set_json(cache_key, result, settings.service_cache_minutes * 60)
    return result
