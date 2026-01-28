"""
Updated Backend Endpoints with Database Integration
Examples of how to update existing endpoints to use SQLAlchemy + repositories
"""

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.core.repositories import get_repositories
from backend.app.models.database import (
    Veteran, ServiceRecord, Resume, JobMatch, Budget,
    JobMatchStatus, BudgetStatus
)

app = FastAPI(title="VetsReady API", version="2.0")


# ============================================================================
# VETERAN ENDPOINTS
# ============================================================================

@app.get("/api/v2/veterans/{veteran_id}")
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    """Get veteran profile from database"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    return {
        "id": veteran.id,
        "name": f"{veteran.first_name} {veteran.last_name}",
        "email": veteran.email,
        "phone": veteran.phone,
        "service_branch": veteran.service_branch.value,
        "separation_rank": veteran.separation_rank,
        "years_service": veteran.years_service,
        "separation_date": veteran.separation_date.isoformat(),
        "discharge_status": veteran.discharge_status.value,
        "disability_rating": veteran.disability_rating,
        "profile_complete": veteran.profile_complete,
        "created_at": veteran.created_at.isoformat()
    }


@app.get("/api/v2/veterans/email/{email}")
def get_veteran_by_email(email: str, db: Session = Depends(get_db)):
    """Get veteran by email"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_email(email)

    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran with email {email} not found"
        )

    return {"id": veteran.id, "name": f"{veteran.first_name} {veteran.last_name}"}


@app.get("/api/v2/veterans/branch/{branch}")
def get_veterans_by_branch(branch: str, db: Session = Depends(get_db)):
    """Get all veterans by service branch"""
    repos = get_repositories(db)
    veterans = repos.veterans.get_by_service_branch(branch)

    return [
        {
            "id": v.id,
            "name": f"{v.first_name} {v.last_name}",
            "service_branch": v.service_branch.value,
            "years_service": v.years_service
        }
        for v in veterans
    ]


@app.get("/api/v2/veterans/disabled")
def get_disabled_veterans(db: Session = Depends(get_db)):
    """Get all disabled veterans (disability_rating > 0)"""
    repos = get_repositories(db)
    veterans = repos.veterans.get_disabled_veterans()

    return [
        {
            "id": v.id,
            "name": f"{v.first_name} {v.last_name}",
            "disability_rating": v.disability_rating,
            "service_branch": v.service_branch.value
        }
        for v in veterans
    ]


@app.post("/api/v2/veterans")
def create_veteran(veteran_data: dict, db: Session = Depends(get_db)):
    """Create new veteran profile"""
    repos = get_repositories(db)

    # Check if veteran already exists
    if repos.veterans.get_by_id(veteran_data.get("id")):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Veteran already exists"
        )

    new_veteran = Veteran(
        id=veteran_data.get("id"),
        first_name=veteran_data.get("first_name"),
        last_name=veteran_data.get("last_name"),
        email=veteran_data.get("email"),
        phone=veteran_data.get("phone"),
        date_of_birth=datetime.fromisoformat(veteran_data.get("date_of_birth")),
        service_branch=veteran_data.get("service_branch"),
        separation_rank=veteran_data.get("separation_rank"),
        years_service=veteran_data.get("years_service"),
        separation_date=datetime.fromisoformat(veteran_data.get("separation_date")),
        disability_rating=veteran_data.get("disability_rating", 0)
    )

    created = repos.veterans.create(new_veteran)
    return {"id": created.id, "message": "Veteran created successfully"}


# ============================================================================
# RESUME BUILDER ENDPOINTS (DATABASE BACKED)
# ============================================================================

@app.post("/api/v2/resumes/generate/{veteran_id}")
def generate_resume_db(veteran_id: str, resume_data: dict, db: Session = Depends(get_db)):
    """Generate and save resume to database"""
    repos = get_repositories(db)

    # Verify veteran exists
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    # Create resume
    new_resume = Resume(
        id=f"RES_{veteran_id}_{datetime.now().timestamp()}",
        veteran_id=veteran_id,
        version=resume_data.get("version", "original"),
        title=resume_data.get("title"),
        summary=resume_data.get("summary"),
        experience_items=resume_data.get("experience_items", []),
        skills=resume_data.get("skills", []),
        certifications=resume_data.get("certifications", []),
        generated_timestamp=datetime.utcnow()
    )

    saved = repos.resumes.create(new_resume)
    return {"resume_id": saved.id, "message": "Resume generated and saved"}


@app.get("/api/v2/resumes/{veteran_id}")
def get_veteran_resumes(veteran_id: str, db: Session = Depends(get_db)):
    """Get all resumes for a veteran"""
    repos = get_repositories(db)
    resumes = repos.resumes.get_by_veteran(veteran_id)

    return [
        {
            "id": r.id,
            "version": r.version,
            "title": r.title,
            "skills": r.skills,
            "generated": r.generated_timestamp.isoformat()
        }
        for r in resumes
    ]


