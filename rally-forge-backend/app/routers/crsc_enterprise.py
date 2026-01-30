from fastapi import APIRouter, Depends, Query
from typing import List, Optional

from app.schemas.crsc_enterprise import (
    CrscAnalyticsSummary,
    CrscCohortMetric,
    CrscTrendPoint,
    CrscEventsResponse,
    CrscAnalyticsEvent,
)
from app.services import crsc_enterprise_service as svc
from app.utils.enterprise_auth import require_enterprise_auth, get_api_audit_log

router = APIRouter(prefix="/enterprise/crsc", tags=["enterprise-crsc"], dependencies=[Depends(require_enterprise_auth)])


@router.post("/events", status_code=202)
async def ingest_crsc_event(event: CrscAnalyticsEvent):
    # PII-free, anonymized event ingestion from CRSC Hub
    svc.add_event(event)
    return {"status": "accepted"}


@router.get("/audit", response_model=List[dict])
async def get_gateway_audit(limit: int = Query(default=200, ge=1, le=1000)):
    # Return PII-free API audit entries
    return await get_api_audit_log(limit)


@router.get("/analytics/summary", response_model=CrscAnalyticsSummary)
async def get_crsc_summary(
    cohortIds: Optional[List[str]] = Query(default=None),
    branch: Optional[str] = Query(default=None),
    installation: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None),
    end: Optional[str] = Query(default=None),
):
    filters = {"cohort_ids": cohortIds, "branch": branch, "installation": installation, "start": start, "end": end}
    return svc.aggregate_summary(filters)


@router.get("/analytics/cohorts", response_model=List[CrscCohortMetric])
async def get_crsc_cohort_metrics(
    cohortIds: Optional[List[str]] = Query(default=None),
    branch: Optional[str] = Query(default=None),
    installation: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None),
    end: Optional[str] = Query(default=None),
):
    filters = {"cohort_ids": cohortIds, "branch": branch, "installation": installation, "start": start, "end": end}
    return svc.aggregate_by_cohort(filters)


@router.get("/analytics/trends", response_model=List[CrscTrendPoint])
async def get_crsc_trends(
    cohortIds: Optional[List[str]] = Query(default=None),
    branch: Optional[str] = Query(default=None),
    installation: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None),
    end: Optional[str] = Query(default=None),
):
    filters = {"cohort_ids": cohortIds, "branch": branch, "installation": installation, "start": start, "end": end}
    return svc.build_trends(filters)


@router.get("/events", response_model=CrscEventsResponse)
async def get_crsc_events(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=500),
    cohortIds: Optional[List[str]] = Query(default=None),
    branch: Optional[str] = Query(default=None),
    installation: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None),
    end: Optional[str] = Query(default=None),
):
    filters = {"cohort_ids": cohortIds, "branch": branch, "installation": installation, "start": start, "end": end}
    events = svc.filter_events(**filters)
    total = len(events)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    page_events = events[start_idx:end_idx]
    return CrscEventsResponse(events=page_events, page=page, per_page=per_page, total=total)


@router.get("/lineage", response_model=List[dict])
async def get_crsc_lineage(
    limit: int = Query(default=200, ge=1, le=1000),
    sourceModule: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None),
    end: Optional[str] = Query(default=None),
):
    """
    Retrieve CRSC lineage records (audit trail of transformations).
    No PII; suitable for compliance and enterprise dashboards.
    """
    lineage = svc.get_lineage_records(limit=limit, source_module=sourceModule, start=start, end=end)
    return lineage
