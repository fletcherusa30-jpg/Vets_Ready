"""
Scanner Engine Pipeline Orchestrator
Coordinates all pipeline stages
"""

import time
from typing import Optional, Dict, Any
from datetime import datetime

from .models import (
    DocumentInput,
    NormalizedOutput,
    ExtractedFields,
    ProcessingStatus,
    PipelineMetrics,
)
from .intake import IntakeStage
from .preprocess import PreprocessingStage
from .ocr import OCRStage
from .field_extraction import ClassificationStage
from .validation import ValidationStage
from .normalization import NormalizationStage
from .logging_utils import ScannerLogger
from .error_handling import ErrorHandler


class ScannerPipeline:
    """
    Complete document scanning pipeline

    Stages:
    1. Intake: Load and validate documents
    2. Preprocessing: Clean and enhance pages
    3. OCR: Extract text from pages
    4. Classification: Identify document type
    5. Field Extraction: Extract structured fields (implemented in classification stage)
    6. Validation: Verify data completeness and correctness
    7. Normalization: Standardize output format
    """

    def __init__(self):
        self.logger = ScannerLogger("pipeline")
        self.error_handler = ErrorHandler()

        # Initialize stages
        self.intake = IntakeStage()
        self.preprocessing = PreprocessingStage()
        self.ocr = OCRStage()
        self.classification = ClassificationStage()
        self.validation = ValidationStage()
        self.normalization = NormalizationStage()

        # Metrics
        self.metrics = PipelineMetrics()

    def process_document(
        self, file_path: str, source: str = "upload", metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[NormalizedOutput]:
        """
        Process a single document through the complete pipeline

        Args:
            file_path: Path to document file
            source: Source of document
            metadata: Additional metadata

        Returns:
            NormalizedOutput with processed document data
        """
        pipeline_start_time = time.time()

        self.logger.info(f"Starting pipeline for document: {file_path}")

        # Stage 1: Intake
        doc_input = self.intake.intake(file_path, source, metadata)
        if not doc_input:
            self.logger.error("Intake stage failed")
            return None

        doc_id = doc_input.id

        # In production, would split PDF/document into pages
        # For now, creating placeholder pages
        pages = [b"placeholder_page_data"]
        raw_pages = self.intake.split_into_pages(doc_input, pages)

        if not raw_pages:
            self.logger.error("Page splitting failed")
            return None

        # Stage 2: Preprocessing
        preprocessed_pages = self.preprocessing.preprocess(raw_pages, doc_id)

        # Stage 3: OCR
        ocr_results = self.ocr.extract_text(preprocessed_pages, doc_id)

        # Stage 4: Classification
        classified_doc = self.classification.classify(ocr_results, doc_id)

        # Stage 5: Field Extraction (placeholder)
        extracted_fields = self._extract_fields(ocr_results, doc_id)

        # Stage 6: Validation
        validation_result = self.validation.validate(extracted_fields, classified_doc, doc_id)

        # Stage 7: Normalization
        total_time = (time.time() - pipeline_start_time) * 1000
        normalized_output = self.normalization.normalize(
            doc_id, extracted_fields, classified_doc, validation_result, total_time
        )

        # Update metrics
        self._update_metrics(normalized_output)

        self.logger.info(
            f"Pipeline completed for {doc_id} in {total_time:.2f}ms. "
            f"Status: {normalized_output.processing_status.value}"
        )

        return normalized_output

    def _extract_fields(self, ocr_results, doc_id: str) -> ExtractedFields:
        """
        Extract structured fields from OCR results

        In production, this would use NER, regex patterns, or ML models
        """
        self.logger.info(f"Extracting fields from OCR results for {doc_id}")

        extracted_fields = ExtractedFields(
            name=None,
            service_branch=None,
            service_dates=None,
            mos=None,
            awards=None,
            rank=None,
        )

        # Placeholder extraction logic
        # In production, would parse OCR text and extract actual values

        return extracted_fields

    def _update_metrics(self, output: NormalizedOutput):
        """Update pipeline metrics"""
        self.metrics.total_pages += 1
        if output.processing_status == ProcessingStatus.VALIDATED:
            self.metrics.successful_extractions += 1
        elif output.processing_status == ProcessingStatus.FAILED:
            self.metrics.failed_extractions += 1
        self.metrics.total_processing_time_ms += output.processing_time_ms

    def get_metrics(self) -> Dict[str, Any]:
        """Get pipeline execution metrics"""
        return {
            "total_pages": self.metrics.total_pages,
            "successful_extractions": self.metrics.successful_extractions,
            "failed_extractions": self.metrics.failed_extractions,
            "success_rate": (
                self.metrics.successful_extractions / self.metrics.total_pages * 100
                if self.metrics.total_pages > 0
                else 0
            ),
            "average_processing_time_ms": (
                self.metrics.total_processing_time_ms / self.metrics.total_pages
                if self.metrics.total_pages > 0
                else 0
            ),
            "total_processing_time_ms": self.metrics.total_processing_time_ms,
            "errors": self.error_handler.get_all_errors(),
            "error_count": self.error_handler.error_count,
        }
