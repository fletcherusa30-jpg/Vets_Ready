"""PhoneApp 2.0 Backend Application"""
# Initialize pytesseract with proper tesseract path BEFORE any imports
import os
import sys

# Get tesseract path from environment or hardcoded
tesseract_path = os.environ.get('TESSERACT_PATH', r'C:\Program Files\Tesseract-OCR\tesseract.exe')
tesseract_dir = os.path.dirname(tesseract_path)

# Add tesseract directory to PATH
if tesseract_dir and os.path.isdir(tesseract_dir):
    os.environ['PATH'] = tesseract_dir + ';' + os.environ.get('PATH', '')

# Set tesseract_cmd BEFORE pytesseract is used
try:
    import pytesseract
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
except Exception as e:
    pass
