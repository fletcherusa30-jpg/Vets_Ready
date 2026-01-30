"""
ARDE (Automatic Revenue Design Engine) API Router

Provides backend endpoints for managing revenue opportunities discovered
and activated by the ARDE system.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum
import json
import os
from pathlib import Path

router = APIRouter(prefix="/api/revenue", tags=["revenue"])

# =====================================================================
# TYPES AND MODELS
# =====================================================================

class RevenueCategory(str, Enum):
    AFFILIATE = "affiliate"
    SPONSORED = "sponsored"
    BUSINESS_SUBMISSION = "business_submission"
    MARKETPLACE_COMMISSION = "marketplace_commission"
    ENTERPRISE_LICENSING = "enterprise_licensing"
    API_INTEGRATION = "api_integration"
    PREMIUM_DISCOUNT = "premium_discount"
    EVENT_PROMOTION = "event_promotion"
    ANONYMIZED_INSIGHTS = "anonymized_insights"

class OpportunityStatus(str, Enum):
    DISCOVERED = "discovered"
    VALIDATED = "validated"
    ACTIVATED = "activated"
    PERFORMING = "performing"
    UNDERPERFORMING = "underperforming"
    PAUSED = "paused"
    REJECTED = "rejected"

class GeographicScope(str, Enum):
    LOCAL = "local"
    REGIONAL = "regional"
    NATIONAL = "national"
    GLOBAL = "global"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Confidence(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class LocationModel(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None

class OptimizationRecord(BaseModel):
    timestamp: datetime
    action: str
    reason: str
    beforeScore: float
    afterScore: float

class RevenueOpportunity(BaseModel):
    id: str
    category: RevenueCategory
    status: OpportunityStatus
    title: str
    description: str

    # Context
    discoveredAt: datetime
    discoveredFrom: str
    relevanceScore: float

    # Matching
    targetModule: str
    geographicScope: GeographicScope
    location: Optional[LocationModel] = None

    # Partner Info
    partnerName: Optional[str] = None
    partnerCategory: Optional[str] = None
    partnerWebsite: Optional[str] = None

    # Revenue Potential
    estimatedValue: float
    confidence: Confidence
    priority: Priority

    # Activation
    activatedAt: Optional[datetime] = None
    activationMethod: Optional[str] = None
    revenueGenerated: Optional[float] = None

    # Performance
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    ctr: Optional[float] = None
    conversionRate: Optional[float] = None

    # Optimization
    lastOptimized: Optional[datetime] = None
    optimizationHistory: Optional[List[OptimizationRecord]] = None

    # Metadata
    tags: List[str]
    metadata: Dict[str, Any]

    # Compliance
    ethicalReview: bool
    privacyCompliant: bool
    nonInterfering: bool

class OpportunityPerformance(BaseModel):
    opportunityId: str
    impressions: int
    clicks: int
    conversions: int
    ctr: float
    conversionRate: float
    revenue: float

class RevenueMetrics(BaseModel):
    totalOpportunities: int
    activeStreams: int
    pendingOpportunities: int
    rejectedOpportunities: int
    totalRevenueGenerated: float
    monthlyRevenue: float
    projectedRevenue: float
    enterpriseLeads: int
    affiliateMatches: int
    sponsoredPlacements: int
    marketplaceInvites: int

# =====================================================================
# IN-MEMORY STORAGE (Replace with database in production)
# =====================================================================

# Storage directory
REVENUE_DIR = Path("./data/revenue")
REVENUE_DIR.mkdir(parents=True, exist_ok=True)

# In-memory store
opportunities_store: Dict[str, RevenueOpportunity] = {}
performance_store: Dict[str, OpportunityPerformance] = {}

# Load existing data
def load_opportunities():
    """Load opportunities from disk"""
    opportunities_file = REVENUE_DIR / "opportunities.json"
    if opportunities_file.exists():
        with open(opportunities_file, 'r') as f:
            data = json.load(f)
            for opp_data in data:
                opp = RevenueOpportunity(**opp_data)
                opportunities_store[opp.id] = opp

def save_opportunities():
    """Save opportunities to disk"""
    opportunities_file = REVENUE_DIR / "opportunities.json"
    data = [opp.dict() for opp in opportunities_store.values()]
    with open(opportunities_file, 'w') as f:
        json.dump(data, f, default=str, indent=2)

# Load on startup
load_opportunities()

# =====================================================================
# API ENDPOINTS
# =====================================================================

@router.get("/health")
async def health_check():
    """Check ARDE API health"""
    return {
        "status": "healthy",
        "opportunities": len(opportunities_store),
        "activeStreams": len([o for o in opportunities_store.values() if o.status == OpportunityStatus.ACTIVATED])
    }

@router.post("/opportunities")
async def create_opportunity(opportunity: RevenueOpportunity):
    """Create a new revenue opportunity"""

    # Validate ethical compliance
    if not opportunity.ethicalReview:
        raise HTTPException(400, "Opportunity failed ethical review")

    if not opportunity.privacyCompliant:
        raise HTTPException(400, "Opportunity is not privacy compliant")

    if not opportunity.nonInterfering:
        raise HTTPException(400, "Opportunity interferes with protected tools")

    # Store opportunity
    opportunities_store[opportunity.id] = opportunity
    save_opportunities()

    return {
        "status": "created",
        "opportunityId": opportunity.id,
        "message": f"Revenue opportunity created: {opportunity.title}"
    }

@router.get("/opportunities")
async def get_opportunities(
    category: Optional[RevenueCategory] = None,
    status: Optional[OpportunityStatus] = None,
    priority: Optional[Priority] = None,
    module: Optional[str] = None
):
    """Get all revenue opportunities with optional filters"""

    opportunities = list(opportunities_store.values())

    # Apply filters
    if category:
        opportunities = [o for o in opportunities if o.category == category]

    if status:
        opportunities = [o for o in opportunities if o.status == status]

    if priority:
        opportunities = [o for o in opportunities if o.priority == priority]

    if module:
        opportunities = [o for o in opportunities if o.targetModule == module]

    return {
        "count": len(opportunities),
        "opportunities": opportunities
    }

@router.get("/opportunities/{opportunity_id}")
async def get_opportunity(opportunity_id: str):
    """Get a specific revenue opportunity"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    return opportunities_store[opportunity_id]

