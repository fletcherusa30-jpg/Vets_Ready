"""
Pydantic Schemas for Subscription and Pricing
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class SubscriptionTierEnum(str, Enum):
    FREE = "free"
    PRO = "pro"
    FAMILY = "family"
    LIFETIME = "lifetime"


class EmployerTierEnum(str, Enum):
    BASIC_POST = "basic_post"
    PREMIUM_POST = "premium_post"
    RECRUITING_PACKAGE = "recruiting_package"
    ENTERPRISE = "enterprise"


class BusinessListingTierEnum(str, Enum):
    BASIC = "basic"
    FEATURED = "featured"
    PREMIUM = "premium"
    ADVERTISING = "advertising"


# Veteran Subscription Schemas
class VeteranSubscriptionCreate(BaseModel):
    user_id: str
    tier: SubscriptionTierEnum
    auto_renew: bool = True


class VeteranSubscriptionUpdate(BaseModel):
    tier: Optional[SubscriptionTierEnum] = None
    auto_renew: Optional[bool] = None
    is_active: Optional[bool] = None


class VeteranSubscriptionResponse(BaseModel):
    id: str
    user_id: str
    tier: SubscriptionTierEnum
    amount_paid: Decimal
    started_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    auto_renew: bool
    family_member_count: int
    max_family_members: int
    created_at: datetime

    class Config:
        from_attributes = True


# Employer Account Schemas
class EmployerAccountCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    tier: EmployerTierEnum


class EmployerAccountUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    tier: Optional[EmployerTierEnum] = None
    is_active: Optional[bool] = None


class EmployerAccountResponse(BaseModel):
    id: str
    company_name: str
    contact_name: str
    contact_email: str
    contact_phone: Optional[str]
    tier: EmployerTierEnum
    monthly_rate: Decimal
    job_posts_limit: int
    job_posts_used: int
    resume_searches_limit: int
    resume_searches_used: int
    is_active: bool
    has_featured_placement: bool
    has_resume_database: bool
    has_analytics: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Business Listing Schemas
class BusinessListingCreate(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255)
    owner_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = Field(None, max_length=2)
    zip_code: Optional[str] = None
    category: Optional[str] = None
    is_veteran_owned: bool = False
    is_vosb_certified: bool = False
    is_sdvosb_certified: bool = False
    tier: BusinessListingTierEnum


class BusinessListingUpdate(BaseModel):
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    category: Optional[str] = None
    tier: Optional[BusinessListingTierEnum] = None
    is_active: Optional[bool] = None


class BusinessListingResponse(BaseModel):
    id: str
    business_name: str
    owner_name: Optional[str]
    email: str
    phone: Optional[str]
    website: Optional[str]
    city: Optional[str]
    state: Optional[str]
    category: Optional[str]
    is_veteran_owned: bool
    is_vosb_certified: bool
    is_sdvosb_certified: bool
    tier: BusinessListingTierEnum
    monthly_rate: Decimal
    has_featured_placement: bool
    has_enhanced_profile: bool
    monthly_impressions: int
    monthly_clicks: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Job Post Schemas
class JobPostCreate(BaseModel):
    employer_id: str
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    location: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    job_type: Optional[str] = Field(None, regex="^(full-time|part-time|contract)$")
    mos_codes: Optional[str] = None
    required_clearance: Optional[str] = None
    post_type: str = Field("basic", regex="^(basic|premium)$")
    duration_days: int = Field(30, ge=1, le=90)


class JobPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    is_active: Optional[bool] = None


class JobPostResponse(BaseModel):
    id: str
    employer_id: str
    title: str
    description: str
    location: Optional[str]
    salary_min: Optional[Decimal]
    salary_max: Optional[Decimal]
    job_type: Optional[str]
    post_type: str
    price_paid: Decimal
    duration_days: int
    is_featured: bool
    views: int
    applications: int
    posted_at: datetime
    expires_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# Lead Schemas
class LeadCreate(BaseModel):
    veteran_user_id: str
    partner_type: str = Field(..., regex="^(va_claims_rep|financial_advisor|mortgage_broker|education|franchise|insurance)$")
    partner_name: Optional[str] = None
    partner_email: Optional[EmailStr] = None
    lead_source: str
    lead_value: Decimal


class LeadUpdate(BaseModel):
    status: Optional[str] = Field(None, regex="^(pending|contacted|converted|lost)$")
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    veteran_user_id: str
    partner_type: str
    partner_name: Optional[str]
    lead_source: str
    lead_value: Decimal
    status: str
    contacted_at: Optional[datetime]
    converted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# VSO Partner Schemas
class VSOPartnerCreate(BaseModel):
    organization_name: str = Field(..., min_length=1, max_length=255)
    organization_type: Optional[str] = None
    contact_name: str = Field(..., min_length=1, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = None


class VSOPartnerUpdate(BaseModel):
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    has_retirement_module: Optional[bool] = None
    has_job_board_module: Optional[bool] = None
    has_white_label: Optional[bool] = None
    has_api_access: Optional[bool] = None
    has_premium_analytics: Optional[bool] = None
    custom_logo_url: Optional[str] = None
    custom_domain: Optional[str] = None
    is_active: Optional[bool] = None


class VSOPartnerResponse(BaseModel):
    id: str
    organization_name: str
    organization_type: Optional[str]
    contact_name: str
    contact_email: str
    has_retirement_module: bool
    has_job_board_module: bool
    has_white_label: bool
    has_api_access: bool
    has_premium_analytics: bool
    monthly_rate: Decimal
    member_count: int
    monthly_active_users: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Pricing Information (Read-only)
class PricingTier(BaseModel):
    name: str
    price_monthly: Optional[Decimal] = None
    price_yearly: Optional[Decimal] = None
    price_one_time: Optional[Decimal] = None
    features: List[str]
    limits: dict


class VeteranPricingResponse(BaseModel):
    free: PricingTier
    pro: PricingTier
    family: PricingTier
    lifetime: PricingTier


class EmployerPricingResponse(BaseModel):
    basic_post: PricingTier
    premium_post: PricingTier
    recruiting_package: PricingTier
    enterprise: PricingTier


class BusinessDirectoryPricingResponse(BaseModel):
    basic: PricingTier
    featured: PricingTier
    premium: PricingTier
    advertising: PricingTier
