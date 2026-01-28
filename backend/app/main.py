"""
VetsReady FastAPI Backend - Database Integrated

PHASE 3 COMPLETE IMPLEMENTATION
Database-backed REST API with SQLAlchemy ORM

API Spec:
- Veteran Management: CRUD operations for veteran profiles
- Resume Builder: Generate and manage veteran resumes
- Job Recruiting: Job matching and application tracking
- Financial Tools: Budget planning and income tracking
- Scanner: Document processing (DD214, certificates)
"""

import os
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, EmailStr
import uvicorn

# Database imports
from backend.app.core.database import get_db, health_check as db_health_check
from backend.app.core.repositories import get_repositories
from backend.app.models.database import (
    Veteran, ServiceRecord, Resume, JobListing, JobMatch,
    Budget, IncomeEntry, ExpenseEntry, Certificate,
    ServiceBranch, DischargeStatus, JobMatchStatus, BudgetStatus,
    BudgetProfile, IncomeSource, ExpenseItem, SavingsGoal, SubscriptionItem
)
from backend.app.schemas.budget import (
    IncomeSourceCreate, IncomeSourceUpdate, IncomeSourceResponse,
    ExpenseItemCreate, ExpenseItemUpdate, ExpenseItemResponse,
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse,
    SubscriptionItemCreate, SubscriptionItemUpdate, SubscriptionItemResponse,
    BudgetProfileResponse, BudgetSummaryResponse, InsightsResponse, ScenarioRequest, ScenarioResponse
)
from backend.app.core.budget_repositories import get_budget_repositories
from backend.app.core.budget_insights import InsightsEngine, ScenarioSimulator
from backend.app.core.disability_calculator import DisabilityCalculator, DisabilityCondition, DisabilitySide, ExtremityGroup, validate_conditions
from backend.app.schemas.disability import CombinedRatingRequest, CombinedRatingResponse

app = FastAPI(
    title="VetsReady API",
    version="3.0.0",
    description="Database-integrated veteran services platform"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKGROUND_IMAGE_ROOT = Path(
    os.getenv("BACKGROUND_IMAGE_ROOT", Path(__file__).resolve().parents[2] / "App" / "Images")
).resolve()
BACKGROUND_IMAGE_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/static/backgrounds", StaticFiles(directory=str(BACKGROUND_IMAGE_ROOT)), name="backgrounds")

# Include routers
try:
    from backend.app.routers.scanner_upload import router as scanner_router
    app.include_router(scanner_router)
except ImportError:
    print("Warning: Scanner router not available")

try:
    from backend.app.routers.retirement_planner import router as retirement_router
    app.include_router(retirement_router)
except ImportError:
    print("Warning: Retirement planner router not available")

try:
    from backend.app.routers.disability_wizard import router as disability_router
    app.include_router(disability_router)
except ImportError:
    print("Warning: Disability wizard router not available")

try:
    from backend.app.routers.profile_background import router as background_router
    app.include_router(background_router)
except ImportError:
    print("Warning: Profile background router not available")

# ============================================================================
# PYDANTIC MODELS FOR REQUEST/RESPONSE
# ============================================================================

class VeteranCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    service_branch: str
    separation_rank: str
    years_service: int
    separation_date: date
    discharge_status: str
    disability_rating: int = 0


class VeteranUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    disability_rating: Optional[int] = None
    profile_complete: Optional[bool] = None


class ResumeGenerate(BaseModel):
    veteran_id: str
    title: str = "Professional Resume"
    summary: Optional[str] = None
    skills: List[str] = []


class JobApplicationCreate(BaseModel):
    veteran_id: str
    job_id: str
    match_score: int


# ============================================================================
# HEALTH & UTILITY ENDPOINTS
# ============================================================================

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Basic health check with database connectivity"""
    db_status = db_health_check()
    return {
        "status": "healthy" if db_status["connected"] else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status
    }


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    repos = get_repositories(db)

    veterans = repos.veterans.get_all()
    resumes = repos.resumes.get_all()
    jobs = repos.jobs.get_all()

    return {
        "total_veterans": len(veterans),
        "total_resumes": len(resumes),
        "total_jobs": len(jobs),
        "active_jobs": len([j for j in jobs if j.status == "active"]),
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================================================
# VETERAN MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/api/veterans")
def get_all_veterans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """Get all veterans with pagination"""
    repos = get_repositories(db)
    veterans = repos.veterans.get_all(skip=skip, limit=limit)

    return {
        "total": len(veterans),
        "veterans": [
            {
                "id": v.id,
                "name": f"{v.first_name} {v.last_name}",
                "email": v.email,
                "service_branch": v.service_branch.value,
                "years_service": v.years_service,
                "disability_rating": v.disability_rating,
                "profile_complete": v.profile_complete
            }
            for v in veterans
        ]
    }


@app.get("/api/veterans/{veteran_id}")
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    """Get veteran profile by ID"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    return {
        "id": veteran.id,
        "first_name": veteran.first_name,
        "last_name": veteran.last_name,
        "email": veteran.email,
        "phone": veteran.phone,
        "service_branch": veteran.service_branch.value,
        "separation_rank": veteran.separation_rank,
        "years_service": veteran.years_service,
        "separation_date": veteran.separation_date.isoformat(),
        "discharge_status": veteran.discharge_status.value,
        "disability_rating": veteran.disability_rating,
        "profile_complete": veteran.profile_complete,
        "created_at": veteran.created_at.isoformat(),
        "updated_at": veteran.updated_at.isoformat()
    }


