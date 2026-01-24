"""Business directory and VBA resources API routes"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db import get_db
from app.services.veteran_business_service import VeteranBusinessService
from app.auth import get_current_user_id


# ===== REQUEST/RESPONSE MODELS =====

class BusinessSearchRequest(BaseModel):
    """Request model for business directory search"""
    query: Optional[str] = Field(None, description="Search query (name, specialties)")
    category: Optional[str] = Field(None, description="Business category")
    state: Optional[str] = Field(None, description="State (2-letter code)")
    certification: Optional[str] = Field(None, description="VOSB, SDVOSB, SBA 8(a), HUBZone")


class BusinessResponse(BaseModel):
    """Business directory entry response"""
    id: str
    name: str
    category: str
    state: str
    certification: List[str]
    revenue_range: Optional[str]
    employees: int
    specialties: List[str]
    rating: float
    federal_contractor: bool


class BusinessDetailResponse(BaseModel):
    """Detailed business information"""
    id: str
    name: str
    description: Optional[str]
    category: str
    state: str
    certification: List[str]
    revenue_range: Optional[str]
    employees: int
    specialties: List[str]
    federal_contractor: bool
    contract_types: List[str]
    team_size: int
    rating: float
    website: Optional[str]
    contact: dict


class VBAProgramResponse(BaseModel):
    """VBA certification program information"""
    program: str
    description: str
    eligibility: List[str]
    benefits: List[str]
    requirements: List[str]


class StateResourceResponse(BaseModel):
    """State-specific veteran resources"""
    state: str
    programs: List[dict]
    resources: List[dict]


class VeteranOrganizationResponse(BaseModel):
    """Veteran support organization"""
    id: str
    name: str
    organization_type: str
    mission: str
    focus_areas: List[str]
    programs: List[str]
    website: Optional[str]
    phone: str
    rating: float


# ===== API ROUTER =====

router = APIRouter(prefix="/api/business", tags=["business"])


# ===== BUSINESS DIRECTORY ENDPOINTS =====

@router.post("/search", response_model=List[BusinessResponse])
async def search_businesses(
    search_request: BusinessSearchRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Search veteran-owned business directory

    Query Parameters:
    - query: Search business name or specialties
    - category: Filter by category (IT, Manufacturing, Services, etc.)
    - state: Filter by state (e.g., 'CA', 'TX')
    - certification: Filter by certification (VOSB, SDVOSB, etc.)
    """
    try:
        service = VeteranBusinessService(db)
        businesses = service.search_veteran_businesses(
            query=search_request.query,
            category=search_request.category,
            state=search_request.state,
            certification=search_request.certification,
        )

        return [
            BusinessResponse(
                id=b["id"],
                name=b["name"],
                category=b["category"],
                state=b["state"],
                certification=b["certification"],
                revenue_range=b.get("revenue_range"),
                employees=b.get("employees", 0),
                specialties=b.get("specialties", []),
                rating=b.get("rating", 0.0),
                federal_contractor=b.get("federal_contractor", False),
            )
            for b in businesses
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/{business_id}", response_model=BusinessDetailResponse)
async def get_business_details(
    business_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get detailed information about a specific veteran-owned business

    Path Parameters:
    - business_id: Unique business identifier
    """
    try:
        service = VeteranBusinessService(db)
        business = service.get_business_details(business_id)

        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

        return BusinessDetailResponse(
            id=business["id"],
            name=business["name"],
            description=business.get("description"),
            category=business["category"],
            state=business["state"],
            certification=business["certification"],
            revenue_range=business.get("revenue_range"),
            employees=business.get("employees", 0),
            specialties=business.get("specialties", []),
            federal_contractor=business.get("federal_contractor", False),
            contract_types=business.get("contract_types", []),
            team_size=business.get("team_size", 0),
            rating=business.get("rating", 0.0),
            website=business.get("website"),
            contact=business.get("contact", {}),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve business: {str(e)}")


@router.get("/categories/list")
async def get_business_categories(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get available business categories

    Returns list of valid categories for filtering
    """
    categories = [
        "IT Services",
        "Manufacturing",
        "Construction",
        "Professional Services",
        "Engineering",
        "Healthcare",
        "Logistics",
        "Energy",
        "Software Development",
        "Consulting",
    ]
    return {"categories": categories}


@router.post("/{business_id}/favorite")
async def save_favorite_business(
    business_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Save a business to user's favorites

    Path Parameters:
    - business_id: Unique business identifier

    Returns: Success message with favorite status
    """
    try:
        # TODO: Implement favorite storage in database
        return {
            "status": "success",
            "business_id": business_id,
            "favorited": True,
            "message": "Business added to your favorites",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save favorite: {str(e)}")


@router.get("/certifications/list")
async def get_certifications(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get available veteran business certifications

    Returns list of certification types with explanations
    """
    certifications = {
        "VOSB": {
            "full_name": "Veteran-Owned Small Business",
            "description": "Businesses at least 51% owned and operated by veterans",
            "requirement": "51% veteran ownership, active management",
            "benefits": [
                "Federal contracting preference",
                "SBA funding programs",
                "Networking opportunities",
            ],
        },
        "SDVOSB": {
            "full_name": "Service-Disabled Veteran-Owned Small Business",
            "description": "Businesses at least 51% owned by service-disabled veterans",
            "requirement": "51% service-disabled vet ownership, VA disability rating",
            "benefits": [
                "Enhanced federal contracting preference",
                "SBA loans and grants",
                "Mentoring programs",
            ],
        },
        "SBA 8(a)": {
            "full_name": "SBA 8(a) Business Development Program",
            "description": "For socially and economically disadvantaged entrepreneurs",
            "requirement": "Personal net worth <$250k, meets income limits",
            "benefits": [
                "Federal contracting assistance",
                "Free management assistance",
                "Access to SBA training",
            ],
        },
        "HUBZone": {
            "full_name": "Historically Underutilized Business Zone",
            "description": "Businesses located and employing workers in underserved areas",
            "requirement": "Principal place of business in HUBZone",
            "benefits": [
                "Federal contracting preference",
                "SBA financing options",
                "Training and support",
            ],
        },
    }
    return certifications


# ===== VBA PROGRAM ENDPOINTS =====

@router.get("/vba/programs", response_model=List[VBAProgramResponse])
async def get_vba_programs(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get Veterans Business Administration (VBA) programs

    Returns all available VBA certification and support programs
    """
    try:
        service = VeteranBusinessService(db)
        programs = service.get_vba_programs()

        return [
            VBAProgramResponse(
                program=p["program"],
                description=p.get("description", ""),
                eligibility=p.get("eligibility", []),
                benefits=p.get("benefits", []),
                requirements=p.get("requirements", []),
            )
            for p in programs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve VBA programs: {str(e)}")


@router.get("/vba/programs/{program_type}", response_model=VBAProgramResponse)
async def get_vba_program_details(
    program_type: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get detailed information about a specific VBA program

    Path Parameters:
    - program_type: Program type (VOSB, SDVOSB, etc.)
    """
    try:
        service = VeteranBusinessService(db)
        programs = service.get_vba_programs()

        program = next((p for p in programs if p["program"].lower() == program_type.lower()), None)

        if not program:
            raise HTTPException(status_code=404, detail=f"Program {program_type} not found")

        return VBAProgramResponse(
            program=program["program"],
            description=program.get("description", ""),
            eligibility=program.get("eligibility", []),
            benefits=program.get("benefits", []),
            requirements=program.get("requirements", []),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve program details: {str(e)}")


@router.get("/vba/state/{state}", response_model=StateResourceResponse)
async def get_state_veteran_resources(
    state: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get state-specific veteran business resources and programs

    Path Parameters:
    - state: State code (e.g., 'CA', 'TX', 'VA')
    """
    try:
        service = VeteranBusinessService(db)
        resources = service.get_state_veteran_resources(state)

        return StateResourceResponse(
            state=state,
            programs=resources.get("programs", []),
            resources=resources.get("resources", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve state resources: {str(e)}")


@router.get("/vba/benefits/federal")
async def get_federal_veteran_benefits(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get comprehensive federal veteran benefits information

    Returns details on disability, education, health, home loans, insurance
    """
    try:
        service = VeteranBusinessService(db)
        benefits = service.get_federal_veteran_benefits()
        return benefits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve federal benefits: {str(e)}")


# ===== VETERAN ORGANIZATIONS ENDPOINTS =====

@router.get("/organizations/search", response_model=List[VeteranOrganizationResponse])
async def search_veteran_organizations(
    query: Optional[str] = Query(None, description="Organization name or focus area"),
    org_type: Optional[str] = Query(None, description="Organization type (support, advocacy, etc.)"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Search veteran support and advocacy organizations

    Query Parameters:
    - query: Organization name or focus area
    - org_type: Filter by organization type
    """
    try:
        service = VeteranBusinessService(db)
        organizations = service.search_organizations(
            query=query,
            org_type=org_type,
        )

        return [
            VeteranOrganizationResponse(
                id=o["id"],
                name=o["name"],
                organization_type=o.get("type", ""),
                mission=o.get("mission", ""),
                focus_areas=o.get("focus_areas", []),
                programs=o.get("programs", []),
                website=o.get("website"),
                phone=o.get("phone", ""),
                rating=o.get("rating", 0.0),
            )
            for o in organizations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/organizations/{org_id}", response_model=VeteranOrganizationResponse)
async def get_organization_details(
    org_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get detailed information about a veteran organization

    Path Parameters:
    - org_id: Organization ID
    """
    try:
        service = VeteranBusinessService(db)
        organizations = service.get_veteran_organizations()

        org = next((o for o in organizations if o["id"] == org_id), None)

        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        return VeteranOrganizationResponse(
            id=org["id"],
            name=org["name"],
            organization_type=org.get("type", ""),
            mission=org.get("mission", ""),
            focus_areas=org.get("focus_areas", []),
            programs=org.get("programs", []),
            website=org.get("website"),
            phone=org.get("phone", ""),
            rating=org.get("rating", 0.0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve organization: {str(e)}")


# ===== HEALTH CHECK =====

@router.get("/health")
async def business_api_health():
    """Health check for business API"""
    return {
        "status": "healthy",
        "service": "Business Directory & VBA Resources",
        "version": "1.0.0",
    }
