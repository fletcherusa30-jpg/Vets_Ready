"""Claim schemas (Pydantic models)"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class MedicalEvidence(BaseModel):
    """Medical evidence for a claim"""

    diagnoses: List[str] = []
    treatments: List[str] = []
    medications: List[str] = []
    hospitalizations: List[str] = []
    severity_notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "diagnoses": ["PTSD", "Depression"],
                "treatments": ["VA hospital therapy", "Counseling"],
                "medications": ["Sertraline", "Prazosin"],
                "hospitalizations": ["2024-06-15 to 2024-07-15"],
                "severity_notes": "Service-connected condition verified",
            }
        }


class ClaimAnalysisRequest(BaseModel):
    """Request schema for claim analysis"""

    title: str
    condition_codes: List[str]
    medical_evidence: MedicalEvidence

    class Config:
        json_schema_extra = {
            "example": {
                "title": "PTSD and Depression Claim",
                "condition_codes": ["F4310", "F3229"],
                "medical_evidence": {
                    "diagnoses": ["PTSD", "Depression"],
                    "treatments": ["VA hospital therapy", "Counseling"],
                    "medications": ["Sertraline", "Prazosin"],
                    "hospitalizations": ["2024-06-15 to 2024-07-15"],
                    "severity_notes": "Service-connected condition verified",
                },
            }
        }


class DisabilityRating(BaseModel):
    """Disability rating for a single condition"""

    code: str
    name: str
    rating: int
    justification: str


class ClaimAnalysisResponse(BaseModel):
    """Response schema for claim analysis"""

    id: str
    user_id: str
    title: str
    condition_ratings: List[DisabilityRating]
    combined_rating: int
    recommendations: List[str]
    next_steps: List[str]
    analysis_timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440001",
                "title": "PTSD and Depression Claim",
                "condition_ratings": [
                    {
                        "code": "F4310",
                        "name": "PTSD",
                        "rating": 50,
                        "justification": "Severe PTSD with treatment history",
                    },
                    {
                        "code": "F3229",
                        "name": "Depression",
                        "rating": 30,
                        "justification": "Co-occurring depression with medication",
                    },
                ],
                "combined_rating": 70,
                "recommendations": [
                    "File for SMC (Special Monthly Compensation)",
                    "Request evaluation for additional conditions",
                ],
                "next_steps": [
                    "Submit medical evidence to VA",
                    "Schedule C&P examination",
                ],
                "analysis_timestamp": "2026-01-23T00:00:00",
            }
        }


class ClaimResponse(BaseModel):
    """Schema for full claim response"""

    id: str
    user_id: str
    title: str
    combined_rating: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
