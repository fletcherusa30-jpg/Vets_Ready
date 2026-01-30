"""Background theme customization endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database import SessionLocal
from app.utils.security import get_current_user_id
from app.services.theme_service import BackgroundThemeService

router = APIRouter(prefix="/api/theme", tags=["theme"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class BranchThemeRequest(BaseModel):
    branch: str  # "army", "navy", "marines", etc.


class PresetThemeRequest(BaseModel):
    preset: str  # "default", "camo", "slate", etc.


class CustomInsigniaRequest(BaseModel):
    insignia_url: str
    position: str = "center"  # "center", "top-left", "top-right", "bottom-left", "bottom-right"


class CustomColorsRequest(BaseModel):
    primary: str  # Hex color
    secondary: str
    accent: Optional[str] = None


@router.get("/my-theme")
async def get_my_theme(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get current user's background theme"""
    service = BackgroundThemeService(db)
    return service.get_user_theme(user_id)


@router.post("/set-branch")
async def set_branch_theme(
    request: BranchThemeRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Set background theme based on military branch"""
    service = BackgroundThemeService(db)
    try:
        return service.set_branch_theme(user_id, request.branch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set-preset")
async def set_preset_theme(
    request: PresetThemeRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Set background theme from preset"""
    service = BackgroundThemeService(db)
    try:
        return service.set_preset_theme(user_id, request.preset)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set-insignia")
async def set_custom_insignia(
    request: CustomInsigniaRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Add custom unit/ship insignia"""
    service = BackgroundThemeService(db)
    try:
        return service.set_custom_insignia(
            user_id,
            request.insignia_url,
            request.position
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/set-colors")
async def set_custom_colors(
    request: CustomColorsRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Set custom color scheme"""
    service = BackgroundThemeService(db)
    try:
        return service.set_custom_colors(
            user_id,
            request.primary,
            request.secondary,
            request.accent
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset")
async def reset_theme(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Reset to default theme"""
    service = BackgroundThemeService(db)
    return service.reset_theme(user_id)


@router.get("/branches")
async def get_branches(db: Session = Depends(get_db)):
    """Get all available military branches"""
    service = BackgroundThemeService(db)
    return service.get_available_branches()


@router.get("/presets")
async def get_presets(db: Session = Depends(get_db)):
    """Get all available background presets"""
    service = BackgroundThemeService(db)
    return service.get_available_presets()
