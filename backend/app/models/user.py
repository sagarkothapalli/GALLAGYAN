import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile
    business_type = Column(String(50), nullable=True)  # freelancer, micro-smb, side-hustle
    income_range = Column(String(50), nullable=True)
    persona = Column(String(50), nullable=True)  # new-freelancer, cash-flow-builder, etc.
    pain_points = Column(JSON, nullable=True, default=list)
    subscription_tier = Column(String(20), nullable=False, default="free")

    # Onboarding
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    tax_savings_percent = Column(String(10), nullable=True)

    # GDPR/CCPA
    behavioral_profiling_opt_out = Column(Boolean, nullable=False, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