@router.put("/opportunities/{opportunity_id}/status")
async def update_opportunity_status(
    opportunity_id: str,
    status: OpportunityStatus
):
    """Update opportunity status"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    opportunity = opportunities_store[opportunity_id]
    opportunity.status = status

    if status == OpportunityStatus.ACTIVATED:
        opportunity.activatedAt = datetime.now()

    save_opportunities()

    return {
        "status": "updated",
        "opportunityId": opportunity_id,
        "newStatus": status
    }

@router.post("/opportunities/{opportunity_id}/link")
async def link_to_module(
    opportunity_id: str,
    module: str
):
    """Link opportunity to a specific module"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    opportunity = opportunities_store[opportunity_id]
    opportunity.targetModule = module

    save_opportunities()

    return {
        "status": "linked",
        "opportunityId": opportunity_id,
        "module": module
    }

@router.get("/opportunities/{opportunity_id}/performance")
async def get_opportunity_performance(opportunity_id: str):
    """Get performance data for an opportunity"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    # Check if we have performance data
    if opportunity_id in performance_store:
        return performance_store[opportunity_id]

    # Return opportunity's current performance metrics
    opportunity = opportunities_store[opportunity_id]
    return {
        "opportunityId": opportunity_id,
        "impressions": opportunity.impressions or 0,
        "clicks": opportunity.clicks or 0,
        "conversions": opportunity.conversions or 0,
        "ctr": opportunity.ctr or 0.0,
        "conversionRate": opportunity.conversionRate or 0.0,
        "revenue": opportunity.revenueGenerated or 0.0
    }

@router.post("/opportunities/{opportunity_id}/performance")
async def update_opportunity_performance(
    opportunity_id: str,
    performance: OpportunityPerformance
):
    """Update performance data for an opportunity"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    # Update opportunity with performance data
    opportunity = opportunities_store[opportunity_id]
    opportunity.impressions = performance.impressions
    opportunity.clicks = performance.clicks
    opportunity.conversions = performance.conversions
    opportunity.ctr = performance.ctr
    opportunity.conversionRate = performance.conversionRate
    opportunity.revenueGenerated = performance.revenue

    # Store performance data
    performance_store[opportunity_id] = performance

    save_opportunities()

    return {
        "status": "updated",
        "opportunityId": opportunity_id
    }

@router.get("/metrics")
async def get_revenue_metrics():
    """Get overall revenue metrics"""

    opportunities = list(opportunities_store.values())

    total_revenue = sum(o.revenueGenerated or 0 for o in opportunities)

    # Count by status
    active_streams = len([o for o in opportunities if o.status == OpportunityStatus.ACTIVATED or o.status == OpportunityStatus.PERFORMING])
    pending = len([o for o in opportunities if o.status == OpportunityStatus.VALIDATED])
    rejected = len([o for o in opportunities if o.status == OpportunityStatus.REJECTED])

    # Count by category
    enterprise_leads = len([o for o in opportunities if o.category == RevenueCategory.ENTERPRISE_LICENSING])
    affiliate_matches = len([o for o in opportunities if o.category == RevenueCategory.AFFILIATE])
    sponsored_placements = len([o for o in opportunities if o.category == RevenueCategory.SPONSORED])
    marketplace_invites = len([o for o in opportunities if o.category == RevenueCategory.MARKETPLACE_COMMISSION])

    # Calculate monthly revenue (last 30 days)
    # Simplified - in production, filter by date
    monthly_revenue = total_revenue

    # Project revenue (estimated value of active opportunities)
    projected_revenue = sum(o.estimatedValue for o in opportunities if o.status == OpportunityStatus.ACTIVATED)

    metrics = RevenueMetrics(
        totalOpportunities=len(opportunities),
        activeStreams=active_streams,
        pendingOpportunities=pending,
        rejectedOpportunities=rejected,
        totalRevenueGenerated=total_revenue,
        monthlyRevenue=monthly_revenue,
        projectedRevenue=projected_revenue,
        enterpriseLeads=enterprise_leads,
        affiliateMatches=affiliate_matches,
        sponsoredPlacements=sponsored_placements,
        marketplaceInvites=marketplace_invites
    )

    return metrics

