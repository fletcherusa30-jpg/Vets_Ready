"""
Scanner Engine Data Models
Defines all data structures for document scanning pipeline
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    """Supported document types"""
    DD214 = "DD214"
    CERTIFICATE = "Certificate"
    AWARD = "Award"
    TRAINING = "Training"
    LICENSE = "License"
    VA_FORM = "VA_Form"
    UNKNOWN = "Unknown"


class ProcessingStatus(str, Enum):
    """Pipeline processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    VALIDATED = "validated"


@dataclass
class DocumentInput:
    """Input document metadata"""
    id: str
    file_path: str
    file_name: str
    file_type: str
    source: str
    upload_timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RawPage:
    """Raw page data from document"""
    page_number: int
    image_data: Optional[bytes] = None
    text_data: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    processing_timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class OCRResult:
    """OCR extraction result"""
    page_number: int
    text: str
    confidence: float
    blocks: List[Dict[str, Any]] = field(default_factory=list)
    ocr_timestamp: datetime = field(default_factory=datetime.now)
    errors: List[str] = field(default_factory=list)


@dataclass
class ClassifiedDocument:
    """Document classification result"""
    doc_type: DocumentType
    confidence: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    classification_timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ExtractedField:
    """Single extracted field with metadata"""
    field_name: str
    value: Any
    confidence: float
    source_page: int
    raw_text: Optional[str] = None


@dataclass
class ExtractedFields:
    """All extracted fields from document"""
    name: Optional[str] = None
    service_branch: Optional[str] = None
    service_dates: Optional[Dict[str, str]] = None  # {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}
    mos: Optional[List[str]] = None  # Military Occupational Specialties
    awards: Optional[List[str]] = None
    rank: Optional[str] = None
    custom_fields: Dict[str, Any] = field(default_factory=dict)
    all_fields: List[ExtractedField] = field(default_factory=list)
    extraction_timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ValidationError:
    """Validation error detail"""
    field: str
    error_type: str
    message: str
    severity: str  # "error", "warning", "info"


@dataclass
class ValidationResult:
    """Validation result"""
    is_valid: bool
    errors: List[ValidationError] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    validation_timestamp: datetime = field(default_factory=datetime.now)
    completeness_score: float = 0.0


@dataclass
class NormalizedOutput:
    """Final normalized output"""
    document_id: str
    document_type: DocumentType
    standardized_fields: Dict[str, Any] = field(default_factory=dict)
    confidence_map: Dict[str, float] = field(default_factory=dict)
    summary: str = ""
    validation_result: Optional[ValidationResult] = None
    processing_status: ProcessingStatus = ProcessingStatus.COMPLETED
    output_timestamp: datetime = field(default_factory=datetime.now)
    processing_time_ms: float = 0.0


@dataclass
class PipelineMetrics:
    """Pipeline execution metrics"""
    total_pages: int = 0
    successful_extractions: int = 0
    failed_extractions: int = 0
    average_confidence: float = 0.0
    total_processing_time_ms: float = 0.0
    stage_times: Dict[str, float] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
