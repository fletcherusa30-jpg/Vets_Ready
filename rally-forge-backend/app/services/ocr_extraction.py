"""
UNIFIED OCR/PDF EXTRACTION ENGINE

Handles all document text extraction with automatic detection and fallback.

SUPPORTS:
- Text-based PDFs (direct text extraction)
- Image-based PDFs (OCR via Tesseract)
- TIFF files (OCR)
- JPG/PNG images (OCR)

FEATURES:
- Automatic text vs image detection
- Multiple extraction methods with fallback
- Confidence scoring
- Character count validation
- Detailed logging

VALIDATION:
- Reject extractions with < 200 characters
- Log extraction confidence
- Log extraction method used
- Return detailed error messages
"""

import os
import logging
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from enum import Enum
import io

# PDF and image processing libraries
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    import PyPDF2
    DEPENDENCIES_AVAILABLE = True
except ImportError as e:
    logging.warning(f"OCR dependencies not fully available: {e}")
    DEPENDENCIES_AVAILABLE = False

logger = logging.getLogger(__name__)


class ExtractionMethod(str, Enum):
    """Methods for text extraction"""
    PDF_TEXT = "pdf_text_extraction"
    OCR_TESSERACT = "ocr_tesseract"
    HYBRID = "hybrid"
    FAILED = "failed"


class DocumentType(str, Enum):
    """Supported document types"""
    PDF_TEXT = "pdf_text"
    PDF_IMAGE = "pdf_image"
    IMAGE = "image"
    TIFF = "tiff"
    UNKNOWN = "unknown"


