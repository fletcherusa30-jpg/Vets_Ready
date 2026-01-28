"""
Scanner Engine Normalization Stage
Normalizes extracted data to standardized format
"""

from typing import Dict, Any, Optional
import time

from .models import (
    ExtractedFields,
    ClassifiedDocument,
    NormalizedOutput,
    ProcessingStatus,
    ValidationResult,
)
from .logging_utils import ScannerLogger


class NormalizationStage:
    """Data normalization to standard format"""

    def __init__(self):
        self.logger = ScannerLogger("normalization")

    def normalize(
        self,
        doc_id: str,
        extracted_fields: ExtractedFields,
        classified_doc: Optional[ClassifiedDocument],
        validation_result: Optional[ValidationResult],
        processing_time_ms: float,
    ) -> NormalizedOutput:
        """
        Normalize extracted data to standard output format

        Args:
            doc_id: Document ID
            extracted_fields: Extracted fields
            classified_doc: Classification result
            validation_result: Validation result
            processing_time_ms: Total processing time

        Returns:
            NormalizedOutput with standardized fields
        """
        stage_name = "normalization"
        self.logger.log_stage_start(stage_name, doc_id)
        start_time = time.time()

        try:
            # Build standardized fields dictionary
            standardized_fields = {
                "name": extracted_fields.name,
                "service_branch": extracted_fields.service_branch,
                "rank": extracted_fields.rank,
                "service_dates": extracted_fields.service_dates,
                "mos_codes": extracted_fields.mos or [],
                "awards": extracted_fields.awards or [],
                "custom_fields": extracted_fields.custom_fields,
            }

            # Build confidence map
            confidence_map = {}
            for field in extracted_fields.all_fields:
                confidence_map[field.field_name] = field.confidence

            # Determine processing status
            if validation_result and not validation_result.is_valid:
                processing_status = ProcessingStatus.FAILED
            elif validation_result and validation_result.completeness_score < 0.7:
                processing_status = ProcessingStatus.COMPLETED
            else:
                processing_status = ProcessingStatus.VALIDATED

            # Create summary
            summary = self._create_summary(extracted_fields, classified_doc)

            # Create normalized output
            normalized = NormalizedOutput(
                document_id=doc_id,
                document_type=classified_doc.doc_type if classified_doc else None,
                standardized_fields=standardized_fields,
                confidence_map=confidence_map,
                summary=summary,
                validation_result=validation_result,
                processing_status=processing_status,
                processing_time_ms=processing_time_ms,
            )

            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_stage_end(stage_name, doc_id, True, duration_ms)

            return normalized

        except Exception as e:
            self.logger.error(f"Normalization failed: {str(e)}")
            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_stage_end(stage_name, doc_id, False, duration_ms)

            # Return partial output on error
            return NormalizedOutput(
                document_id=doc_id,
                document_type=classified_doc.doc_type if classified_doc else None,
                processing_status=ProcessingStatus.FAILED,
                processing_time_ms=processing_time_ms,
            )

    def _create_summary(
        self, extracted_fields: ExtractedFields, classified_doc: Optional[ClassifiedDocument]
    ) -> str:
        """Create human-readable summary of extracted data"""
        parts = []

        if classified_doc:
            parts.append(f"Document Type: {classified_doc.doc_type.value}")

        if extracted_fields.name:
            parts.append(f"Name: {extracted_fields.name}")

        if extracted_fields.rank:
            parts.append(f"Rank: {extracted_fields.rank}")

        if extracted_fields.service_branch:
            parts.append(f"Service Branch: {extracted_fields.service_branch}")

        if extracted_fields.service_dates:
            start = extracted_fields.service_dates.get("start", "Unknown")
            end = extracted_fields.service_dates.get("end", "Unknown")
            parts.append(f"Service Period: {start} to {end}")

        if extracted_fields.mos:
            parts.append(f"MOS Codes: {', '.join(extracted_fields.mos)}")

        if extracted_fields.awards:
            parts.append(f"Awards: {', '.join(extracted_fields.awards)}")

        return " | ".join(parts)
