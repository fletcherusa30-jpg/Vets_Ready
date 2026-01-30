#!/usr/bin/env python
"""Test if Tesseract is properly configured"""
import os
import sys

# Set tesseract path BEFORE import
tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
os.environ['PATH'] = r'C:\Program Files\Tesseract-OCR' + ';' + os.environ.get('PATH', '')

try:
    import pytesseract
    # Set tesseract_cmd before using pytesseract
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    version = pytesseract.get_tesseract_version()
    print(f"✓ SUCCESS: Tesseract is available: {version}")
    sys.exit(0)
except Exception as e:
    print(f"✗ ERROR: {type(e).__name__}: {e}")
    sys.exit(1)
