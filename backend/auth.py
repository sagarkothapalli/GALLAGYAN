from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import json
import os
import logging
from dotenv import load_dotenv
from models import User, UserData, db

load_dotenv()

logger = logging.getLogger(__name__)

# JWT Configuration — loaded from environment, never hardcoded
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set. See .env.example.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
# TODO: Implement refresh tokens to avoid silent logouts on expiry

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class LoginRequest(BaseModel):
    username: str
    passcode: str


class UserDataUpdate(BaseModel):
    portfolio: Optional[List] = None
    watchlist: Optional[List] = None
    alerts: Optional[List] = None


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login")
async def login(request: LoginRequest):
    username = request.username.lower()
    try:
        user = User.get(User.username == username)
        if pwd_context.verify(request.passcode, user.passcode):
            access_token = create_access_token(data={"sub": username})

            # Ensure UserData exists
            user_data, _ = UserData.get_or_create(user=user)

            return {
                "status": "success",
                "user": {
                    "username": username,
                    "role": "analyst"
                },
                "access_token": access_token,
                "token_type": "bearer",
                "data": {
                    "portfolio": json.loads(user_data.portfolio),
                    "watchlist": json.loads(user_data.watchlist),
                    "alerts": json.loads(user_data.alerts)
                }
            }
    except User.DoesNotExist:
        pass
    except Exception as e:
        logger.error(f"Login error for user '{username}': {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get("/me")
async def get_user_profile(username: str = Depends(get_current_user)):
    try:
        user = User.get(User.username == username)
        user_data, _ = UserData.get_or_create(user=user)
        return {
            "username": username,
            "portfolio": json.loads(user_data.portfolio),
            "watchlist": json.loads(user_data.watchlist),
            "alerts": json.loads(user_data.alerts)
        }
    except Exception as e:
        logger.error(f"Error fetching profile for '{username}': {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


@router.post("/update-data")
async def update_user_data(update: UserDataUpdate, username: str = Depends(get_current_user)):
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
    except Exception as e:
        logger.error(f"Error updating data for '{username}': {e}")
        raise HTTPException(status_code=500, detail="Failed to update data")
