from typing import List, Dict, Optional
import json
import os
from app.schemas.crsc_enterprise import CrscAnalyticsEvent, CrscAnalyticsSummary, CrscCohortMetric

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'enterprise_crsc_events.jsonl')
LINEAGE_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'enterprise_crsc_lineage.jsonl')

# In-memory store for anonymized analytics events (backed by JSONL append-only)
EVENT_STORE: List[CrscAnalyticsEvent] = []
# In-memory store for lineage records
LINEAGE_STORE: List[dict] = []


def _ensure_data_dir():
    folder = os.path.dirname(DATA_FILE)
    os.makedirs(folder, exist_ok=True)


def _load_events_from_disk():
    _ensure_data_dir()
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    raw = json.loads(line.strip())
                    EVENT_STORE.append(CrscAnalyticsEvent(**raw))
                except Exception:
                    continue


def _append_event_to_disk(event: CrscAnalyticsEvent):
    _ensure_data_dir()
    with open(DATA_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(event.dict()) + "\n")


def add_event(event: CrscAnalyticsEvent) -> None:
    EVENT_STORE.append(event)
    _append_event_to_disk(event)


_load_events_from_disk()


def filter_events(
    cohort_ids: Optional[List[str]] = None,
    branch: Optional[str] = None,
    installation: Optional[str] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
) -> List[CrscAnalyticsEvent]:
    def in_window(ts: str) -> bool:
        if start and ts < start:
            return False
        if end and ts > end:
            return False
        return True

    return [
        evt
        for evt in EVENT_STORE
        if (not cohort_ids or evt.cohortId in cohort_ids)
        and (not branch or (evt.branch and evt.branch == branch))
        and (not installation or (evt.installation and evt.installation == installation))
        and in_window(evt.timestamp)
    ]


def _bucket_payable(amount: float) -> str:
    if amount < 500:
        return "$0-499"
    if amount < 1000:
        return "$500-999"
    if amount < 2000:
        return "$1,000-1,999"
    return "$2,000+"


def _aggregate(events: List[CrscAnalyticsEvent]) -> CrscAnalyticsSummary:
    eligibility: Dict[str, int] = {}
    category = {
        "armed_conflict": 0,
        "hazardous_service": 0,
        "simulated_war": 0,
        "instrumentality_of_war": 0,
        "purple_heart": 0,
    }
    evidence = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    payable: Dict[str, int] = {}
    retirement_by_period: Dict[str, List[float]] = {}

    for evt in events:
        eligibility[evt.eligibilityStatus] = eligibility.get(evt.eligibilityStatus, 0) + 1
        category["armed_conflict"] += evt.combatCategoryCounts.armedConflict
        category["hazardous_service"] += evt.combatCategoryCounts.hazardousService
        category["simulated_war"] += evt.combatCategoryCounts.simulatedWar
        category["instrumentality_of_war"] += evt.combatCategoryCounts.instrumentalityOfWar
        category["purple_heart"] += evt.combatCategoryCounts.purpleHeart

        evidence[evt.evidenceStrength] = evidence.get(evt.evidenceStrength, 0) + 1
        bucket = _bucket_payable(evt.crscPayableEstimate)
        payable[bucket] = payable.get(bucket, 0) + 1
        period_key = evt.timestamp[:7]
        retirement_by_period.setdefault(period_key, []).append(evt.retirementImpactScore)

    retirement_trend = [
        {
            "period": key,
            "averageImpact": sum(scores) / len(scores) if scores else 0,
        }
        for key, scores in sorted(retirement_by_period.items())
    ]

    return CrscAnalyticsSummary(
        eligibilityDistribution=eligibility,
        combatCategoryBreakdown=category,
        evidenceStrengthDistribution=evidence,
        payableRangeDistribution=[{"range": k, "count": v} for k, v in payable.items()],
        retirementImpactTrend=retirement_trend,
    )


