"""Schemas for profile background selection endpoints."""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class BackgroundOption(BaseModel):
    """Selectable background option metadata."""

    label: str = Field(..., description="User-friendly name")
    path: str = Field(..., description="Path relative to background root")
    preview_url: str = Field(..., description="HTTP URL for preview/usage")
    category: str = Field(..., description="branch or custom")
    branch: Optional[str] = Field(None, description="Branch association for branch assets")
    is_custom: bool = Field(False, description="True when uploaded by veteran")


class BackgroundInventoryResponse(BaseModel):
    """Response payload for inventory endpoint."""

    veteran_id: str
    service_branch: str
    current_background: Optional[str]
    current_background_url: Optional[str]
    branch_backgrounds: List[BackgroundOption]
    custom_backgrounds: List[BackgroundOption]


class BackgroundSelectionRequest(BaseModel):
    """Request body for selecting a background."""

    veteran_id: str
    selected_path: str


class BackgroundSelectionResponse(BaseModel):
    """Response for confirm selected background."""

    veteran_id: str
    selected_path: str
    preview_url: str


class BackgroundUploadResponse(BaseModel):
    """Response after uploading a custom background."""

    veteran_id: str
    uploaded_background: BackgroundOption
