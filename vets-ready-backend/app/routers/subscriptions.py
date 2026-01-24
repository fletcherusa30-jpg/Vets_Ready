"""
Subscription and Pricing API Routes
Implements veteran subscription management and pricing display
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.database import get_db
from app.schemas.subscription import (
    VeteranSubscriptionCreate,
    VeteranSubscriptionUpdate,
    VeteranSubscriptionResponse,
    VeteranPricingResponse,
    PricingTier,
)
from app.models.subscription import VeteranSubscription, SubscriptionTier
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])


@router.get("/pricing/veteran", response_model=VeteranPricingResponse)
async def get_veteran_pricing():
    """
    Get veteran subscription pricing information
    Based on PRICING_STRATEGY.md
    """
    return VeteranPricingResponse(
        free=PricingTier(
            name="Free Tier",
            price_monthly=None,
            price_yearly=Decimal("0.00"),
            features=[
                "Basic benefits search (10/month)",
                "Claims calculator (basic)",
                "Job board browsing",
                "Community discovery (view only)",
                "Budget calculator (1 scenario)",
                "Retirement overview",
            ],
            limits={"benefits_searches": 10, "budget_scenarios": 1},
        ),
        pro=PricingTier(
            name="Pro Tier",
            price_monthly=Decimal("1.67"),
            price_yearly=Decimal("20.00"),
            features=[
                "✅ Unlimited everything",
                "✅ Full claims analysis with AI recommendations",
                "✅ Unlimited retirement scenarios & projections",
                "✅ Complete MOS translator & resume builder",
                "✅ Job application tracking",
                "✅ Save/export all reports",
                "✅ Business directory bookmarking",
                "✅ Email support",
                "✅ No ads",
            ],
            limits={},
        ),
        family=PricingTier(
            name="Family Plan",
            price_monthly=Decimal("2.92"),
            price_yearly=Decimal("35.00"),
            features=[
                "All Pro features",
                "Up to 4 family members",
                "Spouse access to transition tools",
                "Dependent benefits tracking",
                "Family budgeting tools",
            ],
            limits={"max_family_members": 4},
        ),
        lifetime=PricingTier(
            name="Lifetime Access",
            price_one_time=Decimal("200.00"),
            features=[
                "Never pay again",
                "All future features included",
                "Early access to new modules",
                "Legacy member badge",
            ],
            limits={},
        ),
    )


@router.post("/", response_model=VeteranSubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription: VeteranSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new veteran subscription
    Requires authentication
    """
    # Check if user already has subscription
    existing = (
        db.query(VeteranSubscription)
        .filter(VeteranSubscription.user_id == subscription.user_id)
        .filter(VeteranSubscription.is_active == True)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription",
        )

    # Set pricing based on tier
    pricing_map = {
        SubscriptionTier.FREE: Decimal("0.00"),
        SubscriptionTier.PRO: Decimal("20.00"),
        SubscriptionTier.FAMILY: Decimal("35.00"),
        SubscriptionTier.LIFETIME: Decimal("200.00"),
    }

    # Set family member limits
    family_limits = {
        SubscriptionTier.FREE: 1,
        SubscriptionTier.PRO: 1,
        SubscriptionTier.FAMILY: 4,
        SubscriptionTier.LIFETIME: 1,
    }

    new_subscription = VeteranSubscription(
        user_id=subscription.user_id,
        tier=subscription.tier,
        amount_paid=pricing_map[subscription.tier],
        auto_renew=subscription.auto_renew,
        max_family_members=family_limits[subscription.tier],
    )

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return new_subscription


@router.get("/my-subscription", response_model=VeteranSubscriptionResponse)
async def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's subscription
    """
    subscription = (
        db.query(VeteranSubscription)
        .filter(VeteranSubscription.user_id == current_user.id)
        .filter(VeteranSubscription.is_active == True)
        .first()
    )

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found",
        )

    return subscription


@router.patch("/{subscription_id}", response_model=VeteranSubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    subscription_update: VeteranSubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update subscription (upgrade/downgrade/cancel)
    """
    subscription = db.query(VeteranSubscription).filter(VeteranSubscription.id == subscription_id).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    # Only user can modify their own subscription
    if str(subscription.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this subscription",
        )

    # Update fields
    if subscription_update.tier:
        subscription.tier = subscription_update.tier
    if subscription_update.auto_renew is not None:
        subscription.auto_renew = subscription_update.auto_renew
    if subscription_update.is_active is not None:
        subscription.is_active = subscription_update.is_active

    db.commit()
    db.refresh(subscription)

    return subscription


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel subscription
    """
    subscription = db.query(VeteranSubscription).filter(VeteranSubscription.id == subscription_id).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found",
        )

    if str(subscription.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this subscription",
        )

    subscription.is_active = False
    subscription.auto_renew = False

    db.commit()

    return None
