from datetime import UTC, datetime
from math import asin, cos, radians, sin, sqrt

from app.models import FeedItem
from app.schemas import RecommendationRequest

SEVERITY_BOOST = {"critical": 0.38, "high": 0.25, "medium": 0.11, "low": 0.0}


def score_item(item: FeedItem, profile: RecommendationRequest) -> tuple[float, list[str]]:
    score = item.source_reliability * 0.18
    reasons: list[str] = []
    terms = {term.lower() for term in profile.skills + profile.interests}
    if profile.field_of_study:
        terms.add(profile.field_of_study.lower())
    item_text = f"{item.title} {item.summary} {item.tags} {item.eligibility}".lower()
    matches = sorted(term for term in terms if term and term in item_text)
    if matches:
        score += min(0.34, 0.075 * len(matches))
        reasons.append(f"Matches: {', '.join(matches[:4])}")

    if profile.preferred_categories and item.category in profile.preferred_categories:
        score += 0.14
        reasons.append(f"Preferred category: {item.category}")

    country_match = profile.country and profile.country.lower() in item.location.lower()
    if country_match:
        score += 0.10
        reasons.append(f"Location match: {profile.country}")
    elif "global" in item.location.lower() or "remote" in item.location.lower():
        score += 0.06
        reasons.append("Available globally or remotely")

    if profile.study_level and item.study_level:
        if profile.study_level.lower() in item.study_level.lower():
            score += 0.12
            reasons.append(f"Study-level match: {profile.study_level}")
        elif item.category == "scholarship":
            score -= 0.08

    if profile.latitude is not None and profile.longitude is not None and item.latitude is not None and item.longitude is not None:
        distance = _haversine(profile.latitude, profile.longitude, item.latitude, item.longitude)
        if distance <= 25:
            score += 0.15
            reasons.append(f"Nearby: {distance:.1f} km")
        elif distance <= 100:
            score += 0.08
            reasons.append(f"Within {distance:.0f} km")

    age_hours = max(0, (datetime.now(UTC) - _aware(item.published_at)).total_seconds() / 3600)
    freshness = max(0.0, 1.0 - age_hours / (24 * 30))
    score += freshness * 0.10
    if freshness > 0.75:
        reasons.append("Recently published")

    if item.category in {"disaster", "weather"}:
        boost = SEVERITY_BOOST.get(item.severity, 0.0)
        score += boost
        if boost:
            reasons.append(f"{item.severity.title()} safety priority")

    if item.expires_at:
        days = (_aware(item.expires_at) - datetime.now(UTC)).total_seconds() / 86400
        if 0 <= days <= 14:
            score += 0.10
            reasons.append("Deadline approaching")
        elif days < 0:
            score -= 1.0
            reasons.append("Expired")

    if item.verification_status == "verified":
        score += 0.08
        reasons.append("Verified source record")
    elif item.verification_status == "demo":
        score -= 0.04

    return round(max(0.0, min(1.0, score)), 3), reasons or ["General feed relevance"]


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))
