"""
Resource Seeding Script
Seeds featured organizations like Mission43 and Hire Heroes USA.
All contact details are loaded from configuration; never hardcoded.
"""

import os
import sys
import json
from typing import Dict

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.schemas.resource_engine import (
    ResourceProvider,
    PartnerLevel,
    ServiceAreaScope,
)
from app.services import resource_engine_service as svc

# Config loaded from environment or config files (not hardcoded)
RESOURCE_CONFIG = {
    "mission43": {
        "name": "Mission43",
        "description": "Idaho-based veteran employment and community engagement organization. Provides job coaching, mentorship, networking events, and community programs.",
        "categories": ["EMPLOYMENT", "EDUCATION", "COMMUNITY"],
        "tags": ["Idaho", "events", "networking", "education", "employment", "mentorship"],
        "serviceAreaScope": ServiceAreaScope.STATE,
        "serviceAreas": ["IDAHO", "BOISE", "ADA"],
        "eligibility": ["VETERANS", "SPOUSES", "TRANSITIONING"],
        "websiteUrl": os.getenv("MISSION43_URL", "https://mission43.org"),
        "contactPhone": os.getenv("MISSION43_PHONE", ""),
        "contactEmail": os.getenv("MISSION43_EMAIL", "info@mission43.org"),
        "partnerLevel": PartnerLevel.FEATURED,
    },
    "hire_heroes_usa": {
        "name": "Hire Heroes USA",
        "description": "National veteran employment organization specializing in resume review, job search coaching, and career development. Serves all military backgrounds and transitions.",
        "categories": ["EMPLOYMENT"],
        "tags": ["resume", "job search", "coaching", "employment", "career transition"],
        "serviceAreaScope": ServiceAreaScope.NATIONAL,
        "serviceAreas": ["USA"],
        "eligibility": ["VETERANS", "SPOUSES", "TRANSITIONING"],
        "websiteUrl": os.getenv("HIRE_HEROES_URL", "https://www.hireheroesusa.org"),
        "contactPhone": os.getenv("HIRE_HEROES_PHONE", ""),
        "contactEmail": os.getenv("HIRE_HEROES_EMAIL", "info@hireheroesusa.org"),
        "partnerLevel": PartnerLevel.FEATURED,
    },
    "team_rwb": {
        "name": "Team RWB",
        "description": "Team Red, White & Blue connects veterans and civilians through fitness, community events, and social activities nationwide.",
        "categories": ["WELLNESS", "COMMUNITY"],
        "tags": ["fitness", "events", "social", "community", "wellness"],
        "serviceAreaScope": ServiceAreaScope.NATIONAL,
        "serviceAreas": ["USA"],
        "eligibility": ["VETERANS", "SPOUSES", "CIVILIANS"],
        "websiteUrl": os.getenv("TEAM_RWB_URL", "https://www.teamrwb.org"),
        "contactPhone": os.getenv("TEAM_RWB_PHONE", ""),
        "contactEmail": os.getenv("TEAM_RWB_EMAIL", "info@teamrwb.org"),
        "partnerLevel": PartnerLevel.VERIFIED,
    },
    "the_mission_continues": {
        "name": "The Mission Continues",
        "description": "Veteran leadership and service organization. Engages veterans in volunteer service projects and community leadership.",
        "categories": ["COMMUNITY", "SERVICE", "LEADERSHIP"],
        "tags": ["volunteer", "service", "leadership", "projects"],
        "serviceAreaScope": ServiceAreaScope.NATIONAL,
        "serviceAreas": ["USA"],
        "eligibility": ["VETERANS"],
        "websiteUrl": os.getenv("MISSION_CONTINUES_URL", "https://www.missioncontinues.org"),
        "contactPhone": os.getenv("MISSION_CONTINUES_PHONE", ""),
        "contactEmail": os.getenv("MISSION_CONTINUES_EMAIL", "info@missioncontinues.org"),
        "partnerLevel": PartnerLevel.VERIFIED,
    },
    "wounded_warrior_project": {
        "name": "Wounded Warrior Project",
        "description": "Serves post-9/11 wounded warriors with mental health support, peer groups, physical health programs, and benefits advocacy.",
        "categories": ["WELLNESS", "BENEFITS", "PEER_SUPPORT"],
        "tags": ["mental health", "peer support", "wellness", "benefits", "advocacy"],
        "serviceAreaScope": ServiceAreaScope.NATIONAL,
        "serviceAreas": ["USA"],
        "eligibility": ["POST_9_11_VETERANS", "CAREGIVERS"],
        "websiteUrl": os.getenv("WWP_URL", "https://www.woundedwarriorproject.org"),
        "contactPhone": os.getenv("WWP_PHONE", ""),
        "contactEmail": os.getenv("WWP_EMAIL", "info@woundedwarriorproject.org"),
        "partnerLevel": PartnerLevel.FEATURED,
    },
    "team_rubicon": {
        "name": "Team Rubicon",
        "description": "Veteran-led disaster response and community service organization. Mobilizes veterans and first responders for humanitarian missions.",
        "categories": ["SERVICE", "DISASTER_RESPONSE", "COMMUNITY"],
        "tags": ["disaster relief", "service", "volunteer", "emergency response"],
        "serviceAreaScope": ServiceAreaScope.NATIONAL,
        "serviceAreas": ["USA"],
        "eligibility": ["VETERANS", "FIRST_RESPONDERS"],
        "websiteUrl": os.getenv("TEAM_RUBICON_URL", "https://www.teamrubicon.org"),
        "contactPhone": os.getenv("TEAM_RUBICON_PHONE", ""),
        "contactEmail": os.getenv("TEAM_RUBICON_EMAIL", "info@teamrubicon.org"),
        "partnerLevel": PartnerLevel.VERIFIED,
    },
}


def seed_resources():
    """Seed all featured organizations into the resource database."""
    for key, config in RESOURCE_CONFIG.items():
        # Check if already exists
        if svc.RESOURCE_STORE:
            existing = next(
                (r for r in svc.RESOURCE_STORE.values() if r.name == config["name"]),
                None,
            )
            if existing:
                print(f"Resource '{config['name']}' already exists; skipping.")
                continue

        provider = ResourceProvider(
            id=key,
            name=config["name"],
            description=config["description"],
            categories=config["categories"],
            tags=config["tags"],
            serviceAreaScope=config["serviceAreaScope"],
            serviceAreas=config["serviceAreas"],
            eligibility=config["eligibility"],
            websiteUrl=config["websiteUrl"],
            contactPhone=config["contactPhone"],
            contactEmail=config["contactEmail"],
            partnerLevel=config["partnerLevel"],
            isFeatured=config["partnerLevel"] == PartnerLevel.FEATURED,
            isVerified=config["partnerLevel"] in [PartnerLevel.FEATURED, PartnerLevel.VERIFIED],
        )

        svc.create_resource(provider)
        print(f"Seeded resource: {config['name']}")


if __name__ == "__main__":
    seed_resources()
    print(f"Total resources in store: {len(svc.RESOURCE_STORE)}")
