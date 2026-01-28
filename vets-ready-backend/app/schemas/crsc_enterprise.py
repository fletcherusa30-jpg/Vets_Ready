from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class CombatCategoryCounts(BaseModel):
    armedConflict: int = 0
    hazardousService: int = 0
    simulatedWar: int = 0
    instrumentalityOfWar: int = 0
    purpleHeart: int = 0


class CrscAnalyticsEvent(BaseModel):
    cohortId: str
    timestamp: str
    eligibilityStatus: str
    combatRelatedPercentage: float
    evidenceStrength: str
    crscPayableEstimate: float
    retirementImpactScore: float
    combatCategoryCounts: CombatCategoryCounts
    branch: Optional[str] = None
    installation: Optional[str] = None
    version: str = Field(default="v1")


class CrscAnalyticsSummary(BaseModel):
    eligibilityDistribution: Dict[str, int]
    combatCategoryBreakdown: Dict[str, int]
    evidenceStrengthDistribution: Dict[str, int]
    payableRangeDistribution: List[Dict[str, str | int]]
    retirementImpactTrend: List[Dict[str, str | float]]


class CrscCohortMetric(BaseModel):
    cohortId: str
    eligibilityDistribution: Dict[str, int]
    combatCategoryBreakdown: Dict[str, int]
    evidenceStrengthDistribution: Dict[str, int]
    payableRangeDistribution: List[Dict[str, str | int]]
    retirementImpactTrend: List[Dict[str, str | float]]


class CrscTrendPoint(BaseModel):
    period: str
    eligibilityLikely: int = 0
    eligibilityUnclear: int = 0
    averageImpact: float = 0


class CrscEventsResponse(BaseModel):
    events: List[CrscAnalyticsEvent]
    page: int
    per_page: int
    total: int
