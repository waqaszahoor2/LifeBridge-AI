from fastapi import APIRouter, Query

from app.schemas import NearbyServiceOut
from app.services.nearby_services import query_nearby

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/nearby", response_model=list[NearbyServiceOut])
async def nearby_services(
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
    radius_m: int = Query(default=5000, ge=100, le=20000),
    service_type: str = Query(default="all", max_length=40),
):
    return await query_nearby(latitude, longitude, radius_m, service_type)
