"""Retirement planning API routes"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel

from app.database import get_db
from app.services.retirement_service import RetirementService
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api/retirement", tags=["retirement"])


# ===== PYDANTIC MODELS =====

class RetirementEligibilityRequest(BaseModel):
    """Request for retirement eligibility calculation"""
    years_of_service: int
    rank: str
    branch: str


class PensionCalculationRequest(BaseModel):
    """Request for pension calculation"""
    base_pay: float
    years_of_service: int
    disability_rating: int = 0


class BudgetCalculationRequest(BaseModel):
    """Request for budget calculation"""
    monthly_income: float
    expenses: Dict[str, float]  # e.g., {"housing": 2000, "food": 600, "utilities": 200}


class RetirementGuideRequest(BaseModel):
    """Request for retirement guide"""
    years_of_service: int
    rank: str
    branch: str
    base_pay: float
    disability_rating: int = 0
    monthly_expenses: Dict[str, float] = {}


class RetirementProjectionRequest(BaseModel):
    """Request for retirement lifestyle projection"""
    monthly_income: float
    life_expectancy_years: int = 25
    inflation_rate: float = 0.03


# ===== API ENDPOINTS =====

@router.post("/eligibility")
async def check_retirement_eligibility(
    request: RetirementEligibilityRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Check military retirement eligibility

    Requires 20+ years of service for retirement pension
    """
    service = RetirementService(db)
    result = service.calculate_retirement_eligibility(
        request.years_of_service,
        request.rank,
        request.branch
    )
    return result


@router.post("/pension")
async def calculate_pension(
    request: PensionCalculationRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Calculate monthly military retirement pension

    Includes VA disability benefits if applicable
    """
    service = RetirementService(db)
    result = service.calculate_monthly_pension(
        request.base_pay,
        request.years_of_service,
        request.disability_rating
    )
    return result


@router.post("/budget")
async def calculate_budget(
    request: BudgetCalculationRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Calculate monthly budget with income vs expenses

    Returns surplus/deficit and budget recommendations
    """
    service = RetirementService(db)
    result = service.calculate_monthly_budget(
        user_id,
        request.monthly_income,
        request.expenses
    )
    return result


@router.post("/projection")
async def project_retirement_lifestyle(
    request: RetirementProjectionRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Project retirement lifestyle for X years

    Shows yearly income projections with inflation adjustment
    """
    service = RetirementService(db)
    result = service.project_retirement_lifestyle(
        request.monthly_income,
        request.life_expectancy_years,
        request.inflation_rate
    )
    return result


@router.post("/guide")
async def get_retirement_guide(
    request: RetirementGuideRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get personalized AI-powered retirement guide

    Combines eligibility, pension, and budget for comprehensive recommendations
    """
    service = RetirementService(db)

    # Calculate all components
    eligibility = service.calculate_retirement_eligibility(
        request.years_of_service,
        request.rank,
        request.branch
    )

    pension = service.calculate_monthly_pension(
        request.base_pay,
        request.years_of_service,
        request.disability_rating
    )

    budget = service.calculate_monthly_budget(
        user_id,
        pension.get("total_monthly_income", 0),
        request.monthly_expenses
    )

    # Generate comprehensive guide
    guide = service.generate_retirement_guide(
        user_id,
        eligibility,
        pension,
        budget,
        request.disability_rating
    )

    return guide


@router.post("/smc-eligibility")
async def check_smc_eligibility(
    disability_rating: int = 0,
    dependent_count: int = 0,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Check SMC (Special Monthly Compensation) eligibility and rates

    SMC provides additional benefits for certain disability ratings
    """
    service = RetirementService(db)
    result = service.calculate_smc_eligibility(
        disability_rating,
        dependent_count
    )
    return result


@router.get("/health")
async def health_check():
    """Health check for retirement service"""
    return {
        "status": "healthy",
        "service": "retirement_planning",
        "version": "1.0.0"
    }
