"""
scanner_engine/normalization.py
Normalization module for VetsReady Scanner Engine.
Standardizes date formats, MOS codes, branch names, and award names.
"""
from typing import Dict, Any
import datetime

BRANCH_MAP = {
    "us army": "Army",
    "us navy": "Navy",
    "usaf": "Air Force",
    # ...
}

MOS_MAP = {
    "11b": "11B",
    "68w": "68W",
    # ...
}


def normalize_date(date_str: str) -> str:
    try:
        dt = datetime.datetime.strptime(date_str, "%m/%d/%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return date_str

def normalize_branch(branch: str) -> str:
    return BRANCH_MAP.get(branch.lower(), branch)

def normalize_mos(mos: str) -> str:
    return MOS_MAP.get(mos.lower(), mos)

def normalize_fields(fields: Dict[str, Any]) -> Dict[str, Any]:
    if fields.get("date"):
        fields["date"] = normalize_date(fields["date"])
    if fields.get("branch"):
        fields["branch"] = normalize_branch(fields["branch"])
    if fields.get("mos"):
        fields["mos"] = normalize_mos(fields["mos"])
    return fields
