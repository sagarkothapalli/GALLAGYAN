"""
GallaGyan Authentication Routes
────────────────────────────────
Hardened auth: httpOnly cookies, refresh token rotation, rate limiting,
generic error messages, bcrypt with cost 12, input sanitization.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header, Request, Response, Cookie
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from datetime import datetime, timedelta, timezone
import json
import logging

from models import User, UserData, RefreshToken, db
from security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    decode_access_token,
    sanitize_username,
    sanitize_html,
    validate_password_strength,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    COOKIE_SECURE,
    COOKIE_SAMESITE,
    COOKIE_DOMAIN,
    IS_PRODUCTION,
)

logger = logging.getLogger(__name__)

# ── Bcrypt with cost factor 12 ────────────────────────────────────────────
password_hash = PasswordHash((BcryptHasher(rounds=12),))

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# ── In-memory brute-force rate limiter ────────────────────────────────────
# Tracks failed login attempts per IP: { ip: [timestamp, ...] }
_login_attempts: dict[str, list[float]] = {}
_MAX_ATTEMPTS = 5
_WINDOW_SECONDS = 900  # 15 minutes


def _check_brute_force(ip: str) -> None:
    """
    Raise 429 if the IP has exceeded the login attempt limit within the window.
    This is an in-memory approach; for multi-process deployments, use Redis.
    """
    now = datetime.now(timezone.utc).timestamp()
    attempts = _login_attempts.get(ip, [])
    # Prune old entries outside the window
    attempts = [t for t in attempts if now - t < _WINDOW_SECONDS]
    _login_attempts[ip] = attempts

    if len(attempts) >= _MAX_ATTEMPTS:
        logger.warning(f"Rate limit exceeded for IP {ip} on login endpoint")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )


def _record_failed_attempt(ip: str) -> None:
    now = datetime.now(timezone.utc).timestamp()
    _login_attempts.setdefault(ip, []).append(now)


def _clear_attempts(ip: str) -> None:
    _login_attempts.pop(ip, None)


# ── Cookie helper ─────────────────────────────────────────────────────────
def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set httpOnly secure cookies for both access and refresh tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=COOKIE_DOMAIN,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth",  # Restrict refresh cookie to auth endpoints only
        domain=COOKIE_DOMAIN,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Delete auth cookies."""
    response.delete_cookie("access_token", path="/", domain=COOKIE_DOMAIN)
    response.delete_cookie("refresh_token", path="/api/auth", domain=COOKIE_DOMAIN)


