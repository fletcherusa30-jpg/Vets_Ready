"""User model for authentication"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid

from app.database import Base


class User(Base):
    """User model for veteran account management"""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    badges = Column(Text, nullable=True)  # JSON-serialized list of unlocked badge names
    background_theme = Column(Text, nullable=True)  # JSON-serialized background customization

    # Two-Factor Authentication
    totp_secret = Column(String(32), nullable=True)
    totp_enabled = Column(Boolean, default=False)
    totp_backup_codes = Column(JSON, nullable=True)  # Hashed backup codes

    # Privacy Settings
    analytics_enabled = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=True)
    data_sharing_vso = Column(Boolean, default=False)
    profile_visibility = Column(String(20), default='private')  # private, public, vso_only

    # Account Management
    last_login = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Additional User Info
    user_type = Column(String(20), default='veteran')  # veteran, employer, business, vso_partner
    military_branch = Column(String(50), nullable=True)
    service_start_date = Column(DateTime, nullable=True)
    service_end_date = Column(DateTime, nullable=True)
    discharge_type = Column(String(50), nullable=True)
    mos = Column(String(20), nullable=True)

    # Subscription Info
    subscription_tier = Column(String(20), default='FREE')
    subscription_status = Column(String(20), default='active')
    stripe_customer_id = Column(String(255), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    claims = relationship("Claim", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("VeteranSubscription", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"
