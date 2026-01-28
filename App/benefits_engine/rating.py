"""
benefits_engine/rating.py
Rating Logic Engine for VetsReady Benefits Engine.
Implements public CFR rating criteria and multi-condition aggregation.
"""
from typing import Dict, Any

RATING_TABLE = {
    "hearing_loss": 10,
    "ptsd": 30,
    # ...
}

def get_rating(condition: str) -> int:
    return RATING_TABLE.get(condition.lower(), 0)

def aggregate_ratings(conditions: Dict[str, int]) -> int:
    # Simple sum, real VA math is more complex
    return sum(conditions.values())

def rating_estimate(data: Dict[str, Any]) -> Dict[str, Any]:
    conds = data.get("conditions", {})
    ratings = {c: get_rating(c) for c in conds}
    total = aggregate_ratings(ratings)
    return {"ratings": ratings, "total": total}