class OCRExtractionEngine:
    """
    Unified engine for extracting text from documents.

    WORKFLOW:
    1. Detect document type
    2. Attempt direct text extraction (PDFs)
    3. Fall back to OCR if needed
    4. Validate extraction quality
    5. Return structured result
    """

    def __init__(self, min_characters: int = 200):
        self.min_characters = min_characters
        self.tesseract_config = '--psm 1 --oem 3'  # Page segmentation mode 1, OCR Engine Mode 3

        if not DEPENDENCIES_AVAILABLE:
            logger.error("OCR dependencies not available. Install: pip install pytesseract pillow pdf2image PyPDF2")

    async def extract_text(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from document using best available method.

        Returns:
            {
                'success': bool,
                'text': str,
                'method': ExtractionMethod,
                'confidence': float,
                'character_count': int,
                'document_type': DocumentType,
                'error': Optional[str],
                'warnings': List[str]
            }
        """
        file_path = Path(file_path)

        # Validate file exists
        if not file_path.exists():
            return self._error_result(f"File not found: {file_path}")

        if not file_path.is_file():
            return self._error_result(f"Path is not a file: {file_path}")

        file_size = file_path.stat().st_size
        if file_size == 0:
            return self._error_result(f"File is empty: {file_path}")

        logger.info(f"Extracting text from: {file_path} ({file_size} bytes)")

        # Detect document type
        document_type = self._detect_document_type(file_path)
        logger.info(f"Detected document type: {document_type.value}")

        # Try extraction based on document type
        if document_type == DocumentType.PDF_TEXT or document_type == DocumentType.PDF_IMAGE:
            return await self._extract_from_pdf(file_path)

        elif document_type in [DocumentType.IMAGE, DocumentType.TIFF]:
            return await self._extract_from_image(file_path)

        else:
            return self._error_result(f"Unsupported document type: {document_type.value}")

    def _detect_document_type(self, file_path: Path) -> DocumentType:
        """Detect document type from file extension and content"""
        extension = file_path.suffix.lower()

        if extension == '.pdf':
            # Check if PDF contains text or is image-only
            if self._pdf_contains_text(file_path):
                return DocumentType.PDF_TEXT
            else:
                return DocumentType.PDF_IMAGE

        elif extension in ['.tiff', '.tif']:
            return DocumentType.TIFF

        elif extension in ['.jpg', '.jpeg', '.png', '.bmp']:
            return DocumentType.IMAGE

        else:
            return DocumentType.UNKNOWN

    def _pdf_contains_text(self, file_path: Path) -> bool:
        """
        Check if PDF contains extractable text.

        Returns:
            True if PDF has text, False if image-only
        """
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                # Check first few pages for text
                pages_to_check = min(3, len(pdf_reader.pages))

                for page_num in range(pages_to_check):
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()

                    # If we find significant text, it's a text PDF
                    if text and len(text.strip()) > 100:
                        return True

                return False

        except Exception as e:
            logger.warning(f"Error checking PDF for text: {e}")
            return False

    async def _extract_from_pdf(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract text from PDF.

        STRATEGY:
        1. Try direct text extraction
        2. If insufficient text, use OCR
        3. If both fail, return error
        """
        warnings = []

        # Try direct text extraction first
        text_extraction_result = self._extract_pdf_text(file_path)

        if text_extraction_result['success'] and len(text_extraction_result['text']) >= self.min_characters:
            logger.info(f"Successfully extracted text from PDF: {len(text_extraction_result['text'])} characters")
            return text_extraction_result

        else:
            warnings.append(f"PDF text extraction yielded {len(text_extraction_result.get('text', ''))} characters (minimum {self.min_characters})")
            logger.warning(f"PDF text extraction insufficient. Falling back to OCR.")

            # Fall back to OCR
            ocr_result = await self._extract_pdf_with_ocr(file_path)

            if ocr_result['success']:
                ocr_result['warnings'] = warnings + ocr_result.get('warnings', [])
                return ocr_result

            else:
                # Both methods failed
                return self._error_result(
                    f"Both PDF text extraction and OCR failed. Text extraction: {text_extraction_result.get('error')}, OCR: {ocr_result.get('error')}",
                    warnings=warnings
                )

    def _extract_pdf_text(self, file_path: Path) -> Dict[str, Any]:
        """Extract text directly from PDF"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                text_parts = []

                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()

                    if page_text:
                        text_parts.append(page_text)

                full_text = '\n\n'.join(text_parts)
                character_count = len(full_text)

                logger.info(f"Extracted {character_count} characters from {len(pdf_reader.pages)} pages")

                if character_count < self.min_characters:
                    return {
                        'success': False,
                        'text': full_text,
                        'method': ExtractionMethod.PDF_TEXT,
                        'confidence': 0.5,
                        'character_count': character_count,
                        'document_type': DocumentType.PDF_TEXT,
                        'error': f"Insufficient text extracted: {character_count} characters (minimum {self.min_characters})",
                        'warnings': []
                    }

                return {
                    'success': True,
                    'text': full_text,
                    'method': ExtractionMethod.PDF_TEXT,
                    'confidence': 0.95,
                    'character_count': character_count,
                    'document_type': DocumentType.PDF_TEXT,
                    'error': None,
                    'warnings': []
                }

        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            return {
                'success': False,
                'text': '',
                'method': ExtractionMethod.FAILED,
                'confidence': 0.0,
                'character_count': 0,
                'document_type': DocumentType.PDF_TEXT,
                'error': str(e),
                'warnings': []
            }

    async def _extract_pdf_with_ocr(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from PDF using OCR"""
        try:
            logger.info(f"Converting PDF to images for OCR: {file_path}")

            # Convert PDF pages to images
            images = convert_from_path(str(file_path), dpi=300)

            logger.info(f"Converted {len(images)} pages to images")

            text_parts = []
            total_confidence = 0.0

            for page_num, image in enumerate(images):
                # Run OCR on each page
                page_text = pytesseract.image_to_string(image, config=self.tesseract_config)

                if page_text:
                    text_parts.append(page_text)

                # Get confidence (if available)
                try:
                    page_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
                    confidences = [int(conf) for conf in page_data['conf'] if conf != '-1']
                    if confidences:
                        total_confidence += sum(confidences) / len(confidences)
                except:
                    total_confidence += 70  # Default confidence

                logger.info(f"OCR completed for page {page_num + 1}/{len(images)}")

            full_text = '\n\n'.join(text_parts)
            character_count = len(full_text)
            avg_confidence = (total_confidence / len(images)) / 100 if images else 0

            logger.info(f"OCR extracted {character_count} characters with {avg_confidence:.2f} confidence")

            if character_count < self.min_characters:
                return {
                    'success': False,
                    'text': full_text,
                    'method': ExtractionMethod.OCR_TESSERACT,
                    'confidence': avg_confidence,
                    'character_count': character_count,
                    'document_type': DocumentType.PDF_IMAGE,
                    'error': f"Insufficient text extracted via OCR: {character_count} characters (minimum {self.min_characters})",
                    'warnings': []
                }

            return {
                'success': True,
                'text': full_text,
                'method': ExtractionMethod.OCR_TESSERACT,
                'confidence': avg_confidence,
                'character_count': character_count,
                'document_type': DocumentType.PDF_IMAGE,
                'error': None,
                'warnings': []
            }

        except Exception as e:
            logger.error(f"PDF OCR extraction failed: {e}")
            return {
                'success': False,
                'text': '',
                'method': ExtractionMethod.FAILED,
                'confidence': 0.0,
                'character_count': 0,
                'document_type': DocumentType.PDF_IMAGE,
                'error': str(e),
                'warnings': []
            }

    async def _extract_from_image(self, file_path: Path) -> Dict[str, Any]:
        """Extract text from image file using OCR"""
        try:
            logger.info(f"Running OCR on image: {file_path}")

            # Open image
            image = Image.open(file_path)

            # Run OCR
            text = pytesseract.image_to_string(image, config=self.tesseract_config)

            # Get confidence
            try:
                data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
                confidences = [int(conf) for conf in data['conf'] if conf != '-1']
                avg_confidence = (sum(confidences) / len(confidences)) / 100 if confidences else 0
            except:
                avg_confidence = 0.7  # Default confidence

            character_count = len(text)

            logger.info(f"OCR extracted {character_count} characters with {avg_confidence:.2f} confidence")

            if character_count < self.min_characters:
                return {
                    'success': False,
                    'text': text,
                    'method': ExtractionMethod.OCR_TESSERACT,
                    'confidence': avg_confidence,
                    'character_count': character_count,
                    'document_type': DocumentType.IMAGE,
                    'error': f"Insufficient text extracted: {character_count} characters (minimum {self.min_characters})",
                    'warnings': []
                }

            return {
                'success': True,
                'text': text,
                'method': ExtractionMethod.OCR_TESSERACT,
                'confidence': avg_confidence,
                'character_count': character_count,
                'document_type': DocumentType.IMAGE,
                'error': None,
                'warnings': []
            }

        except Exception as e:
            logger.error(f"Image OCR extraction failed: {e}")
            return {
                'success': False,
                'text': '',
                'method': ExtractionMethod.FAILED,
                'confidence': 0.0,
                'character_count': 0,
                'document_type': DocumentType.IMAGE,
                'error': str(e),
                'warnings': []
            }

    def _error_result(self, error: str, warnings: list = None) -> Dict[str, Any]:
        """Create a standardized error result"""
        return {
            'success': False,
            'text': '',
            'method': ExtractionMethod.FAILED,
            'confidence': 0.0,
            'character_count': 0,
            'document_type': DocumentType.UNKNOWN,
            'error': error,
            'warnings': warnings or []
        }


# Global OCR engine instance
ocr_engine = OCRExtractionEngine()


def get_ocr_engine() -> OCRExtractionEngine:
    """Get the global OCR engine instance"""
    return ocr_engine