@app.get("/api/veterans/email/{email}")
def get_veteran_by_email(email: str, db: Session = Depends(get_db)):
    """Get veteran by email address"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_email(email)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran with email {email} not found"
        )

    return {
        "id": veteran.id,
        "name": f"{veteran.first_name} {veteran.last_name}",
        "email": veteran.email,
        "service_branch": veteran.service_branch.value
    }


@app.get("/api/veterans/branch/{branch}")
def get_veterans_by_branch(branch: str, db: Session = Depends(get_db)):
    """Get all veterans by service branch"""
    repos = get_repositories(db)

    # Validate branch
    try:
        branch_enum = ServiceBranch(branch.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid service branch. Must be one of: {[b.value for b in ServiceBranch]}"
        )

    veterans = repos.veterans.get_by_service_branch(branch_enum.value)

    return {
        "branch": branch_enum.value,
        "count": len(veterans),
        "veterans": [
            {
                "id": v.id,
                "name": f"{v.first_name} {v.last_name}",
                "years_service": v.years_service,
                "separation_rank": v.separation_rank
            }
            for v in veterans
        ]
    }


@app.get("/api/veterans/disabled")
def get_disabled_veterans(
    min_rating: int = Query(30, ge=0, le=100),
    db: Session = Depends(get_db)
):
    """Get veterans with disability rating above threshold"""
    repos = get_repositories(db)
    veterans = repos.veterans.get_disabled_veterans(min_rating)

    return {
        "min_rating": min_rating,
        "count": len(veterans),
        "veterans": [
            {
                "id": v.id,
                "name": f"{v.first_name} {v.last_name}",
                "disability_rating": v.disability_rating,
                "service_branch": v.service_branch.value
            }
            for v in veterans
        ]
    }


@app.post("/api/veterans", status_code=status.HTTP_201_CREATED)
def create_veteran(veteran_data: VeteranCreate, db: Session = Depends(get_db)):
    """Create new veteran profile"""
    repos = get_repositories(db)

    # Check if veteran already exists
    existing = repos.veterans.get_by_email(veteran_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Veteran with email {veteran_data.email} already exists"
        )

    # Validate enums
    try:
        branch = ServiceBranch(veteran_data.service_branch.upper())
        discharge = DischargeStatus(veteran_data.discharge_status.upper())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Create veteran
    veteran = Veteran(
        first_name=veteran_data.first_name,
        last_name=veteran_data.last_name,
        email=veteran_data.email,
        phone=veteran_data.phone,
        service_branch=branch,
        separation_rank=veteran_data.separation_rank,
        years_service=veteran_data.years_service,
        separation_date=veteran_data.separation_date,
        discharge_status=discharge,
        disability_rating=veteran_data.disability_rating
    )

    created = repos.veterans.create(veteran)

    return {
        "id": created.id,
        "message": "Veteran profile created successfully",
        "veteran": {
            "id": created.id,
            "name": f"{created.first_name} {created.last_name}",
            "email": created.email
        }
    }


@app.put("/api/veterans/{veteran_id}")
def update_veteran(
    veteran_id: str,
    update_data: VeteranUpdate,
    db: Session = Depends(get_db)
):
    """Update veteran profile"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(veteran, field, value)

    updated = repos.veterans.update(veteran)

    return {
        "message": "Veteran profile updated successfully",
        "veteran": {
            "id": updated.id,
            "name": f"{updated.first_name} {updated.last_name}",
            "updated_at": updated.updated_at.isoformat()
        }
    }


