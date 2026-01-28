"""
Pipeline Completeness Framework
Implements universal pipeline completeness principles across all systems
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from enum import Enum
import time


class StageStatus(str, Enum):
    """Stage execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class InputContract:
    """Defines input contract for a stage"""
    required_fields: List[str]
    field_types: Dict[str, str]
    validation_rules: List[Callable]

    def validate(self, data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate input data against contract"""
        errors = []

        # Check required fields
        for field in self.required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")

        # Validate types
        for field, expected_type in self.field_types.items():
            if field in data and not isinstance(data[field], eval(expected_type)):
                errors.append(f"Field {field} has wrong type. Expected {expected_type}")

        # Run custom validation rules
        for rule in self.validation_rules:
            try:
                if not rule(data):
                    errors.append(f"Custom validation rule failed")
            except Exception as e:
                errors.append(f"Validation error: {str(e)}")

        return len(errors) == 0, errors


@dataclass
class OutputContract:
    """Defines output contract for a stage"""
    required_fields: List[str]
    field_types: Dict[str, str]

    def validate(self, data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """Validate output data against contract"""
        errors = []

        for field in self.required_fields:
            if field not in data:
                errors.append(f"Output missing required field: {field}")

        for field, expected_type in self.field_types.items():
            if field in data and not isinstance(data[field], eval(expected_type)):
                errors.append(f"Output field {field} has wrong type")

        return len(errors) == 0, errors


@dataclass
class PipelineStage:
    """Definition of a pipeline stage"""
    name: str
    description: str
    input_contract: InputContract
    output_contract: OutputContract
    handler: Callable
    error_handlers: List[Callable] = field(default_factory=list)
    timeout_ms: int = 30000
    retry_count: int = 3

    def execute(self, data: Dict[str, Any]) -> tuple[bool, Dict[str, Any], List[str]]:
        """
        Execute stage with full error handling
        Returns: (success, output, errors)
        """
        errors = []
        start_time = time.time()

        # Validate input
        valid, input_errors = self.input_contract.validate(data)
        if not valid:
            return False, {}, input_errors

        # Execute with retry logic
        for attempt in range(self.retry_count):
            try:
                # Check timeout
                elapsed_ms = (time.time() - start_time) * 1000
                if elapsed_ms > self.timeout_ms:
                    return False, {}, ["Stage timeout exceeded"]

                # Execute handler
                output = self.handler(data)

                # Validate output
                valid, output_errors = self.output_contract.validate(output)
                if not valid:
                    errors.extend(output_errors)
                    if attempt == self.retry_count - 1:
                        return False, output, errors
                    continue

                return True, output, errors

            except Exception as e:
                errors.append(f"Execution error: {str(e)}")

                # Call error handlers
                for error_handler in self.error_handlers:
                    try:
                        error_handler(e, data)
                    except Exception as handler_error:
                        errors.append(f"Error handler failed: {str(handler_error)}")

                if attempt == self.retry_count - 1:
                    return False, {}, errors

        return False, {}, errors


@dataclass
class PipelineMetadata:
    """Metadata for pipeline execution"""
    pipeline_id: str
    version: str
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    stages: List[str] = field(default_factory=list)


class CompletePipeline:
    """
    Complete pipeline implementation following Pipeline Completeness principles

    Principles:
    1. Stage definition requirements: Every pipeline must define all stages explicitly
    2. Input/output contracts: Each stage must have clearly defined inputs and outputs
    3. Error-handling expectations: All stages must handle known and unknown errors gracefully
    4. Logging expectations: Each stage must log start, end, and anomalies
    5. Dependency validation: All required libraries, models, and folders must be validated
    6. Versioning requirements: Each pipeline must include a version identifier
    """

    def __init__(self, pipeline_id: str, version: str = "1.0.0"):
        self.pipeline_id = pipeline_id
        self.version = version
        self.stages: List[PipelineStage] = []
        self.metadata = PipelineMetadata(
            pipeline_id=pipeline_id,
            version=version,
        )
        self.execution_log: List[Dict[str, Any]] = []

    def add_stage(self, stage: PipelineStage) -> "CompletePipeline":
        """Add a stage to the pipeline"""
        self.stages.append(stage)
        self.metadata.stages.append(stage.name)
        self.metadata.updated_at = datetime.now()
        return self

    def validate_pipeline(self) -> tuple[bool, List[str]]:
        """Validate pipeline completeness"""
        errors = []

        # Check that we have stages
        if not self.stages:
            errors.append("Pipeline has no stages defined")

        # Check each stage
        for stage in self.stages:
            if not stage.name or not stage.description:
                errors.append(f"Stage missing name or description")

            if not stage.input_contract or not stage.output_contract:
                errors.append(f"Stage {stage.name} missing input/output contracts")

            if not stage.handler:
                errors.append(f"Stage {stage.name} missing handler function")

        return len(errors) == 0, errors

    def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute complete pipeline

        Returns:
            {
                "success": bool,
                "pipeline_id": str,
                "version": str,
                "execution_id": str,
                "output": Dict,
                "errors": List,
                "stage_results": List,
                "execution_time_ms": float,
            }
        """
        execution_id = f"{self.pipeline_id}_{datetime.now().timestamp()}"
        start_time = time.time()
        stage_results = []
        current_data = data.copy()

        # Validate pipeline
        valid, validation_errors = self.validate_pipeline()
        if not valid:
            return {
                "success": False,
                "pipeline_id": self.pipeline_id,
                "version": self.version,
                "execution_id": execution_id,
                "output": {},
                "errors": validation_errors,
                "stage_results": [],
                "execution_time_ms": (time.time() - start_time) * 1000,
            }

        # Execute each stage
        all_errors = []
        for stage in self.stages:
            stage_start = time.time()
            success, output, errors = stage.execute(current_data)

            stage_result = {
                "stage_name": stage.name,
                "status": StageStatus.COMPLETED.value if success else StageStatus.FAILED.value,
                "success": success,
                "execution_time_ms": (time.time() - stage_start) * 1000,
                "errors": errors,
            }
            stage_results.append(stage_result)

            if not success:
                all_errors.extend(errors)
                # Stop pipeline on critical error
                break

            current_data = output

        execution_time = (time.time() - start_time) * 1000

        # Log execution
        self.execution_log.append({
            "execution_id": execution_id,
            "timestamp": datetime.now(),
            "success": len(all_errors) == 0,
            "execution_time_ms": execution_time,
            "error_count": len(all_errors),
        })

        return {
            "success": len(all_errors) == 0,
            "pipeline_id": self.pipeline_id,
            "version": self.version,
            "execution_id": execution_id,
            "output": current_data,
            "errors": all_errors,
            "stage_results": stage_results,
            "execution_time_ms": execution_time,
        }

    def get_execution_history(self) -> List[Dict[str, Any]]:
        """Get pipeline execution history"""
        return self.execution_log

    def get_statistics(self) -> Dict[str, Any]:
        """Get pipeline execution statistics"""
        total_executions = len(self.execution_log)
        successful = sum(1 for log in self.execution_log if log["success"])

        total_time = sum(log["execution_time_ms"] for log in self.execution_log)
        avg_time = total_time / total_executions if total_executions > 0 else 0

        return {
            "total_executions": total_executions,
            "successful_executions": successful,
            "success_rate": (successful / total_executions * 100) if total_executions > 0 else 0,
            "average_execution_time_ms": avg_time,
            "total_execution_time_ms": total_time,
        }
