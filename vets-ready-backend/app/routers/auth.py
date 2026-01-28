"""Authentication routes (login, register, token verification)"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.user_service import UserService
from app.utils.security import create_access_token, get_current_user_id
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account

    Returns access token for immediate use
    """
    user_service = UserService(db)
    user = user_service.create_user(user_data)

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=timedelta(hours=24),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    Returns JWT access token
    """
    user_service = UserService(db)
    user = user_service.authenticate_user(login_data.email, login_data.password)

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=timedelta(hours=24),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get current authenticated user

    Requires valid JWT token in Authorization header
    """
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return UserResponse.from_orm(user)
