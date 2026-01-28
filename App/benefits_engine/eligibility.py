"""
benefits_engine/eligibility.py
Eligibility Engine for VetsReady Benefits Engine.
Implements public-source eligibility rules from 38 CFR Part 3.
"""
from typing import Dict, Any

# Example rules (expand as needed)
SERVICE_REQUIREMENTS = {
    "min_service_months": 24,
    "combat_zone": True,
}

CHARACTER_OF_DISCHARGE = ["Honorable", "General"]


def check_service_requirements(data: Dict[str, Any]) -> bool:
    months = data.get("service_months", 0)
    return months >= SERVICE_REQUIREMENTS["min_service_months"]

def check_character_of_discharge(data: Dict[str, Any]) -> bool:
    return data.get("character_of_service") in CHARACTER_OF_DISCHARGE

def check_combat_zone(data: Dict[str, Any]) -> bool:
    return data.get("combat_zone", False) == SERVICE_REQUIREMENTS["combat_zone"]

def eligibility_summary(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "service": check_service_requirements(data),
        "character": check_character_of_discharge(data),
        "combat": check_combat_zone(data),
    }
