"""Claim model for disability claims"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models.condition import claim_condition


class Claim(Base):
    """User disability claim model"""

    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    medical_evidence = Column(JSON, default={})
    combined_rating = Column(Integer, default=0)
    analysis_result = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="claims")
    conditions = relationship(
        "Condition",
        secondary=claim_condition,
        back_populates="claims",
    )

    def __repr__(self):
        return f"<Claim {self.id} for user {self.user_id}>"
