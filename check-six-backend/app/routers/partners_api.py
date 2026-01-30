"""
PARTNER MANAGEMENT API

Endpoints for partner onboarding, approval, and management.

ENDPOINTS:
- POST /api/partners/onboard - Submit partner application
- GET /api/partners - List all partners (admin)
- GET /api/partners/{id} - Get partner details
- PUT /api/partners/{id}/approve - Approve partner application
- PUT /api/partners/{id}/reject - Reject partner application
- PUT /api/partners/{id} - Update partner information
- DELETE /api/partners/{id} - Delete partner
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/partners", tags=["partners"])


# ==================== DATA MODELS ====================

class PartnerOnboardingRequest(BaseModel):
    # Organization
    organization_name: str
    organization_type: str
    website: Optional[str] = None
    tax_id: Optional[str] = None

    # Contact
    primary_contact_name: str
    primary_contact_email: EmailStr
    primary_contact_phone: Optional[str] = None

    # Address
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    # Partnership
    partnership_type: str
    referral_commission: float
    services_offered: List[str]
    target_audience: Optional[str] = None
    expected_volume: Optional[str] = None

    # Legal
    accepts_terms: bool
    accepts_privacy: bool


class PartnerUpdate(BaseModel):
    organization_name: Optional[str] = None
    website: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    primary_contact_phone: Optional[str] = None
    partnership_type: Optional[str] = None
    referral_commission: Optional[float] = None
    services_offered: Optional[List[str]] = None
    status: Optional[str] = None


# ==================== IN-MEMORY STORAGE (Replace with DB) ====================

partners_db = {}
partner_id_counter = 1


# ==================== ENDPOINTS ====================

@router.post("/onboard")
async def submit_partner_application(application: PartnerOnboardingRequest):
    """
    Submit a new partner application for review.

    Returns:
        {
            'success': bool,
            'partner_id': str,
            'message': str,
            'next_steps': List[str]
        }
    """
    global partner_id_counter

    try:
        # Validate legal acceptance
        if not application.accepts_terms or not application.accepts_privacy:
            raise HTTPException(
                status_code=400,
                detail="Must accept terms and privacy policy"
            )

        # Create partner record
        partner_id = f"PARTNER-{partner_id_counter:06d}"
        partner_id_counter += 1

        partner_data = {
            'id': partner_id,
            'organization_name': application.organization_name,
            'organization_type': application.organization_type,
            'website': application.website,
            'tax_id': application.tax_id,
            'primary_contact': {
                'name': application.primary_contact_name,
                'email': application.primary_contact_email,
                'phone': application.primary_contact_phone
            },
            'address': {
                'line1': application.address_line1,
                'line2': application.address_line2,
                'city': application.city,
                'state': application.state,
                'zip_code': application.zip_code
            },
            'partnership_type': application.partnership_type,
            'referral_commission': application.referral_commission,
            'services_offered': application.services_offered,
            'target_audience': application.target_audience,
            'expected_volume': application.expected_volume,
            'status': 'pending',  # pending, approved, rejected
            'created_at': datetime.utcnow().isoformat(),
            'approved_at': None,
            'approved_by': None,
            'total_referrals': 0,
            'total_revenue': 0.0,
            'total_commission': 0.0
        }

        partners_db[partner_id] = partner_data

        logger.info(f"Partner application submitted: {partner_id} - {application.organization_name}")

        # TODO: Send confirmation email
        # TODO: Notify admin team

        return JSONResponse(content={
            'success': True,
            'partner_id': partner_id,
            'message': 'Application submitted successfully',
            'next_steps': [
                'Check your email for confirmation',
                'Our team will review within 2-3 business days',
                'You will receive onboarding materials upon approval',
                'API credentials will be provided after approval'
            ]
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Partner application submission failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_partners(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    List all partners (admin endpoint).

    Query Parameters:
        status: Filter by status (pending, approved, rejected)
        limit: Maximum results
        offset: Skip results

    Returns:
        {
            'partners': List[dict],
            'total': int,
            'limit': int,
            'offset': int
        }
    """
    # Filter by status if provided
    filtered_partners = list(partners_db.values())

    if status:
        filtered_partners = [p for p in filtered_partners if p['status'] == status]

    # Sort by created_at descending
    filtered_partners.sort(key=lambda x: x['created_at'], reverse=True)

    # Paginate
    total = len(filtered_partners)
    paginated = filtered_partners[offset:offset + limit]

    return JSONResponse(content={
        'partners': paginated,
        'total': total,
        'limit': limit,
        'offset': offset
    })


