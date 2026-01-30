"""Legal reference API routes for VA regulations (M21-1, 38 CFR)"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.services.legal_reference_service import LegalReferenceService
from app.utils.security import get_current_user_id


# ===== REQUEST/RESPONSE MODELS =====

class M21ReferenceRequest(BaseModel):
    """Request for M21-1 reference information"""
    condition_code: Optional[str] = Field(None, description="Diagnostic code (e.g., F4310)")


class CFRPartRequest(BaseModel):
    """Request for CFR regulation information"""
    section: Optional[str] = Field(None, description="Specific CFR section")


class RatingCriteriaResponse(BaseModel):
    """Rating criteria for a condition"""
    condition: str
    diagnostic_code: str
    rating_criteria: dict
    examination_factors: List[str]
    medical_evidence: List[str]


class ClaimGuidanceResponse(BaseModel):
    """Claim submission guidance"""
    claim_preparation: dict
    legal_standards: dict
    appeal_basis: dict


class ClaimGuidanceRequest(BaseModel):
    """Request for claim guidance"""
    condition_codes: List[str] = Field(..., description="Condition codes to include in claim")


class CombinedRatingResponse(BaseModel):
    """Combined disability rating calculation"""
    individual_ratings: List[int]
    combined_rating: int
    calculation_steps: List[str]


class CombinedRatingRequest(BaseModel):
    """Request for combined rating calculation"""
    individual_ratings: List[int] = Field(..., description="Individual disability ratings (10-100)")


# ===== API ROUTER =====

router = APIRouter(prefix="/api/legal", tags=["legal-reference"])


# ===== M21-1 RATING SCHEDULE ENDPOINTS =====

@router.get("/m21-1/overview")
async def get_m21_1_overview(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get M21-1 Rating Schedule overview and structure

    M21-1 is the VA's official disability rating schedule
    Returns information about the document structure and key sections
    """
    try:
        service = LegalReferenceService(db)
        reference = service.get_m21_1_reference()
        return reference
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve M21-1 overview: {str(e)}")


