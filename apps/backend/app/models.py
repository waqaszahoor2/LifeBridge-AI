from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class FeedItem(Base):
    __tablename__ = "feed_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    source_external_id: Mapped[str] = mapped_column(String(180), default="", index=True)
    canonical_url: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True, index=True)
    title_normalized: Mapped[str] = mapped_column(String(250), default="", index=True)
    category: Mapped[str] = mapped_column(String(30), index=True)
    title: Mapped[str] = mapped_column(String(250))
    summary: Mapped[str] = mapped_column(Text)
    source_name: Mapped[str] = mapped_column(String(180), index=True)
    source_url: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    last_checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    location: Mapped[str] = mapped_column(String(180), default="Global", index=True)
    country_code: Mapped[str] = mapped_column(String(8), default="", index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    tags: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="low", index=True)
    verification_status: Mapped[str] = mapped_column(String(30), default="unverified", index=True)
    source_reliability: Mapped[float] = mapped_column(Float, default=0.5)
    funding_type: Mapped[str] = mapped_column(String(80), default="")
    study_level: Mapped[str] = mapped_column(String(80), default="")
    employment_type: Mapped[str] = mapped_column(String(80), default="")
    salary_text: Mapped[str] = mapped_column(String(120), default="")
    eligibility: Mapped[str] = mapped_column(Text, default="")
    raw_json: Mapped[str] = mapped_column(Text, default="{}")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)



class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(100), default="")
    city: Mapped[str] = mapped_column(String(100), default="")
    study_level: Mapped[str] = mapped_column(String(80), default="")
    field_of_study: Mapped[str] = mapped_column(String(120), default="")
    skills: Mapped[str] = mapped_column(Text, default="")
    interests: Mapped[str] = mapped_column(Text, default="")
    preferred_categories: Mapped[str] = mapped_column(Text, default="")
    accessibility_preferences: Mapped[str] = mapped_column(Text, default="")
    language: Mapped[str] = mapped_column(String(20), default="en")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    saved_items: Mapped[list["SavedItem"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class SavedItem(Base):
    __tablename__ = "saved_items"
    __table_args__ = (UniqueConstraint("user_id", "feed_item_id", name="uq_saved_user_item"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    feed_item_id: Mapped[int] = mapped_column(ForeignKey("feed_items.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="saved_items")
    item: Mapped[FeedItem] = relationship()


class NotificationToken(Base):
    __tablename__ = "notification_tokens"
    __table_args__ = (UniqueConstraint("token", name="uq_notification_token"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    token: Mapped[str] = mapped_column(Text)
    platform: Mapped[str] = mapped_column(String(20), default="android")
    topics: Mapped[str] = mapped_column(Text, default="")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class SourceConfig(Base, TimestampMixin):
    __tablename__ = "source_configs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(30))
    source_type: Mapped[str] = mapped_column(String(30), default="api")
    base_url: Mapped[str] = mapped_column(Text)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    refresh_minutes: Mapped[int] = mapped_column(Integer, default=360)
    reliability: Mapped[float] = mapped_column(Float, default=0.7)
    requires_secret: Mapped[bool] = mapped_column(Boolean, default=False)
    terms_note: Mapped[str] = mapped_column(Text, default="")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    actor: Mapped[str] = mapped_column(String(255), default="system", index=True)
    action: Mapped[str] = mapped_column(String(120), index=True)
    resource_type: Mapped[str] = mapped_column(String(80), default="")
    resource_id: Mapped[str] = mapped_column(String(120), default="")
    status: Mapped[str] = mapped_column(String(30), default="success")
    details: Mapped[str] = mapped_column(Text, default="")
    request_id: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)


class UserSkillGoal(Base, TimestampMixin):
    __tablename__ = "user_skill_goals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    raw_goal: Mapped[str] = mapped_column(Text)
    primary_skill: Mapped[str] = mapped_column(String(120), index=True)
    current_level: Mapped[str] = mapped_column(String(50), default="Beginner")
    target_level: Mapped[str] = mapped_column(String(50), default="Job Ready")
    career_goal: Mapped[str] = mapped_column(String(180), default="")
    hours_per_week: Mapped[int] = mapped_column(Integer, default=7)
    target_months: Mapped[int] = mapped_column(Integer, default=6)
    learning_style: Mapped[str] = mapped_column(String(50), default="Mixed")
    free_resources_only: Mapped[bool] = mapped_column(Boolean, default=False)
    known_skills_json: Mapped[str] = mapped_column(Text, default="[]")


class SkillRoadmap(Base, TimestampMixin):
    __tablename__ = "skill_roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    roadmap_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    goal_id: Mapped[int | None] = mapped_column(ForeignKey("user_skill_goals.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(250))
    primary_skill: Mapped[str] = mapped_column(String(120), index=True)
    target_role: Mapped[str] = mapped_column(String(180))
    current_level: Mapped[str] = mapped_column(String(50))
    target_level: Mapped[str] = mapped_column(String(50))
    estimated_hours: Mapped[int] = mapped_column(Integer, default=120)
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    current_phase_number: Mapped[int] = mapped_column(Integer, default=1)
    mode_used: Mapped[str] = mapped_column(String(40), default="ai_generated")
    personalization_reason: Mapped[str] = mapped_column(Text, default="")
    phases_json: Mapped[str] = mapped_column(Text, default="[]")
    tools_json: Mapped[str] = mapped_column(Text, default="[]")
    ai_workflows_json: Mapped[str] = mapped_column(Text, default="[]")
    schedule_json: Mapped[str] = mapped_column(Text, default="{}")
    resources_json: Mapped[str] = mapped_column(Text, default="[]")
    projects_json: Mapped[str] = mapped_column(Text, default="[]")
    assessments_json: Mapped[str] = mapped_column(Text, default="[]")
    completed_items_json: Mapped[str] = mapped_column(Text, default="[]")


class MentorConversation(Base, TimestampMixin):
    __tablename__ = "mentor_conversations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    roadmap_id: Mapped[str] = mapped_column(String(64), index=True)
    messages_json: Mapped[str] = mapped_column(Text, default="[]")


class SkillResource(Base, TimestampMixin):
    __tablename__ = "skill_resources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    skill: Mapped[str] = mapped_column(String(120), index=True)
    title: Mapped[str] = mapped_column(String(250))
    provider: Mapped[str] = mapped_column(String(120))
    resource_type: Mapped[str] = mapped_column(String(60))
    level: Mapped[str] = mapped_column(String(50))
    cost_type: Mapped[str] = mapped_column(String(30)) # Free, Paid, Official
    url: Mapped[str] = mapped_column(Text)
    is_official: Mapped[bool] = mapped_column(Boolean, default=False)

