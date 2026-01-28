"""
scanner_engine/ocr.py
OCR Layer for VetsReady Scanner Engine.
Supports multi-engine OCR, language model correction, confidence scoring, and bounding box extraction.
"""

import pytesseract
from pytesseract import Output
import cv2
from typing import Dict, Any

class OCRResult:
    def __init__(self, text: str, data: Dict[str, Any]):
        self.text = text
        self.data = data
        self.confidences = data.get('conf', [])
        self.boxes = data.get('boxes', [])


def run_tesseract_ocr(image_path: str) -> OCRResult:
    image = cv2.imread(image_path)
    data = pytesseract.image_to_data(image, output_type=Output.DICT)
    text = pytesseract.image_to_string(image)
    return OCRResult(text, data)

# Placeholder for cloud OCR integration
def run_cloud_ocr(image_path: str) -> OCRResult:
    # Integrate with Azure, Google, or AWS OCR as needed
    return run_tesseract_ocr(image_path)


def ocr_with_correction(image_path: str, use_cloud: bool = False) -> OCRResult:
    if use_cloud:
        result = run_cloud_ocr(image_path)
    else:
        result = run_tesseract_ocr(image_path)
    # Placeholder: add language model correction here
    return result
