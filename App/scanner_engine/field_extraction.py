"""
scanner_engine/field_extraction.py
Field Extraction for VetsReady Scanner Engine.
Extracts key fields from OCR text and bounding boxes.
"""

import re
from typing import Dict, Any

FIELD_PATTERNS = {
    "name": r"Name[:\s]+([A-Z][a-zA-Z\s,.'-]+)",
    "ssn": r"SSN[:\s]+(\d{3}-\d{2}-\d{4}|XXX-XX-\d{4})",
    "date": r"(\d{2}/\d{2}/\d{4})",
    "branch": r"Branch[:\s]+([A-Za-z ]+)",
    "character_of_service": r"Character of Service[:\s]+([A-Za-z ]+)",
    "mos": r"MOS[:\s]+([A-Za-z0-9 ]+)",
    "awards": r"Awards[:\s]+([A-Za-z, ]+)",
    # Add more as needed
}


def extract_fields(text: str) -> Dict[str, Any]:
    results = {}
    for field, pattern in FIELD_PATTERNS.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            results[field] = match.group(1)
        else:
            results[field] = None
    return results