@app.delete("/api/veterans/{veteran_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_veteran(veteran_id: str, db: Session = Depends(get_db)):
    """Delete veteran profile"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    repos.veterans.delete(veteran.id)
    return None


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/auth/login")
def login(data: dict, db: Session = Depends(get_db)):
    """Authenticate user and return token"""
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password required"
        )

    # Get veteran by email
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_email(email)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # TODO: Add password verification when authentication system is implemented

    return {
        "token": f"jwt-token-for-{veteran.id}",
        "user": {
            "id": veteran.id,
            "email": veteran.email,
            "name": f"{veteran.first_name} {veteran.last_name}",
            "service_branch": veteran.service_branch.value
        }
    }


# ============================================================================
# SCANNER ENDPOINTS (Document Processing)
# ============================================================================

@app.post("/api/scanner/dd214")
def scan_dd214(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and scan DD214 document"""
    filename = file.filename or "uploaded_document"
    content = file.file.read()

    # TODO: Integrate with actual scanner pipeline
    # For now, return mock data

    return {
        "filename": filename,
        "size": len(content),
        "status": "processing",
        "parsed": {
            "name": "John Doe",
            "branch": "Army",
            "service_dates": "2001-2010",
            "rank": "E-5",
            "discharge_status": "Honorable"
        },
        "message": "Document uploaded successfully. Processing in background."
    }


# ============================================================================
# RESUME BUILDER ENDPOINTS
# ============================================================================

@app.post("/resume/generate", status_code=status.HTTP_201_CREATED)
def generate_resume(resume_data: ResumeGenerate, db: Session = Depends(get_db)):
    """Generate resume for veteran"""
    repos = get_repositories(db)

    # Verify veteran exists
    veteran = repos.veterans.get_by_id(resume_data.veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {resume_data.veteran_id} not found"
        )

    # Get service records for resume content
    service_records = repos.service_records.get_by_veteran_id(resume_data.veteran_id)

    # Build resume
    summary = resume_data.summary or f"Dedicated {veteran.service_branch.value} veteran with {veteran.years_service} years of service"

    skills = resume_data.skills if resume_data.skills else [
        "Leadership", "Teamwork", "Problem Solving",
        "Communication", "Attention to Detail"
    ]

    # Create experience items from service records
    experience_items = []
    for record in service_records:
        experience_items.append({
            "title": record.duty_station or "Military Service",
            "organization": veteran.service_branch.value,
            "start_date": record.start_date.isoformat() if record.start_date else None,
            "end_date": record.end_date.isoformat() if record.end_date else None,
            "description": f"Served as {veteran.separation_rank}"
        })

    # Generate version number
    existing_resumes = repos.resumes.get_by_veteran_id(resume_data.veteran_id)
    version = f"v{len(existing_resumes) + 1}"

    # Create resume
    resume = Resume(
        veteran_id=resume_data.veteran_id,
        version=version,
        title=resume_data.title,
        summary=summary,
        skills=skills,
        experience_items=experience_items,
        education_items=[],
        certifications=[]
    )

    created = repos.resumes.create(resume)

    return {
        "id": created.id,
        "version": created.version,
        "message": "Resume generated successfully",
        "resume": {
            "id": created.id,
            "title": created.title,
            "summary": created.summary,
            "skills": created.skills,
            "experience_count": len(created.experience_items)
        }
    }


@app.get("/api/resumes/{veteran_id}")
def get_veteran_resumes(veteran_id: str, db: Session = Depends(get_db)):
    """Get all resumes for a veteran"""
    repos = get_repositories(db)

    # Verify veteran exists
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    resumes = repos.resumes.get_by_veteran_id(veteran_id)

    return {
        "veteran_id": veteran_id,
        "count": len(resumes),
        "resumes": [
            {
                "id": r.id,
                "version": r.version,
                "title": r.title,
                "created_at": r.created_at.isoformat(),
                "updated_at": r.updated_at.isoformat()
            }
            for r in resumes
        ]
    }


@app.get("/api/resumes/{veteran_id}/latest")
def get_latest_resume(veteran_id: str, db: Session = Depends(get_db)):
    """Get latest resume for veteran"""
    repos = get_repositories(db)
    resume = repos.resumes.get_latest_by_veteran(veteran_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No resumes found for veteran {veteran_id}"
        )

    return {
        "id": resume.id,
        "veteran_id": resume.veteran_id,
        "version": resume.version,
        "title": resume.title,
        "summary": resume.summary,
        "skills": resume.skills,
        "experience_items": resume.experience_items,
        "education_items": resume.education_items,
        "certifications": resume.certifications,
        "created_at": resume.created_at.isoformat()
    }


@app.get("/api/resumes/detail/{resume_id}")
def get_resume_detail(resume_id: str, db: Session = Depends(get_db)):
    """Get full resume details"""
    repos = get_repositories(db)
    resume = repos.resumes.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume {resume_id} not found"
        )

    return {
        "id": resume.id,
        "veteran_id": resume.veteran_id,
        "version": resume.version,
        "title": resume.title,
        "summary": resume.summary,
        "skills": resume.skills,
        "experience_items": resume.experience_items,
        "education_items": resume.education_items,
        "certifications": resume.certifications,
        "created_at": resume.created_at.isoformat(),
        "updated_at": resume.updated_at.isoformat()
    }


