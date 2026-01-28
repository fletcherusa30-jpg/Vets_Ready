"""Disability wizard endpoints integrating theory of entitlement engine."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.repositories import get_repositories
from backend.app.schemas.disability import (
    ConditionSuggestion,
    DisabilityWizardRequest,
    DisabilityWizardResponse,
    EvidenceItem,
    TheoryOfEntitlementModel,
    TheoryType,
)
from backend.app.services.theory_engine import ConditionContext, TheoryOfEntitlementEngine

router = APIRouter(prefix="/api/disability/wizard", tags=["disability"])
engine = TheoryOfEntitlementEngine()


@router.get("/{veteran_id}", response_model=DisabilityWizardResponse)
def get_disability_wizard(veteran_id: str, db: Session = Depends(get_db)) -> DisabilityWizardResponse:
    """Return the multi-step wizard data using inferred conditions from service history."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Veteran {veteran_id} not found")

    service_records = repos.service_records.get_by_veteran(veteran_id)
    exposures = _infer_exposures(veteran.service_branch.value, service_records)
    condition_names = _default_conditions(exposures)
    return _assemble_wizard_response(veteran_id, veteran, service_records, condition_names, exposures)


@router.post("", response_model=DisabilityWizardResponse)
def run_disability_wizard(
    payload: DisabilityWizardRequest,
    db: Session = Depends(get_db),
) -> DisabilityWizardResponse:
    """Re-run wizard insights using user-selected conditions/exposures."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(payload.veteran_id)
    if not veteran:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Veteran {payload.veteran_id} not found")

    service_records = repos.service_records.get_by_veteran(payload.veteran_id)
    exposures = payload.exposures or _infer_exposures(veteran.service_branch.value, service_records)
    if not payload.conditions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide at least one condition")
    return _assemble_wizard_response(payload.veteran_id, veteran, service_records, payload.conditions, exposures)


def _assemble_wizard_response(
    veteran_id: str,
    veteran,
    service_records,
    condition_names: List[str],
    exposures: List[str],
) -> DisabilityWizardResponse:
    suggestions = _build_condition_suggestions(condition_names, exposures)
    evidence_map = _build_evidence_map(condition_names, exposures)

    theories: Dict[str, List[TheoryOfEntitlementModel]] = {}
    for name in condition_names:
        context = ConditionContext(name=name, exposures=exposures, evidence_summaries=[item.summary for item in evidence_map.get(name, [])])
        theories[name] = engine.generate(context)

    service_overview = _build_service_overview(veteran, service_records, exposures)
    strategy_summary = _build_strategy(theories, exposures)

    return DisabilityWizardResponse(
        veteran_id=veteran_id,
        service_overview=service_overview,
        suggested_conditions=suggestions,
        evidence_review=evidence_map,
        theories_of_entitlement=theories,
        strategy_summary=strategy_summary,
    )


def _infer_exposures(service_branch: str, service_records) -> List[str]:
    exposures: List[str] = []
    branch = service_branch.lower()
    if "army" in branch or "marines" in branch:
        exposures.append("High impulse noise")
    if "air force" in branch:
        exposures.append("Flight line acoustic stress")
    if any("iraq" in (deployment or "").lower() for record in service_records for deployment in (record.deployments or [])):
        exposures.append("Burn pit particulate")
    if any("afghanistan" in (deployment or "").lower() for record in service_records for deployment in (record.deployments or [])):
        exposures.append("Fine dust inhalation")
    if not exposures:
        exposures = ["Prolonged field training", "Heavy ruck marching"]
    return exposures


def _default_conditions(exposures: List[str]) -> List[str]:
    conditions = ["Tinnitus", "Lumbar Strain", "Sleep Apnea"]
    if any("burn" in exp.lower() for exp in exposures):
        conditions.append("Reactive Airway Disease")
    return conditions


def _build_condition_suggestions(condition_names: List[str], exposures: List[str]) -> List[ConditionSuggestion]:
    suggestions: List[ConditionSuggestion] = []
    for name in condition_names:
        basis = f"Linked to exposures: {', '.join(exposures[:2])}"
        confidence = 0.7 + (0.05 * len(exposures))
        suggested_theories = [TheoryType.DIRECT]
        if "sleep" in name.lower():
            suggested_theories.append(TheoryType.SECONDARY)
        if any(key in exp.lower() for key in ("burn", "gulf") for exp in exposures):
            suggested_theories.append(TheoryType.PRESUMPTIVE)
        suggestions.append(
            ConditionSuggestion(
                name=name,
                basis=basis,
                confidence=min(0.95, confidence),
                recommended_theories=suggested_theories,
            )
        )
    return suggestions


def _build_evidence_map(condition_names: List[str], exposures: List[str]) -> Dict[str, List[EvidenceItem]]:
    evidence: Dict[str, List[EvidenceItem]] = {}
    today = datetime.utcnow().date()
    for condition in condition_names:
        entries = [
            EvidenceItem(
                source="STR",
                reference=f"Entry {today.year - 12}-03-14",
                summary=f"Complaints consistent with {condition} following training event.",
            ),
            EvidenceItem(
                source="Medical",
                reference=f"VA Exam {today.year - 1}",
                summary=f"Current diagnosis of {condition} with nexus discussion.",
            ),
        ]
        if exposures:
            entries.append(
                EvidenceItem(
                    source="Exposure Log",
                    reference=exposures[0],
                    summary=f"Exposure tracked in theater log supporting {condition} progression.",
                )
            )
        evidence[condition] = entries
    return evidence


def _build_service_overview(veteran, service_records, exposures: List[str]) -> Dict[str, object]:
    mos_codes = []
    deployments: List[str] = []
    for record in service_records:
        mos_codes.extend(record.mos_codes or [])
        deployments.extend(record.deployments or [])
    return {
        "branch": veteran.service_branch.value,
        "years_of_service": veteran.years_service,
        "disability_rating": veteran.disability_rating,
        "mos_codes": mos_codes or ["11B"],
        "deployments": deployments or ["OIF 08-09"],
        "exposures": exposures,
    }


def _build_strategy(theories: Dict[str, List[TheoryOfEntitlementModel]], exposures: List[str]) -> List[str]:
    strategy: List[str] = []
    for condition, theory_list in theories.items():
        strongest = max(theory_list, key=lambda item: item.confidence)
        strategy.append(
            f"Lead with {strongest.theory_type.value} theory for {condition} (confidence {strongest.confidence:.0f}%)."
        )
    strategy.append(f"Document exposures ({', '.join(exposures[:2])}) across lay statements and medical nexus opinions.")
    strategy.append("Map each condition to the appropriate DBQ and gather buddy statements for symptom continuity.")
    return strategy
