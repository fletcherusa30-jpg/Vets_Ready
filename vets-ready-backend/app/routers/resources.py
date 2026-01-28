"""
Resource Engine API Router
Exposes /resources endpoints for marketplace, recommendations, and impact dashboard.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
import uuid

from app.schemas.resource_engine import (
    ResourceProvider,
    ResourceListResponse,
    ResourceRecommendationResult,
    ResourceImpactMetrics,
)
from app.services import resource_engine_service as svc
from app.services.resource_recommendation_engine import (
    VeteranProfile,
    recommend_resources,
)
from app.utils.enterprise_auth import require_enterprise_auth

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("", response_model=ResourceListResponse)
async def list_resources(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    eligibility: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=500),
):
    """List all resources with optional filtering."""
    return svc.list_resources(
        category=category,
        location=location,
        eligibility=eligibility,
        keyword=keyword,
        page=page,
        per_page=per_page,
    )


@router.get("/recommended", response_model=ResourceRecommendationResult)
async def get_recommended_resources(
    location_zip: str = Query(...),
    location_state: str = Query(...),
    location_city: Optional[str] = Query(None),
    goals: Optional[str] = Query(None),  # comma-separated
    branch: Optional[str] = Query(None),
):
    """Get personalized resource recommendations for a veteran."""
    veteran = VeteranProfile(
        location_zip=location_zip,
        location_state=location_state,
        location_city=location_city,
        branch=branch,
        goals=goals.split(",") if goals else [],
    )

    all_resources = list(svc.RESOURCE_STORE.values())
    return recommend_resources(veteran, all_resources, svc.INTERACTION_STORE)


@router.get("/{resource_id}", response_model=ResourceProvider)
async def get_resource(resource_id: str):
    """Retrieve a single resource provider."""
    resource = svc.get_resource(resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource {resource_id} not found",
        )
    return resource


@router.post("", response_model=ResourceProvider, dependencies=[Depends(require_enterprise_auth)])
async def create_resource(provider: ResourceProvider):
    """Create a new resource provider (admin/partner only)."""
    if not provider.id:
        provider.id = str(uuid.uuid4())
    return svc.create_resource(provider)


@router.put("/{resource_id}", response_model=ResourceProvider, dependencies=[Depends(require_enterprise_auth)])
async def update_resource(resource_id: str, updates: dict):
    """Update a resource provider (admin/partner only)."""
    resource = svc.update_resource(resource_id, updates)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource {resource_id} not found",
        )
    return resource


@router.post("/{resource_id}/interact", status_code=200)
async def record_interaction(
    resource_id: str,
    veteran_id: str = Query(...),
    interaction_type: str = Query(...),  # e.g., "VIEW", "CLICK", "SAVE", "REFERRED"
):
    """Record an interaction (view, click, save, referral) with a resource."""
    interaction = svc.record_interaction(
        veteran_id=veteran_id,
        resource_id=resource_id,
        interaction_type=interaction_type,
    )
    return {"status": "recorded", "interaction_id": interaction.id}


@router.get("/{resource_id}/metrics", response_model=ResourceImpactMetrics, dependencies=[Depends(require_enterprise_auth)])
async def get_resource_metrics(resource_id: str):
    """Get impact metrics for a resource (enterprise/admin only)."""
    return svc.get_impact_metrics(resource_id)


@router.get("/dashboard/metrics", dependencies=[Depends(require_enterprise_auth)])
async def get_dashboard_metrics():
    """Get aggregated dashboard metrics (enterprise/internal only)."""
    return svc.get_dashboard_metrics()