@app.delete("/api/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    """Delete resume"""
    repos = get_repositories(db)
    resume = repos.resumes.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume {resume_id} not found"
        )

    repos.resumes.delete(resume.id)
    return None


# ============================================================================
# JOB RECRUITING ENDPOINTS
# ============================================================================

@app.get("/jobs/matches")
def get_job_matches(
    veteran_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get job matches for veteran or all available jobs"""
    repos = get_repositories(db)

    if veteran_id:
        # Get matches for specific veteran
        matches = repos.job_matches.get_by_veteran_id(veteran_id)

        return {
            "veteran_id": veteran_id,
            "count": len(matches),
            "matches": [
                {
                    "job_id": m.job_id,
                    "title": m.job_listing.title,
                    "company": m.job_listing.company,
                    "match_score": m.match_score,
                    "status": m.status.value,
                    "created_at": m.created_at.isoformat()
                }
                for m in matches
            ]
        }
    else:
        # Return all active jobs
        jobs = repos.jobs.get_active_jobs()

        return {
            "count": len(jobs),
            "matches": [
                {
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "salary_range": f"${j.salary_min:,} - ${j.salary_max:,}" if j.salary_min else "Not specified",
                    "remote": j.remote
                }
                for j in jobs
            ]
        }


@app.get("/api/jobs/active")
def get_active_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    """Get all active job listings"""
    repos = get_repositories(db)
    jobs = repos.jobs.get_active_jobs(skip=skip, limit=limit)

    return {
        "count": len(jobs),
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "remote": j.remote,
                "required_skills": j.required_skills,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "posted_date": j.posted_date.isoformat() if j.posted_date else None
            }
            for j in jobs
        ]
    }


@app.get("/api/jobs/location/{location}")
def get_jobs_by_location(location: str, db: Session = Depends(get_db)):
    """Get jobs by location"""
    repos = get_repositories(db)
    jobs = repos.jobs.get_by_location(location)

    return {
        "location": location,
        "count": len(jobs),
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "remote": j.remote
            }
            for j in jobs
        ]
    }


@app.get("/api/jobs/remote")
def get_remote_jobs(db: Session = Depends(get_db)):
    """Get remote job opportunities"""
    repos = get_repositories(db)
    jobs = repos.jobs.get_remote_jobs()

    return {
        "count": len(jobs),
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "required_skills": j.required_skills
            }
            for j in jobs
        ]
    }


