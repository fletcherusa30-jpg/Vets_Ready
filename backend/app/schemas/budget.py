"""
Pydantic schemas for budget-related API requests and responses
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums (mirrored from database models)
class IncomeSourceTypeSchema(str, Enum):
    PRIMARY_EMPLOYMENT = "Primary Employment"
    SECONDARY_EMPLOYMENT = "Secondary Employment"
    VA_DISABILITY = "VA Disability Compensation"
    MILITARY_RETIREMENT = "Military Retirement"
    GI_BILL_HOUSING = "GI Bill Housing Allowance"
    INVESTMENTS = "Investments/Interest"
    FREELANCE = "Freelance/Side Gigs"
    OTHER = "Other"


class ExpenseCategorySchema(str, Enum):
    HOUSING = "Housing"
    UTILITIES = "Utilities"
    TRANSPORTATION = "Transportation"
    INSURANCE = "Insurance"
    HEALTHCARE = "Healthcare"
    GROCERIES = "Groceries"
    DINING = "Dining & Entertainment"
    SUBSCRIPTIONS = "Subscriptions"
    DEBT_PAYMENT = "Debt Payments"
    CHILDCARE = "Childcare"
    PERSONAL_CARE = "Personal Care"
    EDUCATION = "Education"
    CHARITY = "Charity/Donations"
    OTHER = "Other"


class GoalTypeSchema(str, Enum):
    EMERGENCY_FUND = "Emergency Fund"
    HOME_DOWN_PAYMENT = "Home Down Payment"
    VEHICLE = "Vehicle Purchase"
    EDUCATION = "Education"
    VACATION = "Vacation"
    RETIREMENT = "Retirement"
    DEBT_PAYOFF = "Debt Payoff"
    OTHER = "Other"


class GoalStatusSchema(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    ON_TRACK = "On Track"
    BEHIND = "Behind"
    COMPLETED = "Completed"


class BudgetStatusSchema(str, Enum):
    ACTIVE = "Active"
    PAUSED = "Paused"
    ARCHIVED = "Archived"


# Income Schemas
class IncomeSourceBase(BaseModel):
    source_type: IncomeSourceTypeSchema
    monthly_amount: Optional[float] = 0.0
    annual_amount: Optional[float] = 0.0
    description: Optional[str] = None
    is_irregular: bool = False

    @field_validator('monthly_amount', 'annual_amount')
    @classmethod
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amounts must be non-negative')
        return v


class IncomeSourceCreate(IncomeSourceBase):
    pass


class IncomeSourceUpdate(BaseModel):
    source_type: Optional[IncomeSourceTypeSchema] = None
    monthly_amount: Optional[float] = None
    annual_amount: Optional[float] = None
    description: Optional[str] = None
    is_irregular: Optional[bool] = None


class IncomeSourceResponse(IncomeSourceBase):
    id: int
    budget_profile_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseItemBase(BaseModel):
    category: ExpenseCategorySchema
    description: str
    monthly_amount: float
    is_debt_payment: bool = False

    @field_validator('monthly_amount')
    @classmethod
    def validate_amount(cls, v):
        if v < 0:
            raise ValueError('Amount must be non-negative')
        return v


class ExpenseItemCreate(ExpenseItemBase):
    pass


class ExpenseItemUpdate(BaseModel):
    category: Optional[ExpenseCategorySchema] = None
    description: Optional[str] = None
    monthly_amount: Optional[float] = None
    is_debt_payment: Optional[bool] = None


class ExpenseItemResponse(ExpenseItemBase):
    id: int
    budget_profile_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Savings Goal Schemas
class SavingsGoalBase(BaseModel):
    goal_type: GoalTypeSchema
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[datetime] = None
    priority: int = 5  # 1-10 scale

    @field_validator('target_amount', 'current_amount')
    @classmethod
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('Amounts must be non-negative')
        return v


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalUpdate(BaseModel):
    goal_type: Optional[GoalTypeSchema] = None
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    priority: Optional[int] = None


class SavingsGoalResponse(SavingsGoalBase):
    id: int
    budget_profile_id: int
    status: GoalStatusSchema
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Subscription Schemas
class SubscriptionItemBase(BaseModel):
    name: str
    monthly_cost: float
    usage_level: str  # High, Medium, Low, None
    billing_cycle: str  # Monthly, Quarterly, Annual
    auto_renew: bool = True
    cancellation_url: Optional[str] = None

    @field_validator('monthly_cost')
    @classmethod
    def validate_cost(cls, v):
        if v < 0:
            raise ValueError('Cost must be non-negative')
        return v


class SubscriptionItemCreate(SubscriptionItemBase):
    pass


class SubscriptionItemUpdate(BaseModel):
    name: Optional[str] = None
    monthly_cost: Optional[float] = None
    usage_level: Optional[str] = None
    billing_cycle: Optional[str] = None
    auto_renew: Optional[bool] = None
    cancellation_url: Optional[str] = None


class SubscriptionItemResponse(SubscriptionItemBase):
    id: int
    budget_profile_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Budget Profile Schemas
class BudgetProfileBase(BaseModel):
    monthly_income_total: float = 0.0
    monthly_expense_total: float = 0.0
    monthly_net_cashflow: float = 0.0
    savings_rate: float = 0.0
    status: BudgetStatusSchema = BudgetStatusSchema.ACTIVE

    @field_validator('monthly_income_total', 'monthly_expense_total')
    @classmethod
    def validate_amounts(cls, v):
        if v < 0:
            raise ValueError('Amounts must be non-negative')
        return v


class BudgetProfileCreate(BaseModel):
    pass  # Auto-populated from income/expenses


class BudgetProfileUpdate(BaseModel):
    status: Optional[BudgetStatusSchema] = None


class BudgetProfileResponse(BudgetProfileBase):
    id: int
    veteran_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Summary and Reporting Schemas
class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int


class BudgetSummaryResponse(BaseModel):
    budget_id: int
    monthly_income: float
    monthly_expenses: float
    net_cashflow: float
    savings_rate: float
    category_breakdown: List[CategoryBreakdown]
    active_goals: int
    total_goal_amount: float
    current_goal_progress: float
    active_subscriptions: int
    total_subscription_cost: float
    status: BudgetStatusSchema


class SpendingAlert(BaseModel):
    type: str
    severity: str  # critical, warning, info
    message: str
    amount: Optional[float] = None


class Recommendation(BaseModel):
    priority: str  # high, medium, low
    category: str
    title: str
    description: str
    potential_savings: Optional[float] = None
    action: str


class InsightsResponse(BaseModel):
    savings_rate: float
    spending_trend: str  # Increasing, Stable, Decreasing
    emergency_fund_months: float
    spending_alerts: List[SpendingAlert]
    category_insights: Dict[str, Any]
    subscription_waste: float
    recommendations: List[Recommendation]
    veteran_specific_insights: List[Dict[str, str]]


# Scenario Simulation Schemas
class ScenarioRequest(BaseModel):
    income_change: float = 0.0  # Absolute change
    expense_change: float = 0.0  # Absolute change
    description: Optional[str] = None


class GoalImpactProjection(BaseModel):
    goal_id: int
    goal_name: str
    months_to_completion: float
    projected_completion: datetime


class ScenarioResponse(BaseModel):
    scenario_description: str
    simulated_monthly_income: float
    simulated_monthly_expenses: float
    simulated_net_cashflow: float
    simulated_savings_rate: float
    vs_current: Dict[str, float]
    goal_impact: List[GoalImpactProjection]


# Error Schemas
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int
