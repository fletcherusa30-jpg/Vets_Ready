"""
SQLAlchemy Database Models
Defines all ORM models for VetsReady platform persistence
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


# Enums
class ServiceBranch(str, enum.Enum):
    ARMY = "Army"
    NAVY = "Navy"
    AIR_FORCE = "Air Force"
    MARINES = "Marines"
    COAST_GUARD = "Coast Guard"
    SPACE_FORCE = "Space Force"


class DischargeStatus(str, enum.Enum):
    HONORABLE = "Honorable"
    GENERAL = "General"
    OTHER = "Other"
    BAD_CONDUCT = "Bad Conduct"
    DISHONORABLE = "Dishonorable"


class JobMatchStatus(str, enum.Enum):
    PERFECT = "Perfect"
    STRONG = "Strong"
    MODERATE = "Moderate"
    WEAK = "Weak"


class BudgetStatus(str, enum.Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    ARCHIVED = "Archived"


class IncomeSourceType(str, enum.Enum):
    BASE_PAY = "Base Pay"
    VA_DISABILITY = "VA Disability Compensation"
    MILITARY_RETIREMENT = "Military Retirement"
    GI_BILL_HOUSING = "GI Bill Housing"
    SIDE_INCOME = "Side Income"
    BUSINESS = "Business/Self-Employment"
    INVESTMENTS = "Investments/Dividends"
    OTHER = "Other"


class ExpenseCategoryType(str, enum.Enum):
    HOUSING = "Housing"
    UTILITIES = "Utilities"
    FOOD = "Food & Groceries"
    TRANSPORTATION = "Transportation"
    HEALTHCARE = "Healthcare & Medical"
    INSURANCE = "Insurance"
    DEBT_PAYMENT = "Debt Payments"
    SUBSCRIPTIONS = "Subscriptions"
    ENTERTAINMENT = "Entertainment"
    EDUCATION = "Education & Training"
    PERSONAL = "Personal Care"
    SAVINGS = "Savings & Investments"
    TAXES = "Taxes & Deductions"
    OTHER = "Other"


class GoalType(str, enum.Enum):
    EMERGENCY_FUND = "Emergency Fund"
    DEBT_PAYOFF = "Debt Payoff"
    HOME_PURCHASE = "Home Purchase"
    EDUCATION = "Education/Training"
    BUSINESS = "Business Startup"
    RETIREMENT = "Retirement Savings"
    VACATION = "Vacation"
    VEHICLE = "Vehicle Purchase"
    OTHER = "Other"


class GoalStatus(str, enum.Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    PAUSED = "Paused"
    ABANDONED = "Abandoned"


# Veteran Profile
class Veteran(Base):
    """Veteran profile and service record"""
    __tablename__ = "veterans"

    id = Column(String, primary_key=True)  # VET_001
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime, nullable=False)

    # Service Information
    service_branch = Column(SQLEnum(ServiceBranch), nullable=False)
    separation_rank = Column(String(50), nullable=False)
    years_service = Column(Float, nullable=False)
    separation_date = Column(DateTime, nullable=False)
    discharge_status = Column(SQLEnum(DischargeStatus), default=DischargeStatus.HONORABLE)

    # Disability
    disability_rating = Column(Integer, default=0)  # 0-100 percent

    # Profile Status
    profile_complete = Column(Boolean, default=False)
    profile_background_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service_records = relationship("ServiceRecord", back_populates="veteran", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="veteran", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="veteran", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="veteran", cascade="all, delete-orphan")
    training_records = relationship("TrainingRecord", back_populates="veteran", cascade="all, delete-orphan")
    budget_profile = relationship("BudgetProfile", back_populates="veteran", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Veteran {self.id}: {self.first_name} {self.last_name}>"


# Service Record (DD214)
class ServiceRecord(Base):
    """Service record data extracted from DD214"""
    __tablename__ = "service_records"

    id = Column(String, primary_key=True)  # SR_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)
    dd214_file_path = Column(String, nullable=True)

    # Extracted Data
    mos_codes = Column(JSON, default=list)  # ["11B", "12A"]
    awards = Column(JSON, default=list)  # List of award dicts
    deployments = Column(JSON, default=list)  # List of deployment dicts

    # Processing
    processed = Column(Boolean, default=False)
    confidence_score = Column(Float, nullable=True)  # 0.0-1.0
    extraction_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    veteran = relationship("Veteran", back_populates="service_records")

    def __repr__(self):
        return f"<ServiceRecord {self.id}>"


# Training Records
class TrainingRecord(Base):
    """Military training coursework"""
    __tablename__ = "training_records"

    id = Column(String, primary_key=True)  # TRAIN_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)

    course_name = Column(String(200), nullable=False)
    course_code = Column(String(50), nullable=False)
    provider = Column(String(200), nullable=False)
    completion_date = Column(DateTime, nullable=False)
    duration_hours = Column(Integer, nullable=False)
    grade = Column(String(10), nullable=True)
    certification_awarded = Column(String(200), nullable=True)
    certification_number = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    veteran = relationship("Veteran", back_populates="training_records")

    def __repr__(self):
        return f"<TrainingRecord {self.id}>"


# Certificate
class Certificate(Base):
    """Professional certifications"""
    __tablename__ = "certificates"

    id = Column(String, primary_key=True)  # CERT_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)

    certificate_name = Column(String(200), nullable=False)
    issuing_organization = Column(String(200), nullable=False)
    issue_date = Column(DateTime, nullable=False)
    expiration_date = Column(DateTime, nullable=True)
    credential_number = Column(String(100), nullable=True)
    status = Column(String(20), default="active")  # active, expired

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Certificate {self.id}>"


# Resume
class Resume(Base):
    """Generated veteran resume"""
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)  # RES_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)

    version = Column(String(50), default="original")  # original, tailored_tech, etc
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    experience_items = Column(JSON, default=list)  # List of experience dicts
    skills = Column(JSON, default=list)  # List of skills
    certifications = Column(JSON, default=list)  # List of certifications

    file_path = Column(String, nullable=True)  # Path to PDF/DOCX
    generated_timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    veteran = relationship("Veteran", back_populates="resumes")

    def __repr__(self):
        return f"<Resume {self.id}>"


# Job Listing
class JobListing(Base):
    """Job opportunity listing"""
    __tablename__ = "job_listings"

    id = Column(String, primary_key=True)  # JOB_001
    employer_id = Column(String, ForeignKey("employers.id"), nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(200), nullable=False)
    remote = Column(Boolean, default=False)

    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)

    required_skills = Column(JSON, default=list)  # List of skills
    ideal_mos = Column(JSON, default=list)  # List of MOS codes

    posted_date = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

    # Relationships
    employer = relationship("Employer", back_populates="job_listings")
    job_matches = relationship("JobMatch", back_populates="job_listing", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<JobListing {self.id}>"


# Job Match
class JobMatch(Base):
    """Job matching result"""
    __tablename__ = "job_matches"

    id = Column(String, primary_key=True)  # MATCH_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)
    job_listing_id = Column(String, ForeignKey("job_listings.id"), nullable=False)

    overall_score = Column(Float, nullable=False)  # 0.0-1.0
    skill_match = Column(Float, nullable=False)
    experience_match = Column(Float, nullable=False)
    cultural_match = Column(Float, nullable=False)

    match_status = Column(SQLEnum(JobMatchStatus), default=JobMatchStatus.MODERATE)

    viewed = Column(Boolean, default=False)
    applied = Column(Boolean, default=False)
    hired = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    veteran = relationship("Veteran", back_populates="job_matches")
    job_listing = relationship("JobListing", back_populates="job_matches")

    def __repr__(self):
        return f"<JobMatch {self.id}>"


# Employer
class Employer(Base):
    """Employer company profile"""
    __tablename__ = "employers"

    id = Column(String, primary_key=True)  # EMP_001
    name = Column(String(200), unique=True, nullable=False)
    industry = Column(String(100), nullable=False)

    veteran_hiring_percentage = Column(Float, default=0)
    vet_friendly_status = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

    headquarters = Column(String(200), nullable=True)
    founded_year = Column(Integer, nullable=True)
    employee_count = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job_listings = relationship("JobListing", back_populates="employer", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Employer {self.id}>"


# Budget
class Budget(Base):
    """Veteran financial budget"""
    __tablename__ = "budgets"

    id = Column(String, primary_key=True)  # BUDGET_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)

    month_year = Column(String(7), nullable=False)  # "2024-01"
    status = Column(SQLEnum(BudgetStatus), default=BudgetStatus.DRAFT)

    # Income
    employment_income = Column(Float, default=0)
    va_disability_income = Column(Float, default=0)
    military_retirement_income = Column(Float, default=0)
    other_income = Column(Float, default=0)
    total_income = Column(Float, default=0)

    # Expenses
    housing_expense = Column(Float, default=0)
    utilities_expense = Column(Float, default=0)
    food_expense = Column(Float, default=0)
    transportation_expense = Column(Float, default=0)
    healthcare_expense = Column(Float, default=0)
    other_expense = Column(Float, default=0)
    total_expenses = Column(Float, default=0)

    # Summary
    net_income = Column(Float, default=0)
    savings_rate = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    veteran = relationship("Veteran", back_populates="budgets")
    income_entries = relationship("IncomeEntry", back_populates="budget", cascade="all, delete-orphan")
    expense_entries = relationship("ExpenseEntry", back_populates="budget", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Budget {self.id}>"


# Income Entry
class IncomeEntry(Base):
    """Individual income entry"""
    __tablename__ = "income_entries"

    id = Column(String, primary_key=True)  # INC_001
    budget_id = Column(String, ForeignKey("budgets.id"), nullable=False)

    source = Column(String(100), nullable=False)  # employment, va_disability, etc
    amount = Column(Float, nullable=False)
    frequency = Column(String(20), default="monthly")  # monthly, annual, etc

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    budget = relationship("Budget", back_populates="income_entries")

    def __repr__(self):
        return f"<IncomeEntry {self.id}>"


# Expense Entry
class ExpenseEntry(Base):
    """Individual expense entry"""
    __tablename__ = "expense_entries"

    id = Column(String, primary_key=True)  # EXP_001
    budget_id = Column(String, ForeignKey("budgets.id"), nullable=False)

    category = Column(String(100), nullable=False)  # housing, food, etc
    amount = Column(Float, nullable=False)
    frequency = Column(String(20), default="monthly")
    notes = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    budget = relationship("Budget", back_populates="expense_entries")

    def __repr__(self):
        return f"<ExpenseEntry {self.id}>"


# Retirement Plan
class RetirementPlan(Base):
    """Veteran retirement projection"""
    __tablename__ = "retirement_plans"

    id = Column(String, primary_key=True)  # RETIRE_001
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)

    current_age = Column(Integer, nullable=False)
    retirement_age = Column(Integer, nullable=False)

    current_savings = Column(Float, nullable=False)
    monthly_contribution = Column(Float, nullable=False)
    annual_return_percent = Column(Float, default=7.0)
    inflation_percent = Column(Float, default=3.0)

    # Projections
    projected_retirement_balance = Column(Float, nullable=True)
    projected_monthly_income = Column(Float, nullable=True)
    years_to_retirement = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<RetirementPlan {self.id}>"


# Organization (Reference)
class Organization(Base):
    """Reference organization data"""
    __tablename__ = "organizations"

    id = Column(String, primary_key=True)
    name = Column(String(200), nullable=False)
    organization_type = Column(String(100), nullable=False)  # government, nonprofit, corporate

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Organization {self.id}>"


# Condition (Reference)
class Condition(Base):
    """Medical condition reference"""
    __tablename__ = "conditions"

    id = Column(String, primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)  # ICD-10 code
    va_rating_code = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Condition {self.id}>"


# ============================================================================
# BUDGET MODELS
# ============================================================================

class BudgetProfile(Base):
    """Veteran's budget profile and financial snapshot"""
    __tablename__ = "budget_profiles"

    id = Column(String, primary_key=True)
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)
    status = Column(SQLEnum(BudgetStatus), default=BudgetStatus.DRAFT, nullable=False)

    # Monthly totals
    monthly_income_total = Column(Float, default=0.0)
    monthly_expense_total = Column(Float, default=0.0)
    monthly_net_cashflow = Column(Float, default=0.0)
    savings_rate = Column(Float, default=0.0)  # 0-100 percentage

    # Metadata
    currency = Column(String(3), default="USD")
    fiscal_year_start = Column(String(10), default="01-01")  # MM-DD format
    last_calculated = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    veteran = relationship("Veteran", back_populates="budget_profile")
    income_sources = relationship("IncomeSource", back_populates="budget_profile", cascade="all, delete-orphan")
    expense_items = relationship("ExpenseItem", back_populates="budget_profile", cascade="all, delete-orphan")
    goals = relationship("SavingsGoal", back_populates="budget_profile", cascade="all, delete-orphan")
    subscriptions = relationship("SubscriptionItem", back_populates="budget_profile", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BudgetProfile {self.id}>"


class IncomeSource(Base):
    """Income source for budget"""
    __tablename__ = "income_sources"

    id = Column(String, primary_key=True)
    budget_profile_id = Column(String, ForeignKey("budget_profiles.id"), nullable=False)

    name = Column(String(200), nullable=False)
    source_type = Column(SQLEnum(IncomeSourceType), nullable=False)
    monthly_amount = Column(Float, nullable=False)

    # For irregular income
    is_irregular = Column(Boolean, default=False)
    frequency_months = Column(Integer, default=1)  # e.g., quarterly = 3
    annual_amount = Column(Float, nullable=True)

    # Metadata
    is_verified = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    budget_profile = relationship("BudgetProfile", back_populates="income_sources")

    def __repr__(self):
        return f"<IncomeSource {self.id}>"


class ExpenseItem(Base):
    """Individual expense in budget"""
    __tablename__ = "expense_items"

    id = Column(String, primary_key=True)
    budget_profile_id = Column(String, ForeignKey("budget_profiles.id"), nullable=False)

    name = Column(String(200), nullable=False)
    category = Column(SQLEnum(ExpenseCategoryType), nullable=False)
    monthly_amount = Column(Float, nullable=False)

    # Classification
    is_fixed = Column(Boolean, default=False)  # Fixed vs variable
    is_recurring = Column(Boolean, default=True)

    # For debt payments
    is_debt_payment = Column(Boolean, default=False)
    debt_type = Column(String(50), nullable=True)  # e.g., "Credit Card", "Student Loan"
    principal_amount = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)

    # Metadata
    notes = Column(Text, nullable=True)
    alert_threshold = Column(Float, nullable=True)  # Alert if exceeds this

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    budget_profile = relationship("BudgetProfile", back_populates="expense_items")

    def __repr__(self):
        return f"<ExpenseItem {self.id}>"


