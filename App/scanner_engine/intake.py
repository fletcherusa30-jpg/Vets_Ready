"""
scanner_engine/intake.py
File Intake module for VetsReady Scanner Engine.
Handles file validation, conversion, and intake logging.
"""

import os
from typing import Tuple, Optional
from PIL import Image
import fitz  # PyMuPDF

SUPPORTED_FORMATS = ["pdf", "jpg", "jpeg", "png", "tiff", "heic"]
MAX_FILE_SIZE_MB = 20
MAX_PAGE_COUNT = 50

class FileIntakeError(Exception):
    pass

def validate_file_type(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1][1:].lower()
    if ext not in SUPPORTED_FORMATS:
        raise FileIntakeError(f"Unsupported file type: {ext}")
    return ext

def validate_file_size(filepath: str) -> None:
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise FileIntakeError(f"File size {size_mb:.2f}MB exceeds {MAX_FILE_SIZE_MB}MB limit.")

def validate_page_count(filepath: str, ext: str) -> int:
    if ext == "pdf":
        doc = fitz.open(filepath)
        page_count = doc.page_count
        doc.close()
    else:
        page_count = 1
    if page_count > MAX_PAGE_COUNT:
        raise FileIntakeError(f"Page count {page_count} exceeds {MAX_PAGE_COUNT} page limit.")
    return page_count

def convert_to_standard(filepath: str, ext: str) -> str:
    # Convert HEIC to PNG, others to PDF if needed
    if ext == "heic":
        img = Image.open(filepath)
        out_path = filepath + ".png"
        img.save(out_path, "PNG")
        return out_path
    return filepath

def intake_file(filepath: str) -> Tuple[str, int]:
    ext = validate_file_type(filepath)
    validate_file_size(filepath)
    page_count = validate_page_count(filepath, ext)
    std_path = convert_to_standard(filepath, ext)
    return std_path, page_count
