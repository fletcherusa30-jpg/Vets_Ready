"""
Employer and Job Board API Routes
B2B revenue stream - employers pay to post jobs and access veteran talent
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta

from app.database import get_db
from app.schemas.subscription import (
    EmployerAccountCreate,
    EmployerAccountUpdate,
    EmployerAccountResponse,
    JobPostCreate,
    JobPostUpdate,
    JobPostResponse,
    EmployerPricingResponse,
    PricingTier,
)
from app.models.subscription import EmployerAccount, JobPost, EmployerTier
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/employers", tags=["Employers & Job Board"])


@router.get("/pricing", response_model=EmployerPricingResponse)
async def get_employer_pricing():
    """
    Get employer/recruiter pricing information
    Based on PRICING_STRATEGY.md - employers pay, veterans use for free
    """
    return EmployerPricingResponse(
        basic_post=PricingTier(
            name="Basic Job Posting",
            price_one_time=Decimal("299.00"),
            features=[
                "30-day listing",
                "Standard listing",
                "Appears in search results",
                "Basic analytics",
            ],
            limits={"duration_days": 30, "posts": 1},
        ),
        premium_post=PricingTier(
            name="Premium Job Posting",
            price_one_time=Decimal("599.00"),
            features=[
                "60-day listing",
                "Featured placement (top of results)",
                "Highlighted in veteran emails",
                "Advanced analytics",
                "MOS-match targeting",
            ],
            limits={"duration_days": 60, "posts": 1},
        ),
        recruiting_package=PricingTier(
            name="Recruiting Package",
            price_monthly=Decimal("2499.00"),
            features=[
                "Unlimited job posts",
                "Resume database access (unlimited searches)",
                "Applicant tracking integration",
                "Dedicated account manager",
                "Quarterly hiring analytics report",
            ],
            limits={},
        ),
        enterprise=PricingTier(
            name="Enterprise Recruiting",
            price_monthly=Decimal("9999.00"),
            features=[
                "Everything in Recruiting Package",
                "Custom veteran talent pipeline",
                "On-site recruiting events",
                "Priority matching algorithm",
                "API integration",
                "White-label career portal",
            ],
            limits={},
        ),
    )


@router.post("/accounts", response_model=EmployerAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_employer_account(
    employer: EmployerAccountCreate,
    db: Session = Depends(get_db),
):
    """
    Create employer account
    Open endpoint for employer self-signup
    """
    # Check if email already exists
    existing = db.query(EmployerAccount).filter(EmployerAccount.contact_email == employer.contact_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Set pricing and limits based on tier
    tier_config = {
        EmployerTier.BASIC_POST: {
            "monthly_rate": Decimal("299.00"),
            "job_posts_limit": 1,
            "resume_searches_limit": 0,
            "features": {},
        },
        EmployerTier.PREMIUM_POST: {
            "monthly_rate": Decimal("599.00"),
            "job_posts_limit": 1,
            "resume_searches_limit": 0,
            "features": {"has_featured_placement": True, "has_analytics": True},
        },
        EmployerTier.RECRUITING_PACKAGE: {
            "monthly_rate": Decimal("2499.00"),
            "job_posts_limit": -1,  # unlimited
            "resume_searches_limit": -1,
            "features": {
                "has_featured_placement": True,
                "has_resume_database": True,
                "has_analytics": True,
                "has_account_manager": True,
            },
        },
        EmployerTier.ENTERPRISE: {
            "monthly_rate": Decimal("9999.00"),
            "job_posts_limit": -1,
            "resume_searches_limit": -1,
            "features": {
                "has_featured_placement": True,
                "has_resume_database": True,
                "has_analytics": True,
                "has_account_manager": True,
                "has_api_access": True,
            },
        },
    }

    config = tier_config[employer.tier]

    new_employer = EmployerAccount(
        company_name=employer.company_name,
        contact_name=employer.contact_name,
        contact_email=employer.contact_email,
        contact_phone=employer.contact_phone,
        tier=employer.tier,
        monthly_rate=config["monthly_rate"],
        job_posts_limit=config["job_posts_limit"],
        resume_searches_limit=config["resume_searches_limit"],
        **config["features"],
    )

    db.add(new_employer)
    db.commit()
    db.refresh(new_employer)

    return new_employer


@router.get("/accounts/{employer_id}", response_model=EmployerAccountResponse)
async def get_employer_account(
    employer_id: str,
    db: Session = Depends(get_db),
):
    """Get employer account details"""
    employer = db.query(EmployerAccount).filter(EmployerAccount.id == employer_id).first()

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer account not found",
        )

    return employer


@router.patch("/accounts/{employer_id}", response_model=EmployerAccountResponse)
async def update_employer_account(
    employer_id: str,
    employer_update: EmployerAccountUpdate,
    db: Session = Depends(get_db),
):
    """Update employer account"""
    employer = db.query(EmployerAccount).filter(EmployerAccount.id == employer_id).first()

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer account not found",
        )

    # Update fields
    update_data = employer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employer, field, value)

    db.commit()
    db.refresh(employer)

    return employer


@router.post("/jobs", response_model=JobPostResponse, status_code=status.HTTP_201_CREATED)
async def create_job_post(
    job: JobPostCreate,
    db: Session = Depends(get_db),
):
    """
    Create job posting
    Employer pays per post or uses monthly allowance
    """
    employer = db.query(EmployerAccount).filter(EmployerAccount.id == job.employer_id).first()

    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer account not found",
        )

    # Check if employer has available posts
    if employer.job_posts_limit != -1:  # not unlimited
        if employer.job_posts_used >= employer.job_posts_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Job post limit reached. Upgrade plan or wait for renewal.",
            )

    # Set pricing
    price = Decimal("299.00") if job.post_type == "basic" else Decimal("599.00")

    # Calculate expiration
    expires_at = datetime.utcnow() + timedelta(days=job.duration_days)

    new_job = JobPost(
        employer_id=job.employer_id,
        title=job.title,
        description=job.description,
        location=job.location,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        job_type=job.job_type,
        mos_codes=job.mos_codes,
        required_clearance=job.required_clearance,
        post_type=job.post_type,
        price_paid=price,
        duration_days=job.duration_days,
        expires_at=expires_at,
        is_featured=(job.post_type == "premium"),
    )

    db.add(new_job)

    # Increment employer usage
    employer.job_posts_used += 1

    db.commit()
    db.refresh(new_job)

    return new_job


@router.get("/jobs", response_model=List[JobPostResponse])
async def list_job_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: bool = Query(True),
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all job postings
    Veterans use this for free - employers paid to post
    """
    query = db.query(JobPost)

    if is_active:
        query = query.filter(JobPost.is_active == True)
        query = query.filter(JobPost.expires_at > datetime.utcnow())

    if location:
        query = query.filter(JobPost.location.ilike(f"%{location}%"))

    if job_type:
        query = query.filter(JobPost.job_type == job_type)

    # Featured posts first
    query = query.order_by(JobPost.is_featured.desc(), JobPost.posted_at.desc())

    jobs = query.offset(skip).limit(limit).all()

    return jobs


@router.get("/jobs/{job_id}", response_model=JobPostResponse)
async def get_job_post(
    job_id: str,
    db: Session = Depends(get_db),
):
    """Get job post details and increment view count"""
    job = db.query(JobPost).filter(JobPost.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found",
        )

    # Increment view count
    job.views += 1
    db.commit()
    db.refresh(job)

    return job


@router.patch("/jobs/{job_id}", response_model=JobPostResponse)
async def update_job_post(
    job_id: str,
    job_update: JobPostUpdate,
    db: Session = Depends(get_db),
):
    """Update job posting"""
    job = db.query(JobPost).filter(JobPost.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found",
        )

    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


@router.post("/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Apply to job (veteran action)
    Increments application count for employer analytics
    """
    job = db.query(JobPost).filter(JobPost.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job post not found",
        )

    if not job.is_active or job.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job posting is no longer active",
        )

    # Increment application count
    job.applications += 1
    db.commit()

    return {
        "message": "Application submitted successfully",
        "job_id": job_id,
        "employer_contact": "Contact information will be shared",
    }