@app.post("/api/matches", status_code=status.HTTP_201_CREATED)
def create_job_match(match_data: JobApplicationCreate, db: Session = Depends(get_db)):
    """Create job match/application"""
    repos = get_repositories(db)

    # Verify veteran and job exist
    veteran = repos.veterans.get_by_id(match_data.veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {match_data.veteran_id} not found"
        )

    job = repos.jobs.get_by_id(match_data.job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {match_data.job_id} not found"
        )

    # Create match
    match = JobMatch(
        veteran_id=match_data.veteran_id,
        job_id=match_data.job_id,
        match_score=match_data.match_score,
        status=JobMatchStatus.APPLIED
    )

    created = repos.job_matches.create(match)

    return {
        "id": created.id,
        "message": "Job application submitted successfully",
        "match": {
            "veteran_id": created.veteran_id,
            "job_id": created.job_id,
            "match_score": created.match_score,
            "status": created.status.value
        }
    }


@app.get("/api/matches/{veteran_id}/strong")
def get_strong_matches(
    veteran_id: str,
    min_score: int = Query(80, ge=0, le=100),
    db: Session = Depends(get_db)
):
    """Get high-scoring job matches for veteran"""
    repos = get_repositories(db)
    matches = repos.job_matches.get_strong_matches(veteran_id, min_score)

    return {
        "veteran_id": veteran_id,
        "min_score": min_score,
        "count": len(matches),
        "matches": [
            {
                "job_id": m.job_id,
                "title": m.job_listing.title,
                "company": m.job_listing.company,
                "match_score": m.match_score,
                "status": m.status.value
            }
            for m in matches
        ]
    }


# ============================================================================
# FINANCIAL TOOLS ENDPOINTS
# ============================================================================

@app.post("/api/budgets/{veteran_id}", status_code=status.HTTP_201_CREATED)
def create_budget(veteran_id: str, db: Session = Depends(get_db)):
    """Create budget for veteran"""
    repos = get_repositories(db)

    # Verify veteran exists
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    # Create budget
    budget = Budget(
        veteran_id=veteran_id,
        month=datetime.utcnow().month,
        year=datetime.utcnow().year,
        status=BudgetStatus.DRAFT
    )

    created = repos.budgets.create(budget)

    return {
        "id": created.id,
        "message": "Budget created successfully",
        "budget": {
            "id": created.id,
            "veteran_id": created.veteran_id,
            "month": created.month,
            "year": created.year,
            "status": created.status.value
        }
    }


@app.get("/api/budgets/{veteran_id}")
def get_veteran_budgets(veteran_id: str, db: Session = Depends(get_db)):
    """Get all budgets for veteran"""
    repos = get_repositories(db)
    budgets = repos.budgets.get_by_veteran_id(veteran_id)

    return {
        "veteran_id": veteran_id,
        "count": len(budgets),
        "budgets": [
            {
                "id": b.id,
                "month": b.month,
                "year": b.year,
                "total_income": b.total_income,
                "total_expenses": b.total_expenses,
                "net": b.total_income - b.total_expenses,
                "status": b.status.value
            }
            for b in budgets
        ]
    }


@app.get("/api/budgets/{veteran_id}/current")
def get_current_budget(veteran_id: str, db: Session = Depends(get_db)):
    """Get current month budget for veteran"""
    repos = get_repositories(db)
    budget = repos.budgets.get_current_month(veteran_id)

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budget found for current month"
        )

    return {
        "id": budget.id,
        "veteran_id": budget.veteran_id,
        "month": budget.month,
        "year": budget.year,
        "total_income": budget.total_income,
        "total_expenses": budget.total_expenses,
        "net": budget.total_income - budget.total_expenses,
        "status": budget.status.value,
        "created_at": budget.created_at.isoformat()
    }


# ============================================================================
# BUDGET MANAGEMENT API ENDPOINTS
# ============================================================================

@app.post("/api/budgets", response_model=BudgetProfileResponse)
def create_or_get_budget(veteran_id: int, db: Session = Depends(get_db)):
    """Create or retrieve budget profile for veteran"""
    veteran = db.query(Veteran).filter_by(id=veteran_id).first()
    if not veteran:
        raise HTTPException(status_code=404, detail="Veteran not found")

    # Check if budget exists
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if budget:
        return budget

    # Create new budget
    repos = get_budget_repositories(db)
    budget = repos.budget.create(veteran_id=veteran_id)
    return budget


