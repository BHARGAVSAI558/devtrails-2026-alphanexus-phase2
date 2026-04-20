import os
from functools import lru_cache
from typing import List, Optional, Tuple

from pydantic import AliasChoices, Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Always allow these in browser CORS (deduped with env); avoids prod break if Render omits ALLOWED_ORIGINS.
_REQUIRED_CORS_ORIGINS: Tuple[str, ...] = (
    "https://safenet-sage.vercel.app",
    "https://safenet-admin-wine.vercel.app",
)
_DEFAULT_DEV_BROWSER_ORIGINS: Tuple[str, ...] = (
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8081",
    "exp://127.0.0.1:8081",
    "exp://localhost:8081",
)


def _parse_allowed_origins_env(raw: str) -> Tuple[List[str], bool]:
    """
    Parse ALLOWED_ORIGINS: comma-separated, trimmed, no trailing slash, empty tokens dropped, deduped.
    Returns (explicit_origins, wildcard_only). wildcard_only is True only when the whole value is empty or '*'.
    A stray '*' in a list (e.g. '*,https://x') is ignored so we can merge explicit origins safely.
    """
    s = (raw or "").strip()
    if not s or s == "*":
        return [], True
    seen: set[str] = set()
    out: List[str] = []
    for chunk in s.split(","):
        token = chunk.strip().rstrip("/")
        if not token or token == "*":
            continue
        if token not in seen:
            seen.add(token)
            out.append(token)
    return out, False


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "SafeNet"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"  # set to "production" on Render
    DEBUG: bool = False
    DEMO_MODE: bool = False
    DB_FAIL_FAST: bool = True
    DB_STARTUP_MAX_RETRIES: int = 8
    DB_STARTUP_RETRY_BASE_SECONDS: float = 1.0

    # Comma-separated browser Origins (scheme+host+port, no path). Parsed with trim, slash strip, dedupe.
    # Defaults include live Vercel frontends so a missing Render env var does not block production CORS.
    # Set ALLOWED_ORIGINS=* on Render only if you intend to reflect all Origins (Starlette echoes Origin when using credentials).
    ALLOWED_ORIGINS: str = (
        "https://safenet-sage.vercel.app,"
        "https://safenet-admin-wine.vercel.app,"
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://localhost:8081,"
        "http://127.0.0.1:3000,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:8081,"
        "exp://127.0.0.1:8081,"
        "exp://localhost:8081"
    )

    # Resolved from process env only for the DSN string (never embed Supabase/project URLs in code).
    # When unset or empty, local SQLite is used via async_database_url.
    DATABASE_URL: Optional[str] = Field(default=None, validation_alias="DATABASE_URL")

    # Optional — None disables Redis; cache_service already guards for None
    REDIS_URL: Optional[str] = None

    JWT_SECRET: str = Field(
        default="safenet-dev-secret-2026",
        validation_alias=AliasChoices("JWT_SECRET", "JWT_SECRET_KEY"),
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=1440,  # 24 hours
        validation_alias=AliasChoices("ACCESS_TOKEN_EXPIRE_MINUTES", "JWT_EXPIRY_MINUTES"),
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_ACCESS_TOKEN_EXPIRE_HOURS: int = 1

    # Dashboard login (not worker OTP). Override in production.
    ADMIN_DASHBOARD_USERNAME: str = "admin"
    ADMIN_DASHBOARD_PASSWORD: str = "admin123"
    # Reserved `users.phone` for the synthetic admin row used in JWT `user_id`.
    ADMIN_CONSOLE_PHONE: str = "9000000001"

    ADMIN_JWT_SECRET: str = Field(
        default="admin-dev-secret-2026",
        validation_alias=AliasChoices("ADMIN_JWT_SECRET", "ADMIN_JWT"),
    )
    ADMIN_JWT_PRIVATE_KEY: str = ""
    ADMIN_JWT_PUBLIC_KEY: str = ""
    ADMIN_JWT_ALGORITHM: str = "RS256"

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE: str = ""

    OPENWEATHER_API_KEY: str = ""
    WEATHERAPI_KEY: str = ""
    OPENAQ_API_KEY: str = ""
    OPENAQ_LOCATION_ID: str = ""
    OPENAI_API_KEY: str = ""

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="", validation_alias=AliasChoices("RAZORPAY_WEBHOOK_SECRET", "RZP_WEBHOOK_SECRET"))

    FIREBASE_CREDENTIALS_PATH: str = ""

    # Optional — None disables Mongo writes silently
    MONGODB_URI: Optional[str] = None
    MONGODB_DB_NAME: str = "safenet"
    GOVERNMENT_ALERTS_SEED_PATH: str = ""
    ADMIN_API_KEY: str = Field(default="", validation_alias=AliasChoices("ADMIN_API_KEY", "ADMIN_KEY"))

    @field_validator("DEBUG", "DEMO_MODE", "DB_FAIL_FAST", mode="before")
    @classmethod
    def _parse_boolish(cls, value: object) -> bool:
        if isinstance(value, bool):
            return value
        raw = str(value or "").strip().lower()
        if raw in {"1", "true", "yes", "on", "debug", "development", "dev"}:
            return True
        if raw in {"0", "false", "no", "off", "release", "prod", "production", ""}:
            return False
        return bool(value)

    @computed_field
    @property
    def has_database_url(self) -> bool:
        u = (os.getenv("DATABASE_URL") or "").strip() or (self.DATABASE_URL or "").strip()
        return bool(u)

    @computed_field
    @property
    def is_production(self) -> bool:
        return (self.APP_ENV or "").strip().lower() in {"prod", "production", "render"}

    @computed_field
    @property
    def origins(self) -> List[str]:
        explicit, wildcard_only = _parse_allowed_origins_env(self.ALLOWED_ORIGINS or "")
        # Whole env is '*' or blank: Starlette wildcard + credentials echoes request Origin.
        if wildcard_only:
            return ["*"]
        # Merge required production + dev defaults + env list (dedupe, preserve order).
        merged: List[str] = []
        seen: set[str] = set()
        for bucket in (_REQUIRED_CORS_ORIGINS, _DEFAULT_DEV_BROWSER_ORIGINS, tuple(explicit)):
            for o in bucket:
                if o not in seen:
                    seen.add(o)
                    merged.append(o)
        return merged if merged else ["*"]

    @computed_field
    @property
    def async_database_url(self) -> str:
        u = (os.getenv("DATABASE_URL") or "").strip() or (self.DATABASE_URL or "").strip()
        if not u:
            u = "sqlite+aiosqlite:///./safenet_local.db"
        if u.startswith("sqlite"):
            # Ensure aiosqlite driver is specified
            if "+aiosqlite" not in u:
                u = u.replace("sqlite://", "sqlite+aiosqlite://", 1)
            return u
        if "+asyncpg" in u:
            return u
        if u.startswith("postgresql+psycopg2://"):
            return u.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        if u.startswith("postgresql://"):
            return u.replace("postgresql://", "postgresql+asyncpg://", 1)
        if u.startswith("postgres://"):
            return u.replace("postgres://", "postgresql+asyncpg://", 1)
        return u

    @computed_field
    @property
    def is_sqlite(self) -> bool:
        return self.async_database_url.startswith("sqlite")

    @computed_field
    @property
    def admin_jwt_signing_secret(self) -> str:
        return self.ADMIN_JWT_SECRET or self.JWT_SECRET


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