# ── Pydantic request models with validation ──────────────────────────────
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    passcode: str = Field(..., min_length=1, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        cleaned = sanitize_username(v)
        if cleaned is None:
            raise ValueError("Username must be 3-30 alphanumeric characters, underscores, dots, or hyphens.")
        return cleaned


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    passcode: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        cleaned = sanitize_username(v)
        if cleaned is None:
            raise ValueError("Username must be 3-30 alphanumeric characters, underscores, dots, or hyphens.")
        return cleaned


class UserDataUpdate(BaseModel):
    portfolio: Optional[List[Any]] = None
    watchlist: Optional[List[Any]] = None
    alerts: Optional[List[Any]] = None


# ── Token extraction: supports both Bearer header and httpOnly cookie ────
async def get_current_user(
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
) -> str:
    """
    Extract and validate the access token from:
      1. Authorization: Bearer <token> header (backwards compatible)
      2. access_token httpOnly cookie (preferred secure method)
    """
    token = None

    # Priority 1: Bearer header (existing clients / API consumers)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]

    # Priority 2: httpOnly cookie
    if not token and access_token:
        token = access_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = decode_access_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return username


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/register")
async def register(request_body: RegisterRequest, request: Request, response: Response):
    """
    Register a new user. Returns access_token and sets httpOnly cookies on success.
    Validates password strength and checks for duplicate usernames.
    """
    username = request_body.username  # Already sanitized by Pydantic validator

    # Validate password strength
    strength_error = validate_password_strength(request_body.passcode)
    if strength_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=strength_error,
        )

    # Check if username already exists
    try:
        User.get(User.username == username)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken.",
        )
    except User.DoesNotExist:
        pass

    # Create the user
    try:
        hashed = password_hash.hash(request_body.passcode[:72])
        user = User.create(username=username, passcode=hashed)
        UserData.get_or_create(user=user)

        # Auto-login: issue tokens
        access_token = create_access_token(subject=username)
        refresh_token_raw = create_refresh_token()

        RefreshToken.create(
            user=user,
            token_hash=hash_token(refresh_token_raw),
            expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        )

        _set_auth_cookies(response, access_token, refresh_token_raw)

        user_data, _ = UserData.get_or_create(user=user)

        return {
            "status": "success",
            "user": {
                "username": username,
                "role": "analyst",
            },
            "access_token": access_token,
            "token_type": "bearer",
            "data": {
                "portfolio": json.loads(user_data.portfolio),
                "watchlist": json.loads(user_data.watchlist),
                "alerts": json.loads(user_data.alerts),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again.",
        )


@router.post("/login")
async def login(request_body: LoginRequest, request: Request, response: Response):
    """
    Authenticate user. Returns access_token in body (legacy) AND sets httpOnly cookies.
    Rate limited: max 5 attempts per IP per 15 minutes.
    All failures return the same generic error to prevent user enumeration.

    Auth flow verification:
    1. User logs in with correct creds -> httpOnly cookies set, user data returned (no password).
    2. User logs in with wrong password -> generic "Invalid credentials" error, attempt counter increments.
    3. After 5 failures in 15 min -> 429 Too Many Requests.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_brute_force(client_ip)

    username = request_body.username  # Already sanitized by Pydantic validator

    try:
        user = User.get(User.username == username)
        if password_hash.verify(request_body.passcode[:72], user.passcode):
            # Successful login — clear brute-force counter
            _clear_attempts(client_ip)

            access_token = create_access_token(subject=username)
            refresh_token_raw = create_refresh_token()

            # Store hashed refresh token in database for rotation/revocation
            RefreshToken.create(
                user=user,
                token_hash=hash_token(refresh_token_raw),
                expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            )

            # Set httpOnly cookies
            _set_auth_cookies(response, access_token, refresh_token_raw)

            # Ensure UserData exists
            user_data, _ = UserData.get_or_create(user=user)

            return {
                "status": "success",
                "user": {
                    "username": username,
                    "role": "analyst",
                },
                # Keep access_token in body for backwards compatibility with localStorage clients
                "access_token": access_token,
                "token_type": "bearer",
                "data": {
                    "portfolio": json.loads(user_data.portfolio),
                    "watchlist": json.loads(user_data.watchlist),
                    "alerts": json.loads(user_data.alerts),
                },
            }
    except User.DoesNotExist:
        pass
    except Exception as e:
        # Never log the password or reveal specifics to the client
        logger.error(f"Login error: {type(e).__name__}")

    # Record failed attempt for brute-force tracking
    _record_failed_attempt(client_ip)

    # Generic error — identical whether user doesn't exist or password is wrong
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/refresh")
async def refresh_token_endpoint(
    request: Request,
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
):
    """
    Refresh token rotation:
    1. Validate the refresh token from the httpOnly cookie.
    2. Issue a new access token + new refresh token.
    3. Revoke the old refresh token (rotation).

    If the old refresh token has already been revoked, this indicates token theft —
    revoke ALL refresh tokens for the user as a precaution.

    Verification:
    5. Expired access token -> client calls /refresh -> new access token issued.
    6. Stolen/replayed refresh token -> all tokens revoked, user must re-login.
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    token_hash = hash_token(refresh_token)

    try:
        stored = RefreshToken.get(RefreshToken.token_hash == token_hash)
    except RefreshToken.DoesNotExist:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check if token was already revoked (potential theft indicator)
    if stored.revoked:
        logger.warning(
            f"Revoked refresh token reuse detected for user_id={stored.user_id}. "
            "Revoking all tokens for this user."
        )
        # Revoke ALL tokens for this user — defensive measure
        RefreshToken.update(revoked=True).where(
            RefreshToken.user == stored.user
        ).execute()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Session invalidated. Please log in again.")

    # Check expiry
    now = datetime.now(timezone.utc)
    expires_at = stored.expires_at
    if hasattr(expires_at, 'tzinfo') and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if now > expires_at:
        stored.revoked = True
        stored.save()
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Refresh token expired")

    # Rotate: revoke old, issue new
    stored.revoked = True
    stored.save()

    user = stored.user
    new_access = create_access_token(subject=user.username)
    new_refresh_raw = create_refresh_token()

    RefreshToken.create(
        user=user,
        token_hash=hash_token(new_refresh_raw),
        expires_at=now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )

    _set_auth_cookies(response, new_access, new_refresh_raw)

    return {
        "status": "success",
        "access_token": new_access,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    response: Response,
    username: str = Depends(get_current_user),
    refresh_token: Optional[str] = Cookie(None),
):
    """
    Log out: revoke the current refresh token and clear cookies.
    """
    if refresh_token:
        token_hash = hash_token(refresh_token)
        try:
            stored = RefreshToken.get(RefreshToken.token_hash == token_hash)
            stored.revoked = True
            stored.save()
        except RefreshToken.DoesNotExist:
            pass

    _clear_auth_cookies(response)
    return {"status": "success", "detail": "Logged out"}


@router.get("/me")
async def get_user_profile(username: str = Depends(get_current_user)):
    """
    Verification:
    4. Protected endpoint without token -> 401 "Not authenticated".
    4b. Protected endpoint with expired token -> 401 "Invalid or expired token".
    """
    try:
        user = User.get(User.username == username)
        user_data, _ = UserData.get_or_create(user=user)
        return {
            "username": username,
            "portfolio": json.loads(user_data.portfolio),
            "watchlist": json.loads(user_data.watchlist),
            "alerts": json.loads(user_data.alerts),
        }
    except User.DoesNotExist:
        raise HTTPException(status_code=401, detail="Invalid session")
    except Exception as e:
        logger.error(f"Profile fetch error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="An internal error occurred")


@router.post("/update-data")
async def update_user_data(update: UserDataUpdate, username: str = Depends(get_current_user)):
    """Update watchlist/portfolio/alerts. Ownership is enforced via the JWT subject claim."""
    try:
        user = User.get(User.username == username)
        user_data, _ = UserData.get_or_create(user=user)

        if update.portfolio is not None:
            user_data.portfolio = json.dumps(update.portfolio)
        if update.watchlist is not None:
            user_data.watchlist = json.dumps(update.watchlist)
        if update.alerts is not None:
            user_data.alerts = json.dumps(update.alerts)

        user_data.save()
        return {"status": "success"}
    except User.DoesNotExist:
        raise HTTPException(status_code=401, detail="Invalid session")
    except Exception as e:
        logger.error(f"Data update error: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="An internal error occurred")
