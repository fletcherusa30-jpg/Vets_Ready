"""
SELF-HEALING ENGINE

Automatic repair and recovery system for scanner operations.
Handles common failures and optimizes performance.

CAPABILITIES:
- Auto-recreate missing directories
- Retry extraction with alternate methods
- Adjust OCR settings dynamically
- Split large PDFs
- Detect and handle corrupted files
- Suggest re-uploads
"""

import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
import shutil

logger = logging.getLogger(__name__)


class SelfHealingEngine:
    """
    Monitors scanner health and automatically repairs common issues
    """

    def __init__(self):
        self.repair_history: List[Dict] = []
        self.auto_repair_enabled = True


    # ==================== DIRECTORY HEALING ====================

    def ensure_directories_exist(self, base_path: str) -> Dict:
        """
        Ensure all required scanner directories exist.
        Auto-create if missing.

        Args:
            base_path: Base path for scanner storage

        Returns:
            {
                'success': bool,
                'created': List[str],
                'errors': List[str]
            }
        """
        required_dirs = [
            'uploads/dd214',
            'uploads/str',
            'uploads/rating',
            'uploads/project',
            'results/dd214',
            'results/str',
            'results/rating',
            'results/project',
            'temp',
            'ocr_cache'
        ]

        created = []
        errors = []

        for dir_path in required_dirs:
            full_path = os.path.join(base_path, dir_path)

            try:
                if not os.path.exists(full_path):
                    os.makedirs(full_path, exist_ok=True)
                    created.append(dir_path)
                    logger.info(f"Created missing directory: {dir_path}")

                    self._log_repair(
                        'directory_creation',
                        f"Created missing directory: {dir_path}",
                        'success'
                    )
            except Exception as e:
                errors.append(f"{dir_path}: {str(e)}")
                logger.error(f"Failed to create directory {dir_path}: {e}")

        return {
            'success': len(errors) == 0,
            'created': created,
            'errors': errors
        }


    # ==================== EXTRACTION HEALING ====================

    def retry_extraction_with_fallback(
        self,
        file_path: str,
        primary_method: str,
        error: str
    ) -> Dict:
        """
        Retry extraction using alternate methods when primary fails.

        Fallback sequence:
        1. Text extraction (PyPDF2)
        2. OCR with standard settings
        3. OCR with enhanced settings
        4. Image conversion + OCR

        Args:
            file_path: Path to file
            primary_method: Method that failed
            error: Error message from primary

        Returns:
            {
                'success': bool,
                'method_used': str,
                'text': str,
                'confidence': float
            }
        """
        from app.services.ocr_extraction import get_ocr_engine

        logger.info(f"Attempting extraction fallback for {file_path}")
        logger.info(f"Primary method '{primary_method}' failed: {error}")

        ocr = get_ocr_engine()
        fallback_methods = []

        # Determine fallback sequence based on what failed
        if primary_method == 'text_extraction':
            fallback_methods = ['ocr_standard', 'ocr_enhanced', 'image_ocr']
        elif primary_method == 'ocr_standard':
            fallback_methods = ['ocr_enhanced', 'image_ocr', 'text_extraction']
        else:
            fallback_methods = ['text_extraction', 'ocr_standard', 'ocr_enhanced']

        for method in fallback_methods:
            try:
                logger.info(f"Trying fallback method: {method}")

                if method == 'text_extraction':
                    result = ocr.extract_text_from_pdf(file_path)
                elif method == 'ocr_standard':
                    result = ocr.extract_with_ocr(file_path, enhanced=False)
                elif method == 'ocr_enhanced':
                    result = ocr.extract_with_ocr(file_path, enhanced=True)
                elif method == 'image_ocr':
                    result = ocr.extract_from_images(file_path)

                if result['success'] and result.get('text'):
                    self._log_repair(
                        'extraction_fallback',
                        f"Successfully extracted using {method} after {primary_method} failed",
                        'success',
                        {'file': file_path, 'method': method}
                    )

                    return {
                        'success': True,
                        'method_used': method,
                        'text': result['text'],
                        'confidence': result.get('confidence', 0.0)
                    }

            except Exception as e:
                logger.warning(f"Fallback method {method} failed: {e}")
                continue

        # All methods failed
        self._log_repair(
            'extraction_fallback',
            f"All extraction methods failed for {file_path}",
            'failed',
            {'file': file_path, 'primary_error': error}
        )

        return {
            'success': False,
            'method_used': None,
            'text': '',
            'confidence': 0.0
        }


    # ==================== OCR OPTIMIZATION ====================

    def optimize_ocr_settings(
        self,
        file_path: str,
        current_confidence: float
    ) -> Dict:
        """
        Adjust OCR settings to improve confidence.

        Strategies:
        - Increase DPI for low confidence
        - Try different preprocessing
        - Adjust language settings

        Args:
            file_path: Path to file
            current_confidence: Current extraction confidence

        Returns:
            {
                'success': bool,
                'settings': dict,
                'improvement': float
            }
        """
        from app.services.ocr_extraction import get_ocr_engine

        if current_confidence >= 0.8:
            return {
                'success': True,
                'settings': {},
                'improvement': 0.0,
                'message': 'Confidence already high, no optimization needed'
            }

        ocr = get_ocr_engine()
        optimizations = []

        # Try higher DPI
        if current_confidence < 0.6:
            try:
                result = ocr.extract_with_ocr(file_path, enhanced=True, dpi=400)
                if result['success']:
                    improvement = result['confidence'] - current_confidence
                    if improvement > 0.1:
                        optimizations.append({
                            'setting': 'dpi_400',
                            'confidence': result['confidence'],
                            'improvement': improvement
                        })
            except Exception as e:
                logger.warning(f"DPI optimization failed: {e}")

        # Try preprocessing variations
        if current_confidence < 0.7:
            # Future: Add image preprocessing (contrast, brightness, etc.)
            pass

        if optimizations:
            best = max(optimizations, key=lambda x: x['improvement'])
            self._log_repair(
                'ocr_optimization',
                f"Improved OCR confidence by {best['improvement']:.2%}",
                'success',
                {'file': file_path, 'optimization': best}
            )

            return {
                'success': True,
                'settings': best,
                'improvement': best['improvement']
            }

        return {
            'success': False,
            'settings': {},
            'improvement': 0.0,
            'message': 'No optimization improved confidence'
        }


    # ==================== FILE HEALING ====================

    def detect_corrupted_file(self, file_path: str) -> Dict:
        """
        Check if file is corrupted or unreadable.

        Returns:
            {
                'is_corrupted': bool,
                'reason': str,
                'suggestion': str
            }
        """
        import PyPDF2

        if not os.path.exists(file_path):
            return {
                'is_corrupted': True,
                'reason': 'File does not exist',
                'suggestion': 'Re-upload the file'
            }

        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return {
                'is_corrupted': True,
                'reason': 'File is empty (0 bytes)',
                'suggestion': 'Re-upload the file'
            }

        # Check if PDF can be opened
        try:
            with open(file_path, 'rb') as f:
                pdf = PyPDF2.PdfReader(f)
                num_pages = len(pdf.pages)

                if num_pages == 0:
                    return {
                        'is_corrupted': True,
                        'reason': 'PDF has 0 pages',
                        'suggestion': 'Re-upload a valid PDF'
                    }

                # Try to read first page
                first_page = pdf.pages[0]
                text = first_page.extract_text()

        except Exception as e:
            return {
                'is_corrupted': True,
                'reason': f'Cannot read PDF: {str(e)}',
                'suggestion': 'Re-upload the file or try a different format'
            }

        return {
            'is_corrupted': False,
            'reason': 'File is valid',
            'suggestion': None
        }


    def split_large_pdf(self, file_path: str, max_pages: int = 100) -> Dict:
        """
        Split large PDF into smaller chunks for processing.

        Args:
            file_path: Path to large PDF
            max_pages: Maximum pages per chunk

        Returns:
            {
                'success': bool,
                'chunks': List[str],
                'total_pages': int
            }
        """
        import PyPDF2

        try:
            with open(file_path, 'rb') as f:
                pdf = PyPDF2.PdfReader(f)
                total_pages = len(pdf.pages)

                if total_pages <= max_pages:
                    return {
                        'success': True,
                        'chunks': [file_path],
                        'total_pages': total_pages,
                        'message': 'File is small enough, no split needed'
                    }

                # Create chunks
                chunks = []
                base_name = os.path.splitext(file_path)[0]

                for start_page in range(0, total_pages, max_pages):
                    end_page = min(start_page + max_pages, total_pages)

                    chunk_writer = PyPDF2.PdfWriter()
                    for page_num in range(start_page, end_page):
                        chunk_writer.add_page(pdf.pages[page_num])

                    chunk_path = f"{base_name}_chunk_{start_page+1}-{end_page}.pdf"
                    with open(chunk_path, 'wb') as chunk_file:
                        chunk_writer.write(chunk_file)

                    chunks.append(chunk_path)
                    logger.info(f"Created chunk: {chunk_path}")

                self._log_repair(
                    'pdf_split',
                    f"Split {total_pages}-page PDF into {len(chunks)} chunks",
                    'success',
                    {'file': file_path, 'chunks': len(chunks)}
                )

                return {
                    'success': True,
                    'chunks': chunks,
                    'total_pages': total_pages
                }

        except Exception as e:
            logger.error(f"PDF split failed: {e}")
            return {
                'success': False,
                'chunks': [],
                'total_pages': 0,
                'error': str(e)
            }


    # ==================== REPAIR LOGGING ====================

    def _log_repair(
        self,
        repair_type: str,
        description: str,
        status: str,
        metadata: Optional[Dict] = None
    ):
        """Log a repair action"""
        from datetime import datetime

        repair_log = {
            'timestamp': datetime.utcnow().isoformat(),
            'type': repair_type,
            'description': description,
            'status': status,
            'metadata': metadata or {}
        }

        self.repair_history.append(repair_log)

        # Keep only last 100 repairs
        if len(self.repair_history) > 100:
            self.repair_history = self.repair_history[-100:]


    def get_repair_history(self, limit: int = 50) -> List[Dict]:
        """Get recent repair actions"""
        return self.repair_history[-limit:]


# Singleton instance
_self_healing_engine = None

def get_self_healing_engine() -> SelfHealingEngine:
    """Get singleton self-healing engine instance"""
    global _self_healing_engine
    if _self_healing_engine is None:
        _self_healing_engine = SelfHealingEngine()
    return _self_healing_engine
