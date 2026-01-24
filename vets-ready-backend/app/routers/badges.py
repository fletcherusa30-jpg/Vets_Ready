"""Badge achievement endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.utils.security import get_current_user_id
from app.services.badge_service import BadgeService
from typing import List

router = APIRouter(prefix="/api/badges", tags=["badges"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/my-badges", response_model=List[dict])
async def get_my_badges(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get user's unlocked badges"""
    badge_service = BadgeService(db)
    return badge_service.get_user_badges(user_id)


@router.post("/check")
async def check_badges(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Check for new badge eligibility and award any earned badges"""
    badge_service = BadgeService(db)
    newly_awarded = badge_service.check_and_award_badges(user_id)
    return {
        "newly_awarded": newly_awarded,
        "message": f"Awarded {len(newly_awarded)} new badge(s)!" if newly_awarded else "No new badges earned yet",
    }
