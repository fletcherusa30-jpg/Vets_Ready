"""Claims analysis service with disability rating calculations"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Dict, Any

from app.models.claim import Claim
from app.models.condition import Condition
from app.schemas.claim import ClaimAnalysisRequest, DisabilityRating


class ClaimsService:
    """Service for claims analysis and disability rating calculation"""

    def __init__(self, db: Session):
        self.db = db

    def analyze_claim(self, user_id: str, claim_data: ClaimAnalysisRequest) -> Dict[str, Any]:
        """
        Analyze a disability claim and calculate combined rating

        Uses VA disability rating tables for accurate calculations.
        """
        # Fetch conditions by code
        conditions = []
        condition_ratings = []

        for code in claim_data.condition_codes:
            condition = self.db.query(Condition).filter(Condition.code == code).first()
            if not condition:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Condition with code {code} not found",
                )
            conditions.append(condition)

            # Calculate rating for this condition
            rating = self._calculate_condition_rating(
                code, condition.name, claim_data.medical_evidence
            )
            condition_ratings.append(
                DisabilityRating(
                    code=code,
                    name=condition.name,
                    rating=rating,
                    justification=self._get_rating_justification(code, rating),
                )
            )

        # Calculate combined rating using VA math
        combined_rating = self._calculate_combined_rating([cr.rating for cr in condition_ratings])

        # Generate recommendations
        recommendations = self._generate_recommendations(condition_ratings, combined_rating)
        next_steps = self._generate_next_steps(combined_rating)

        # Save claim to database
        claim = Claim(
            user_id=user_id,
            title=claim_data.title,
            medical_evidence=claim_data.medical_evidence.dict(),
            combined_rating=combined_rating,
            analysis_result={
                "condition_ratings": [cr.dict() for cr in condition_ratings],
                "combined_rating": combined_rating,
                "recommendations": recommendations,
                "next_steps": next_steps,
            },
        )

        # Associate conditions with claim
        for condition in conditions:
            if condition not in claim.conditions:
                claim.conditions.append(condition)

        self.db.add(claim)
        self.db.commit()
        self.db.refresh(claim)

        return {
            "id": claim.id,
            "user_id": user_id,
            "title": claim_data.title,
            "condition_ratings": condition_ratings,
            "combined_rating": combined_rating,
            "recommendations": recommendations,
            "next_steps": next_steps,
            "analysis_timestamp": datetime.utcnow(),
        }

    def _calculate_condition_rating(self, code: str, name: str, evidence) -> int:
        """
        Calculate disability rating for a single condition.

        Uses simplified VA rating table.
        In production, this would integrate with AI engine for smart analysis.
        """
        base_rating = {
            "F4310": 50,  # PTSD - higher if hospitalization evidence
            "F3229": 30,  # Depression
            "S06": 40,  # TBI
            "H9311": 10,  # Tinnitus
            "G89.29": 20,  # Back pain
        }.get(code, 10)

        # Adjust based on evidence severity
        if evidence.hospitalizations:
            base_rating = min(base_rating + 10, 100)

        if len(evidence.medications) > 2:
            base_rating = min(base_rating + 5, 100)

        if evidence.severity_notes and "severe" in evidence.severity_notes.lower():
            base_rating = min(base_rating + 10, 100)

        return base_rating

    def _calculate_combined_rating(self, individual_ratings: List[int]) -> int:
        """
        Calculate combined disability rating using VA formula.

        The VA doesn't add percentages; they use the combined rating table.
        Simplified formula: highest rating + (100 - highest) * sum(others) / 100
        """
        if not individual_ratings:
            return 0

        individual_ratings = sorted(individual_ratings, reverse=True)
        combined = individual_ratings[0]

        for rating in individual_ratings[1:]:
            combined = combined + (100 - combined) * rating // 100

        # Round to nearest 10
        combined = round(combined / 10) * 10
        return min(combined, 100)

    def _get_rating_justification(self, code: str, rating: int) -> str:
        """Get justification text for a rating"""
        justifications = {
            "F4310": f"PTSD rated at {rating}% based on medical evidence and symptoms",
            "F3229": f"Depression rated at {rating}% based on treatment history",
            "S06": f"TBI rated at {rating}% based on cognitive assessments",
            "H9311": f"Tinnitus rated at {rating}% based on VA standard",
            "G89.29": f"Pain disorder rated at {rating}% based on functional limitations",
        }
        return justifications.get(code, f"Condition rated at {rating}%")

    def _generate_recommendations(
        self, condition_ratings: List[DisabilityRating], combined_rating: int
    ) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []

        # Check for SMC eligibility
        if combined_rating >= 50:
            recommendations.append("File for SMC (Special Monthly Compensation)")
            recommendations.append("Review SMC schedules for potential additional benefits")

        if combined_rating >= 70:
            recommendations.append("Veteran may qualify for TDIU (Total Disability Individual Unemployability)")
            recommendations.append("Consider applying for Vocational Rehabilitation")

        # Specific recommendations per condition
        for rating in condition_ratings:
            if rating.code == "F4310" and rating.rating >= 50:
                recommendations.append("Request psychotherapy services through VA")
                recommendations.append("Explore PTSD-specific support groups")

        if not recommendations:
            recommendations.append("Request re-evaluation if symptoms worsen")

        return recommendations

    def _generate_next_steps(self, combined_rating: int) -> List[str]:
        """Generate next steps for veteran"""
        return [
            "Submit all medical evidence to VA Regional Office",
            "Schedule Compensation & Pension (C&P) examination if requested",
            f"Expect decision within 60 days of VA receiving your claim",
            "Appeal if you disagree with the rating decision",
            "Consider filing additional claims if new conditions develop",
        ]

    def get_user_claims(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Claim]:
        """Get all claims for a user"""
        return (
            self.db.query(Claim)
            .filter(Claim.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_claim_by_id(self, claim_id: str, user_id: str) -> Claim:
        """Get a specific claim for a user"""
        claim = (
            self.db.query(Claim)
            .filter(Claim.id == claim_id, Claim.user_id == user_id)
            .first()
        )
        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found",
            )
        return claim
