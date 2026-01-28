"""
enterprise_licensing/tiers.py
Defines license tiers and features for VetsReady Enterprise Licensing.
"""
from typing import Dict, Any

LICENSE_TIERS = {
    "agency_basic": {
        "price": 10000,
        "seats": 50,
        "features": [
            "scanner_access", "resume_builder", "job_matching", "benefits_engine", "reporting_dashboard"
        ]
    },
    "agency_pro": {
        "price": 25000,
        "seats": 200,
        "features": [
            "advanced_scanner", "advanced_benefits_engine", "custom_reporting", "priority_support", "api_access"
        ]
    },
    "agency_elite": {
        "price": 50000,
        "seats": "unlimited",
        "features": [
            "full_platform", "custom_integrations", "dedicated_support", "white_label", "training_onboarding"
        ]
    }
}

def get_tier_info(tier: str) -> Dict[str, Any]:
    return LICENSE_TIERS.get(tier, {})
