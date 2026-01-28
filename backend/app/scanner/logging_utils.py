"""
Scanner Engine Logging Utilities
Provides consistent logging across all pipeline stages
"""

import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional
from enum import Enum


class LogLevel(str, Enum):
    """Log levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class ScannerLogger:
    """Unified logger for scanner engine"""

    def __init__(self, name: str):
        self.logger = logging.getLogger(f"scanner.{name}")
        self.logger.setLevel(logging.DEBUG)

        # Console handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)

    def log_stage_start(self, stage_name: str, doc_id: str, metadata: Optional[Dict] = None):
        """Log start of pipeline stage"""
        msg = f"STAGE_START: {stage_name} for document {doc_id}"
        if metadata:
            msg += f" | {json.dumps(metadata)}"
        self.logger.info(msg)

    def log_stage_end(self, stage_name: str, doc_id: str, success: bool, duration_ms: float):
        """Log end of pipeline stage"""
        status = "SUCCESS" if success else "FAILURE"
        msg = f"STAGE_END: {stage_name} for document {doc_id} | Status: {status} | Duration: {duration_ms}ms"
        level = logging.INFO if success else logging.ERROR
        self.logger.log(level, msg)

    def log_anomaly(self, anomaly_type: str, message: str, context: Optional[Dict] = None):
        """Log pipeline anomaly"""
        msg = f"ANOMALY: {anomaly_type} - {message}"
        if context:
            msg += f" | Context: {json.dumps(context)}"
        self.logger.warning(msg)

    def log_error(self, error_type: str, message: str, exception: Optional[Exception] = None):
        """Log pipeline error"""
        msg = f"ERROR: {error_type} - {message}"
        if exception:
            msg += f" | Exception: {str(exception)}"
        self.logger.error(msg)

    def log_performance_metric(self, metric_name: str, value: float, unit: str = "ms"):
        """Log performance metric"""
        msg = f"METRIC: {metric_name} = {value}{unit}"
        self.logger.info(msg)

    def debug(self, message: str):
        self.logger.debug(message)

    def info(self, message: str):
        self.logger.info(message)

    def warning(self, message: str):
        self.logger.warning(message)

    def error(self, message: str):
        self.logger.error(message)
