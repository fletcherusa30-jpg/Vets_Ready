"""Condition schemas (Pydantic models)"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConditionCreate(BaseModel):
    """Schema for creating/updating a condition"""

    code: str
    name: str
    description: Optional[str] = None
    disability_rating_default: int = 0

    class Config:
        json_schema_extra = {
            "example": {
                "code": "F4310",
                "name": "PTSD",
                "description": "Post-Traumatic Stress Disorder",
                "disability_rating_default": 30,
            }
        }


class ConditionResponse(BaseModel):
    """Schema for condition response"""

    id: str
    code: str
    name: str
    description: Optional[str]
    disability_rating_default: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "code": "F4310",
                "name": "PTSD",
                "description": "Post-Traumatic Stress Disorder",
                "disability_rating_default": 30,
                "created_at": "2026-01-23T00:00:00",
                "updated_at": "2026-01-23T00:00:00",
            }
        }
