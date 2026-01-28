"""
benefits_engine/evidence.py
Evidence Engine for VetsReady Benefits Engine.
Maps required forms and evidence based on public VA rules.
"""
from typing import Dict, Any, List

FORM_MAP = {
    "disability": ["21-526EZ"],
    "ptsd": ["21-0781"],
    # ...
}

EVIDENCE_MAP = {
    "disability": ["Medical records", "Lay evidence"],
    "ptsd": ["Service records", "Medical diagnosis"],
    # ...
}

def required_forms(condition: str) -> List[str]:
    return FORM_MAP.get(condition.lower(), [])

def required_evidence(condition: str) -> List[str]:
    return EVIDENCE_MAP.get(condition.lower(), [])

def evidence_checklist(data: Dict[str, Any]) -> Dict[str, Any]:
    cond = data.get("condition", "")
    return {
        "forms": required_forms(cond),
        "evidence": required_evidence(cond)
    }