@app.get("/api/budgets/{veteran_id}", response_model=BudgetProfileResponse)
def get_budget(veteran_id: int, db: Session = Depends(get_db)):
    """Get budget profile for veteran"""
    repos = get_budget_repositories(db)
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


# Income Management
@app.post("/api/income", response_model=IncomeSourceResponse)
def create_income_source(veteran_id: int, income: IncomeSourceCreate, db: Session = Depends(get_db)):
    """Add income source to budget"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    new_income = repos.income.create(
        budget_profile_id=budget.id,
        source_type=income.source_type,
        monthly_amount=income.monthly_amount or 0,
        annual_amount=income.annual_amount or 0,
        description=income.description,
        is_irregular=income.is_irregular
    )

    # Recalculate budget
    repos.budget.recalculate_budget_totals(budget.id)
    return new_income


@app.get("/api/income/{veteran_id}")
def list_income_sources(veteran_id: int, db: Session = Depends(get_db)):
    """List all income sources for veteran"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    income_sources = repos.income.list(budget.id)
    return income_sources


@app.put("/api/income/{income_id}", response_model=IncomeSourceResponse)
def update_income_source(income_id: int, income: IncomeSourceUpdate, db: Session = Depends(get_db)):
    """Update income source"""
    repos = get_budget_repositories(db)
    income_source = db.query(IncomeSource).filter_by(id=income_id).first()
    if not income_source:
        raise HTTPException(status_code=404, detail="Income source not found")

    update_data = income.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(income_source, field, value)

    db.commit()
    db.refresh(income_source)

    # Recalculate budget
    repos.budget.recalculate_budget_totals(income_source.budget_profile_id)
    return income_source


@app.delete("/api/income/{income_id}")
def delete_income_source(income_id: int, db: Session = Depends(get_db)):
    """Delete income source"""
    repos = get_budget_repositories(db)
    income_source = db.query(IncomeSource).filter_by(id=income_id).first()
    if not income_source:
        raise HTTPException(status_code=404, detail="Income source not found")

    budget_id = income_source.budget_profile_id
    db.delete(income_source)
    db.commit()

    # Recalculate budget
    repos.budget.recalculate_budget_totals(budget_id)
    return {"status": "deleted"}


# Expense Management
@app.post("/api/expenses", response_model=ExpenseItemResponse)
def create_expense(veteran_id: int, expense: ExpenseItemCreate, db: Session = Depends(get_db)):
    """Add expense to budget"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    new_expense = repos.expense.create(
        budget_profile_id=budget.id,
        category=expense.category,
        description=expense.description,
        monthly_amount=expense.monthly_amount,
        is_debt_payment=expense.is_debt_payment
    )

    # Recalculate budget
    repos.budget.recalculate_budget_totals(budget.id)
    return new_expense


@app.get("/api/expenses/{veteran_id}")
def list_expenses(veteran_id: int, category: Optional[str] = None, db: Session = Depends(get_db)):
    """List expenses for veteran, optionally filtered by category"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    if category:
        expenses = repos.expense.get_by_category(budget.id, category)
    else:
        expenses = repos.expense.list(budget.id)
    return expenses


@app.put("/api/expenses/{expense_id}", response_model=ExpenseItemResponse)
def update_expense(expense_id: int, expense: ExpenseItemUpdate, db: Session = Depends(get_db)):
    """Update expense"""
    repos = get_budget_repositories(db)
    expense_item = db.query(ExpenseItem).filter_by(id=expense_id).first()
    if not expense_item:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense_item, field, value)

    db.commit()
    db.refresh(expense_item)

    # Recalculate budget
    repos.budget.recalculate_budget_totals(expense_item.budget_profile_id)
    return expense_item


@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete expense"""
    repos = get_budget_repositories(db)
    expense_item = db.query(ExpenseItem).filter_by(id=expense_id).first()
    if not expense_item:
        raise HTTPException(status_code=404, detail="Expense not found")

    budget_id = expense_item.budget_profile_id
    db.delete(expense_item)
    db.commit()

    # Recalculate budget
    repos.budget.recalculate_budget_totals(budget_id)
    return {"status": "deleted"}


# Goals Management
@app.post("/api/goals", response_model=SavingsGoalResponse)
def create_goal(veteran_id: int, goal: SavingsGoalCreate, db: Session = Depends(get_db)):
    """Create savings goal"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    new_goal = repos.goal.create(
        budget_profile_id=budget.id,
        goal_type=goal.goal_type,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        priority=goal.priority
    )
    return new_goal


