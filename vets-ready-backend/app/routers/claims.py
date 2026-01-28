"""Claims analysis routes"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.claim import ClaimAnalysisRequest, ClaimAnalysisResponse, ClaimResponse
from app.services.claims_service import ClaimsService
from app.services.badge_service import BadgeService
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.post("/analyze", response_model=ClaimAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_claim(
    claim_data: ClaimAnalysisRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Analyze a disability claim

    Returns disability ratings and recommendations
    """
    service = ClaimsService(db)
    result = service.analyze_claim(user_id, claim_data)

    # Check for badge eligibility after claim analysis
    badge_service = BadgeService(db)
    badge_service.check_and_award_badges(user_id)

    return ClaimAnalysisResponse(**result)


@router.get("", response_model=List[ClaimResponse])
async def list_claims(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List all claims for current user"""
    service = ClaimsService(db)
    return service.get_user_claims(user_id, skip=skip, limit=limit)


@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    claim_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a specific claim"""
    service = ClaimsService(db)
    return service.get_claim_by_id(claim_id, user_id)