@app.get("/api/v2/resumes/{veteran_id}/latest")
def get_latest_resume(veteran_id: str, db: Session = Depends(get_db)):
    """Get most recent resume for a veteran"""
    repos = get_repositories(db)
    resume = repos.resumes.get_latest(veteran_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No resumes found for veteran {veteran_id}"
        )

    return {
        "id": resume.id,
        "version": resume.version,
        "title": resume.title,
        "summary": resume.summary,
        "skills": resume.skills,
        "experience": resume.experience_items
    }


# ============================================================================
# JOB RECRUITING ENDPOINTS (DATABASE BACKED)
# ============================================================================

@app.get("/api/v2/jobs/active")
def get_active_jobs(db: Session = Depends(get_db)):
    """Get all active job listings"""
    repos = get_repositories(db)
    jobs = repos.job_listings.get_active()

    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.employer.name if j.employer else "Unknown",
            "location": j.location,
            "salary_range": {
                "min": j.salary_min,
                "max": j.salary_max
            },
            "remote": j.remote,
            "skills": j.required_skills
        }
        for j in jobs
    ]


@app.get("/api/v2/jobs/location/{location}")
def get_jobs_by_location(location: str, db: Session = Depends(get_db)):
    """Get jobs by location"""
    repos = get_repositories(db)
    jobs = repos.job_listings.get_by_location(location)

    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.employer.name,
            "salary_range": {"min": j.salary_min, "max": j.salary_max}
        }
        for j in jobs
    ]


@app.get("/api/v2/matches/{veteran_id}")
def get_job_matches(veteran_id: str, db: Session = Depends(get_db)):
    """Get all job matches for a veteran"""
    repos = get_repositories(db)
    matches = repos.job_matches.get_for_veteran(veteran_id)

    return [
        {
            "match_id": m.id,
            "job_id": m.job_listing_id,
            "job_title": m.job_listing.title,
            "company": m.job_listing.employer.name,
            "overall_score": m.overall_score,
            "skill_match": m.skill_match,
            "experience_match": m.experience_match,
            "cultural_match": m.cultural_match,
            "match_status": m.match_status.value,
            "viewed": m.viewed,
            "applied": m.applied
        }
        for m in matches
    ]


@app.get("/api/v2/matches/{veteran_id}/strong")
def get_strong_job_matches(veteran_id: str, db: Session = Depends(get_db)):
    """Get strong (score >= 0.75) job matches for veteran"""
    repos = get_repositories(db)
    matches = repos.job_matches.get_strong_matches(veteran_id)

    return [
        {
            "match_id": m.id,
            "job_title": m.job_listing.title,
            "company": m.job_listing.employer.name,
            "overall_score": m.overall_score,
            "match_status": m.match_status.value
        }
        for m in matches
    ]


@app.post("/api/v2/matches/{veteran_id}/{job_id}")
def record_job_interaction(
    veteran_id: str,
    job_id: str,
    action: str,  # "view", "apply", "hire"
    db: Session = Depends(get_db)
):
    """Record veteran interaction with a job (view, apply, hire)"""
    repos = get_repositories(db)

    # Get the match
    matches = repos.job_matches.get_for_veteran(veteran_id)
    match = next((m for m in matches if m.job_listing_id == job_id), None)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job match not found"
        )

    # Update based on action
    if action == "view":
        match.viewed = True
    elif action == "apply":
        match.applied = True
    elif action == "hire":
        match.hired = True

    db.commit()
    return {"message": f"Job interaction '{action}' recorded"}


@app.get("/api/v2/employers/vet-friendly")
def get_vet_friendly_employers(db: Session = Depends(get_db)):
    """Get all veteran-friendly employers"""
    repos = get_repositories(db)
    employers = repos.employers.get_vet_friendly()

    return [
        {
            "id": e.id,
            "name": e.name,
            "industry": e.industry,
            "veteran_hiring_percentage": e.veteran_hiring_percentage,
            "headquarters": e.headquarters
        }
        for e in employers
    ]


@app.get("/api/v2/employers/top-hirers")
def get_top_veteran_hirers(limit: int = 10, db: Session = Depends(get_db)):
    """Get top veteran-hiring employers"""
    repos = get_repositories(db)
    employers = repos.employers.get_top_veteran_hirers(limit)

    return [
        {
            "name": e.name,
            "veteran_hiring_percentage": e.veteran_hiring_percentage,
            "open_jobs": len(e.job_listings)
        }
        for e in employers
    ]


# ============================================================================
# FINANCIAL TOOLS ENDPOINTS (DATABASE BACKED)
# ============================================================================

