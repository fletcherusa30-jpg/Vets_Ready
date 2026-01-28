"""
scanner_engine/confidence.py
Confidence Engine for VetsReady Scanner Engine.
Calculates per-field, per-page, and overall document confidence.
"""
from typing import Dict, Any

def compute_field_confidence(ocr_data: Dict[str, Any], field: str) -> float:
    # Placeholder: use OCR confidence or heuristics
    confs = ocr_data.get('conf', [])
    if confs:
        return sum([float(c) for c in confs if c != '-1']) / len(confs)
    return 0.0

def compute_overall_confidence(field_confidences: Dict[str, float]) -> float:
    if not field_confidences:
        return 0.0
    return sum(field_confidences.values()) / len(field_confidences)

def detect_ambiguity(field_confidences: Dict[str, float], threshold: float = 60.0) -> Dict[str, bool]:
    return {k: v < threshold for k, v in field_confidences.items()}
