"""
Scanner Engine Validation Stage
Validates extracted and classified data for completeness and correctness
"""

from typing import List, Dict, Any, Optional
import time
from datetime import datetime

from .models import (
    ExtractedFields,
    ClassifiedDocument,
    ValidationResult,
    ValidationError,
)
from .logging_utils import ScannerLogger
from .error_handling import ErrorHandler, ErrorType, ErrorSeverity


class ValidationStage:
    """Data validation and completeness checking"""

    def __init__(self):
        self.logger = ScannerLogger("validation")
        self.error_handler = ErrorHandler()
        self.required_fields = {
            "name": {"type": str, "min_length": 1},
            "service_branch": {"type": str, "min_length": 1},
            "rank": {"type": str, "min_length": 1},
        }

    def validate(
        self,
        extracted_fields: ExtractedFields,
        classified_doc: Optional[ClassifiedDocument],
        doc_id: str,
    ) -> ValidationResult:
        """
        Validate extracted data

        Args:
            extracted_fields: Extracted fields from document
            classified_doc: Classification result
            doc_id: Document ID

        Returns:
            ValidationResult with errors and warnings
        """
        stage_name = "validation"
        self.logger.log_stage_start(stage_name, doc_id)
        start_time = time.time()

        try:
            errors: List[ValidationError] = []
            warnings: List[str] = []

            # Validate required fields
            for field_name, field_spec in self.required_fields.items():
                field_value = getattr(extracted_fields, field_name, None)

                if field_value is None:
                    errors.append(
                        ValidationError(
                            field=field_name,
                            error_type="missing_required_field",
                            message=f"Required field '{field_name}' is missing",
                            severity="error",
                        )
                    )
                elif isinstance(field_value, str) and len(field_value) < field_spec.get("min_length", 1):
                    errors.append(
                        ValidationError(
                            field=field_name,
                            error_type="invalid_field_value",
                            message=f"Field '{field_name}' is too short",
                            severity="error",
                        )
                    )

            # Check for classification confidence
            if classified_doc and classified_doc.confidence < 0.6:
                warnings.append(
                    f"Low classification confidence ({classified_doc.confidence:.2%}). "
                    "Manual review recommended."
                )

            # Calculate completeness score
            completeness_score = self._calculate_completeness(extracted_fields)

            if completeness_score < 0.7:
                warnings.append(
                    f"Document completeness score ({completeness_score:.2%}) is below 70%. "
                    "Some fields may be missing."
                )

            # Create validation result
            is_valid = len(errors) == 0
            duration_ms = (time.time() - start_time) * 1000

            validation_result = ValidationResult(
                is_valid=is_valid,
                errors=errors,
                warnings=warnings,
                completeness_score=completeness_score,
            )

            self.logger.log_performance_metric("completeness_score", completeness_score * 100, "%")
            self.logger.log_stage_end(stage_name, doc_id, is_valid, duration_ms)

            return validation_result

        except Exception as e:
            error = self.error_handler.create_error(
                error_type=ErrorType.VALIDATION_FAILURE,
                message=f"Validation failed: {str(e)}",
                severity=ErrorSeverity.MEDIUM,
                stage=stage_name,
                document_id=doc_id,
                exception=e,
            )
            self.error_handler.handle_error(error)
            duration_ms = (time.time() - start_time) * 1000
            self.logger.log_stage_end(stage_name, doc_id, False, duration_ms)

            return ValidationResult(
                is_valid=False,
                errors=[
                    ValidationError(
                        field="general",
                        error_type="validation_error",
                        message=str(e),
                        severity="error",
                    )
                ],
            )

    def _calculate_completeness(self, extracted_fields: ExtractedFields) -> float:
        """Calculate completeness score based on available fields"""
        total_fields = 0
        filled_fields = 0

        # Count name
        if extracted_fields.name:
            filled_fields += 1
        total_fields += 1

        # Count service_branch
        if extracted_fields.service_branch:
            filled_fields += 1
        total_fields += 1

        # Count rank
        if extracted_fields.rank:
            filled_fields += 1
        total_fields += 1

        # Count service_dates
        if extracted_fields.service_dates:
            filled_fields += 1
        total_fields += 1

        # Count MOS codes
        if extracted_fields.mos:
            filled_fields += 1
        total_fields += 1

        # Count awards
        if extracted_fields.awards:
            filled_fields += 1
        total_fields += 1

        return filled_fields / total_fields if total_fields > 0 else 0.0
