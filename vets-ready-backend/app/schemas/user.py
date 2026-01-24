"""User schemas (Pydantic models) for API requests/responses"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration"""

    email: EmailStr
    full_name: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "veteran@example.com",
                "full_name": "John Smith",
                "password": "securepassword123",
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "veteran@example.com",
                "password": "securepassword123",
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (no password)"""

    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response"""

    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "123",
                    "email": "veteran@example.com",
                    "full_name": "John Smith",
                    "is_active": True,
                    "created_at": "2026-01-23T00:00:00",
                    "updated_at": "2026-01-23T00:00:00",
                },
            }
        }
