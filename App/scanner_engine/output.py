"""
scanner_engine/output.py
Output module for VetsReady Scanner Engine.
Produces JSON object, confidence map, error list, suggested corrections, and document summary.
"""
import json
from typing import Dict, Any

def generate_output(fields: Dict[str, Any], confidences: Dict[str, float], errors: Dict[str, Any], summary: str = "") -> str:
    output = {
        "fields": fields,
        "confidence": confidences,
        "errors": errors,
        "summary": summary
    }
    return json.dumps(output, indent=2)
