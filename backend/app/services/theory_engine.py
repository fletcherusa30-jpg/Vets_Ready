"""Theory of Entitlement inference engine."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from backend.app.schemas.disability import TheoryType, TheoryOfEntitlementModel


@dataclass
class ConditionContext:
    """Context supplied to the theory engine."""

    name: str
    exposures: List[str]
    evidence_summaries: List[str]


class TheoryOfEntitlementEngine:
    """Generates entitlement theories with rationale, CFR references, and confidence."""

    CFR_MAP = {
        TheoryType.DIRECT: "38 CFR §3.303",
        TheoryType.SECONDARY: "38 CFR §3.310",
        TheoryType.PRESUMPTIVE: "38 CFR §3.307/§3.309",
        TheoryType.AGGRAVATION: "38 CFR §3.306",
        TheoryType.CHRONICITY: "38 CFR §3.303(b)",
    }

    def generate(self, context: ConditionContext) -> List[TheoryOfEntitlementModel]:
        exposures = [item.lower() for item in context.exposures]
        evidence = context.evidence_summaries
        condition_lower = context.name.lower()

        theories: List[TheoryOfEntitlementModel] = []
        theories.append(self._build_direct(condition_lower, exposures, evidence))

        secondary = self._maybe_secondary(condition_lower, exposures)
        if secondary:
            theories.append(secondary)

        presumptive = self._maybe_presumptive(exposures)
        if presumptive:
            theories.append(presumptive)

        aggravation = self._maybe_aggravation(condition_lower, evidence)
        if aggravation:
            theories.append(aggravation)

        chronicity = self._maybe_chronicity(evidence)
        if chronicity:
            theories.append(chronicity)

        return theories

    def _build_direct(self, condition: str, exposures: List[str], evidence: List[str]) -> TheoryOfEntitlementModel:
        rationale = "Service records and STR entries document in-service onset with continuous symptoms."
        if exposures:
            rationale = f"Documented exposures ({', '.join(exposures[:3])}) align with {condition} onset."
        confidence = self._score(65, exposures, evidence)
        return TheoryOfEntitlementModel(
            theory_type=TheoryType.DIRECT,
            rationale=rationale,
            evidence_required=["STR entries describing onset", "Current diagnosis", "Medical nexus opinion"],
            cfr_reference=self.CFR_MAP[TheoryType.DIRECT],
            confidence=confidence,
        )

    def _maybe_secondary(self, condition: str, exposures: List[str]) -> TheoryOfEntitlementModel | None:
        secondary_pairs = {
            "sleep": "PTSD-related insomnia",
            "hypertension": "Service-connected renal or endocrine disorders",
            "tinnitus": "Service-connected hearing loss",
        }
        for keyword, basis in secondary_pairs.items():
            if keyword in condition:
                confidence = self._score(55, exposures, [])
                return TheoryOfEntitlementModel(
                    theory_type=TheoryType.SECONDARY,
                    rationale=f"{basis} aggravates or causes the claimed {condition}.",
                    evidence_required=["Current diagnosis", "Service-connected primary condition", "Competent nexus opining aggravation/causation"],
                    cfr_reference=self.CFR_MAP[TheoryType.SECONDARY],
                    confidence=confidence,
                )
        return None

    def _maybe_presumptive(self, exposures: List[str]) -> TheoryOfEntitlementModel | None:
        presumptive_markers = ["burn pit", "agent orange", "gulf"]
        if any(marker in exp for marker in presumptive_markers for exp in exposures):
            return TheoryOfEntitlementModel(
                theory_type=TheoryType.PRESUMPTIVE,
                rationale="Service in a recognized hazardous environment triggers the presumptive list.",
                evidence_required=["Proof of service in theater", "Current diagnosis listed in 38 CFR §3.309"],
                cfr_reference=self.CFR_MAP[TheoryType.PRESUMPTIVE],
                confidence=78,
            )
        return None

    def _maybe_aggravation(self, condition: str, evidence: List[str]) -> TheoryOfEntitlementModel | None:
        aggravation_markers = ["pre-existing", "worsened"]
        if any(marker in " ".join(evidence).lower() for marker in aggravation_markers):
            return TheoryOfEntitlementModel(
                theory_type=TheoryType.AGGRAVATION,
                rationale=f"Service demands permanently worsened the pre-service {condition} baseline.",
                evidence_required=["Entrance exam", "STR showing worsening", "Medical opinion quantifying aggravation"],
                cfr_reference=self.CFR_MAP[TheoryType.AGGRAVATION],
                confidence=65,
            )
        return None

    def _maybe_chronicity(self, evidence: List[str]) -> TheoryOfEntitlementModel | None:
        if len(evidence) >= 2:
            return TheoryOfEntitlementModel(
                theory_type=TheoryType.CHRONICITY,
                rationale="Multiple STR entries and current diagnosis show chronic, continuous symptoms.",
                evidence_required=["STR chronic complaints", "Post-service treatment records"],
                cfr_reference=self.CFR_MAP[TheoryType.CHRONICITY],
                confidence=70,
            )
        return None

    @staticmethod
    def _score(base: int, exposures: List[str], evidence: List[str]) -> float:
        modifier = (len(exposures) * 4) + (len(evidence) * 3)
        return min(95.0, base + modifier)
