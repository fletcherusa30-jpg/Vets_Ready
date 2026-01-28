"""
scanner_engine/type_detection.py
Document Type Detection for VetsReady Scanner Engine.
Performs layout analysis, keyword detection, structural pattern matching, and template matching.
"""

from typing import Dict, Any
import re

PUBLIC_VA_FORMS = [
    "21-526EZ", "21-4138", "21-0781", # ... add more as needed
]

DD214_KEYWORDS = ["DD214", "Certificate of Release or Discharge"]


def detect_document_type(text: str) -> Dict[str, Any]:
    result = {"type": "unknown", "matches": []}
    for form in PUBLIC_VA_FORMS:
        if form in text:
            result["type"] = "va_form"
            result["matches"].append(form)
    for kw in DD214_KEYWORDS:
        if re.search(kw, text, re.IGNORECASE):
            result["type"] = "dd214"
            result["matches"].append(kw)
    # Add more detection logic as needed
    return result