@app.post("/api/v2/budgets/{veteran_id}")
def create_budget(veteran_id: str, budget_data: dict, db: Session = Depends(get_db)):
    """Create monthly budget"""
    repos = get_repositories(db)

    # Verify veteran exists
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found"
        )

    # Create budget
    total_income = (
        budget_data.get("employment_income", 0) +
        budget_data.get("va_disability_income", 0) +
        budget_data.get("military_retirement_income", 0) +
        budget_data.get("other_income", 0)
    )

    total_expenses = (
        budget_data.get("housing_expense", 0) +
        budget_data.get("utilities_expense", 0) +
        budget_data.get("food_expense", 0) +
        budget_data.get("transportation_expense", 0) +
        budget_data.get("healthcare_expense", 0) +
        budget_data.get("other_expense", 0)
    )

    net_income = total_income - total_expenses
    savings_rate = (net_income / total_income * 100) if total_income > 0 else 0

    new_budget = Budget(
        id=f"BUDGET_{veteran_id}_{datetime.now().strftime('%Y%m%d')}",
        veteran_id=veteran_id,
        month_year=budget_data.get("month_year"),
        employment_income=budget_data.get("employment_income", 0),
        va_disability_income=budget_data.get("va_disability_income", 0),
        military_retirement_income=budget_data.get("military_retirement_income", 0),
        other_income=budget_data.get("other_income", 0),
        total_income=total_income,
        housing_expense=budget_data.get("housing_expense", 0),
        utilities_expense=budget_data.get("utilities_expense", 0),
        food_expense=budget_data.get("food_expense", 0),
        transportation_expense=budget_data.get("transportation_expense", 0),
        healthcare_expense=budget_data.get("healthcare_expense", 0),
        other_expense=budget_data.get("other_expense", 0),
        total_expenses=total_expenses,
        net_income=net_income,
        savings_rate=savings_rate,
        status=BudgetStatus.DRAFT
    )

    saved = repos.budgets.create(new_budget)

    return {
        "budget_id": saved.id,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_income": net_income,
        "savings_rate": f"{savings_rate:.1f}%"
    }


@app.get("/api/v2/budgets/{veteran_id}")
def get_veteran_budgets(veteran_id: str, db: Session = Depends(get_db)):
    """Get all budgets for a veteran"""
    repos = get_repositories(db)
    budgets = repos.budgets.get_by_veteran(veteran_id)

    return [
        {
            "id": b.id,
            "month_year": b.month_year,
            "total_income": b.total_income,
            "total_expenses": b.total_expenses,
            "net_income": b.net_income,
            "savings_rate": f"{b.savings_rate:.1f}%",
            "status": b.status.value
        }
        for b in budgets
    ]


@app.get("/api/v2/budgets/{veteran_id}/current")
def get_current_budget(veteran_id: str, db: Session = Depends(get_db)):
    """Get most recent budget for a veteran"""
    repos = get_repositories(db)
    budget = repos.budgets.get_current(veteran_id)

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budgets found for veteran {veteran_id}"
        )

    return {
        "budget_id": budget.id,
        "month_year": budget.month_year,
        "income_breakdown": {
            "employment": budget.employment_income,
            "va_disability": budget.va_disability_income,
            "military_retirement": budget.military_retirement_income,
            "other": budget.other_income,
            "total": budget.total_income
        },
        "expense_breakdown": {
            "housing": budget.housing_expense,
            "utilities": budget.utilities_expense,
            "food": budget.food_expense,
            "transportation": budget.transportation_expense,
            "healthcare": budget.healthcare_expense,
            "other": budget.other_expense,
            "total": budget.total_expenses
        },
        "summary": {
            "net_income": budget.net_income,
            "savings_rate": f"{budget.savings_rate:.1f}%"
        }
    }


# ============================================================================
# HEALTH CHECK & DATABASE STATUS
# ============================================================================

@app.get("/api/v2/health")
def health_check(db: Session = Depends(get_db)):
    """API health check with database status"""
    try:
        from backend.app.core.database import health_check
        db_status = health_check()

        return {
            "api": "healthy",
            "database": db_status["status"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "api": "healthy",
            "database": "unhealthy",
            "error": str(e)
        }


@app.get("/api/v2/stats")
def get_api_stats(db: Session = Depends(get_db)):
    """Get system statistics"""
    repos = get_repositories(db)

    all_veterans = repos.veterans.get_all(limit=10000)
    all_jobs = repos.job_listings.get_active()

    return {
        "total_veterans": len(all_veterans),
        "active_jobs": len(all_jobs),
        "disabled_veterans": len(repos.veterans.get_disabled_veterans()),
        "vet_friendly_employers": len(repos.employers.get_vet_friendly())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
