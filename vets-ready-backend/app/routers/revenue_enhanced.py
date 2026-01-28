"""
REVENUE ENGINE API - EXPANDED

Complete REST API for the Revenue Engine system.
Includes all endpoints for tracking revenue, managing partners, and enterprise leads.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.revenue import (
    RevenueEvent, RevenueStream, Partner, EnterpriseLead, RevenueAlert, RevenueLog,
    RevenueEventCreate, RevenueEventResponse,
    RevenueStreamCreate, RevenueStreamUpdate, RevenueStreamResponse,
    PartnerCreate, PartnerUpdate, PartnerResponse,
    EnterpriseLeadCreate, EnterpriseLeadUpdate, EnterpriseLeadResponse,
    AlertCreate, AlertResponse,
    LogCreate, LogResponse,
    RevenueSummary,
    RevenueStreamType, StreamStatus, PartnerStatus, EnterpriseStage, LeadSource
)

router = APIRouter(prefix="/api/revenue", tags=["revenue"])


# ==================== UTILITY FUNCTIONS ====================

def create_log(
    db: Session,
    actor: str,
    action: str,
    target: str,
    target_id: Optional[str] = None,
    result: str = "Success",
    details: Optional[str] = None
):
    """Create an audit log entry"""
    log = RevenueLog(
        actor=actor,
        action=action,
        target=target,
        target_id=target_id,
        result=result,
        details=details
    )
    db.add(log)
    db.commit()


# ==================== REVENUE SUMMARY ====================

@router.get("/summary", response_model=RevenueSummary)
async def get_revenue_summary(db: Session = Depends(get_db)):
    """
    Get comprehensive revenue summary with key metrics.
    """
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)
    year_start = datetime(now.year, 1, 1)

    # Calculate totals
    total_ytd = db.query(func.sum(RevenueEvent.amount)).filter(
        RevenueEvent.timestamp >= year_start
    ).scalar() or 0.0

    total_30_days = db.query(func.sum(RevenueEvent.amount)).filter(
        RevenueEvent.timestamp >= thirty_days_ago
    ).scalar() or 0.0

    total_7_days = db.query(func.sum(RevenueEvent.amount)).filter(
        RevenueEvent.timestamp >= seven_days_ago
    ).scalar() or 0.0

    # Active streams
    active_streams = db.query(RevenueStream).filter(
        RevenueStream.status == StreamStatus.ACTIVE
    ).count()

    # Pending opportunities (from ARDE)
    # TODO: Integrate with ARDE opportunities table
    pending_opportunities = 0

    # Enterprise leads
    enterprise_leads = db.query(EnterpriseLead).filter(
        EnterpriseLead.stage.notin_([EnterpriseStage.CLOSED_WON, EnterpriseStage.CLOSED_LOST])
    ).count()

    # Average conversion rate (placeholder - needs actual conversion tracking)
    avg_conversion_rate = 0.06

    # Revenue by stream type
    by_stream_results = db.query(
        RevenueEvent.stream_type,
        func.sum(RevenueEvent.amount)
    ).filter(
        RevenueEvent.timestamp >= thirty_days_ago
    ).group_by(RevenueEvent.stream_type).all()

    by_stream = {str(stream_type): float(amount) for stream_type, amount in by_stream_results}

    # Top partners (by revenue in last 30 days)
    top_partners_results = db.query(
        Partner.id,
        Partner.name,
        func.sum(RevenueEvent.amount).label('revenue')
    ).join(
        RevenueEvent, RevenueEvent.partner_id == Partner.id
    ).filter(
        RevenueEvent.timestamp >= thirty_days_ago
    ).group_by(Partner.id, Partner.name).order_by(
        func.sum(RevenueEvent.amount).desc()
    ).limit(5).all()

    top_partners = [
        {"id": partner_id, "name": name, "revenue": float(revenue)}
        for partner_id, name, revenue in top_partners_results
    ]

    # Trends (simplified)
    trends = {
        "overall": "Up" if total_30_days > total_7_days * 4 else "Flat",
        "subscriptions": "Up",
        "affiliates": "Up",
        "enterprise": "Flat"
    }

    return RevenueSummary(
        total_ytd=total_ytd,
        total_30_days=total_30_days,
        total_7_days=total_7_days,
        active_streams=active_streams,
        pending_opportunities=pending_opportunities,
        enterprise_leads=enterprise_leads,
        avg_conversion_rate=avg_conversion_rate,
        by_stream=by_stream,
        top_partners=top_partners,
        trends=trends
    )


# ==================== REVENUE STREAMS ====================

@router.get("/streams", response_model=List[RevenueStreamResponse])
async def list_revenue_streams(
    status: Optional[StreamStatus] = None,
    stream_type: Optional[RevenueStreamType] = None,
    db: Session = Depends(get_db)
):
    """
    List all revenue streams with optional filtering.
    """
    query = db.query(RevenueStream)

    if status:
        query = query.filter(RevenueStream.status == status)
    if stream_type:
        query = query.filter(RevenueStream.type == stream_type)

    streams = query.all()
    return streams


@router.get("/streams/{stream_id}", response_model=RevenueStreamResponse)
async def get_revenue_stream(stream_id: str, db: Session = Depends(get_db)):
    """
    Get details of a specific revenue stream.
    """
    stream = db.query(RevenueStream).filter(RevenueStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Revenue stream not found")
    return stream


@router.post("/streams", response_model=RevenueStreamResponse)
async def create_revenue_stream(
    stream: RevenueStreamCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new revenue stream.
    """
    # Check for duplicate names
    existing = db.query(RevenueStream).filter(RevenueStream.name == stream.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Revenue stream with this name already exists")

    db_stream = RevenueStream(**stream.dict())
    db.add(db_stream)
    db.commit()
    db.refresh(db_stream)

    create_log(db, "System", "Created revenue stream", "RevenueStream", db_stream.id)

    return db_stream


@router.patch("/streams/{stream_id}", response_model=RevenueStreamResponse)
async def update_revenue_stream(
    stream_id: str,
    updates: RevenueStreamUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a revenue stream.
    """
    stream = db.query(RevenueStream).filter(RevenueStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=404, detail="Revenue stream not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(stream, key, value)

    stream.updated_at = datetime.utcnow()

    # Track activation/deactivation
    if "status" in update_data:
        if update_data["status"] == StreamStatus.ACTIVE and not stream.activated_at:
            stream.activated_at = datetime.utcnow()
        elif update_data["status"] != StreamStatus.ACTIVE and stream.activated_at:
            stream.deactivated_at = datetime.utcnow()

    db.commit()
    db.refresh(stream)

    create_log(db, "System", "Updated revenue stream", "RevenueStream", stream_id)

    return stream


# ==================== REVENUE EVENTS ====================

@router.post("/events", response_model=RevenueEventResponse)
async def create_revenue_event(
    event: RevenueEventCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new revenue event (transaction record).
    """
    db_event = RevenueEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    create_log(
        db,
        "System",
        f"Recorded revenue event: {event.stream_type}",
        "RevenueEvent",
        db_event.id,
        details=f"${event.amount} from {event.source_module or 'unknown'}"
    )

    return db_event


@router.get("/events", response_model=List[RevenueEventResponse])
async def list_revenue_events(
    stream_type: Optional[RevenueStreamType] = None,
    source_module: Optional[str] = None,
    partner_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List revenue events with filtering and pagination.
    """
    query = db.query(RevenueEvent).order_by(RevenueEvent.timestamp.desc())

    if stream_type:
        query = query.filter(RevenueEvent.stream_type == stream_type)
    if source_module:
        query = query.filter(RevenueEvent.source_module == source_module)
    if partner_id:
        query = query.filter(RevenueEvent.partner_id == partner_id)
    if start_date:
        query = query.filter(RevenueEvent.timestamp >= start_date)
    if end_date:
        query = query.filter(RevenueEvent.timestamp <= end_date)

    events = query.limit(limit).offset(offset).all()
    return events


# ==================== PARTNERS ====================

@router.get("/partners", response_model=List[PartnerResponse])
async def list_partners(
    status: Optional[PartnerStatus] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all partners with optional filtering.
    """
    query = db.query(Partner)

    if status:
        query = query.filter(Partner.status == status)
    if category:
        query = query.filter(Partner.category == category)
    if region:
        query = query.filter(Partner.region == region)

    partners = query.all()
    return partners


@router.post("/partners", response_model=PartnerResponse)
async def create_partner(
    partner: PartnerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new partner (for admin or self-service onboarding).
    """
    db_partner = Partner(**partner.dict())
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)

    create_log(db, "System", "Created partner", "Partner", db_partner.id)

    return db_partner


@router.patch("/partners/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: str,
    updates: PartnerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a partner (including approval/rejection).
    """
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(partner, key, value)

    partner.updated_at = datetime.utcnow()

    # Track approval
    if "status" in update_data and update_data["status"] == PartnerStatus.APPROVED:
        partner.approved_at = datetime.utcnow()
        # TODO: Set approved_by from authenticated user

    db.commit()
    db.refresh(partner)

    create_log(db, "System", "Updated partner", "Partner", partner_id)

    return partner


# ==================== ENTERPRISE LEADS ====================

@router.get("/enterprise-leads", response_model=List[EnterpriseLeadResponse])
async def list_enterprise_leads(
    stage: Optional[EnterpriseStage] = None,
    lead_type: Optional[str] = None,
    region: Optional[str] = None,
    source: Optional[LeadSource] = None,
    db: Session = Depends(get_db)
):
    """
    List all enterprise leads with optional filtering.
    """
    query = db.query(EnterpriseLead)

    if stage:
        query = query.filter(EnterpriseLead.stage == stage)
    if lead_type:
        query = query.filter(EnterpriseLead.type == lead_type)
    if region:
        query = query.filter(EnterpriseLead.region == region)
    if source:
        query = query.filter(EnterpriseLead.source == source)

    leads = query.order_by(EnterpriseLead.created_at.desc()).all()
    return leads


@router.post("/enterprise-leads", response_model=EnterpriseLeadResponse)
async def create_enterprise_lead(
    lead: EnterpriseLeadCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new enterprise lead (manual or auto-detected).
    """
    db_lead = EnterpriseLead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    create_log(db, "System", "Created enterprise lead", "EnterpriseLead", db_lead.id)

    # Create alert for new lead
    alert = RevenueAlert(
        type="opportunity",
        severity="medium",
        description=f"New enterprise lead: {lead.organization_name}",
        impact=f"Estimated value: ${lead.estimated_value or 0}",
        recommended_action="Review lead details and assign owner"
    )
    db.add(alert)
    db.commit()

    return db_lead


@router.patch("/enterprise-leads/{lead_id}", response_model=EnterpriseLeadResponse)
async def update_enterprise_lead(
    lead_id: str,
    updates: EnterpriseLeadUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an enterprise lead (stage progression, notes, etc.).
    """
    lead = db.query(EnterpriseLead).filter(EnterpriseLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Enterprise lead not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)

    lead.updated_at = datetime.utcnow()
    lead.last_activity_at = datetime.utcnow()

    # Track closure
    if "stage" in update_data:
        if update_data["stage"] in [EnterpriseStage.CLOSED_WON, EnterpriseStage.CLOSED_LOST]:
            lead.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(lead)

    create_log(db, "System", "Updated enterprise lead", "EnterpriseLead", lead_id)

    return lead


# ==================== ALERTS ====================

@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    status: str = "pending",
    severity: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """
    List revenue alerts and suggestions.
    """
    query = db.query(RevenueAlert).filter(RevenueAlert.status == status)

    if severity:
        query = query.filter(RevenueAlert.severity == severity)

    alerts = query.order_by(RevenueAlert.created_at.desc()).limit(limit).all()
    return alerts


@router.post("/alerts", response_model=AlertResponse)
async def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new alert/suggestion.
    """
    db_alert = RevenueAlert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.patch("/alerts/{alert_id}")
async def resolve_alert(
    alert_id: str,
    action: str,  # 'accept', 'dismiss', 'snooze'
    db: Session = Depends(get_db)
):
    """
    Resolve an alert (accept, dismiss, or snooze).
    """
    alert = db.query(RevenueAlert).filter(RevenueAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = action
    if action in ['accept', 'dismiss']:
        alert.resolved_at = datetime.utcnow()
        # TODO: Set resolved_by from authenticated user

    db.commit()

    create_log(db, "System", f"Resolved alert: {action}", "RevenueAlert", alert_id)

    return {"status": "success", "action": action}


# ==================== LOGS ====================

@router.get("/logs", response_model=List[LogResponse])
async def list_logs(
    actor: Optional[str] = None,
    target: Optional[str] = None,
    result: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """
    List audit logs with filtering.
    """
    query = db.query(RevenueLog).order_by(RevenueLog.timestamp.desc())

    if actor:
        query = query.filter(RevenueLog.actor == actor)
    if target:
        query = query.filter(RevenueLog.target == target)
    if result:
        query = query.filter(RevenueLog.result == result)
    if start_date:
        query = query.filter(RevenueLog.timestamp >= start_date)
    if end_date:
        query = query.filter(RevenueLog.timestamp <= end_date)

    logs = query.limit(limit).all()
    return logs


# ==================== ANALYTICS ====================

@router.get("/metrics/by-stream")
async def get_metrics_by_stream(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get revenue metrics grouped by stream type.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        RevenueEvent.stream_type,
        func.sum(RevenueEvent.amount).label('total_revenue'),
        func.count(RevenueEvent.id).label('event_count'),
        func.avg(RevenueEvent.amount).label('avg_amount')
    ).filter(
        RevenueEvent.timestamp >= start_date
    ).group_by(RevenueEvent.stream_type).all()

    return [
        {
            "stream_type": str(stream_type),
            "total_revenue": float(total_revenue or 0),
            "event_count": event_count,
            "avg_amount": float(avg_amount or 0)
        }
        for stream_type, total_revenue, event_count, avg_amount in results
    ]


@router.get("/metrics/by-module")
async def get_metrics_by_module(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get revenue metrics grouped by source module.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    results = db.query(
        RevenueEvent.source_module,
        func.sum(RevenueEvent.amount).label('total_revenue'),
        func.count(RevenueEvent.id).label('event_count')
    ).filter(
        and_(
            RevenueEvent.timestamp >= start_date,
            RevenueEvent.source_module.isnot(None)
        )
    ).group_by(RevenueEvent.source_module).all()

    return [
        {
            "module": source_module,
            "total_revenue": float(total_revenue or 0),
            "event_count": event_count
        }
        for source_module, total_revenue, event_count in results
    ]


@router.get("/health")
async def revenue_engine_health(db: Session = Depends(get_db)):
    """
    Health check for revenue engine.
    """
    try:
        # Check database connectivity
        db.execute("SELECT 1")

        # Get basic stats
        total_streams = db.query(RevenueStream).count()
        active_streams = db.query(RevenueStream).filter(
            RevenueStream.status == StreamStatus.ACTIVE
        ).count()
        total_events = db.query(RevenueEvent).count()
        total_partners = db.query(Partner).count()
        total_leads = db.query(EnterpriseLead).count()

        return {
            "status": "healthy",
            "database": "connected",
            "stats": {
                "total_streams": total_streams,
                "active_streams": active_streams,
                "total_events": total_events,
                "total_partners": total_partners,
                "total_leads": total_leads
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
