"""FastAPI router for profile background selection and uploads."""

from __future__ import annotations

import os
import secrets
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.repositories import get_repositories
from backend.app.models.database import ServiceBranch
from backend.app.schemas.profile_background import (
    BackgroundInventoryResponse,
    BackgroundOption,
    BackgroundSelectionRequest,
    BackgroundSelectionResponse,
    BackgroundUploadResponse,
)

router = APIRouter(prefix="/profile/background", tags=["profile", "backgrounds"])

BACKGROUND_ROOT = Path(
    os.getenv(
        "BACKGROUND_IMAGE_ROOT",
        Path(__file__).resolve().parents[2] / "App" / "Images",
    )
).resolve()

BRANCH_DIRECTORY_NAMES: Dict[ServiceBranch, str] = {
    ServiceBranch.ARMY: "Army",
    ServiceBranch.NAVY: "Navy",
    ServiceBranch.AIR_FORCE: "Air Force",
    ServiceBranch.MARINES: "Marines",
    ServiceBranch.COAST_GUARD: "Coast Guard",
    ServiceBranch.SPACE_FORCE: "Space Force",
}

BRANCH_DIRECTORIES = {
    branch: (BACKGROUND_ROOT / folder).resolve()
    for branch, folder in BRANCH_DIRECTORY_NAMES.items()
}
CUSTOM_DIRECTORY = (BACKGROUND_ROOT / "Custom").resolve()
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


def _ensure_directories() -> None:
    BACKGROUND_ROOT.mkdir(parents=True, exist_ok=True)
    CUSTOM_DIRECTORY.mkdir(parents=True, exist_ok=True)
    for directory in BRANCH_DIRECTORIES.values():
        directory.mkdir(parents=True, exist_ok=True)


def _is_subpath(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
        return True
    except ValueError:
        return False


def _build_public_url(relative_path: Optional[str]) -> Optional[str]:
    if not relative_path:
        return None
    safe = relative_path.replace("\\", "/")
    return f"/static/backgrounds/{safe}"


def _list_backgrounds(directory: Path, category: str, branch: Optional[ServiceBranch]) -> List[BackgroundOption]:
    if not directory.exists():
        return []

    options: List[BackgroundOption] = []
    for asset in sorted(directory.iterdir()):
        if not asset.is_file() or asset.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        relative = str(asset.relative_to(BACKGROUND_ROOT)).replace("\\", "/")
        label = asset.stem.replace("_", " ").title()
        options.append(
            BackgroundOption(
                label=label,
                path=relative,
                preview_url=_build_public_url(relative) or "",
                category=category,
                branch=branch.value if branch else None,
                is_custom=(category == "custom"),
            )
        )
    return options


def _normalize_selection(path_value: str) -> str:
    if not path_value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected path is required")

    candidate = Path(path_value)
    if candidate.is_absolute():
        try:
            candidate = candidate.relative_to(BACKGROUND_ROOT)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid background path") from exc

    resolved = (BACKGROUND_ROOT / candidate).resolve()
    if not _is_subpath(resolved, BACKGROUND_ROOT):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Background path is outside allowed directory")
    if not resolved.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Background image was not found")

    return str(resolved.relative_to(BACKGROUND_ROOT)).replace("\\", "/")


_ensure_directories()


@router.get("", response_model=BackgroundInventoryResponse)
def get_background_inventory(veteran_id: str, db: Session = Depends(get_db)) -> BackgroundInventoryResponse:
    """Return current selection and available branch/custom backgrounds for a veteran."""

    _ensure_directories()
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Veteran {veteran_id} not found")

    branch_dir = BRANCH_DIRECTORIES.get(veteran.service_branch)
    branch_options = _list_backgrounds(branch_dir, "branch", veteran.service_branch) if branch_dir else []
    custom_options = _list_backgrounds(CUSTOM_DIRECTORY, "custom", None)

    current = veteran.profile_background_path

    return BackgroundInventoryResponse(
        veteran_id=veteran.id,
        service_branch=veteran.service_branch.value,
        current_background=current,
        current_background_url=_build_public_url(current),
        branch_backgrounds=branch_options,
        custom_backgrounds=custom_options,
    )


@router.post("", response_model=BackgroundSelectionResponse)
def select_background(
    payload: BackgroundSelectionRequest,
    db: Session = Depends(get_db),
) -> BackgroundSelectionResponse:
    """Persist a veteran's chosen background path."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(payload.veteran_id)
    if not veteran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Veteran {payload.veteran_id} not found")

    normalized_path = _normalize_selection(payload.selected_path)
    repos.veterans.update(veteran.id, profile_background_path=normalized_path)

    return BackgroundSelectionResponse(
        veteran_id=veteran.id,
        selected_path=normalized_path,
        preview_url=_build_public_url(normalized_path) or "",
    )


@router.post("/upload", response_model=BackgroundUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_background(
    veteran_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> BackgroundUploadResponse:
    """Upload a custom background into the shared Custom folder."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Veteran {veteran_id} not found")

    filename = file.filename or "uploaded_document"
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Background exceeds 8 MB limit")

    token = secrets.token_hex(4)
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_filename = f"{veteran_id}_{timestamp}_{token}{extension}"
    destination = CUSTOM_DIRECTORY / safe_filename
    CUSTOM_DIRECTORY.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)

    relative_path = str(destination.relative_to(BACKGROUND_ROOT)).replace("\\", "/")
    option = BackgroundOption(
        label=f"Custom Upload {timestamp}",
        path=relative_path,
        preview_url=_build_public_url(relative_path) or "",
        category="custom",
        branch=None,
        is_custom=True,
    )

    return BackgroundUploadResponse(veteran_id=veteran_id, uploaded_background=option)
