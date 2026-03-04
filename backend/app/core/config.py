from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    APP_NAME: str = "SteadyStack"
    APP_ENV: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/steadystack"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Sanity CMS
    SANITY_PROJECT_ID: str = ""
    SANITY_DATASET: str = "production"
    SANITY_API_TOKEN: str = ""

    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "hello@steadystack.com"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # GallaGyan merged settings
    ALLOWED_ORIGINS: Optional[str] = None
    DEFAULT_USER_PASSCODE: Optional[str] = None
    ENVIRONMENT: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
