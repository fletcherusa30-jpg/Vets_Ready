"""
scanner_engine/validation.py
Validation Layer for VetsReady Scanner Engine.
Performs cross-field consistency checks, date logic, MOS validation, and missing field detection.
"""
from typing import Dict, Any, List
import datetime

VALID_MOS_CODES = ["11B", "68W", "25B"]  # Example, expand as needed


def validate_dates(fields: Dict[str, Any]) -> List[str]:
    errors = []
    date_str = fields.get("date")
    if date_str:
        try:
            datetime.datetime.strptime(date_str, "%m/%d/%Y")
        except Exception:
            errors.append(f"Invalid date format: {date_str}")
    return errors

def validate_mos(fields: Dict[str, Any]) -> List[str]:
    errors = []
    mos = fields.get("mos")
    if mos and mos not in VALID_MOS_CODES:
        errors.append(f"Unknown MOS code: {mos}")
    return errors

def detect_missing_fields(fields: Dict[str, Any]) -> List[str]:
    return [k for k, v in fields.items() if v is None]

def validate_fields(fields: Dict[str, Any]) -> Dict[str, Any]:
    errors = []
    errors.extend(validate_dates(fields))
    errors.extend(validate_mos(fields))
    missing = detect_missing_fields(fields)
    return {"errors": errors, "missing": missing}
