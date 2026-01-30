"""
Resource Recommendation Engine
Recommends resources based on veteran profile, location, goals, and engagement history.
"""

from typing import List, Optional, Dict
from app.schemas.resource_engine import (
    ResourceProvider,
    ResourceRecommendationResult,
    ResourceInteraction,
    PartnerLevel,
    ServiceAreaScope,
)


class VeteranProfile:
    """Input profile for recommendation."""
    def __init__(
        self,
        location_zip: str,
        location_state: str,
        location_city: Optional[str] = None,
        branch: Optional[str] = None,
        goals: Optional[List[str]] = None,  # e.g., ["EMPLOYMENT", "EDUCATION", "WELLNESS"]
        transitionStage: Optional[str] = None,
        preferredDelivery: Optional[str] = None,  # "IN_PERSON", "VIRTUAL", "HYBRID"
    ):
        self.location_zip = location_zip
        self.location_state = location_state
        self.location_city = location_city
        self.branch = branch
        self.goals = goals or []
        self.transitionStage = transitionStage
        self.preferredDelivery = preferredDelivery


def score_resource_for_veteran(
    resource: ResourceProvider,
    veteran: VeteranProfile,
    interactions: List[ResourceInteraction],
) -> float:
    """
    Score a resource for a veteran. Higher score = better recommendation.
    Factors: location match, goal alignment, partner level, engagement history.
    """
    score = 0.0

    # Location scoring (40% weight)
    location_score = 0.0
    if resource.serviceAreaScope == ServiceAreaScope.LOCAL:
        if resource.serviceAreas and (
            veteran.location_city in resource.serviceAreas
            or veteran.location_zip in resource.serviceAreas
        ):
            location_score = 100.0
    elif resource.serviceAreaScope == ServiceAreaScope.STATE:
        if resource.serviceAreas and veteran.location_state in resource.serviceAreas:
            location_score = 80.0
        else:
            location_score = 0.0
    elif resource.serviceAreaScope == ServiceAreaScope.REGIONAL:
        # Simplified: assume all within region are 50 points
        location_score = 50.0
    elif resource.serviceAreaScope == ServiceAreaScope.NATIONAL:
        location_score = 60.0
    score += location_score * 0.4

    # Goal alignment (30% weight)
    goal_score = 0.0
    if veteran.goals:
        matches = sum(1 for goal in veteran.goals if goal in resource.categories)
        goal_score = (matches / len(veteran.goals)) * 100 if veteran.goals else 50
    else:
        goal_score = 50.0
    score += goal_score * 0.3

    # Partner level (20% weight)
    partner_multiplier = {
        PartnerLevel.FEATURED: 100,
        PartnerLevel.VERIFIED: 75,
        PartnerLevel.COMMUNITY: 50,
    }
    partner_score = partner_multiplier.get(resource.partnerLevel, 50)
    score += partner_score * 0.2

    # Engagement history (10% weight)
    resource_interactions = [
        i for i in interactions if i.resourceId == resource.id
    ]
    if resource_interactions:
        engagement_boost = min(10.0, len(resource_interactions))
        score += engagement_boost * 0.1

    return score


def recommend_resources(
    veteran: VeteranProfile,
    all_resources: List[ResourceProvider],
    interactions: Optional[List[ResourceInteraction]] = None,
) -> ResourceRecommendationResult:
    """
    Main recommendation engine.
    Returns recommended, local, and national resources sorted by relevance.
    """
    interactions = interactions or []

    # Filter by eligibility
    eligible_resources = [
        r for r in all_resources
        if any(elig.upper() in ["VETERANS", "SPOUSES", "TRANSITIONING", "CIVILIANS"]
               for elig in r.eligibility)
    ]

    # Score all resources
    scored = [
        (resource, score_resource_for_veteran(resource, veteran, interactions))
        for resource in eligible_resources
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    # Categorize
    recommended = [r[0] for r in scored[:10]]  # Top 10

    local_resources = [
        r for r in eligible_resources
        if r.serviceAreaScope in [ServiceAreaScope.LOCAL, ServiceAreaScope.STATE]
        and r not in recommended
    ]
    local_resources.sort(
        key=lambda r: score_resource_for_veteran(r, veteran, interactions),
        reverse=True
    )

    national_resources = [
        r for r in eligible_resources
        if r.serviceAreaScope in [ServiceAreaScope.NATIONAL, ServiceAreaScope.REGIONAL]
        and r not in recommended
    ]
    national_resources.sort(
        key=lambda r: score_resource_for_veteran(r, veteran, interactions),
        reverse=True
    )

    rationale = [
        f"Recommended {len(recommended)} resources based on your location ({veteran.location_state}), goals ({', '.join(veteran.goals)}), and engagement history.",
        f"Located {len(local_resources)} local/state resources.",
        f"Found {len(national_resources)} national/regional resources.",
    ]

    return ResourceRecommendationResult(
        recommended=recommended,
        local=local_resources,
        national=national_resources,
        rationale=rationale,
    )