@router.get("/metrics/by-category")
async def get_metrics_by_category():
    """Get revenue metrics broken down by category"""

    opportunities = list(opportunities_store.values())

    metrics_by_category = {}

    for category in RevenueCategory:
        category_opps = [o for o in opportunities if o.category == category]

        total_revenue = sum(o.revenueGenerated or 0 for o in category_opps)

        # Calculate average CTR and conversion rate
        ctrs = [o.ctr for o in category_opps if o.ctr is not None]
        conversions = [o.conversionRate for o in category_opps if o.conversionRate is not None]

        avg_ctr = sum(ctrs) / len(ctrs) if ctrs else 0
        avg_conversion = sum(conversions) / len(conversions) if conversions else 0

        metrics_by_category[category.value] = {
            "count": len(category_opps),
            "revenue": total_revenue,
            "avgCTR": avg_ctr,
            "avgConversion": avg_conversion
        }

    return {
        "byCategory": metrics_by_category
    }

@router.get("/top-performers")
async def get_top_performers(limit: int = 10):
    """Get top performing revenue opportunities"""

    opportunities = list(opportunities_store.values())

    # Filter to performing opportunities
    performing = [o for o in opportunities if o.status == OpportunityStatus.PERFORMING]

    # Sort by revenue
    performing.sort(key=lambda o: o.revenueGenerated or 0, reverse=True)

    return {
        "count": len(performing),
        "topPerformers": performing[:limit]
    }

@router.get("/underperformers")
async def get_underperformers(limit: int = 10):
    """Get underperforming opportunities that need attention"""

    opportunities = list(opportunities_store.values())

    underperformers = [o for o in opportunities if o.status == OpportunityStatus.UNDERPERFORMING]

    return {
        "count": len(underperformers),
        "underperformers": underperformers[:limit]
    }

@router.post("/opportunities/{opportunity_id}/optimize")
async def optimize_opportunity(
    opportunity_id: str,
    action: str,
    reason: str
):
    """Record an optimization action for an opportunity"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    opportunity = opportunities_store[opportunity_id]

    # Calculate current performance score
    performance = performance_store.get(opportunity_id)
    if performance:
        before_score = calculate_performance_score(performance)
    else:
        before_score = 0

    # Record optimization
    if not opportunity.optimizationHistory:
        opportunity.optimizationHistory = []

    optimization = OptimizationRecord(
        timestamp=datetime.now(),
        action=action,
        reason=reason,
        beforeScore=before_score,
        afterScore=before_score  # Will be updated later
    )

    opportunity.optimizationHistory.append(optimization)
    opportunity.lastOptimized = datetime.now()

    save_opportunities()

    return {
        "status": "optimized",
        "opportunityId": opportunity_id,
        "action": action
    }

@router.delete("/opportunities/{opportunity_id}")
async def delete_opportunity(opportunity_id: str):
    """Delete a revenue opportunity"""

    if opportunity_id not in opportunities_store:
        raise HTTPException(404, f"Opportunity {opportunity_id} not found")

    del opportunities_store[opportunity_id]

    if opportunity_id in performance_store:
        del performance_store[opportunity_id]

    save_opportunities()

    return {
        "status": "deleted",
        "opportunityId": opportunity_id
    }

# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

def calculate_performance_score(performance: OpportunityPerformance) -> float:
    """Calculate performance score (0-100)"""
    score = 0

    # CTR scoring (0-30 points)
    if performance.ctr >= 5:
        score += 30
    elif performance.ctr >= 2:
        score += 20
    elif performance.ctr >= 1:
        score += 10

    # Conversion rate scoring (0-30 points)
    if performance.conversionRate >= 10:
        score += 30
    elif performance.conversionRate >= 5:
        score += 20
    elif performance.conversionRate >= 2:
        score += 10

    # Revenue scoring (0-40 points)
    if performance.revenue >= 1000:
        score += 40
    elif performance.revenue >= 500:
        score += 30
    elif performance.revenue >= 100:
        score += 20
    elif performance.revenue >= 50:
        score += 10

    return score
