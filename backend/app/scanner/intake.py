"""
Scanner Engine Intake Stage
Loads and verifies input documents, splits into pages
"""

import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib

from .models import DocumentInput, RawPage
from .logging_utils import ScannerLogger
from .error_handling import ErrorHandler, ErrorType, ErrorSeverity


class IntakeStage:
    """Document intake and validation"""

    def __init__(self):
        self.logger = ScannerLogger("intake")
        self.error_handler = ErrorHandler()

    def intake(
        self,
        file_path: str,
        source: str = "upload",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[DocumentInput]:
        """
        Load and validate input document

        Args:
            file_path: Path to the input file
            source: Source of the document (upload, email, etc.)
            metadata: Additional metadata

        Returns:
            DocumentInput object or None if validation fails
        """
        stage_name = "intake"
        self.logger.log_stage_start(stage_name, file_path, {"source": source})

        try:
            # Validate file exists
            if not os.path.exists(file_path):
                error = self.error_handler.create_error(
                    error_type=ErrorType.FILE_NOT_FOUND,
                    message=f"File not found: {file_path}",
                    severity=ErrorSeverity.HIGH,
                    stage=stage_name,
                    document_id=file_path,
                    recovery_suggestion="Verify the file path is correct",
                )
                self.error_handler.handle_error(error)
                return None

            # Get file stats
            file_stat = os.stat(file_path)
            file_size = file_stat.st_size
            file_name = os.path.basename(file_path)
            file_type = os.path.splitext(file_name)[1].lower()

            # Generate document ID
            with open(file_path, "rb") as f:
                file_hash = hashlib.md5(f.read()).hexdigest()
            doc_id = f"{file_name}_{file_hash}"

            # Create document input
            doc_input = DocumentInput(
                id=doc_id,
                file_path=file_path,
                file_name=file_name,
                file_type=file_type,
                source=source,
                upload_timestamp=datetime.now(),
                metadata=metadata or {"file_size": file_size},
            )

            # Log metrics
            self.logger.log_performance_metric("file_size", file_size, "bytes")
            self.logger.log_stage_end(stage_name, doc_id, True, 0)

            return doc_input

        except Exception as e:
            error = self.error_handler.create_error(
                error_type=ErrorType.UNKNOWN,
                message=f"Intake failed: {str(e)}",
                severity=ErrorSeverity.HIGH,
                stage=stage_name,
                document_id=file_path,
                exception=e,
            )
            self.error_handler.handle_error(error)
            self.logger.log_stage_end(stage_name, file_path, False, 0)
            return None

    def split_into_pages(
        self, doc_input: DocumentInput, pages: List[bytes]
    ) -> List[RawPage]:
        """
        Split document into raw pages

        Args:
            doc_input: Input document metadata
            pages: List of page data (bytes)

        Returns:
            List of RawPage objects
        """
        stage_name = "page_split"
        self.logger.log_stage_start(stage_name, doc_input.id)

        raw_pages = []
        try:
            for page_num, page_data in enumerate(pages, 1):
                raw_page = RawPage(
                    page_number=page_num,
                    image_data=page_data if isinstance(page_data, bytes) else None,
                    text_data=page_data if isinstance(page_data, str) else None,
                    metadata={"source_document": doc_input.id},
                )
                raw_pages.append(raw_page)

            self.logger.log_stage_end(stage_name, doc_input.id, True, 0)
            return raw_pages

        except Exception as e:
            error = self.error_handler.create_error(
                error_type=ErrorType.UNKNOWN,
                message=f"Page split failed: {str(e)}",
                severity=ErrorSeverity.HIGH,
                stage=stage_name,
                document_id=doc_input.id,
                exception=e,
            )
            self.error_handler.handle_error(error)
            self.logger.log_stage_end(stage_name, doc_input.id, False, 0)
            return raw_pages
