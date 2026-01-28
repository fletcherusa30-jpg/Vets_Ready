"""Pydantic schemas for retirement projection endpoints."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field, validator


class RetirementProjectionPayload(BaseModel):
    """Request payload for the retirement projection endpoint."""

    current_age: int = Field(..., ge=16, le=80)
    retirement_age: int = Field(..., ge=30, le=80)
    current_savings: float = Field(..., ge=0)
    monthly_contribution: float = Field(..., ge=0)
    expected_growth_rate: float = Field(7.0, ge=0, le=20, description="Annual growth rate in percent")
    inflation_rate: float = Field(2.5, ge=0, le=10, description="Annual inflation rate in percent")
    include_va_income: bool = Field(True, description="Toggle VA income streams")
    retirement_income_goal: Optional[float] = Field(None, ge=0, description="Monthly retirement income target")

    @validator("retirement_age")
    def validate_ages(cls, retirement_age: int, values: Dict[str, int]) -> int:
        current_age = values.get("current_age")
        if current_age is not None and retirement_age <= current_age:
            raise ValueError("retirement_age must be greater than current_age")
        return retirement_age


class RetirementChartPoint(BaseModel):
    age: int
    balance: float
    inflation_adjusted_balance: float


class ChartBar(BaseModel):
    label: str
    value: float


class ChartData(BaseModel):
    savings_growth: List[RetirementChartPoint]
    income_comparison: List[ChartBar]
    contribution_breakdown: List[ChartBar]


class VAIncomeSourceResponse(BaseModel):
    id: str
    name: str
    monthly_amount: float
    source_type: str


class BudgetContext(BaseModel):
    monthly_net_cashflow: float
    savings_rate: Optional[float]


class ProfileContext(BaseModel):
    veteran_id: str
    name: str
    service_branch: str
    disability_rating: int
    calculated_age: int


class GoalContext(BaseModel):
    monthly_goal: float
    goal_source: str


class RetirementProjectionResponse(BaseModel):
    projected_savings: float
    projected_savings_real: float
    monthly_retirement_income: float
    retirement_readiness_score: int
    readiness_band: str
    readiness_factors: Dict[str, float]
    goal_progress: float
    years_to_retirement: int
    years_covered: float
    shortfall_amount: float
    include_va_income: bool
    va_income_monthly: float
    va_income_sources: List[VAIncomeSourceResponse]
    status_message: str
    action_required: Optional[str]
    chart_data: ChartData
    insights: List[str]
    inputs_used: Dict[str, float]
    budget_context: BudgetContext
    profile_context: ProfileContext
    goal_context: GoalContext


class InvestmentAccountInput(BaseModel):
    """Input payload for individual investment accounts."""

    name: str
    balance: float = Field(..., ge=0)
    monthly_contribution: float = Field(..., ge=0)
    annual_growth_rate: float = Field(..., ge=0, le=20, description="Annualized return in percent")


class InvestmentAccountProjection(BaseModel):
    """Projected output per investment account."""

    name: str
    starting_balance: float
    monthly_contribution: float
    annual_growth_rate: float
    projected_balance: float
    inflation_adjusted_balance: float
    contribution_component: float
    current_component: float
    share_of_total: float


class IncomeStream(BaseModel):
    name: str
    monthly_amount: float


class RetirementBudgetSummary(BaseModel):
    projected_savings: float
    projected_savings_real: float
    monthly_income: float
    monthly_goal: float
    shortfall: float
    readiness_score: int
    readiness_band: str
    goal_progress: float


class RetirementBudgetChart(BaseModel):
    savings_curve: List[RetirementChartPoint]
    income_mix: List[ChartBar]


class RetirementBudgetRequest(BaseModel):
    current_age: int = Field(..., ge=16, le=80)
    retirement_age: int = Field(..., ge=30, le=80)
    inflation_rate: float = Field(2.5, ge=0, le=10)
    retirement_income_goal: float = Field(..., ge=0)
    accounts: List[InvestmentAccountInput]
    va_disability_income: float = Field(0.0, ge=0)
    military_retirement_income: float = Field(0.0, ge=0)
    social_security_income: float = Field(0.0, ge=0)
    monthly_budget_surplus: Optional[float] = None
    savings_rate: Optional[float] = None

    @validator("retirement_age")
    def validate_budget_ages(cls, retirement_age: int, values: Dict[str, int]) -> int:
        current_age = values.get("current_age")
        if current_age is not None and retirement_age <= current_age:
            raise ValueError("retirement_age must be greater than current_age")
        return retirement_age

    @validator("accounts")
    def validate_accounts(cls, accounts: List[InvestmentAccountInput]) -> List[InvestmentAccountInput]:
        if not accounts:
            raise ValueError("At least one investment account is required")
        return accounts


class RetirementBudgetResponse(BaseModel):
    veteran_id: str
    years_to_retirement: int
    summary: RetirementBudgetSummary
    accounts: List[InvestmentAccountProjection]
    income_streams: List[IncomeStream]
    budget_link: BudgetContext
    chart_data: RetirementBudgetChart
    insights: List[str]
    goals: List[str]
