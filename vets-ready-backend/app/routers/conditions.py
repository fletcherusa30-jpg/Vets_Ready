"""Condition management routes"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.condition import ConditionCreate, ConditionResponse
from app.services.condition_service import ConditionService

router = APIRouter()


@router.get("", response_model=List[ConditionResponse])
async def list_conditions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List all VA disability conditions"""
    service = ConditionService(db)
    return service.list_conditions(skip=skip, limit=limit)


@router.get("/{code}", response_model=ConditionResponse)
async def get_condition(code: str, db: Session = Depends(get_db)):
    """Get condition by VA code (e.g., 'F4310' for PTSD)"""
    service = ConditionService(db)
    return service.get_condition_by_code(code)


@router.post("", response_model=ConditionResponse, status_code=status.HTTP_201_CREATED)
async def create_condition(
    condition_data: ConditionCreate,
    db: Session = Depends(get_db),
):
    """Create a new condition (admin only)"""
    service = ConditionService(db)
    return service.create_condition(condition_data)


@router.put("/{condition_id}", response_model=ConditionResponse)
async def update_condition(
    condition_id: str,
    condition_data: ConditionCreate,
    db: Session = Depends(get_db),
):
    """Update a condition (admin only)"""
    service = ConditionService(db)
    return service.update_condition(condition_id, condition_data)


@router.delete("/{condition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_condition(
    condition_id: str,
    db: Session = Depends(get_db),
):
    """Delete a condition (admin only)"""
    service = ConditionService(db)
    service.delete_condition(condition_id)
    return None
