from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl, field_validator

Category = Literal["job", "scholarship", "disaster", "weather", "service", "safety", "learning"]


class FeedItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    source_external_id: str = ""
    canonical_url: str | None = None
    content_hash: str | None = None
    category: str
    title: str
    summary: str
    source_name: str
    source_url: str
    image_url: str | None = None
    published_at: datetime
    collected_at: datetime
    last_checked_at: datetime
    updated_at: datetime
    expires_at: datetime | None
    location: str
    country_code: str = ""
    latitude: float | None = None
    longitude: float | None = None
    tags: str
    severity: str
    verification_status: str
    source_reliability: float
    funding_type: str = ""
    study_level: str = ""
    employment_type: str = ""
    salary_text: str = ""
    eligibility: str = ""
    recommendation_reason: str | None = None
    match_score: float | None = None



class CursorPaginatedFeedOut(BaseModel):
    items: list[FeedItemOut]
    next_cursor: str | None = None
    has_more: bool
    generated_at: datetime
    latest_item_at: datetime | None = None


class FeedItemCreate(BaseModel):
    external_id: str = Field(min_length=3, max_length=180, pattern=r"^[A-Za-z0-9._:-]+$")
    category: Category
    title: str = Field(min_length=5, max_length=250)
    summary: str = Field(min_length=10, max_length=4000)
    source_name: str = Field(min_length=2, max_length=180)
    source_url: HttpUrl
    image_url: HttpUrl | None = None
    published_at: datetime
    expires_at: datetime | None = None
    location: str = Field(default="Global", max_length=180)
    country_code: str = Field(default="", max_length=8)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    tags: list[str] = Field(default_factory=list, max_length=30)
    severity: Literal["low", "medium", "high", "critical"] = "low"
    verification_status: Literal["unverified", "verified", "demo", "community"] = "unverified"
    source_reliability: float = Field(default=0.5, ge=0, le=1)
    funding_type: str = Field(default="", max_length=80)
    study_level: str = Field(default="", max_length=80)
    employment_type: str = Field(default="", max_length=80)
    salary_text: str = Field(default="", max_length=120)
    eligibility: str = Field(default="", max_length=2000)


class RecommendationRequest(BaseModel):
    skills: list[str] = Field(default_factory=list, max_length=50)
    preferred_categories: list[Category] = Field(default_factory=list, max_length=10)
    country: str = Field(default="", max_length=100)
    city: str = Field(default="", max_length=100)
    study_level: str = Field(default="", max_length=80)
    field_of_study: str = Field(default="", max_length=120)
    interests: list[str] = Field(default_factory=list, max_length=30)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    limit: int = Field(default=20, ge=1, le=100)

    @field_validator("skills", "interests")
    @classmethod
    def normalise_terms(cls, values: list[str]) -> list[str]:
        return [value.strip().lower()[:80] for value in values if value.strip()]


class RecommendationOut(BaseModel):
    item: FeedItemOut
    score: float
    reasons: list[str]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    display_name: str = Field(min_length=2, max_length=120)
    country: str = Field(default="", max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=120)
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    study_level: str | None = Field(default=None, max_length=80)
    field_of_study: str | None = Field(default=None, max_length=120)
    skills: list[str] | None = Field(default=None, max_length=80)
    interests: list[str] | None = Field(default=None, max_length=50)
    preferred_categories: list[Category] | None = Field(default=None, max_length=10)
    accessibility_preferences: list[str] | None = Field(default=None, max_length=30)
    language: str | None = Field(default=None, max_length=20)


class UserProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: str
    country: str
    city: str
    study_level: str
    field_of_study: str
    skills: str
    interests: str
    preferred_categories: str
    accessibility_preferences: str
    language: str


class ScamCheckRequest(BaseModel):
    text: str = Field(min_length=3, max_length=10000)
    url: str | None = Field(default=None, max_length=2000)


class ScamCheckResponse(BaseModel):
    risk_score: float
    risk_level: Literal["low", "medium", "high"]
    label: Literal["likely_legitimate", "suspicious", "likely_scam"]
    evidence: list[str]
    safe_actions: list[str]
    model_version: str


class CvAnalyzeRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50000)


class CvAnalyzeResponse(BaseModel):
    extracted_skills: list[str]
    detected_email: str | None
    detected_phone: str | None
    experience_years: float | None
    recommended_roles: list[dict[str, str | float | list[str]]]


class DisasterRiskRequest(BaseModel):
    rainfall_mm: float = Field(ge=0, le=1000)
    river_level_m: float = Field(ge=0, le=100)
    soil_moisture: float = Field(ge=0, le=1)
    slope_degrees: float = Field(ge=0, le=90)
    temperature_c: float = Field(ge=-80, le=70)
    wind_kph: float = Field(ge=0, le=500)


class DisasterRiskResponse(BaseModel):
    risk_score: float
    risk_level: Literal["low", "medium", "high", "critical"]
    drivers: list[str]
    model_version: str


class NearbyServiceOut(BaseModel):
    external_id: str
    name: str
    service_type: str
    latitude: float
    longitude: float
    distance_km: float | None = None
    accessibility: str = "unknown"
    address: str = ""
    source_url: str = ""


class NotificationTokenCreate(BaseModel):
    token: str = Field(min_length=20, max_length=4096)
    platform: Literal["android", "web", "ios"] = "android"
    topics: list[str] = Field(default_factory=list, max_length=20)


class SaveItemRequest(BaseModel):
    feed_item_id: int = Field(gt=0)
    reminder_at: datetime | None = None

class DecisionGraphRequest(RecommendationRequest):
    max_items: int = Field(default=15, ge=1, le=50)


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    attributes: dict[str, str | float | int | bool | None] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    weight: float = Field(default=1.0, ge=0, le=1)


class DecisionGraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    top_items: list[RecommendationOut]
    explanation: str
