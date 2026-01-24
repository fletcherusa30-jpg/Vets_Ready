"""Condition model for VA disability conditions"""

from sqlalchemy import Column, String, Integer, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

# Association table for many-to-many relationship between Claims and Conditions
claim_condition = Table(
    "claim_condition",
    Base.metadata,
    Column("claim_id", String, ForeignKey("claims.id")),
    Column("condition_id", String, ForeignKey("conditions.id")),
)


class Condition(Base):
    """VA disability condition model"""

    __tablename__ = "conditions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, unique=True, index=True, nullable=False)  # e.g., "F4310"
    name = Column(String, nullable=False)  # e.g., "PTSD"
    description = Column(String)
    disability_rating_default = Column(Integer, default=0)  # Default rating 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    claims = relationship("Claim", secondary=claim_condition, back_populates="conditions")

    def __repr__(self):
        return f"<Condition {self.name} ({self.code})>"
