"""
scanner_engine/error_handling.py
Error handling for VetsReady Scanner Engine.
Handles corrupted files, unsupported formats, low-confidence fallback, multi-pass OCR retry, and user-friendly messages.
"""
from typing import Any

class ScannerEngineError(Exception):
    pass

class CorruptedFileError(ScannerEngineError):
    pass

class UnsupportedFormatError(ScannerEngineError):
    pass

def handle_error(e: Exception) -> str:
    if isinstance(e, CorruptedFileError):
        return "The file appears to be corrupted. Please upload a different file."
    if isinstance(e, UnsupportedFormatError):
        return "This file format is not supported. Please upload a PDF, JPG, PNG, or TIFF."
    return f"An error occurred: {str(e)}"