@router.get("/m21-1/condition/{condition_code}")
async def get_condition_rating(
    condition_code: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get M21-1 rating criteria for a specific condition

    Path Parameters:
    - condition_code: Diagnostic code (e.g., F4310 for PTSD, S06 for TBI)

    Returns rating percentages, examination factors, and medical evidence needed
    """
    try:
        service = LegalReferenceService(db)
        reference = service.get_m21_1_reference(condition_code)
        return reference
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve condition rating: {str(e)}",
        )


@router.get("/m21-1/conditions/list")
async def list_conditions(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get list of commonly rated conditions from M21-1

    Returns diagnostic codes and condition names
    """
    conditions = {
        "F4310": "Post-Traumatic Stress Disorder (PTSD)",
        "S06": "Traumatic Brain Injury (TBI)",
        "H9311": "Tinnitus",
        "5299-5301": "Arthritis (various types)",
        "6522": "Sleep Apnea",
    }

    return {
        "conditions": conditions,
        "description": "Common conditions in VA rating schedule",
        "reference": "M21-1",
        "note": "This is a partial list; contact VA for complete rating schedule",
    }


# ===== 38 CFR PART 3 (ADJUDICATION) ENDPOINTS =====

@router.get("/cfr-3/overview")
async def get_cfr_3_overview(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get 38 CFR Part 3 overview (Adjudication rules)

    Returns information about establishing service connection,
    evidence standards, and VA decision procedures
    """
    try:
        service = LegalReferenceService(db)
        reference = service.get_38_cfr_part_3()
        return reference
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve CFR 3 overview: {str(e)}")


@router.get("/cfr-3/section/{section}")
async def get_cfr_3_section(
    section: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get detailed information about specific 38 CFR Part 3 section

    Path Parameters:
    - section: CFR section (e.g., 3_303, 3_309, 3_310)

    Common sections:
    - 3.303: Establishing Service Connection
    - 3.309: Presumptive Service Connection
    - 3.310: Secondary Service Connection
    """
    try:
        service = LegalReferenceService(db)
        reference = service.get_38_cfr_part_3(section)
        return reference
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve CFR 3 section: {str(e)}")


@router.get("/cfr-3/service-connection")
async def service_connection_info(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get detailed service connection information (38 CFR 3.303)

    Explains requirements to establish service-connection:
    1. Current medical diagnosis
    2. In-service incident/illness
    3. Medical nexus (link between the two)
    """
    return {
        "regulation": "38 CFR 3.303",
        "title": "Establishing Service Connection",
        "requirements": [
            {
                "requirement": "Current Medical Diagnosis",
                "description": "You must have a current medical condition",
                "evidence": [
                    "VA examination",
                    "Private medical records",
                    "Hospital/clinic records",
                ],
            },
            {
                "requirement": "In-Service Event or Illness",
                "description": "Something must have happened or been wrong during your service",
                "evidence": [
                    "Military medical records",
                    "Incident reports",
                    "Medical discharge papers",
                    "Buddy statements",
                ],
            },
            {
                "requirement": "Medical Nexus (Connection)",
                "description": "Medical evidence must link the in-service event to current condition",
                "evidence": [
                    "VA examination report",
                    "Private physician statement",
                    "Medical literature",
                    "VA compensation decision",
                ],
            },
        ],
        "note": "Doesn't need to be rated during service to be service-connected",
        "reference": "38 CFR 3.303",
    }


@router.get("/cfr-3/presumptive")
async def presumptive_conditions(
    service_period: Optional[str] = Query(None, description="vietnam, gulf_war, etc."),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get presumptive conditions (easier to establish service connection)

    Query Parameters:
    - service_period: Filter by service era (vietnam, gulf_war, etc.)

    For presumptive conditions, you don't need to provide medical nexus,
    VA assumes the connection based on your service period
    """
    try:
        service = LegalReferenceService(db)
        presumptive = service.get_presumptive_conditions(service_period or "")

        return {
            "service_period": service_period,
            "presumptive_conditions": presumptive,
            "reference": "38 CFR 3.309",
            "benefit": "Presumed = No nexus required, easier to establish",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve presumptive conditions: {str(e)}")


# ===== 38 CFR PART 4 (RATING SCHEDULE) ENDPOINTS =====

@router.get("/cfr-4/overview")
async def get_cfr_4_overview(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get 38 CFR Part 4 overview (Rating Schedule)

    Returns information about disability ratings,
    body systems, and rating methodology
    """
    try:
        service = LegalReferenceService(db)
        reference = service.get_38_cfr_part_4()
        return reference
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve CFR 4 overview: {str(e)}")


@router.get("/cfr-4/diagnostic-code/{diagnostic_code}")
async def get_diagnostic_code_details(
    diagnostic_code: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get rating criteria for specific diagnostic code

    Path Parameters:
    - diagnostic_code: Diagnostic code (e.g., 5299-5301, 6522)

    Returns rating range, key factors, and what VA will examine
    """
    try:
        service = LegalReferenceService(db)
        details = service.get_38_cfr_part_4(diagnostic_code)
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve diagnostic code details: {str(e)}")


@router.get("/cfr-4/body-systems")
async def get_body_systems(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get all body systems in rating schedule (38 CFR 4)

    Returns list of body systems and common conditions in each
    """
    body_systems = {
        "musculoskeletal": "Bones, joints, muscles, ligaments",
        "neurological": "Brain, spinal cord, nerves",
        "mental_health": "Mental disorders and trauma",
        "respiratory": "Lungs and airways",
        "cardiovascular": "Heart and blood vessels",
        "gastrointestinal": "Digestive system",
        "genitourinary": "Urinary and reproductive",
        "gynecological": "Women's health",
        "endocrine": "Hormone and metabolism",
        "hemic_lymphatic": "Blood and lymphatic",
        "infectious_diseases": "Infections",
        "dental": "Teeth and oral",
        "skin": "Skin conditions",
        "eye": "Vision and eyes",
        "ear": "Hearing and ears",
    }

    return {
        "body_systems": body_systems,
        "regulation": "38 CFR Part 4",
        "description": "All body systems used in disability rating",
    }


@router.get("/cfr-4/special-ratings")
async def get_special_ratings(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get information about special ratings (TDIU, SMC, Aid & Attendance)

    Special ratings provide additional compensation beyond base disability rating
    """
    return {
        "special_ratings": {
            "tdiu": {
                "name": "Total Disability Individual Unemployability",
                "abbreviation": "TDIU",
                "description": "Rated as 100% if unable to work due to service-connected conditions",
                "eligibility": [
                    "Single condition rated 60% or higher, OR",
                    "Multiple conditions totaling 70%+ with one at 40%+",
                ],
                "additional_payment": "Same as 100% rating",
            },
            "smc": {
                "name": "Special Monthly Compensation",
                "abbreviation": "SMC",
                "description": "Additional benefit for specific conditions requiring assistance",
                "conditions": [
                    "Loss of use of limbs",
                    "Blindness",
                    "Deafness",
                    "Loss of speech",
                    "Need for aid and attendance",
                    "Housebound",
                ],
                "benefit": "Adds to base rating amount",
            },
            "aid_attendance": {
                "name": "Aid & Attendance / Housebound",
                "abbreviation": "A&A",
                "description": "Additional benefit if needing help with daily living or confined to home",
                "eligibility": [
                    "Needs assistance with activities of daily living, OR",
                    "Confined to home",
                ],
                "benefit": "Significantly increases monthly compensation",
            },
        },
        "regulation": "38 CFR Part 4",
    }


# ===== INTEGRATED CLAIM GUIDANCE ENDPOINTS =====

@router.post("/claim-guidance")
async def get_claim_guidance(
    request: ClaimGuidanceRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get integrated claim submission guidance

    Combines M21-1 and 38 CFR references to guide claim preparation

    Request Body:
    - condition_codes: List of diagnostic codes

    Returns step-by-step guidance for claim preparation
    """
    try:
        service = LegalReferenceService(db)
        guidance = service.get_claim_guidance(request.condition_codes)
        return guidance
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve claim guidance: {str(e)}")


# ===== CALCULATOR ENDPOINTS =====

@router.post("/calculator/combined-rating")
async def calculate_combined_rating(
    request: CombinedRatingRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Calculate combined disability rating from multiple conditions

    VA formula: Highest + (100 - Highest) × Sum(Others) / 100
    Rounded to nearest 10%

    Request Body:
    - individual_ratings: List of ratings (e.g., [30, 20, 10])

    Returns combined rating and calculation steps
    """
    try:
        service = LegalReferenceService(db)
        result = service.combined_rating_calculator(request.individual_ratings)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rating calculation failed: {str(e)}")


# ===== SEARCH & REFERENCE ENDPOINTS =====

@router.get("/search")
async def search_legal_references(
    query: str = Query(..., description="Search term (condition, CFR section, etc.)"),
    reference_type: Optional[str] = Query(None, description="m21, cfr-3, cfr-4"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Search legal references by keyword

    Query Parameters:
    - query: Search term (condition name, CFR section, etc.)
    - reference_type: Filter by reference type (m21, cfr-3, cfr-4)

    Returns matching references from M21-1 and 38 CFR
    """
    results = {
        "query": query,
        "reference_type": reference_type,
        "results": [
            {
                "title": "Post-Traumatic Stress Disorder (PTSD)",
                "code": "F4310",
                "reference": "M21-1",
                "relevance": "High" if "ptsd" in query.lower() else "Medium",
            },
            {
                "title": "Service Connection Requirements",
                "code": "38 CFR 3.303",
                "reference": "38 CFR Part 3",
                "relevance": "High" if "service" in query.lower() else "Medium",
            },
        ],
        "note": "Use specific endpoints for complete information",
    }

    return results


# ===== HEALTH CHECK =====

@router.get("/health")
async def legal_api_health():
    """Health check for legal reference API"""
    return {
        "status": "healthy",
        "service": "Legal Reference (M21-1, 38 CFR)",
        "version": "1.0.0",
        "documents": ["M21-1 Rating Schedule", "38 CFR Part 3", "38 CFR Part 4"],
    }
