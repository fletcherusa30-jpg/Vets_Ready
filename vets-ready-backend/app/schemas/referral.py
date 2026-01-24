"""Referral schemas"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ReferralCreate(BaseModel):
    """Create referral code"""
    pass


class ReferralResponse(BaseModel):
    """Referral response"""
    id: str
    referral_code: str
    referred_email: Optional[str] = None
    reward_type: str
    reward_value: Optional[Decimal] = None
    reward_claimed: bool
    status: str
    created_at: datetime
    conversion_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReferralStatsResponse(BaseModel):
    """Referral statistics"""
    referral_code: Optional[str]
    referral_link: Optional[str]
    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    total_rewards_earned: float
    available_rewards: float


class ReferralRewardResponse(BaseModel):
    """Referral reward"""
    id: str
    reward_type: str
    reward_value: Optional[Decimal]
    applied_at: datetime
    expires_at: Optional[datetime]
    stripe_promotion_code_id: Optional[str]

    class Config:
        from_attributes = True
