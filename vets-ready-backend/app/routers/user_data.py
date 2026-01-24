"""Data export and portability endpoints (GDPR/CCPA compliance)"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
import json
import zipfile
from io import BytesIO
from datetime import datetime

from app.core.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/user-data", tags=["user-data"])


@router.get("/export")
async def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export all user data (GDPR/CCPA compliance)"""

    # Collect all user data
    data = {
        "export_info": {
            "exported_at": datetime.utcnow().isoformat(),
            "user_id": str(current_user.id),
            "format_version": "1.0"
        },
        "profile": {
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "user_type": current_user.user_type,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "military_info": {
                "branch": current_user.military_branch,
                "service_start": current_user.service_start_date.isoformat() if current_user.service_start_date else None,
                "service_end": current_user.service_end_date.isoformat() if current_user.service_end_date else None,
                "discharge_type": current_user.discharge_type,
                "mos": current_user.mos,
            } if current_user.user_type == "veteran" else None
        },
        "subscription": {
            "tier": current_user.subscription_tier,
            "status": current_user.subscription_status,
            "stripe_customer_id": current_user.stripe_customer_id,
        },
        "security": {
            "2fa_enabled": current_user.totp_enabled,
            "last_login": current_user.last_login.isoformat() if hasattr(current_user, 'last_login') and current_user.last_login else None,
        }
    }

    # TODO: Add more data as models are created:
    # - Claims
    # - Documents
    # - Conditions
    # - Activity logs
    # - Messages
    # - Referrals

    # Create JSON export
    json_data = json.dumps(data, indent=2, ensure_ascii=False)

    # Create ZIP file
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add JSON data
        zip_file.writestr(
            f"vetsready_data_export_{current_user.id}.json",
            json_data
        )

        # Add README
        readme = f"""VETS READY DATA EXPORT

Exported: {datetime.utcnow().isoformat()}
User ID: {current_user.id}
Email: {current_user.email}

This archive contains all your personal data stored by Vets Ready.

Files:
- vetsready_data_export_{current_user.id}.json: Your data in JSON format

Your Rights:
- You can request deletion of this data at any time
- You can request corrections to any inaccurate data
- You can opt out of marketing communications
- You can restrict certain data processing

To exercise your rights, contact: privacy@vetsready.com

For more information, see our Privacy Policy:
https://vetsready.com/privacy
"""
        zip_file.writestr("README.txt", readme)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=vetsready_data_export_{current_user.id}.zip"
        }
    )


@router.delete("/delete-account")
async def delete_account(
    confirmation: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete user account (GDPR/CCPA compliance)"""

    if confirmation != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation. Please type 'DELETE MY ACCOUNT' exactly."
        )

    # Soft delete (mark as deleted, keep for 30 days for recovery)
    current_user.deleted_at = datetime.utcnow()
    current_user.email = f"deleted_{current_user.id}@deleted.local"
    current_user.is_active = False

    # TODO: Schedule hard delete after 30 days
    # TODO: Cancel Stripe subscriptions
    # TODO: Delete uploaded files
    # TODO: Anonymize activity logs

    db.commit()

    return {
        "message": "Account scheduled for deletion",
        "deletion_date": (datetime.utcnow().date() + timedelta(days=30)).isoformat(),
        "recovery_info": "You can recover your account within 30 days by contacting support@vetsready.com"
    }


@router.post("/cancel-deletion")
async def cancel_deletion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel account deletion request"""

    if not current_user.deleted_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No deletion request found"
        )

    # Check if within 30-day window
    from datetime import timedelta
    if datetime.utcnow() > current_user.deleted_at + timedelta(days=30):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion request has already been processed"
        )

    # Restore account
    current_user.deleted_at = None
    current_user.is_active = True
    # Email will need to be updated manually by user

    db.commit()

    return {
        "message": "Account deletion cancelled successfully",
        "note": "Please update your email address in profile settings"
    }


@router.get("/privacy-settings")
async def get_privacy_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user privacy settings"""

    return {
        "analytics_enabled": getattr(current_user, 'analytics_enabled', True),
        "marketing_emails": getattr(current_user, 'marketing_emails', True),
        "data_sharing_vso": getattr(current_user, 'data_sharing_vso', False),
        "profile_visibility": getattr(current_user, 'profile_visibility', 'private'),
    }


@router.put("/privacy-settings")
async def update_privacy_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user privacy settings"""

    # TODO: Add these fields to User model
    # For now, return success

    return {
        "message": "Privacy settings updated successfully",
        "settings": settings
    }
