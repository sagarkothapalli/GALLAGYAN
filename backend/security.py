"""
GallaGyan Security Utilities
─────────────────────────────
Rate limiting, password validation, token management, input sanitization.
"""

import re
import os
import secrets
import hashlib
import html
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── JWT Configuration ──────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
if not SECRET_KEY or len(SECRET_KEY) < 32:
    SECRET_KEY = secrets.token_hex(32)
    logger.warning(
        "JWT_SECRET_KEY not set or too short — generated ephemeral key. "
        "Sessions will not survive restarts. Set JWT_SECRET_KEY env var for production."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30          # Short-lived access token
REFRESH_TOKEN_EXPIRE_DAYS = 7             # Longer-lived refresh token

# ── CORS ───────────────────────────────────────────────────────────────────
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://gallagyan.xyz,https://www.gallagyan.xyz,http://localhost:3000,http://localhost:3001"
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# ── Cookie settings ────────────────────────────────────────────────────────
IS_PRODUCTION = os.getenv("ENVIRONMENT", "production").lower() == "production"
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN", None)  # e.g. ".gallagyan.xyz"
COOKIE_SECURE = IS_PRODUCTION
COOKIE_SAMESITE = "lax"


# ── Password Validation ───────────────────────────────────────────────────
def validate_password_strength(password: str) -> Optional[str]:
    """
    Returns an error message if the password is too weak, or None if acceptable.
    Requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit.
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r'\d', password):
        return "Password must contain at least one digit."
    return None


# ── Token Generation ──────────────────────────────────────────────────────
def create_access_token(subject: str) -> str:
    """Create a short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
        "iss": "gallagyan",
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    """Create a cryptographically random refresh token string."""
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """SHA-256 hash a refresh token for safe database storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and validate an access token. Returns the subject (username) or None.
    Validates signature, expiry, issuer, and token type.
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require_exp": True, "require_iat": True},
        )
        if payload.get("type") != "access":
            return None
        if payload.get("iss") != "gallagyan":
            return None
        username: str = payload.get("sub")
        return username if username else None
    except JWTError:
        return None


# ── Input Sanitization ────────────────────────────────────────────────────
_USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_.\-]{3,30}$')


def sanitize_username(username: str) -> Optional[str]:
    """
    Validate and sanitize a username.
    Returns cleaned username or None if invalid.
    """
    cleaned = username.strip().lower()
    if not _USERNAME_PATTERN.match(cleaned):
        return None
    return cleaned


def sanitize_html(text: str) -> str:
    """Escape HTML entities to prevent XSS in any reflected output."""
    return html.escape(text, quote=True)
