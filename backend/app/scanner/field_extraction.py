"""
Scanner Engine Classification Stage
Identifies document type
"""

from typing import List, Optional, Dict, Any
import time

from .models import OCRResult, ClassifiedDocument, DocumentType
from .logging_utils import ScannerLogger
from .error_handling import ErrorHandler, ErrorType, ErrorSeverity


class ClassificationStage:
    """Document type classification"""

    def __init__(self):
        self.logger = ScannerLogger("classification")
        self.error_handler = ErrorHandler()
        self.type_keywords = {
            DocumentType.DD214: ["discharge", "dd214", "separation"],
            DocumentType.CERTIFICATE: ["certificate", "completion", "training"],
            DocumentType.AWARD: ["award", "medal", "commendation", "ribbon"],
            DocumentType.TRAINING: ["training", "course", "completion"],
            DocumentType.LICENSE: ["license", "certification", "credential"],
            DocumentType.VA_FORM: ["va", "form", "veterans", "benefit"],
        }

    def classify(self, ocr_results: List[OCRResult], doc_id: str) -> Optional[ClassifiedDocument]:
        """
        Classify document type based on OCR results

        Args:
            ocr_results: List of OCR results from all pages
            doc_id: Document ID

        Returns:
            ClassifiedDocument with type and confidence
        """
        stage_name = "classification"
        self.logger.log_stage_start(stage_name, doc_id)
        start_time = time.time()

        try:
            if not ocr_results:
                error = self.error_handler.create_error(
                    error_type=ErrorType.CLASSIFICATION_FAILURE,
                    message="No OCR results available for classification",
                    severity=ErrorSeverity.MEDIUM,
                    stage=stage_name,
                    document_id=doc_id,
                )
                self.error_handler.handle_error(error)
                return None

            # Extract all text from OCR results
            full_text = " ".join([result.text.lower() for result in ocr_results])

            # Classify document type
            doc_type, confidence = self._classify_type(full_text)

            classified_doc = ClassifiedDocument(
                doc_type=doc_type,
                confidence=confidence,
                metadata={"full_text_length": len(full_text), "page_count": len(ocr_results)},
            )

            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_performance_metric("classification_confidence", confidence, "%")
            self.logger.log_stage_end(stage_name, doc_id, True, duration_ms)

            return classified_doc

        except Exception as e:
            error = self.error_handler.create_error(
                error_type=ErrorType.CLASSIFICATION_FAILURE,
                message=f"Classification failed: {str(e)}",
                severity=ErrorSeverity.MEDIUM,
                stage=stage_name,
                document_id=doc_id,
                exception=e,
            )
            self.error_handler.handle_error(error)
            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_stage_end(stage_name, doc_id, False, duration_ms)
            return None

    def _classify_type(self, text: str) -> tuple:
        """
        Classify document type using keyword matching

        Returns:
            Tuple of (DocumentType, confidence_score)
        """
        type_scores = {}

        for doc_type, keywords in self.type_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in text)
            if matches > 0:
                type_scores[doc_type] = matches / len(keywords)

        if not type_scores:
            return DocumentType.UNKNOWN, 0.0

        best_type = max(type_scores, key=type_scores.get)
        confidence = min(type_scores[best_type], 1.0)

        return best_type, confidence
