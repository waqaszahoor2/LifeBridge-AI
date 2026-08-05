from functools import lru_cache
from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[4]
CENTRAL_ENV = PROJECT_ROOT / "config" / "apis.env"
API_ENV = PROJECT_ROOT / "apps" / "api" / ".env"
LOCAL_ENV = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(CENTRAL_ENV), str(API_ENV), str(LOCAL_ENV)),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "LifeBridge AI"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "development-only-change-this-secret"
    admin_api_key: str = "development-admin-key"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./lifebridge.db"
    redis_url: str = "redis://localhost:6379/0"
    allowed_origins: list[str] | str = ["http://localhost:3000", "http://localhost:8080"]
    trusted_hosts: list[str] | str = ["localhost", "127.0.0.1", "testserver"]
    force_https: bool = False
    max_request_bytes: int = 5_242_880
    enable_scheduler: bool = False
    enable_demo_seed: bool = True
    log_level: str = "INFO"

    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"


    nasa_eonet_enabled: bool = True
    gdacs_enabled: bool = True
    open_meteo_enabled: bool = True
    openstreetmap_enabled: bool = True
    default_latitude: float = 31.5204
    default_longitude: float = 74.3587
    default_location_name: str = "Lahore, Pakistan"
    overpass_endpoint: str = "https://overpass-api.de/api/interpreter"

    usajobs_enabled: bool = False
    usajobs_api_key: str = ""
    usajobs_user_agent_email: str = ""
    reliefweb_enabled: bool = False
    reliefweb_app_name: str = ""
    adzuna_enabled: bool = False
    adzuna_app_id: str = ""
    adzuna_app_key: str = ""
    adzuna_country: str = "gb"
    rss_enabled: bool = True
    rss_sources_file: str = "config/rss_sources.yaml"

    firebase_enabled: bool = False
    firebase_project_id: str = ""
    firebase_service_account_path: str = ""

    job_refresh_minutes: int = 360
    scholarship_refresh_minutes: int = 720
    disaster_refresh_minutes: int = 30
    weather_refresh_minutes: int = 60
    service_cache_minutes: int = 1440

    scam_model_path: str = "ml/models/scam_classifier.joblib"
    disaster_model_path: str = "ml/models/disaster_risk.joblib"
    skill_index_path: str = "ml/models/skill_index.joblib"

    @field_validator("allowed_origins", "trusted_hosts", mode="before")
    @classmethod
    def split_csv(cls, value):
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.app_env.lower() == "production":
            weak = {
                "development-only-change-this-secret",
                "CHANGE_TO_A_RANDOM_64_CHARACTER_SECRET",
                "development-admin-key",
                "CHANGE_TO_A_DIFFERENT_RANDOM_ADMIN_KEY",
            }
            if self.secret_key in weak or self.admin_api_key in weak:
                raise ValueError("Production requires strong SECRET_KEY and ADMIN_API_KEY values")
            if "localhost" in self.allowed_origins:
                raise ValueError("Remove localhost from ALLOWED_ORIGINS in production")
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def seed_csv_path(self) -> Path:
        return PROJECT_ROOT / "datasets" / "seed" / "feed_items.csv"

    def resolve_project_path(self, value: str) -> Path:
        path = Path(value)
        return path if path.is_absolute() else PROJECT_ROOT / path


@lru_cache
def get_settings() -> Settings:
    return Settings()