def aggregate_summary(filters: dict | None = None) -> CrscAnalyticsSummary:
    events = filter_events(
        cohort_ids=filters.get("cohort_ids") if filters else None,
        branch=filters.get("branch") if filters else None,
        installation=filters.get("installation") if filters else None,
        start=filters.get("start") if filters else None,
        end=filters.get("end") if filters else None,
    )
    return _aggregate(events)


def aggregate_by_cohort(filters: dict | None = None) -> List[CrscCohortMetric]:
    events = filter_events(
        cohort_ids=filters.get("cohort_ids") if filters else None,
        branch=filters.get("branch") if filters else None,
        installation=filters.get("installation") if filters else None,
        start=filters.get("start") if filters else None,
        end=filters.get("end") if filters else None,
    )
    cohorts = {}
    for evt in events:
        cohorts.setdefault(evt.cohortId, []).append(evt)
    return [CrscCohortMetric(cohortId=cid, **_aggregate(evts).dict()) for cid, evts in cohorts.items()]


def build_trends(filters: dict | None = None) -> List[dict]:
    events = filter_events(
        cohort_ids=filters.get("cohort_ids") if filters else None,
        branch=filters.get("branch") if filters else None,
        installation=filters.get("installation") if filters else None,
        start=filters.get("start") if filters else None,
        end=filters.get("end") if filters else None,
    )
    buckets: Dict[str, dict] = {}
    for evt in events:
        period = evt.timestamp[:7]
        bucket = buckets.setdefault(period, {"eligibilityLikely": 0, "eligibilityUnclear": 0, "averageImpact": []})
        if evt.eligibilityStatus.lower().startswith("likely"):
            bucket["eligibilityLikely"] += 1
        else:
            bucket["eligibilityUnclear"] += 1
        bucket["averageImpact"].append(evt.retirementImpactScore)
    trend = []
    for period, vals in sorted(buckets.items()):
        impacts = vals["averageImpact"]
        trend.append({
            "period": period,
            "eligibilityLikely": vals["eligibilityLikely"],
            "eligibilityUnclear": vals["eligibilityUnclear"],
            "averageImpact": sum(impacts) / len(impacts) if impacts else 0,
        })
    return trend


def _load_lineage_from_disk():
    """Load lineage records from append-only JSONL file."""
    if os.path.exists(LINEAGE_FILE):
        with open(LINEAGE_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    record = json.loads(line.strip())
                    LINEAGE_STORE.append(record)
                except Exception:
                    continue


def _append_lineage_to_disk(record: dict):
    """Append lineage record to JSONL file."""
    _ensure_data_dir()
    os.makedirs(os.path.dirname(LINEAGE_FILE), exist_ok=True)
    with open(LINEAGE_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(record) + "\n")


def add_lineage_record(
    record_id: str,
    source_module: str,
    input_hashes: List[str],
    output_hash: str,
    transformation_summary: str,
    version: str = "1.0",
) -> None:
    """Record a lineage event for audit trail."""
    import hashlib
    from datetime import datetime, timezone

    record = {
        "recordId": record_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sourceModule": source_module,
        "inputHashes": input_hashes,
        "outputHash": output_hash,
        "transformationSummary": transformation_summary,
        "version": version,
    }
    LINEAGE_STORE.append(record)
    _append_lineage_to_disk(record)


def get_lineage_records(
    limit: int = 200,
    source_module: Optional[str] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
) -> List[dict]:
    """Retrieve lineage records with optional filtering."""
    results = LINEAGE_STORE

    if source_module:
        results = [r for r in results if r.get("sourceModule") == source_module]

    if start:
        results = [r for r in results if r.get("timestamp", "") >= start]

    if end:
        results = [r for r in results if r.get("timestamp", "") <= end]

    # Return most recent first, up to limit
    return sorted(results, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]


# Load lineage records at startup
_load_lineage_from_disk()
