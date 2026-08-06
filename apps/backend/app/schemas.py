from datetime import datetime
from typing import Any, Literal


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


# ==========================================================================
# AI SKILL MENTOR SCHEMAS
# ==========================================================================

class SkillGoalRequest(BaseModel):
    raw_goal: str = Field(min_length=5, max_length=2000)
    target_skill: str | None = Field(default=None, max_length=120)
    current_level: Literal["Beginner", "Intermediate", "Advanced"] = "Beginner"
    known_skills: list[str] = Field(default_factory=list, max_length=30)
    career_goal: str = Field(default="", max_length=180)
    hours_per_day: float = Field(default=1.0, ge=0.25, le=16.0)
    days_per_week: int = Field(default=5, ge=1, le=7)
    target_months: int = Field(default=6, ge=1, le=24)
    learning_style: Literal["Videos", "Reading", "Practical Projects", "Exercises", "Mixed"] = "Mixed"
    budget_preference: Literal["Free Only", "Mostly Free", "Paid Allowed"] = "Mostly Free"
    country: str = Field(default="Global", max_length=100)


class SkillProfileOut(BaseModel):
    primary_skill: str
    current_level: str
    target_level: str
    known_skills: list[str]
    missing_prerequisites: list[str]
    hours_per_week: float
    target_months: int
    career_goal: str
    learning_style: str
    free_resources_only: bool


class RoadmapPhaseOut(BaseModel):
    phase_number: int
    title: str
    objective: str
    estimated_hours: int
    topics: list[str]
    tools: list[str]
    ai_tools: list[str]
    exercises: list[str]
    project: str
    checkpoint: str


class RoadmapLessonOut(BaseModel):
    id: str
    phase_number: int
    title: str
    duration_minutes: int
    is_completed: bool = False
    topics: list[str] = Field(default_factory=list)
    ai_usage_note: str = ""


class RoadmapProjectOut(BaseModel):
    id: str
    phase_number: int
    title: str
    problem_statement: str
    objective: str
    skills_practised: list[str]
    tools: list[str]
    ai_integration: str
    dataset_requirements: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced", "Capstone"]
    estimated_hours: int
    is_capstone: bool = False
    is_completed: bool = False
    github_url: str | None = None
    demo_url: str | None = None


class RoadmapAssessmentOut(BaseModel):
    id: str
    phase_number: int
    title: str
    type: Literal["multiple_choice", "practical_task", "debugging_task", "mini_project"]
    questions: list[dict[str, str | list[str]]] = Field(default_factory=list)
    passing_score: int = 70
    is_completed: bool = False
    score: int | None = None


class ToolRecommendationOut(BaseModel):
    name: str
    category: Literal["Core", "AI", "Free", "Advanced"]
    purpose: str
    skill_level: str
    is_free: bool
    platform: str
    why_recommended: str
    alternative: str


class AIWorkflowOut(BaseModel):
    task: str
    recommended_ai_tool: str
    example_workflow: str
    verification_requirement: str
    limitation: str
    privacy_warning: str


class RoadmapResponse(BaseModel):
    roadmap_id: str
    title: str
    primary_skill: str
    target_role: str
    current_level: str
    target_level: str
    estimated_hours: int
    completion_percentage: float = 0.0
    current_phase_number: int = 1
    mode_used: Literal["ai_generated", "structured_template"]
    personalization_reason: str
    phases: list[RoadmapPhaseOut]
    tools: list[ToolRecommendationOut]
    ai_workflows: list[AIWorkflowOut]
    schedule: dict[str, Any]
    projects: list[RoadmapProjectOut]
    assessments: list[RoadmapAssessmentOut]
    resources: list[dict[str, str | bool]]
    completed_items: list[str] = Field(default_factory=list)



class MentorChatRequest(BaseModel):
    roadmap_id: str
    user_message: str = Field(min_length=2, max_length=2000)
    current_phase_number: int = 1


class MentorChatResponse(BaseModel):
    reply: str
    citations: list[str] = Field(default_factory=list)
    suggested_questions: list[str] = Field(default_factory=list)
    disclaimer: str = "AI guidance may contain mistakes. Verify important technical, academic and career decisions."


class ProgressUpdateRequest(BaseModel):
    item_id: str
    is_completed: bool
    github_url: str | None = None
    demo_url: str | None = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=10000)


class AssistantChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)
    mode: Literal["lifebridge_assistant", "skill_coach"] = "lifebridge_assistant"
    roadmap_id: str | None = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1024, ge=1, le=4096)


class AssistantChatResponse(BaseModel):
    message: ChatMessage
    reply: str
    model: str
    model_used: str
    conversation_id: str
    provider: str
    citations: list[str] = Field(default_factory=list)
    disclaimer: str = "AI guidance is for informational purposes. Verify important decisions."
    status: str = "success"


class AssistantHealthResponse(BaseModel):
    status: str = "ready"
    provider: str = "groq"
    model_configured: bool = True
    api_key_configured: bool = True