@app.get("/api/goals/{veteran_id}")
def list_goals(veteran_id: int, db: Session = Depends(get_db)):
    """List goals for veteran"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    goals = repos.goal.get_goals(budget.id)
    return goals


@app.put("/api/goals/{goal_id}", response_model=SavingsGoalResponse)
def update_goal(goal_id: int, goal: SavingsGoalUpdate, db: Session = Depends(get_db)):
    """Update goal"""
    repos = get_budget_repositories(db)
    goal_item = db.query(SavingsGoal).filter_by(id=goal_id).first()
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal_item, field, value)

    db.commit()
    db.refresh(goal_item)
    return goal_item


@app.delete("/api/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete goal"""
    repos = get_budget_repositories(db)
    goal_item = db.query(SavingsGoal).filter_by(id=goal_id).first()
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal_item)
    db.commit()
    return {"status": "deleted"}


# Subscriptions Management
@app.post("/api/subscriptions", response_model=SubscriptionItemResponse)
def create_subscription(veteran_id: int, subscription: SubscriptionItemCreate, db: Session = Depends(get_db)):
    """Add subscription to track"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    new_sub = repos.subscription.create(
        budget_profile_id=budget.id,
        name=subscription.name,
        monthly_cost=subscription.monthly_cost,
        usage_level=subscription.usage_level,
        billing_cycle=subscription.billing_cycle,
        auto_renew=subscription.auto_renew,
        cancellation_url=subscription.cancellation_url
    )

    # Recalculate budget (subscriptions are expenses)
    repos.budget.recalculate_budget_totals(budget.id)
    return new_sub


@app.get("/api/subscriptions/{veteran_id}")
def list_subscriptions(veteran_id: int, db: Session = Depends(get_db)):
    """List subscriptions for veteran"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)
    subscriptions = repos.subscription.list(budget.id)
    return subscriptions


@app.put("/api/subscriptions/{subscription_id}", response_model=SubscriptionItemResponse)
def update_subscription(subscription_id: int, subscription: SubscriptionItemUpdate, db: Session = Depends(get_db)):
    """Update subscription"""
    repos = get_budget_repositories(db)
    sub_item = db.query(SubscriptionItem).filter_by(id=subscription_id).first()
    if not sub_item:
        raise HTTPException(status_code=404, detail="Subscription not found")

    update_data = subscription.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sub_item, field, value)

    db.commit()
    db.refresh(sub_item)

    # Recalculate budget
    repos.budget.recalculate_budget_totals(sub_item.budget_profile_id)
    return sub_item


