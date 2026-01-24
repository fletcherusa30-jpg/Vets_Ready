"""Referral system models"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.models.base import Base


class Referral(Base):
    """Referral tracking"""
    __tablename__ = "vetsready_referrals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_user_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_users.id"), nullable=False)
    referred_user_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_users.id"), nullable=True)
    referral_code = Column(String(20), unique=True, nullable=False, index=True)
    referred_email = Column(String(255), nullable=True)  # Track email even before signup

    # Reward tracking
    reward_type = Column(String(50), nullable=False)  # 'free_month', 'discount', 'credit'
    reward_value = Column(Numeric(10, 2), nullable=True)  # Amount in USD
    reward_claimed = Column(Boolean, default=False)
    reward_claimed_at = Column(DateTime, nullable=True)

    # Status
    status = Column(String(20), default='pending')  # pending, completed, expired
    conversion_date = Column(DateTime, nullable=True)  # When referred user signed up

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_user_id], backref="referrals_made")
    referred = relationship("User", foreign_keys=[referred_user_id], backref="referred_by")


class ReferralReward(Base):
    """Referral rewards history"""
    __tablename__ = "vetsready_referral_rewards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_users.id"), nullable=False)
    referral_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_referrals.id"), nullable=False)

    reward_type = Column(String(50), nullable=False)
    reward_value = Column(Numeric(10, 2), nullable=True)

    # Stripe integration
    stripe_coupon_id = Column(String(255), nullable=True)
    stripe_promotion_code_id = Column(String(255), nullable=True)

    applied_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", backref="referral_rewards")
    referral = relationship("Referral", backref="rewards")
