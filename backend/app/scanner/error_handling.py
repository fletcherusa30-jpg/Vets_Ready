"""
Scanner Engine Error Handling
Centralized error handling and recovery mechanisms
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from enum import Enum


class ErrorSeverity(str, Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorType(str, Enum):
    """Types of errors that can occur"""
    FILE_NOT_FOUND = "file_not_found"
    INVALID_FORMAT = "invalid_format"
    OCR_FAILURE = "ocr_failure"
    CLASSIFICATION_FAILURE = "classification_failure"
    EXTRACTION_FAILURE = "extraction_failure"
    VALIDATION_FAILURE = "validation_failure"
    TIMEOUT = "timeout"
    MEMORY_ERROR = "memory_error"
    PERMISSION_ERROR = "permission_error"
    UNKNOWN = "unknown"


@dataclass
class ScannerError:
    """Standardized error representation"""
    error_type: ErrorType
    message: str
    severity: ErrorSeverity
    stage: str
    document_id: str
    context: Dict[str, Any] = None
    recovery_suggestion: Optional[str] = None
    original_exception: Optional[Exception] = None

    def __post_init__(self):
        if self.context is None:
            self.context = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary"""
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "severity": self.severity.value,
            "stage": self.stage,
            "document_id": self.document_id,
            "context": self.context,
            "recovery_suggestion": self.recovery_suggestion,
        }


class ErrorHandler:
    """Centralized error handling"""

    def __init__(self):
        self.errors: List[ScannerError] = []
        self.critical_errors: List[ScannerError] = []

    def handle_error(self, error: ScannerError) -> bool:
        """
        Handle an error and determine if processing should continue
        Returns: True if processing should continue, False if it should stop
        """
        self.errors.append(error)

        if error.severity == ErrorSeverity.CRITICAL:
            self.critical_errors.append(error)
            return False

        return True

    def create_error(
        self,
        error_type: ErrorType,
        message: str,
        severity: ErrorSeverity,
        stage: str,
        document_id: str,
        context: Optional[Dict[str, Any]] = None,
        recovery_suggestion: Optional[str] = None,
        exception: Optional[Exception] = None,
    ) -> ScannerError:
        """Factory method to create scanner errors"""
        return ScannerError(
            error_type=error_type,
            message=message,
            severity=severity,
            stage=stage,
            document_id=document_id,
            context=context or {},
            recovery_suggestion=recovery_suggestion,
            original_exception=exception,
        )

    def get_all_errors(self) -> List[Dict[str, Any]]:
        """Get all errors as dictionaries"""
        return [error.to_dict() for error in self.errors]

    def get_errors_by_stage(self, stage: str) -> List[ScannerError]:
        """Get errors from specific pipeline stage"""
        return [error for error in self.errors if error.stage == stage]

    def clear(self):
        """Clear error history"""
        self.errors = []
        self.critical_errors = []

    @property
    def has_critical_errors(self) -> bool:
        """Check if any critical errors occurred"""
        return len(self.critical_errors) > 0

    @property
    def error_count(self) -> int:
        """Get total error count"""
        return len(self.errors)
