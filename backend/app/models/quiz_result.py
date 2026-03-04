import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    persona = Column(String(50), nullable=False)
    health_score = Column(Integer, nullable=False)
    scores = Column(JSON, nullable=False)
    answers = Column(JSON, nullable=False)
    strengths = Column(JSON, nullable=True)
    improvements = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
