"""Condition service for managing VA conditions"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List

from app.models.condition import Condition
from app.schemas.condition import ConditionCreate, ConditionResponse


class ConditionService:
    """Service for condition operations"""

    def __init__(self, db: Session):
        self.db = db

    def create_condition(self, condition_data: ConditionCreate) -> Condition:
        """Create a new condition"""
        db_condition = Condition(**condition_data.dict())
        self.db.add(db_condition)
        self.db.commit()
        self.db.refresh(db_condition)
        return db_condition

    def get_condition_by_id(self, condition_id: str) -> Condition:
        """Get condition by ID"""
        condition = self.db.query(Condition).filter(Condition.id == condition_id).first()
        if not condition:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Condition not found",
            )
        return condition

    def get_condition_by_code(self, code: str) -> Condition:
        """Get condition by VA code"""
        condition = self.db.query(Condition).filter(Condition.code == code).first()
        if not condition:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Condition with code {code} not found",
            )
        return condition

    def list_conditions(self, skip: int = 0, limit: int = 100) -> List[Condition]:
        """List all conditions with pagination"""
        return self.db.query(Condition).offset(skip).limit(limit).all()

    def update_condition(self, condition_id: str, condition_data: ConditionCreate) -> Condition:
        """Update a condition"""
        condition = self.get_condition_by_id(condition_id)
        update_data = condition_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(condition, field, value)
        self.db.commit()
        self.db.refresh(condition)
        return condition

    def delete_condition(self, condition_id: str) -> None:
        """Delete a condition"""
        condition = self.get_condition_by_id(condition_id)
        self.db.delete(condition)
        self.db.commit()