@app.delete("/api/subscriptions/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Delete subscription"""
    repos = get_budget_repositories(db)
    sub_item = db.query(SubscriptionItem).filter_by(id=subscription_id).first()
    if not sub_item:
        raise HTTPException(status_code=404, detail="Subscription not found")

    budget_id = sub_item.budget_profile_id
    db.delete(sub_item)
    db.commit()

    # Recalculate budget
    repos.budget.recalculate_budget_totals(budget_id)
    return {"status": "deleted"}


# Budget Summary and Analytics
@app.get("/api/budget/summary/{veteran_id}", response_model=BudgetSummaryResponse)
def get_budget_summary(veteran_id: int, db: Session = Depends(get_db)):
    """Get complete budget summary"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    repos = get_budget_repositories(db)

    # Get category breakdown
    expenses = db.query(ExpenseItem).filter_by(budget_profile_id=budget.id).all()
    category_breakdown = {}
    for expense in expenses:
        cat = expense.category.value
        if cat not in category_breakdown:
            category_breakdown[cat] = 0
        category_breakdown[cat] += expense.monthly_amount

    # Get goals
    goals = db.query(SavingsGoal).filter_by(budget_profile_id=budget.id).all()
    total_goal_amount = sum(g.target_amount for g in goals)
    current_goal_progress = sum(g.current_amount for g in goals)

    # Get subscriptions
    subscriptions = db.query(SubscriptionItem).filter_by(budget_profile_id=budget.id).all()
    total_sub_cost = sum(s.monthly_cost for s in subscriptions)

    summary_data = {
        'budget_id': budget.id,
        'monthly_income': budget.monthly_income_total,
        'monthly_expenses': budget.monthly_expense_total,
        'net_cashflow': budget.monthly_net_cashflow,
        'savings_rate': budget.savings_rate,
        'category_breakdown': [
            {'category': cat, 'amount': amount, 'percentage': (amount/budget.monthly_expense_total)*100 if budget.monthly_expense_total > 0 else 0, 'count': 0}
            for cat, amount in category_breakdown.items()
        ],
        'active_goals': len(goals),
        'total_goal_amount': total_goal_amount,
        'current_goal_progress': current_goal_progress,
        'active_subscriptions': len(subscriptions),
        'total_subscription_cost': total_sub_cost,
        'status': budget.status.value
    }
    return summary_data


# Insights and Recommendations
@app.get("/api/budget/insights/{veteran_id}", response_model=InsightsResponse)
def get_insights(veteran_id: int, db: Session = Depends(get_db)):
    """Get financial insights and recommendations"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    insights_engine = InsightsEngine(db)
    insights = insights_engine.generate_insights(budget)
    return insights


# Scenario Simulation
@app.post("/api/budget/simulate/{veteran_id}", response_model=ScenarioResponse)
def simulate_scenario(veteran_id: int, scenario: ScenarioRequest, db: Session = Depends(get_db)):
    """Simulate a financial scenario (what-if analysis)"""
    budget = db.query(BudgetProfile).filter_by(veteran_id=veteran_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    simulator = ScenarioSimulator(db)
    result = simulator.simulate_scenario(
        budget,
        income_change=scenario.income_change,
        expense_change=scenario.expense_change
    )
    return result


# ============================================================================
# DISABILITY RATING CALCULATOR API ENDPOINTS
# ============================================================================

@app.post("/api/disability/combined-rating", response_model=CombinedRatingResponse)
def calculate_combined_rating(request: CombinedRatingRequest):
    """
    Calculate VA combined disability rating.

    Implements official VA combined rating methodology with bilateral factor support.

    Example request:
    {
      "conditions": [
        {"condition_name": "Left Knee", "percentage": 30, "side": "LEFT", "extremity_group": "LEG"},
        {"condition_name": "Right Knee", "percentage": 30, "side": "RIGHT", "extremity_group": "LEG"},
        {"condition_name": "Tinnitus", "percentage": 10, "side": "NONE"}
      ],
      "apply_bilateral_factor": true
    }
    """
    # Convert request conditions to domain objects
    conditions = []
    for cond in request.conditions:
        try:
            condition = DisabilityCondition(
                condition_name=cond.condition_name,
                percentage=cond.percentage,
                side=DisabilitySide(cond.side.value),
                extremity_group=ExtremityGroup(cond.extremity_group.value) if cond.extremity_group else None
            )
            conditions.append(condition)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid condition: {str(e)}")

    # Validate conditions
    is_valid, error_msg = validate_conditions(conditions)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Calculate combined rating
    calculator = DisabilityCalculator()
    result = calculator.calculate_combined_rating(
        conditions,
        apply_bilateral=request.apply_bilateral_factor
    )

    return CombinedRatingResponse(**result)


@app.get("/api/disability/help")
def get_disability_calculator_help():
    """Get help information about the disability calculator"""
    return {
        "title": "VA Disability Combined Rating Calculator",
        "description": "Calculate combined disability rating using VA methodology",
        "endpoint": "/api/disability/combined-rating",
        "method": "POST",
        "key_points": [
            "VA combines percentages using remaining efficiency method",
            "Higher percentages are applied first",
            "Bilateral factor (10%) applies to paired extremity conditions",
            "Final rating is rounded to nearest 10%",
            "Example: 50% + 50% = 75% (not 100%)"
        ],
        "extremity_groups": ["ARM", "LEG", "ORGAN"],
        "sides": ["LEFT", "RIGHT", "NONE"],
        "documentation": "https://www.va.gov/disability/how-we-rate-disabilities/"
    }
