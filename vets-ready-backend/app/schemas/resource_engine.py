"""
Resource Engine Schema and Models
Defines ResourceProvider, ResourceInteraction, and supporting types.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class ServiceAreaScope(str, Enum):
    """Geographic scope of resource services."""
    LOCAL = "LOCAL"
    STATE = "STATE"
    REGIONAL = "REGIONAL"
    NATIONAL = "NATIONAL"


class PartnerLevel(str, Enum):
    """Partnership tier for resource visibility."""
    FEATURED = "FEATURED"
    VERIFIED = "VERIFIED"
    COMMUNITY = "COMMUNITY"


class ResourceProvider(BaseModel):
    """
    Represents an organization or resource provider.
    All contact details are loaded from config/DB, not hardcoded in code.
    """
    id: str
    name: str
    description: str
    categories: List[str]  # e.g., ["EMPLOYMENT", "EDUCATION", "COMMUNITY"]
    tags: List[str]  # e.g., ["resume", "job placement", "networking"]
    serviceAreaScope: ServiceAreaScope
    serviceAreas: List[str]  # e.g., ["IDAHO", "BOISE", "TREASURE VALLEY"]
    eligibility: List[str]  # e.g., ["VETERANS", "SPOUSES", "TRANSITIONING"]
    websiteUrl: str
    contactPhone: str  # loaded from config, never hardcoded
    contactEmail: str
    contactHours: Optional[str] = None
    isFeatured: bool = False
    isVerified: bool = False
    partnerLevel: PartnerLevel = PartnerLevel.COMMUNITY
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ResourceInteractionType(str, Enum):
    """Types of interactions with resources."""
    VIEW = "VIEW"
    CLICK = "CLICK"
    SAVE = "SAVE"
    REFERRED = "REFERRED"
    ATTENDED_EVENT = "ATTENDED_EVENT"


class ResourceInteraction(BaseModel):
    """Record of veteran interaction with a resource."""
    id: str
    veteranId: str
    resourceId: str
    interactionType: ResourceInteractionType
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ResourceRecommendationResult(BaseModel):
    """Output from Resource Recommendation Engine."""
    recommended: List[ResourceProvider]
    local: List[ResourceProvider]
    national: List[ResourceProvider]
    rationale: List[str]


class ResourceListResponse(BaseModel):
    """Paginated response for resource queries."""
    resources: List[ResourceProvider]
    page: int
    perPage: int
    total: int


class ResourceImpactMetrics(BaseModel):
    """Aggregated usage metrics for a resource."""
    resourceId: str
    resourceName: str
    views: int
    clicks: int
    saves: int
    referrals: int
    avgEngagementScore: float = 0.0
    topCategories: List[str] = []
    topLocations: List[str] = []
