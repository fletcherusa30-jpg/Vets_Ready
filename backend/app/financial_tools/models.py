"""
Financial Tools Data Models
Defines data structures for budget and retirement planning
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class IncomeSource(str, Enum):
    """Types of income sources"""
    EMPLOYMENT = "employment"
    VA_DISABILITY = "va_disability"
    VA_PENSION = "va_pension"
    MILITARY_RETIREMENT = "military_retirement"
    SOCIAL_SECURITY = "social_security"
    INVESTMENTS = "investments"
    OTHER = "other"


class ExpenseCategory(str, Enum):
    """Budget expense categories"""
    HOUSING = "housing"
    UTILITIES = "utilities"
    TRANSPORTATION = "transportation"
    FOOD = "food"
    HEALTHCARE = "healthcare"
    INSURANCE = "insurance"
    DEBT = "debt"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    SAVINGS = "savings"
    OTHER = "other"


@dataclass
class IncomeEntry:
    """Single income entry"""
    source: IncomeSource
    amount: float
    frequency: str  # monthly, annual, weekly, etc.
    is_recurring: bool = True
    notes: Optional[str] = None


@dataclass
class ExpenseEntry:
    """Single expense entry"""
    category: ExpenseCategory
    amount: float
    frequency: str  # monthly, annual, one-time, etc.
    is_recurring: bool = True
    notes: Optional[str] = None


@dataclass
class BudgetItem:
    """Budget item with actual vs planned"""
    category: ExpenseCategory
    planned_amount: float
    actual_amount: float = 0.0
    frequency: str = "monthly"
    notes: Optional[str] = None


@dataclass
class Budget:
    """Complete monthly/annual budget"""
    id: str
    user_id: str
    name: str
    period: str  # monthly, annual
    income_entries: List[IncomeEntry] = field(default_factory=list)
    expense_entries: List[ExpenseEntry] = field(default_factory=list)
    total_income: float = 0.0
    total_expenses: float = 0.0
    net_income: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    notes: str = ""


@dataclass
class RetirementInputs:
    """Retirement planning inputs"""
    id: str
    user_id: str
    current_age: int
    retirement_age: int
    life_expectancy: int = 90
    current_savings: float = 0.0
    annual_contribution: float = 0.0
    expected_return_rate: float = 0.07  # 7% average
    current_income: float = 0.0
    va_disability_income: float = 0.0
    social_security_estimate: float = 0.0
    military_retirement_income: float = 0.0
    inflation_rate: float = 0.03  # 3% average
    lifestyle_expenses: float = 0.0
    healthcare_expenses: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class RetirementProjection:
    """Retirement projection results"""
    id: str
    user_id: str
    retirement_age: int
    projected_savings_at_retirement: float
    annual_income_at_retirement: float
    annual_expenses_at_retirement: float
    shortfall_or_surplus: float
    years_savings_will_last: float
    confidence_level: str  # low, medium, high
    recommendations: List[str] = field(default_factory=list)
    generated_at: datetime = field(default_factory=datetime.now)
