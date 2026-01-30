"""
DD-214 OCR Scanner Service

Comprehensive backend service for extracting veteran service information from DD-214 documents.
Uses multiple OCR engines (Tesseract + Cloud Vision) with fallback logic.

Features:
- PDF and image processing with Poppler dependency checks
- Service date extraction
- Branch determination
- Combat service indicators
- Awards parsing
- MOS/specialty information
- Structured error handling with diagnostics
"""

import io
import re
import logging
import subprocess
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import os
from pathlib import Path

# Tesseract OCR
import pytesseract
from PIL import Image

# PDF2Image requires Poppler
try:
    import pdf2image
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False

# Google Cloud Vision (optional - for high-accuracy backup)
try:
    from google.cloud import vision
    HAS_GOOGLE_VISION = True
except ImportError:
    HAS_GOOGLE_VISION = False

from app.utils.ocr_diagnostics import OCRDependencyManager, OCRDiagnosticResult
from app.config import settings

logger = logging.getLogger(__name__)


class DD214OCRScanner:
    """Extract data from DD-214 documents using OCR"""

    # Combat deployment indicators
    COMBAT_LOCATIONS = [
        'iraq', 'afghanistan', 'kuwait', 'syria', 'yemen', 'somalia',
        'bahrain', 'qatar', 'saudi arabia', 'uae', 'oman', 'jordan',
        'combat zone', 'hostile fire', 'imminent danger', 'hf/id',
        'operation desert storm', 'operation enduring freedom', 'operation iraqi freedom',
        'operation inherent resolve', 'operation freedom sentinel'
    ]

    # Awards indicating combat service
    COMBAT_AWARDS = [
        'bronze star', 'purple heart', 'combat infantryman badge', 'cib',
        'expert infantryman badge', 'eib', 'combat action ribbon', 'car',
        'army commendation medal', 'meritorious service medal',
        'air force commendation medal', 'naval commendation medal'
    ]

    # Military branches
    BRANCHES = {
        'army': ['usa', 'us army', 'department of the army'],
        'navy': ['usn', 'us navy', 'department of the navy'],
        'air force': ['usaf', 'us air force', 'department of the air force'],
        'marine corps': ['usmc', 'us marine corps', 'department of the marine corps'],
        'coast guard': ['uscg', 'us coast guard', 'department of homeland security', 'coast guard'],
        'space force': ['ussf', 'us space force', 'space force'],
    }

    def __init__(self):
        """Initialize scanner with OCR engines and dependency checks"""
        # Initialize dependency manager
        self.dep_manager = OCRDependencyManager(
            poppler_path=settings.poppler_path,
            tesseract_path=settings.tesseract_path
        )

        # Check dependencies
        self.tesseract_available = self._check_tesseract()
        self.google_vision_available = HAS_GOOGLE_VISION
        self.poppler_available = self._check_poppler()

        # Log diagnostics on initialization
        diagnostics = self.dep_manager.run_diagnostics()
        self._log_diagnostics(diagnostics)

    def _check_tesseract(self) -> bool:
        """Check if Tesseract OCR is available"""
        try:
            pytesseract.get_tesseract_version()
            logger.info("Tesseract OCR is available")
            return True
        except Exception as e:
            logger.warning(f"Tesseract not available: {e}")
            return False

    def _check_poppler(self) -> bool:
        """Check if Poppler is available"""
        try:
            result = subprocess.run(['pdfinfo', '-v'], capture_output=True, timeout=5)
            if result.returncode == 0:
                logger.info("Poppler (pdfinfo) is available")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        logger.warning("Poppler not available")
        return False

    def _log_diagnostics(self, diagnostics: OCRDiagnosticResult):
        """Log OCR diagnostics"""
        if diagnostics.errors:
            for error in diagnostics.errors:
                logger.error(f"OCR ERROR: {error}")

        if diagnostics.warnings:
            for warning in diagnostics.warnings:
                logger.warning(f"OCR WARNING: {warning}")

        if diagnostics.recommendations:
            logger.info("OCR RECOMMENDATIONS:")
            for rec in diagnostics.recommendations:
                logger.info(f"  - {rec}")

        logger.info(f"OCR Ready for PDF: {diagnostics.ready_for_pdf_ocr}")

    async def scan_dd214(self, file_path: str) -> Dict:
        """
        Scan DD-214 document and extract information

        Args:
            file_path: Path to DD-214 file (PDF or image)

        Returns:
            Dictionary with extracted data

        Raises:
            ValueError: With structured error info if file cannot be processed
        """
        try:
            # Validate file exists and is readable
            if not os.path.isfile(file_path):
                raise ValueError({
                    'error_code': 'FILE_NOT_FOUND',
                    'message': f'File not found: {file_path}',
                    'recommended_fix': 'Verify file path is correct and file exists'
                })

            if not os.access(file_path, os.R_OK):
                raise ValueError({
                    'error_code': 'FILE_NOT_READABLE',
                    'message': f'File is not readable: {file_path}',
                    'recommended_fix': 'Check file permissions'
                })

            # Determine file type
            file_ext = Path(file_path).suffix.lower()

            # Extract text from file
            if file_ext == '.pdf':
                logger.info(f"Processing PDF: {file_path}")
                text = await self._extract_from_pdf(file_path)
            elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
                logger.info(f"Processing image: {file_path}")
                text = await self._extract_from_image(file_path)
            else:
                raise ValueError({
                    'error_code': 'UNSUPPORTED_FILE_TYPE',
                    'message': f'Unsupported file type: {file_ext}',
                    'recommended_fix': 'Use PDF, JPG, PNG, TIFF, or BMP file'
                })

            if not text or text.strip() == "":
                raise ValueError({
                    'error_code': 'NO_TEXT_EXTRACTED',
                    'message': 'No text could be extracted from the file',
                    'recommended_fix': 'Ensure the document is not blank or corrupted. Try uploading a different file.'
                })

            # Parse extracted text
            extracted_data = self._parse_dd214_text(text)
            extracted_data['raw_text'] = text
            extracted_data['extraction_method'] = 'OCR'
            extracted_data['extraction_confidence'] = self._calculate_confidence(extracted_data)

            logger.info(f"DD-214 scan complete: Confidence={extracted_data['extraction_confidence']}")
            return extracted_data

        except ValueError as e:
            # Re-raise structured errors
            logger.error(f"Structured error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error scanning DD-214: {e}")
            raise ValueError({
                'error_code': 'OCR_PROCESSING_ERROR',
                'message': f'Error scanning document: {str(e)}',
                'recommended_fix': 'Try uploading the document again or contact support'
            })

    async def _extract_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF using multiple methods

        First attempts to verify PDF with Poppler (pdfinfo),
        then uses Tesseract or Google Vision for OCR.
        """
        text = ""

        # Step 1: Verify PDF with Poppler
        logger.info("Verifying PDF with Poppler...")
        can_process, verification_msg = self.dep_manager.verify_pdf_for_processing(file_path)

        if not can_process:
            error_msg = f"Poppler verification failed: {verification_msg}"
            logger.error(error_msg)

            if "pdfinfo" in verification_msg or "not found in PATH" in verification_msg:
                raise ValueError({
                    'error_code': 'MISSING_POPPLER',
                    'message': 'Poppler is not installed or not in system PATH',
                    'details': verification_msg,
                    'recommended_fix': (
                        'Install Poppler from https://github.com/oschwartz10612/poppler-windows/releases/ '
                        'or run: apt-get install poppler-utils (Linux), '
                        'or brew install poppler (macOS)'
                    )
                })
            else:
                raise ValueError({
                    'error_code': 'INVALID_PDF',
                    'message': f'PDF validation failed: {verification_msg}',
                    'recommended_fix': 'Verify the PDF file is valid and not corrupted'
                })

        logger.info(f"PDF verification successful: {verification_msg}")

        # Step 2: Try Tesseract OCR
        if not HAS_PDF2IMAGE:
            logger.warning("pdf2image not available, cannot process PDF with Tesseract")
        elif self.tesseract_available:
            try:
                logger.info("Extracting text from PDF with Tesseract...")
                images = pdf2image.convert_from_path(file_path)
                logger.info(f"PDF converted to {len(images)} image(s)")

                for page_num, image in enumerate(images, 1):
                    logger.info(f"Running OCR on page {page_num}/{len(images)}...")
                    page_text = pytesseract.image_to_string(image, lang='eng')
                    text += page_text
                    text += "\n---PAGE BREAK---\n"
                    logger.debug(f"Page {page_num} OCR complete: {len(page_text)} characters extracted")

                if text:
                    logger.info(f"Tesseract extraction successful: {len(text)} total characters")
                    return text
            except Exception as e:
                logger.warning(f"Tesseract PDF extraction failed: {e}")

        # Step 3: Try Google Cloud Vision if Tesseract failed
        if self.google_vision_available:
            try:
                logger.info("Falling back to Google Cloud Vision...")
                text = await self._extract_with_google_vision(file_path)
                logger.info("Google Vision extraction successful")
                return text
            except Exception as e:
                logger.warning(f"Google Vision extraction failed: {e}")

        # If we reach here, all OCR methods failed
        error_msg = "Could not extract text from PDF using available OCR engines"
        logger.error(error_msg)
        raise ValueError({
            'error_code': 'OCR_EXTRACTION_FAILED',
            'message': error_msg,
            'details': f'Tesseract available: {self.tesseract_available}, Google Vision available: {self.google_vision_available}',
            'recommended_fix': (
                'Install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki '
                'or enable Google Cloud Vision API'
            )
        })

    async def _extract_from_image(self, file_path: str) -> str:
        """Extract text from image"""
        text = ""

        # Try Tesseract
        if self.tesseract_available:
            try:
                image = Image.open(file_path)
                text = pytesseract.image_to_string(image, lang='eng')
            except Exception as e:
                logger.warning(f"Tesseract image extraction failed: {e}")

        # Try Google Vision if Tesseract failed
        if not text and self.google_vision_available:
            try:
                text = await self._extract_with_google_vision(file_path)
            except Exception as e:
                logger.warning(f"Google Vision extraction failed: {e}")

        if not text:
            raise ValueError("Could not extract text from image using available OCR engines")

        return text

    async def _extract_with_google_vision(self, file_path: str) -> str:
        """Extract text using Google Cloud Vision API"""
        if not HAS_GOOGLE_VISION:
            raise ValueError("Google Cloud Vision not available")

        client = vision.ImageAnnotatorClient()

        with io.open(file_path, 'rb') as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)

        if response.full_text_annotation:
            return response.full_text_annotation.text
        else:
            raise ValueError("No text found in image by Google Vision")

    def _parse_dd214_text(self, text: str) -> Dict:
        """Parse extracted DD-214 text and extract structured data"""
        text_lower = text.lower()
        data = {
            'branch': self._extract_branch(text_lower),
            'entry_date': self._extract_date(text, 'entry|begin service|entered active'),
            'separation_date': self._extract_date(text, 'separation|released|discharged'),
            'years_of_service': self._extract_years_of_service(text),
            'rank': self._extract_rank(text),
            'pay_grade': self._extract_pay_grade(text),
            'character_of_service': self._extract_character_of_service(text),
            'separation_code': self._extract_separation_code(text),
            'combat_service': self._detect_combat_service(text_lower),
            'combat_locations': self._extract_combat_locations(text_lower),
            'awards': self._extract_awards(text),
            'mos_code': self._extract_mos_code(text),
            'mos_title': self._extract_mos_title(text),
            'specialties': self._extract_specialties(text),
            'narrative_reason': self._extract_narrative_reason(text)
        }
        return data

    def _extract_branch(self, text_lower: str) -> str:
        """Extract military branch"""
        for branch, keywords in self.BRANCHES.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return branch.title()
        return ""

    def _extract_date(self, text: str, pattern: str) -> Optional[str]:
        """Extract date near pattern"""
        # Match date patterns: MM/DD/YYYY, MM-DD-YYYY, Month DD, YYYY, etc.
        date_patterns = [
            r'\d{1,2}/\d{1,2}/\d{4}',
            r'\d{1,2}-\d{1,2}-\d{4}',
            r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}',
        ]

        text_lower = text.lower()
        # Find section near pattern
        if re.search(pattern, text_lower):
            idx = re.search(pattern, text_lower).start()
            section = text[max(0, idx - 100):min(len(text), idx + 100)]

            for date_pattern in date_patterns:
                match = re.search(date_pattern, section)
                if match:
                    return match.group()

        return None

    def _extract_years_of_service(self, text: str) -> Optional[int]:
        """Extract years of service"""
        patterns = [
            r'years?\s+of\s+service[:\s]+(\d+)',
            r'total\s+service[:\s]+(\d+)\s+years?',
            r'(\d+)\s+years?\s+(?:active\s+)?service',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue

        return None

    def _extract_rank(self, text: str) -> str:
        """Extract highest rank held"""
        rank_patterns = {
            'E': r'e-?([1-9])',  # Enlisted
            'O': r'o-?([1-9])',  # Officer
            'W': r'w-?([1-5])',  # Warrant officer
        }

        ranks_found = []
        for category, pattern in rank_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                ranks_found.append(f"{category}{match}")

        return ' / '.join(ranks_found) if ranks_found else ""

    def _extract_pay_grade(self, text: str) -> str:
        """Extract pay grade"""
        match = re.search(r'pay\s+grade[:\s]+([A-Z0-9\-]+)', text, re.IGNORECASE)
        return match.group(1) if match else ""

    def _extract_character_of_service(self, text: str) -> str:
        """Extract character of discharge"""
        patterns = [
            r'character\s+of\s+discharge[:\s]+([^\n\r]+)',
            r'(honorable|general|under\s+honorable|other\s+than\s+honorable|oth|bad\s+conduct|dishonorable)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).title()

        return ""

    def _extract_separation_code(self, text: str) -> str:
        """Extract separation code"""
        match = re.search(r'(?:separation\s+)?code[:\s]+([A-Z0-9]+)', text, re.IGNORECASE)
        return match.group(1) if match else ""

    def _detect_combat_service(self, text_lower: str) -> bool:
        """Detect if veteran has combat service"""
        # Check for combat location mentions
        for location in self.COMBAT_LOCATIONS:
            if location in text_lower:
                return True

        # Check for combat awards
        for award in self.COMBAT_AWARDS:
            if award in text_lower:
                return True

        # Check for explicit combat indicators
        combat_indicators = ['combat zone', 'hostile fire', 'imminent danger', 'combat related']
        for indicator in combat_indicators:
            if indicator in text_lower:
                return True

        return False

    def _extract_combat_locations(self, text_lower: str) -> List[str]:
        """Extract combat deployment locations"""
        locations = []
        for location in self.COMBAT_LOCATIONS:
            if location in text_lower:
                locations.append(location.title())
        return locations

    def _extract_awards(self, text: str) -> List[str]:
        """Extract awards and decorations"""
        awards = []
        award_keywords = [
            'medal', 'ribbon', 'star', 'badge', 'commendation', 'achievement'
        ]

        # Split by common award delimiters
        sections = re.split(r'(?:awards?|decorations?|citations?)[:\s]*', text, flags=re.IGNORECASE)

        for section in sections[1:]:  # Skip first section
            lines = section.split('\n')
            for line in lines[:10]:  # First 10 lines after "Awards" section
                if any(keyword in line.lower() for keyword in award_keywords):
                    clean_line = re.sub(r'^\s*[\-•*]\s*', '', line).strip()
                    if len(clean_line) > 5 and len(clean_line) < 100:
                        awards.append(clean_line)

        return list(set(awards))  # Remove duplicates

    def _extract_mos_code(self, text: str) -> str:
        """Extract Military Occupational Specialty code"""
        # MOS codes are typically 5 digit codes or similar formats
        patterns = [
            r'(?:mos|military occupational specialty)[:\s]*([0-9A-Z]{3,6})',
            r'(?:duty\s+mos|final\s+mos)[:\s]*([0-9A-Z]{3,6})',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)

        return ""

    def _extract_mos_title(self, text: str) -> str:
        """Extract MOS title/description"""
        patterns = [
            r'(?:mos|occupational)[^:]*:[^\n]*(?:=)\s*([^\n]+)',
            r'specialty\s*:\s*([^\n]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return ""

    def _extract_specialties(self, text: str) -> List[str]:
        """Extract skill identifiers and specialties"""
        specialties = []

        # Look for skill identifier patterns (like "P" for Parachute, "S" for SCUBA, etc.)
        skill_patterns = r'(?:skills?|specialties?)[:\s]*([A-Z\s,]+)'
        match = re.search(skill_patterns, text, re.IGNORECASE)
        if match:
            skills = match.group(1).split(',')
            specialties.extend([s.strip() for s in skills if s.strip()])

        return specialties

    def _extract_narrative_reason(self, text: str) -> str:
        """Extract narrative reason for separation"""
        patterns = [
            r'(?:narrative\s+)?(?:reason|explanation)[:\s]*([^\n]+)',
            r'(?:comments?)[:\s]*([^\n]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return ""

    def _calculate_confidence(self, data: Dict) -> str:
        """Calculate extraction confidence score"""
        score = 0
        max_score = 0

        # Check each important field
        fields = {
            'branch': 20,
            'entry_date': 15,
            'separation_date': 15,
            'rank': 15,
            'character_of_service': 15,
            'combat_service': 10,
            'mos_code': 10,
        }

        for field, points in fields.items():
            max_score += points
            if data.get(field):
                score += points

        confidence_pct = (score / max_score) * 100 if max_score > 0 else 0

        if confidence_pct >= 80:
            return 'high'
        elif confidence_pct >= 60:
            return 'medium'
        else:
            return 'low'

    def get_civilian_job_suggestions(self, mos_code: str, mos_title: str, specialties: List[str]) -> Dict:
        """
        Suggest civilian jobs based on military background

        This is a mapping service - in production, use a comprehensive MOS-to-civilian jobs database
        """
        # Placeholder - in production, this would query a comprehensive database
        return {
            'suggested_jobs': [],
            'matched_skills': specialties or [],
            'certification_recommendations': []
        }