class SavingsGoal(Base):
    """Savings or financial goal"""
    __tablename__ = "savings_goals"

    id = Column(String, primary_key=True)
    budget_profile_id = Column(String, ForeignKey("budget_profiles.id"), nullable=False)

    name = Column(String(200), nullable=False)
    goal_type = Column(SQLEnum(GoalType), nullable=False)
    status = Column(SQLEnum(GoalStatus), default=GoalStatus.ACTIVE)

    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    suggested_monthly_contribution = Column(Float, nullable=True)

    # Timeline
    target_date = Column(DateTime, nullable=True)
    projected_completion_date = Column(DateTime, nullable=True)

    # Priority
    priority = Column(Integer, default=3)  # 1 = highest, 5 = lowest
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    budget_profile = relationship("BudgetProfile", back_populates="goals")

    def __repr__(self):
        return f"<SavingsGoal {self.id}>"


class SubscriptionItem(Base):
    """Monthly subscription tracking"""
    __tablename__ = "subscription_items"

    id = Column(String, primary_key=True)
    budget_profile_id = Column(String, ForeignKey("budget_profiles.id"), nullable=False)

    name = Column(String(200), nullable=False)
    provider = Column(String(200), nullable=True)
    monthly_cost = Column(Float, nullable=False)

    # Details
    category = Column(String(100), nullable=True)  # e.g., "Streaming", "Software", "Gym"
    billing_date = Column(Integer, nullable=True)  # Day of month (1-31)
    auto_renewal = Column(Boolean, default=True)

    # Usage tracking
    usage_level = Column(String(50), nullable=True)  # "High", "Medium", "Low", "None"
    is_essential = Column(Boolean, default=False)
    cancellation_url = Column(String(500), nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    budget_profile = relationship("BudgetProfile", back_populates="subscriptions")

    def __repr__(self):
        return f"<SubscriptionItem {self.id}>"


class InsightsReport(Base):
    """Generated financial insights and recommendations"""
    __tablename__ = "insights_reports"

    id = Column(String, primary_key=True)
    budget_profile_id = Column(String, ForeignKey("budget_profiles.id"), nullable=False)

    # Metrics
    savings_rate = Column(Float, default=0.0)
    spending_trend = Column(String(50), nullable=True)  # "Increasing", "Stable", "Decreasing"
    emergency_fund_months = Column(Float, nullable=True)  # Months of expenses covered

    # Alerts and insights (stored as JSON)
    spending_alerts = Column(JSON, nullable=True)  # List of alerts
    category_insights = Column(JSON, nullable=True)  # Category analysis
    subscription_waste = Column(Float, default=0.0)  # Estimated unused subscriptions
    recommendations = Column(JSON, nullable=True)  # List of recommendations
    veteran_specific_insights = Column(JSON, nullable=True)  # VA/military specific tips

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<InsightsReport {self.id}>"


# Document Vault (Uploaded Documents)
class DocumentVault(Base):
    """Storage and metadata for uploaded military documents"""
    __tablename__ = "document_vault"

    id = Column(String, primary_key=True)  # Unique file ID
    veteran_id = Column(String, ForeignKey("veterans.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String, nullable=False)

    # Document classification
    document_type = Column(String(50), nullable=False)  # DD214, STR, Rating, etc.
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Extracted data
    extracted_data = Column(JSON, nullable=True)  # DD214 fields, ratings, etc.
    doc_metadata = Column(JSON, nullable=True)  # Confidence, extraction source, etc.

    # Audit trail
    processed = Column(Boolean, default=False)
    processing_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<DocumentVault {self.id}: {self.file_name}>"

