"""
benefits_engine/mos_exposure.py
MOS Exposure Engine for VetsReady Benefits Engine.
Implements public FAST Letter 10-35 noise exposure and MOS mapping.
"""
from typing import Dict, Any

MOS_EXPOSURE = {
    "11B": "High",
    "68W": "Moderate",
    # ...
}

EXPOSURE_CONDITIONS = {
    "High": ["hearing_loss"],
    "Moderate": ["tinnitus"],
    # ...
}

def get_exposure_level(mos: str) -> str:
    return MOS_EXPOSURE.get(mos.upper(), "Unknown")

def relevant_conditions(exposure: str) -> list:
    return EXPOSURE_CONDITIONS.get(exposure, [])

def mos_exposure_notes(data: Dict[str, Any]) -> Dict[str, Any]:
    mos = data.get("mos", "")
    exposure = get_exposure_level(mos)
    conditions = relevant_conditions(exposure)
    return {"exposure": exposure, "conditions": conditions}
