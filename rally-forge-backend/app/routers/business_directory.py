"""
Business Directory Listings API
B2B revenue stream - businesses pay to be listed, veterans search for free
Implements "Scout System" monetization from PRICING_STRATEGY.md
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.database import get_db
from app.schemas.subscription import (
    BusinessListingCreate,
    BusinessListingUpdate,
    BusinessListingResponse,
    BusinessDirectoryPricingResponse,
    PricingTier,
)
from app.models.subscription import BusinessListing, BusinessListingTier
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/business-directory", tags=["Business Directory"])


@router.get("/pricing", response_model=BusinessDirectoryPricingResponse)
async def get_business_directory_pricing():
    """
    Get business directory pricing
    Veterans search free, businesses pay to be found
    """
    return BusinessDirectoryPricingResponse(
        basic=PricingTier(
            name="Basic Listing",
            price_monthly=Decimal("99.00"),
            features=[
                "Company profile",
                "Contact information",
                "Website link",
                "Logo display",
                "Shows in search results",
            ],
            limits={},
        ),
        featured=PricingTier(
            name="Featured Listing",
            price_monthly=Decimal("299.00"),
            features=[
                "Top placement in category",
                "Enhanced profile with photos",
                "Veteran testimonials section",
                "Email collection widget",
                "Monthly impression stats",
            ],
            limits={},
        ),
        premium=PricingTier(
            name="Premium Marketing Package",
            price_monthly=Decimal("999.00"),
            features=[
                "Everything in Featured",
                "Sponsored content posts",
                "Email newsletter mentions (2x/month)",
                "Social media shares",
                "Dedicated landing page",
                "Lead tracking dashboard",
            ],
            limits={"newsletter_mentions_per_month": 2},
        ),
        advertising=PricingTier(
            name="Advertising Campaign",
            price_monthly=Decimal("2999.00"),
            features=[
                "Custom targeting (state, MOS, interests)",
                "Banner ads across platform",
                "Sponsored search results",
                "Email campaigns to veteran segments",
                "Performance analytics",
                "A/B testing",
            ],
            limits={},
        ),
    )


@router.post("/listings", response_model=BusinessListingResponse, status_code=status.HTTP_201_CREATED)
async def create_business_listing(
    listing: BusinessListingCreate,
    db: Session = Depends(get_db),
):
    """
    Create business directory listing
    Open endpoint for business self-signup
    """
    # Check if email already exists
    existing = db.query(BusinessListing).filter(BusinessListing.email == listing.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Set pricing and features based on tier
    tier_config = {
        BusinessListingTier.BASIC: {
            "monthly_rate": Decimal("99.00"),
            "features": {},
        },
        BusinessListingTier.FEATURED: {
            "monthly_rate": Decimal("299.00"),
            "features": {
                "has_featured_placement": True,
                "has_enhanced_profile": True,
                "has_testimonials": True,
                "has_email_collection": True,
                "has_analytics": True,
            },
        },
        BusinessListingTier.PREMIUM: {
            "monthly_rate": Decimal("999.00"),
            "features": {
                "has_featured_placement": True,
                "has_enhanced_profile": True,
                "has_testimonials": True,
                "has_email_collection": True,
                "has_analytics": True,
                "has_sponsored_content": True,
                "has_newsletter_mentions": True,
            },
        },
        BusinessListingTier.ADVERTISING: {
            "monthly_rate": Decimal("2999.00"),
            "features": {
                "has_featured_placement": True,
                "has_enhanced_profile": True,
                "has_testimonials": True,
                "has_email_collection": True,
                "has_analytics": True,
                "has_sponsored_content": True,
                "has_newsletter_mentions": True,
            },
        },
    }

    config = tier_config[listing.tier]

    new_listing = BusinessListing(
        business_name=listing.business_name,
        owner_name=listing.owner_name,
        email=listing.email,
        phone=listing.phone,
        website=listing.website,
        address=listing.address,
        city=listing.city,
        state=listing.state,
        zip_code=listing.zip_code,
        category=listing.category,
        is_veteran_owned=listing.is_veteran_owned,
        is_vosb_certified=listing.is_vosb_certified,
        is_sdvosb_certified=listing.is_sdvosb_certified,
        tier=listing.tier,
        monthly_rate=config["monthly_rate"],
        **config["features"],
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return new_listing


@router.get("/listings", response_model=List[BusinessListingResponse])
async def search_business_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    state: Optional[str] = None,
    veteran_owned_only: bool = Query(False),
    certified_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """
    Search business directory
    Free for veterans - businesses paid to be listed
    """
    query = db.query(BusinessListing).filter(BusinessListing.is_active == True)

    if category:
        query = query.filter(BusinessListing.category == category)

    if state:
        query = query.filter(BusinessListing.state == state)

    if veteran_owned_only:
        query = query.filter(BusinessListing.is_veteran_owned == True)

    if certified_only:
        query = query.filter(
            (BusinessListing.is_vosb_certified == True) | (BusinessListing.is_sdvosb_certified == True)
        )

    # Featured listings first
    query = query.order_by(BusinessListing.has_featured_placement.desc(), BusinessListing.created_at.desc())

    listings = query.offset(skip).limit(limit).all()

    # Increment impression counts for analytics
    for listing in listings:
        listing.monthly_impressions += 1

    db.commit()

    return listings


@router.get("/listings/{listing_id}", response_model=BusinessListingResponse)
async def get_business_listing(
    listing_id: str,
    db: Session = Depends(get_db),
):
    """Get business listing details and track click"""
    listing = db.query(BusinessListing).filter(BusinessListing.id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business listing not found",
        )

    # Increment click count for analytics
    listing.monthly_clicks += 1
    db.commit()
    db.refresh(listing)

    return listing


@router.patch("/listings/{listing_id}", response_model=BusinessListingResponse)
async def update_business_listing(
    listing_id: str,
    listing_update: BusinessListingUpdate,
    db: Session = Depends(get_db),
):
    """Update business listing"""
    listing = db.query(BusinessListing).filter(BusinessListing.id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business listing not found",
        )

    update_data = listing_update.dict(exclude_unset=True)

    # If upgrading tier, update features and pricing
    if "tier" in update_data:
        tier_config = {
            BusinessListingTier.BASIC: {
                "monthly_rate": Decimal("99.00"),
                "features": {
                    "has_featured_placement": False,
                    "has_enhanced_profile": False,
                    "has_testimonials": False,
                    "has_email_collection": False,
                    "has_analytics": False,
                    "has_sponsored_content": False,
                    "has_newsletter_mentions": False,
                },
            },
            BusinessListingTier.FEATURED: {
                "monthly_rate": Decimal("299.00"),
                "features": {
                    "has_featured_placement": True,
                    "has_enhanced_profile": True,
                    "has_testimonials": True,
                    "has_email_collection": True,
                    "has_analytics": True,
                    "has_sponsored_content": False,
                    "has_newsletter_mentions": False,
                },
            },
            BusinessListingTier.PREMIUM: {
                "monthly_rate": Decimal("999.00"),
                "features": {
                    "has_featured_placement": True,
                    "has_enhanced_profile": True,
                    "has_testimonials": True,
                    "has_email_collection": True,
                    "has_analytics": True,
                    "has_sponsored_content": True,
                    "has_newsletter_mentions": True,
                },
            },
            BusinessListingTier.ADVERTISING: {
                "monthly_rate": Decimal("2999.00"),
                "features": {
                    "has_featured_placement": True,
                    "has_enhanced_profile": True,
                    "has_testimonials": True,
                    "has_email_collection": True,
                    "has_analytics": True,
                    "has_sponsored_content": True,
                    "has_newsletter_mentions": True,
                },
            },
        }

        new_tier = update_data["tier"]
        config = tier_config[new_tier]

        listing.monthly_rate = config["monthly_rate"]
        for feature, value in config["features"].items():
            setattr(listing, feature, value)

    # Update other fields
    for field, value in update_data.items():
        if field != "tier":
            setattr(listing, field, value)

    db.commit()
    db.refresh(listing)

    return listing


@router.post("/listings/{listing_id}/contact")
async def contact_business(
    listing_id: str,
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Veteran contacts business (tracks lead for analytics)
    """
    listing = db.query(BusinessListing).filter(BusinessListing.id == listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business listing not found",
        )

    # Increment lead count for business analytics
    listing.monthly_leads += 1
    db.commit()

    return {
        "message": "Contact request sent successfully",
        "business_email": listing.email,
        "business_phone": listing.phone,
    }


@router.get("/categories")
async def get_business_categories(db: Session = Depends(get_db)):
    """Get list of all business categories"""
    categories = (
        db.query(BusinessListing.category)
        .filter(BusinessListing.is_active == True)
        .filter(BusinessListing.category != None)
        .distinct()
        .all()
    )

    return {"categories": [cat[0] for cat in categories if cat[0]]}
