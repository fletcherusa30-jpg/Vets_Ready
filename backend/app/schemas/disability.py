"""
Pydantic schemas for disability rating calculator
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from enum import Enum


class DisabilitySideSchema(str, Enum):
    """Side of body for disability"""
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    NONE = "NONE"


class ExtremityGroupSchema(str, Enum):
    """Grouping for bilateral factor application"""
    ARM = "ARM"
    LEG = "LEG"
    ORGAN = "ORGAN"


class DisabilityConditionRequest(BaseModel):
    """Request model for a single disability condition"""
    condition_name: str = Field(..., min_length=1, max_length=100)
    percentage: int = Field(..., ge=0, le=100)
    side: DisabilitySideSchema = DisabilitySideSchema.NONE
    extremity_group: Optional[ExtremityGroupSchema] = None

    model_config = {"json_schema_extra": {
        "example": {
            "condition_name": "Right Knee",
            "percentage": 30,
            "side": "RIGHT",
            "extremity_group": "LEG"
        }
    }}


class CombinedRatingRequest(BaseModel):
    """Request model for combined rating calculation"""
    conditions: List[DisabilityConditionRequest] = Field(
        ...,
        min_items=0,
        max_items=50
    )
    apply_bilateral_factor: bool = Field(
        default=True,
        description="Whether to apply bilateral factor logic"
    )

    model_config = {"json_schema_extra": {
        "example": {
            "conditions": [
                {
                    "condition_name": "Left Knee",
                    "percentage": 30,
                    "side": "LEFT",
                    "extremity_group": "LEG"
                },
                {
                    "condition_name": "Right Knee",
                    "percentage": 30,
                    "side": "RIGHT",
                    "extremity_group": "LEG"
                },
                {
                    "condition_name": "Tinnitus",
                    "percentage": 10,
                    "side": "NONE"
                }
            ],
            "apply_bilateral_factor": True
        }
    }}


class CombinedRatingResponse(BaseModel):
    """Response model for combined rating calculation"""
    true_combined_rating: float = Field(
        ...,
        description="Unrounded combined rating percentage"
    )
    rounded_combined_rating: int = Field(
        ...,
        ge=0,
        le=100,
        description="Combined rating rounded to nearest 10%"
    )
    bilateral_applied: bool = Field(
        ...,
        description="Whether bilateral factor was applied"
    )
    steps: List[str] = Field(
        ...,
        description="Step-by-step breakdown of calculation"
    )
    notes: List[str] = Field(
        default_factory=list,
        description="Additional notes about the calculation"
    )

    model_config = {"json_schema_extra": {
        "example": {
            "true_combined_rating": 56.45,
            "rounded_combined_rating": 60,
            "bilateral_applied": True,
            "steps": [
                "Right Knee: 30% of 100.0% remaining → Increment: 30.00% → Combined: 30.00%",
                "Left Knee: 30% of 70.0% remaining → Increment: 21.00% → Combined: 51.00%",
                "Tinnitus: 10% of 49.0% remaining → Increment: 4.90% → Combined: 55.90%"
            ],
            "notes": [
                "Bilateral factor applied to paired extremity conditions",
                "Bilateral factor for LEG (LEFT, RIGHT): 50.4% × 10% = +5.04%"
            ]
        }
    }}


class DisabilityHistoryEntry(BaseModel):
    """Record of a disability rating calculation"""
    id: Optional[int] = None
    veteran_id: int
    conditions: List[DisabilityConditionRequest]
    result: CombinedRatingResponse
    created_at: Optional[str] = None
    notes: Optional[str] = None


class EvidenceItem(BaseModel):
    """Evidence artifact linked to a claimed condition."""

    source: str
    reference: str
    summary: str


class TheoryType(str, Enum):
    DIRECT = "Direct"
    SECONDARY = "Secondary"
    PRESUMPTIVE = "Presumptive"
    AGGRAVATION = "Aggravation"
    CHRONICITY = "Chronicity"


class TheoryOfEntitlementModel(BaseModel):
    """Structured theory of entitlement detail."""

    theory_type: TheoryType
    rationale: str
    evidence_required: List[str]
    cfr_reference: str
    confidence: float = Field(..., ge=0, le=100)


class ConditionSuggestion(BaseModel):
    """Condition surfaced by the wizard."""

    name: str
    basis: str
    confidence: float
    recommended_theories: List[TheoryType]


class DisabilityWizardRequest(BaseModel):
    """Payload for recalculating wizard results with user-selected conditions."""

    veteran_id: str
    conditions: List[str]
    exposures: Optional[List[str]] = None


class DisabilityWizardResponse(BaseModel):
    """Multi-step wizard data bundle."""

    veteran_id: str
    service_overview: Dict[str, Any]
    suggested_conditions: List[ConditionSuggestion]
    evidence_review: Dict[str, List[EvidenceItem]]
    theories_of_entitlement: Dict[str, List[TheoryOfEntitlementModel]]
    strategy_summary: List[str]