@router.get("/{partner_id}")
async def get_partner(partner_id: str):
    """
    Get detailed information about a specific partner.

    Returns:
        Partner object with all details
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    return JSONResponse(content=partners_db[partner_id])


@router.put("/{partner_id}/approve")
async def approve_partner(
    partner_id: str,
    approved_by: str = "admin"
):
    """
    Approve a partner application.

    Args:
        partner_id: Partner ID
        approved_by: Admin username

    Returns:
        {
            'success': bool,
            'partner_id': str,
            'message': str
        }
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    partner = partners_db[partner_id]

    if partner['status'] != 'pending':
        raise HTTPException(
            status_code=400,
            detail=f"Partner is already {partner['status']}"
        )

    # Update status
    partner['status'] = 'approved'
    partner['approved_at'] = datetime.utcnow().isoformat()
    partner['approved_by'] = approved_by

    logger.info(f"Partner approved: {partner_id} by {approved_by}")

    # TODO: Send approval email
    # TODO: Generate API credentials
    # TODO: Send onboarding materials

    return JSONResponse(content={
        'success': True,
        'partner_id': partner_id,
        'message': 'Partner approved successfully',
        'status': 'approved'
    })


@router.put("/{partner_id}/reject")
async def reject_partner(
    partner_id: str,
    rejection_reason: Optional[str] = None,
    rejected_by: str = "admin"
):
    """
    Reject a partner application.

    Args:
        partner_id: Partner ID
        rejection_reason: Reason for rejection
        rejected_by: Admin username

    Returns:
        {
            'success': bool,
            'partner_id': str,
            'message': str
        }
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    partner = partners_db[partner_id]

    if partner['status'] != 'pending':
        raise HTTPException(
            status_code=400,
            detail=f"Partner is already {partner['status']}"
        )

    # Update status
    partner['status'] = 'rejected'
    partner['rejected_at'] = datetime.utcnow().isoformat()
    partner['rejected_by'] = rejected_by
    partner['rejection_reason'] = rejection_reason

    logger.info(f"Partner rejected: {partner_id} by {rejected_by}")

    # TODO: Send rejection email with reason

    return JSONResponse(content={
        'success': True,
        'partner_id': partner_id,
        'message': 'Partner rejected',
        'status': 'rejected',
        'reason': rejection_reason
    })


@router.put("/{partner_id}")
async def update_partner(partner_id: str, updates: PartnerUpdate):
    """
    Update partner information.

    Args:
        partner_id: Partner ID
        updates: Fields to update

    Returns:
        Updated partner object
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    partner = partners_db[partner_id]

    # Update fields
    update_data = updates.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field in partner:
            partner[field] = value
            logger.info(f"Partner {partner_id} updated: {field} = {value}")

    partner['updated_at'] = datetime.utcnow().isoformat()

    return JSONResponse(content=partner)


@router.delete("/{partner_id}")
async def delete_partner(partner_id: str):
    """
    Delete a partner (soft delete by setting status to 'deleted').

    Returns:
        {
            'success': bool,
            'partner_id': str,
            'message': str
        }
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    # Soft delete
    partners_db[partner_id]['status'] = 'deleted'
    partners_db[partner_id]['deleted_at'] = datetime.utcnow().isoformat()

    logger.info(f"Partner deleted: {partner_id}")

    return JSONResponse(content={
        'success': True,
        'partner_id': partner_id,
        'message': 'Partner deleted successfully'
    })


@router.get("/{partner_id}/performance")
async def get_partner_performance(partner_id: str):
    """
    Get partner performance metrics.

    Returns:
        {
            'partner_id': str,
            'total_referrals': int,
            'total_revenue': float,
            'total_commission': float,
            'avg_conversion_rate': float,
            'recent_referrals': List[dict]
        }
    """
    if partner_id not in partners_db:
        raise HTTPException(status_code=404, detail=f"Partner not found: {partner_id}")

    partner = partners_db[partner_id]

    # TODO: Fetch actual referral data from database

    return JSONResponse(content={
        'partner_id': partner_id,
        'organization_name': partner['organization_name'],
        'total_referrals': partner['total_referrals'],
        'total_revenue': partner['total_revenue'],
        'total_commission': partner['total_commission'],
        'avg_conversion_rate': 0.0,
        'recent_referrals': []
    })


@router.get("/stats/summary")
async def get_partner_stats_summary():
    """
    Get summary statistics for all partners.

    Returns:
        {
            'total_partners': int,
            'pending_applications': int,
            'approved_partners': int,
            'rejected_applications': int,
            'total_referrals': int,
            'total_revenue': float,
            'total_commissions_paid': float
        }
    """
    all_partners = list(partners_db.values())

    stats = {
        'total_partners': len(all_partners),
        'pending_applications': len([p for p in all_partners if p['status'] == 'pending']),
        'approved_partners': len([p for p in all_partners if p['status'] == 'approved']),
        'rejected_applications': len([p for p in all_partners if p['status'] == 'rejected']),
        'total_referrals': sum(p['total_referrals'] for p in all_partners),
        'total_revenue': sum(p['total_revenue'] for p in all_partners),
        'total_commissions_paid': sum(p['total_commission'] for p in all_partners)
    }

    return JSONResponse(content=stats)
