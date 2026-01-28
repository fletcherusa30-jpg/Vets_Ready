"""
Resource Engine Service
Manages ResourceProvider CRUD, interactions, and persistence.
"""

import json
import os
from typing import List, Optional, Dict
from datetime import datetime

from app.schemas.resource_engine import (
    ResourceProvider,
    ResourceInteraction,
    ResourceInteractionType,
    ResourceListResponse,
    ResourceImpactMetrics,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
RESOURCES_FILE = os.path.join(DATA_DIR, 'resource_providers.jsonl')
INTERACTIONS_FILE = os.path.join(DATA_DIR, 'resource_interactions.jsonl')

RESOURCE_STORE: Dict[str, ResourceProvider] = {}
INTERACTION_STORE: List[ResourceInteraction] = []


def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def _load_resources_from_disk():
    """Load resource providers from JSONL."""
    if os.path.exists(RESOURCES_FILE):
        with open(RESOURCES_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    provider = ResourceProvider(**data)
                    RESOURCE_STORE[provider.id] = provider
                except Exception:
                    continue


def _load_interactions_from_disk():
    """Load interactions from JSONL."""
    if os.path.exists(INTERACTIONS_FILE):
        with open(INTERACTIONS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    interaction = ResourceInteraction(**data)
                    INTERACTION_STORE.append(interaction)
                except Exception:
                    continue


def _persist_resource(provider: ResourceProvider):
    """Append resource to JSONL."""
    _ensure_data_dir()
    with open(RESOURCES_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(provider.dict()) + "\n")


def _persist_interaction(interaction: ResourceInteraction):
    """Append interaction to JSONL."""
    _ensure_data_dir()
    with open(INTERACTIONS_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(interaction.dict()) + "\n")


def create_resource(provider: ResourceProvider) -> ResourceProvider:
    """Create a new resource provider."""
    provider.createdAt = datetime.utcnow().isoformat()
    provider.updatedAt = datetime.utcnow().isoformat()
    RESOURCE_STORE[provider.id] = provider
    _persist_resource(provider)
    return provider


def get_resource(resource_id: str) -> Optional[ResourceProvider]:
    """Retrieve a single resource provider."""
    return RESOURCE_STORE.get(resource_id)


def list_resources(
    category: Optional[str] = None,
    location: Optional[str] = None,
    eligibility: Optional[str] = None,
    keyword: Optional[str] = None,
    page: int = 1,
    per_page: int = 50,
) -> ResourceListResponse:
    """List resources with optional filtering."""
    results = list(RESOURCE_STORE.values())

    if category:
        results = [r for r in results if category in r.categories]

    if location:
        results = [r for r in results if location in r.serviceAreas]

    if eligibility:
        results = [r for r in results if eligibility in r.eligibility]

    if keyword:
        keyword_lower = keyword.lower()
        results = [
            r for r in results
            if keyword_lower in r.name.lower()
            or keyword_lower in r.description.lower()
            or any(keyword_lower in tag.lower() for tag in r.tags)
        ]

    total = len(results)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    page_results = results[start_idx:end_idx]

    return ResourceListResponse(
        resources=page_results,
        page=page,
        perPage=per_page,
        total=total,
    )


def update_resource(resource_id: str, updates: dict) -> Optional[ResourceProvider]:
    """Update a resource provider."""
    if resource_id not in RESOURCE_STORE:
        return None

    provider = RESOURCE_STORE[resource_id]
    for key, value in updates.items():
        if hasattr(provider, key):
            setattr(provider, key, value)

    provider.updatedAt = datetime.utcnow().isoformat()
    RESOURCE_STORE[resource_id] = provider

    # Re-write entire file (simpler than JSONL updates)
    _ensure_data_dir()
    with open(RESOURCES_FILE, 'w', encoding='utf-8') as f:
        for r in RESOURCE_STORE.values():
            f.write(json.dumps(r.dict()) + "\n")

    return provider


def record_interaction(
    veteran_id: str,
    resource_id: str,
    interaction_type: ResourceInteractionType,
) -> ResourceInteraction:
    """Record an interaction with a resource."""
    import uuid

    interaction = ResourceInteraction(
        id=str(uuid.uuid4()),
        veteranId=veteran_id,
        resourceId=resource_id,
        interactionType=interaction_type,
    )
    INTERACTION_STORE.append(interaction)
    _persist_interaction(interaction)
    return interaction


def get_resource_interactions(resource_id: str) -> List[ResourceInteraction]:
    """Get all interactions for a resource."""
    return [i for i in INTERACTION_STORE if i.resourceId == resource_id]


def get_impact_metrics(resource_id: str) -> ResourceImpactMetrics:
    """Calculate impact metrics for a resource."""
    provider = get_resource(resource_id)
    if not provider:
        return ResourceImpactMetrics(
            resourceId=resource_id,
            resourceName="Unknown",
            views=0,
            clicks=0,
            saves=0,
            referrals=0,
        )

    interactions = get_resource_interactions(resource_id)

    counts = {
        "VIEW": 0,
        "CLICK": 0,
        "SAVE": 0,
        "REFERRED": 0,
        "ATTENDED_EVENT": 0,
    }

    for interaction in interactions:
        counts[interaction.interactionType.value] += 1

    total_interactions = len(interactions)
    engagement_score = (
        counts["CLICK"] * 2
        + counts["REFERRED"] * 3
        + counts["ATTENDED_EVENT"] * 5
        + counts["SAVE"] * 1
    ) / max(total_interactions, 1)

    return ResourceImpactMetrics(
        resourceId=resource_id,
        resourceName=provider.name,
        views=counts["VIEW"],
        clicks=counts["CLICK"],
        saves=counts["SAVE"],
        referrals=counts["REFERRED"],
        avgEngagementScore=min(engagement_score, 100.0),
        topCategories=provider.categories[:3],
        topLocations=provider.serviceAreas[:3],
    )


def get_dashboard_metrics() -> Dict:
    """Get aggregated metrics for Resource Impact Dashboard."""
    all_metrics = [get_impact_metrics(rid) for rid in RESOURCE_STORE.keys()]

    top_resources = sorted(
        all_metrics,
        key=lambda m: m.views + m.clicks * 2 + m.referrals * 3,
        reverse=True,
    )[:10]

    category_usage: Dict[str, int] = {}
    for provider in RESOURCE_STORE.values():
        for category in provider.categories:
            category_usage[category] = category_usage.get(category, 0) + len(
                get_resource_interactions(provider.id)
            )

    return {
        "totalResources": len(RESOURCE_STORE),
        "totalInteractions": len(INTERACTION_STORE),
        "topResources": [
            {
                "name": m.resourceName,
                "views": m.views,
                "clicks": m.clicks,
                "engagement": m.avgEngagementScore,
            }
            for m in top_resources
        ],
        "categoryUsage": category_usage,
    }


# Load data at startup
_load_resources_from_disk()
_load_interactions_from_disk()
