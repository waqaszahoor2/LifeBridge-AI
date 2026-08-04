from datetime import UTC, datetime, timedelta
import re
import secrets

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models import User

settings = get_settings()
password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)
bearer = HTTPBearer(auto_error=False)


def validate_password_strength(password: str) -> None:
    patterns = [r"[A-Z]", r"[a-z]", r"[0-9]", r"[^A-Za-z0-9]"]
    if len(password) < 12 or not all(re.search(pattern, password) for pattern in patterns):
        raise HTTPException(
            status_code=422,
            detail="Password must be at least 12 characters and include upper, lower, number and symbol",
        )


def hash_password(password: str) -> str:
    validate_password_strength(password)
    return password_hasher.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    try:
        return password_hasher.verify(encoded, password)
    except VerifyMismatchError:
        return False


def create_access_token(subject: str, user_id: int | None = None) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "uid": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        "iss": "lifebridge-ai",
        "aud": "lifebridge-clients",
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            audience="lifebridge-clients",
            issuer="lifebridge-ai",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    payload = decode_token(credentials.credentials)
    user = db.scalar(select(User).where(User.email == payload.get("sub")))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account unavailable")
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
    except HTTPException:
        return None
    return db.scalar(select(User).where(User.email == payload.get("sub"), User.is_active.is_(True)))


def require_admin_api_key(x_admin_key: str | None = None):
    """Dependency helper retained for scripts; API route uses Header injection wrapper below."""
    if not x_admin_key or not secrets.compare_digest(x_admin_key, settings.admin_api_key):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access denied")
    return True


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    """Require an authenticated admin user. In development, ADMIN_API_KEY is handled by admin header dependency."""
    if credentials:
        payload = decode_token(credentials.credentials)
        user = db.scalar(select(User).where(User.email == payload.get("sub")))
        if user and user.is_active and user.is_admin:
            return user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator account required")
