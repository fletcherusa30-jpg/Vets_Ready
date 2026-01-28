"""Referral system API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
from datetime import datetime, timedelta

from app.database import get_db
from app.utils.security import get_current_user_id as get_current_user
from app.models.user import User
from app.models.referral import Referral, ReferralReward
from app.schemas.referral import (
    ReferralCreate,
    ReferralResponse,
    ReferralStatsResponse,
    ReferralRewardResponse
)
from app.services.stripe_service import StripeService

router = APIRouter(prefix="/api/referrals", tags=["referrals"])
stripe_service = StripeService()


@router.post("/create-code", response_model=ReferralResponse)
async def create_referral_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a unique referral code for the user"""

    # Check if user already has a referral code
    existing = db.query(Referral).filter(
        Referral.referrer_user_id == current_user.id,
        Referral.referred_user_id == None
    ).first()

    if existing:
        return existing

    # Generate unique code
    while True:
        code = f"VR{secrets.token_hex(4).upper()}"
        if not db.query(Referral).filter(Referral.referral_code == code).first():
            break

    # Determine reward type based on user type
    reward_type = "free_month"
    reward_value = 20.00  # Value of free month

    if current_user.user_type == "employer":
        reward_type = "credit"
        reward_value = 100.00
    elif current_user.user_type == "vso_partner":
        reward_type = "premium_features"
        reward_value = 0.00

    # Create referral entry
    referral = Referral(
        referrer_user_id=current_user.id,
        referral_code=code,
        reward_type=reward_type,
        reward_value=reward_value,
        status='active'
    )

    db.add(referral)
    db.commit()
    db.refresh(referral)

    return referral


@router.get("/my-stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get referral statistics for current user"""

    # Get all referrals made by user
    referrals = db.query(Referral).filter(
        Referral.referrer_user_id == current_user.id
    ).all()

    # Calculate stats
    total_referrals = len(referrals)
    completed_referrals = len([r for r in referrals if r.status == 'completed'])
    pending_referrals = len([r for r in referrals if r.status == 'pending'])
    total_rewards_earned = sum(
        r.reward_value or 0 for r in referrals
        if r.reward_claimed
    )

    # Get active referral code
    active_code = next(
        (r for r in referrals if r.referred_user_id is None),
        None
    )

    # Generate referral link
    referral_link = None
    if active_code:
        base_url = "https://vetsready.com"  # TODO: Get from config
        referral_link = f"{base_url}/signup?ref={active_code.referral_code}"

    return {
        "referral_code": active_code.referral_code if active_code else None,
        "referral_link": referral_link,
        "total_referrals": total_referrals,
        "completed_referrals": completed_referrals,
        "pending_referrals": pending_referrals,
        "total_rewards_earned": float(total_rewards_earned),
        "available_rewards": sum(
            r.reward_value or 0 for r in referrals
            if r.status == 'completed' and not r.reward_claimed
        )
    }


@router.get("/my-referrals", response_model=List[ReferralResponse])
async def get_my_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all referrals made by current user"""

    referrals = db.query(Referral).filter(
        Referral.referrer_user_id == current_user.id,
        Referral.referred_user_id != None
    ).order_by(Referral.created_at.desc()).all()

    return referrals


@router.post("/claim-reward/{referral_id}")
async def claim_referral_reward(
    referral_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Claim reward for a completed referral"""

    referral = db.query(Referral).filter(
        Referral.id == referral_id,
        Referral.referrer_user_id == current_user.id
    ).first()

    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referral not found"
        )

    if referral.status != 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral not yet completed"
        )

    if referral.reward_claimed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward already claimed"
        )

    # Create Stripe coupon/credit based on reward type
    stripe_coupon_id = None
    stripe_promo_code_id = None

    if referral.reward_type == "free_month":
        # Create 100% off coupon for one month
        coupon = stripe_service.stripe.Coupon.create(
            percent_off=100,
            duration="once",
            name=f"Referral Reward - {referral.referral_code}"
        )
        stripe_coupon_id = coupon.id

        # Create promotion code
        promo = stripe_service.stripe.PromotionCode.create(
            coupon=coupon.id,
            code=f"REF{referral.referral_code}",
            max_redemptions=1
        )
        stripe_promo_code_id = promo.id

    elif referral.reward_type == "credit":
        # Create account credit
        if current_user.stripe_customer_id:
            stripe_service.stripe.Customer.create_balance_transaction(
                current_user.stripe_customer_id,
                amount=int(referral.reward_value * 100),  # Convert to cents
                currency="usd",
                description=f"Referral reward - {referral.referral_code}"
            )

    # Mark as claimed
    referral.reward_claimed = True
    referral.reward_claimed_at = datetime.utcnow()

    # Create reward record
    reward = ReferralReward(
        user_id=current_user.id,
        referral_id=referral.id,
        reward_type=referral.reward_type,
        reward_value=referral.reward_value,
        stripe_coupon_id=stripe_coupon_id,
        stripe_promotion_code_id=stripe_promo_code_id,
        expires_at=datetime.utcnow() + timedelta(days=365)
    )

    db.add(reward)
    db.commit()

    return {
        "message": "Reward claimed successfully",
        "reward_type": referral.reward_type,
        "reward_value": float(referral.reward_value),
        "promo_code": f"REF{referral.referral_code}" if stripe_promo_code_id else None
    }


@router.post("/apply-code/{code}")
async def apply_referral_code(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply a referral code during signup"""

    # Find referral code
    referral = db.query(Referral).filter(
        Referral.referral_code == code.upper(),
        Referral.status == 'active'
    ).first()

    if not referral:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid referral code"
        )

    if referral.referrer_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use your own referral code"
        )

    # Check if user already used a referral code
    existing = db.query(Referral).filter(
        Referral.referred_user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already used a referral code"
        )

    # Apply referral
    referral.referred_user_id = current_user.id
    referral.status = 'completed'
    referral.conversion_date = datetime.utcnow()

    # Grant reward to new user (1 month free PRO)
    # This will be applied at checkout in the frontend

    db.commit()

    return {
        "message": "Referral code applied successfully",
        "reward": "1 month free PRO tier"
    }
