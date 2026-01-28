"""
Subscription and Pricing Models
Implements tier system from PRICING_STRATEGY.md
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.types import Numeric  # Decimal is now Numeric in SQLAlchemy 2.x
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class SubscriptionTier(str, enum.Enum):
    """Veteran subscription tiers"""
    FREE = "free"
    PRO = "pro"  # $20/year
    FAMILY = "family"  # $35/year
    LIFETIME = "lifetime"  # $200 one-time


class EmployerTier(str, enum.Enum):
    """Employer/recruiter pricing tiers"""
    BASIC_POST = "basic_post"  # $299/post (30 days)
    PREMIUM_POST = "premium_post"  # $599/post (60 days)
    RECRUITING_PACKAGE = "recruiting_package"  # $2,499/month
    ENTERPRISE = "enterprise"  # $9,999/month


class BusinessListingTier(str, enum.Enum):
    """Business directory listing tiers"""
    BASIC = "basic"  # $99/month
    FEATURED = "featured"  # $299/month
    PREMIUM = "premium"  # $999/month
    ADVERTISING = "advertising"  # $2,999-$9,999/month


class PaymentStatus(str, enum.Enum):
    """Payment transaction status"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class VeteranSubscription(Base):
    """Veteran user subscriptions"""
    __tablename__ = "vetsready_veteran_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_users.id"), nullable=False)
    tier = Column(Enum(SubscriptionTier), nullable=False, default=SubscriptionTier.FREE)

    # Pricing
    amount_paid = Column(Numeric(10, 2), default=0.00)

    # Dates
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # None for lifetime
    renewed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=True)

    # Payment
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    # Family plan
    family_member_count = Column(Integer, default=1)
    max_family_members = Column(Integer, default=1)  # 4 for family plan

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="subscription")


class EmployerAccount(Base):
    """Employer/recruiter accounts"""
    __tablename__ = "vetsready_employer_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Company info
    company_name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False, unique=True)
    contact_phone = Column(String(50))

    # Account details
    tier = Column(Enum(EmployerTier), nullable=False)
    monthly_rate = Column(Numeric(10, 2), nullable=False)

    # Limits and usage
    job_posts_limit = Column(Integer, default=1)  # -1 for unlimited
    job_posts_used = Column(Integer, default=0)
    resume_searches_limit = Column(Integer, default=0)  # -1 for unlimited
    resume_searches_used = Column(Integer, default=0)

    # Features
    has_featured_placement = Column(Boolean, default=False)
    has_resume_database = Column(Boolean, default=False)
    has_analytics = Column(Boolean, default=False)
    has_account_manager = Column(Boolean, default=False)
    has_api_access = Column(Boolean, default=False)

    # Status
    is_active = Column(Boolean, default=True)
    billing_day = Column(Integer, default=1)  # Day of month for billing

    # Payment
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_posts = relationship("JobPost", back_populates="employer")
    invoices = relationship("Invoice", back_populates="employer")


class BusinessListing(Base):
    """Business directory listings"""
    __tablename__ = "vetsready_business_listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Business info
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255))
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    website = Column(String(500))

    # Location
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))

    # Category
    category = Column(String(100))
    subcategory = Column(String(100))

    # Certification
    is_veteran_owned = Column(Boolean, default=False)
    is_vosb_certified = Column(Boolean, default=False)
    is_sdvosb_certified = Column(Boolean, default=False)

    # Subscription
    tier = Column(Enum(BusinessListingTier), nullable=False, default=BusinessListingTier.BASIC)
    monthly_rate = Column(Numeric(10, 2), nullable=False)

    # Features
    has_featured_placement = Column(Boolean, default=False)
    has_enhanced_profile = Column(Boolean, default=False)
    has_testimonials = Column(Boolean, default=False)
    has_email_collection = Column(Boolean, default=False)
    has_analytics = Column(Boolean, default=False)
    has_sponsored_content = Column(Boolean, default=False)
    has_newsletter_mentions = Column(Boolean, default=False)

    # Stats
    monthly_impressions = Column(Integer, default=0)
    monthly_clicks = Column(Integer, default=0)
    monthly_leads = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Payment
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    invoices = relationship("Invoice", back_populates="business")


class JobPost(Base):
    """Employer job postings"""
    __tablename__ = "vetsready_job_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employer_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_employer_accounts.id"), nullable=False)

    # Job details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255))
    salary_min = Column(Numeric(12, 2))
    salary_max = Column(Numeric(12, 2))
    job_type = Column(String(50))  # full-time, part-time, contract

    # Targeting
    mos_codes = Column(Text)  # Comma-separated MOS codes
    required_clearance = Column(String(50))

    # Pricing
    post_type = Column(String(50))  # basic, premium
    price_paid = Column(Numeric(10, 2), nullable=False)
    duration_days = Column(Integer, default=30)

    # Features
    is_featured = Column(Boolean, default=False)
    is_highlighted = Column(Boolean, default=False)

    # Stats
    views = Column(Integer, default=0)
    applications = Column(Integer, default=0)

    # Dates
    posted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employer = relationship("EmployerAccount", back_populates="job_posts")


class Lead(Base):
    """Lead generation tracking"""
    __tablename__ = "vetsready_leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Lead info
    veteran_user_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_users.id"), nullable=False)
    partner_type = Column(String(50), nullable=False)  # va_claims_rep, financial_advisor, etc.
    partner_name = Column(String(255))
    partner_email = Column(String(255))

    # Lead details
    lead_source = Column(String(100))  # claims_analyzer, retirement_calculator, etc.
    lead_value = Column(Numeric(10, 2))  # Amount paid for this lead

    # Status
    status = Column(String(50), default="pending")  # pending, contacted, converted, lost
    contacted_at = Column(DateTime, nullable=True)
    converted_at = Column(DateTime, nullable=True)

    # Notes
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Invoice(Base):
    """Billing and payment tracking"""
    __tablename__ = "vetsready_invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Customer (can be employer or business)
    employer_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_employer_accounts.id"), nullable=True)
    business_id = Column(UUID(as_uuid=True), ForeignKey("vetsready_business_listings.id"), nullable=True)

    # Invoice details
    invoice_number = Column(String(50), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(Text)

    # Payment
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(String(50))  # stripe, paypal, etc.
    stripe_invoice_id = Column(String(255), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)

    # Dates
    invoice_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employer = relationship("EmployerAccount", back_populates="invoices")
    business = relationship("BusinessListing", back_populates="invoices")


class VSOPartner(Base):
    """VSO (Veteran Service Organization) white-label partners"""
    __tablename__ = "vetsready_vso_partners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Organization info
    organization_name = Column(String(255), nullable=False)
    organization_type = Column(String(100))  # VFW, American Legion, DAV, etc.
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False, unique=True)
    contact_phone = Column(String(50))

    # Features (claims/benefits always free)
    has_retirement_module = Column(Boolean, default=False)  # $149/month
    has_job_board_module = Column(Boolean, default=False)  # $249/month
    has_white_label = Column(Boolean, default=False)  # $699/month
    has_api_access = Column(Boolean, default=False)  # $99/month
    has_premium_analytics = Column(Boolean, default=False)  # $79/month

    # Pricing
    monthly_rate = Column(Numeric(10, 2), default=0.00)

    # Branding
    custom_logo_url = Column(String(500))
    custom_domain = Column(String(255))
    custom_colors = Column(Text)  # JSON

    # Stats
    member_count = Column(Integer, default=0)
    monthly_active_users = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)

    # Payment
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

