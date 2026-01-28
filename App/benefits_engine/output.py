"""
benefits_engine/output.py
Output Engine for VetsReady Benefits Engine.
Produces eligibility summary, evidence checklist, rating estimate, next steps, and recommended forms.
"""
from typing import Dict, Any
import json

def generate_output(eligibility: Dict[str, Any], evidence: Dict[str, Any], rating: Dict[str, Any], mos: Dict[str, Any], next_steps: str = "") -> str:
    output = {
        "eligibility": eligibility,
        "evidence": evidence,
        "rating": rating,
        "mos_exposure": mos,
        "next_steps": next_steps
    }
    return json.dumps(output, indent=2)
