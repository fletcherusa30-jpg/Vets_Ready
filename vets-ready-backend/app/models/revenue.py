"""
REVENUE ENGINE DATA MODELS

Complete data model definitions for the Revenue Engine system.
Includes all entities for tracking revenue streams, events, partners, and enterprise leads.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


# ==================== ENUMS ====================

class RevenueStreamType(str, Enum):
    """Types of revenue streams"""
    SUBSCRIPTION = "Subscription"
    AFFILIATE = "Affiliate"
    SPONSORED = "Sponsored"
    MARKETPLACE = "Marketplace"
    ENTERPRISE = "Enterprise"
    API_USAGE = "API Usage"
    INSIGHTS = "Insights"
    EVENTS = "Events"
    DISCOUNT_PREMIUM = "Discount Premium"


class StreamStatus(str, Enum):
    """Revenue stream statuses"""
    ACTIVE = "Active"
    PAUSED = "Paused"
    EXPERIMENTAL = "Experimental"
    DISCONTINUED = "Discontinued"


class PartnerStatus(str, Enum):
    """Partner statuses"""
    PENDING = "Pending"
    APPROVED = "Approved"
    ACTIVE = "Active"
    PAUSED = "Paused"
    REJECTED = "Rejected"
    SUSPENDED = "Suspended"


class EnterpriseLeadType(str, Enum):
    """Types of enterprise leads"""
    STATE_VA = "State VA"
    VSO = "VSO"
    NONPROFIT = "Nonprofit"
    UNIVERSITY = "University"
    EMPLOYER = "Employer"
    AGENCY = "Agency"


class EnterpriseStage(str, Enum):
    """Enterprise lead pipeline stages"""
    IDENTIFIED = "Identified"
    RESEARCHED = "Researched"
    CONTACTED = "Contacted"
    DISCOVERY_CALL = "Discovery Call"
    DEMO_SCHEDULED = "Demo Scheduled"
    DEMO_COMPLETED = "Demo Completed"
    PROPOSAL_SENT = "Proposal Sent"
    NEGOTIATION = "Negotiation"
    CONTRACT_REVIEW = "Contract Review"
    CLOSED_WON = "Closed-Won"
    CLOSED_LOST = "Closed-Lost"


class LeadSource(str, Enum):
    """Sources of enterprise leads"""
    AUTO_DETECTED = "Auto-Detected"
    REFERRAL = "Referral"
    MANUAL = "Manual"
    INBOUND = "Inbound"


# ==================== DATABASE MODELS ====================

class RevenueEvent(Base):
    """Revenue event tracking - every revenue-generating action"""
    __tablename__ = "revenue_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    stream_type = Column(SQLEnum(RevenueStreamType), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    source_module = Column(String, nullable=True, index=True)  # Employment, Education, Housing, etc.
    partner_id = Column(String, nullable=True, index=True)
    organization_id = Column(String, nullable=True, index=True)
    veteran_id = Column(String, nullable=True, index=True)  # Anonymized where required
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RevenueStream(Base):
    """Revenue stream configuration and tracking"""
    __tablename__ = "revenue_streams"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True, index=True)
    type = Column(SQLEnum(RevenueStreamType), nullable=False, index=True)
    status = Column(SQLEnum(StreamStatus), nullable=False, default=StreamStatus.EXPERIMENTAL, index=True)
    description = Column(Text, nullable=True)
    configuration = Column(JSON, nullable=True)  # Stream-specific settings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    activated_at = Column(DateTime, nullable=True)
    deactivated_at = Column(DateTime, nullable=True)


class Partner(Base):
    """Partner/affiliate tracking"""
    __tablename__ = "partners"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # Education, Employment, Housing, etc.
    status = Column(SQLEnum(PartnerStatus), nullable=False, default=PartnerStatus.PENDING, index=True)
    website = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    region = Column(String, nullable=True, index=True)
    partnership_type = Column(String, nullable=True)  # Affiliate, Sponsored, Marketplace, etc.
    terms = Column(JSON, nullable=True)  # Revenue share, placement rules, tracking params
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String, nullable=True)


class EnterpriseLead(Base):
    """Enterprise licensing leads"""
    __tablename__ = "enterprise_leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_name = Column(String, nullable=False, index=True)
    type = Column(SQLEnum(EnterpriseLeadType), nullable=False, index=True)
    region = Column(String, nullable=False, index=True)
    stage = Column(SQLEnum(EnterpriseStage), nullable=False, default=EnterpriseStage.IDENTIFIED, index=True)
    source = Column(SQLEnum(LeadSource), nullable=False, default=LeadSource.AUTO_DETECTED, index=True)
    estimated_value = Column(Float, nullable=True)
    probability = Column(Integer, nullable=True)  # 0-100
    veteran_population = Column(Integer, nullable=True)
    usage_indicators = Column(JSON, nullable=True)  # Platform usage data
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    next_action = Column(String, nullable=True)
    next_action_date = Column(DateTime, nullable=True)
    assigned_owner = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    closed_reason = Column(Text, nullable=True)


class RevenueAlert(Base):
    """Revenue system alerts and suggestions"""
    __tablename__ = "revenue_alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False, index=True)  # opportunity, performance, system
    severity = Column(String, nullable=False, index=True)  # high, medium, low
    description = Column(Text, nullable=False)
    impact = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String, default="pending", index=True)  # pending, accepted, dismissed, snoozed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)


class RevenueLog(Base):
    """Audit trail for revenue system actions"""
    __tablename__ = "revenue_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    actor = Column(String, nullable=False, index=True)  # 'System' or 'User:{name}'
    action = Column(String, nullable=False, index=True)
    target = Column(String, nullable=False)
    target_id = Column(String, nullable=True, index=True)
    result = Column(String, nullable=False)  # Success, Failed, Pending
    details = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)


# ==================== PYDANTIC SCHEMAS ====================

class RevenueEventCreate(BaseModel):
    """Schema for creating a revenue event"""
    stream_type: RevenueStreamType
    amount: float
    currency: str = "USD"
    source_module: Optional[str] = None
    partner_id: Optional[str] = None
    organization_id: Optional[str] = None
    veteran_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class RevenueEventResponse(BaseModel):
    """Schema for revenue event response"""
    id: str
    timestamp: datetime
    stream_type: RevenueStreamType
    amount: float
    currency: str
    source_module: Optional[str]
    partner_id: Optional[str]
    organization_id: Optional[str]
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class RevenueStreamCreate(BaseModel):
    """Schema for creating a revenue stream"""
    name: str
    type: RevenueStreamType
    status: StreamStatus = StreamStatus.EXPERIMENTAL
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None


class RevenueStreamUpdate(BaseModel):
    """Schema for updating a revenue stream"""
    name: Optional[str] = None
    status: Optional[StreamStatus] = None
    description: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None


class RevenueStreamResponse(BaseModel):
    """Schema for revenue stream response"""
    id: str
    name: str
    type: RevenueStreamType
    status: StreamStatus
    description: Optional[str]
    configuration: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    activated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PartnerCreate(BaseModel):
    """Schema for creating a partner"""
    name: str
    category: str
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    region: Optional[str] = None
    partnership_type: Optional[str] = None
    terms: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PartnerUpdate(BaseModel):
    """Schema for updating a partner"""
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[PartnerStatus] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    region: Optional[str] = None
    partnership_type: Optional[str] = None
    terms: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PartnerResponse(BaseModel):
    """Schema for partner response"""
    id: str
    name: str
    category: str
    status: PartnerStatus
    website: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    region: Optional[str]
    partnership_type: Optional[str]
    terms: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True


class EnterpriseLeadCreate(BaseModel):
    """Schema for creating an enterprise lead"""
    organization_name: str
    type: EnterpriseLeadType
    region: str
    source: LeadSource = LeadSource.MANUAL
    estimated_value: Optional[float] = None
    probability: Optional[int] = None
    veteran_population: Optional[int] = None
    usage_indicators: Optional[Dict[str, Any]] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    assigned_owner: Optional[str] = None


class EnterpriseLeadUpdate(BaseModel):
    """Schema for updating an enterprise lead"""
    organization_name: Optional[str] = None
    type: Optional[EnterpriseLeadType] = None
    region: Optional[str] = None
    stage: Optional[EnterpriseStage] = None
    estimated_value: Optional[float] = None
    probability: Optional[int] = None
    veteran_population: Optional[int] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    assigned_owner: Optional[str] = None


class EnterpriseLeadResponse(BaseModel):
    """Schema for enterprise lead response"""
    id: str
    organization_name: str
    type: EnterpriseLeadType
    region: str
    stage: EnterpriseStage
    source: LeadSource
    estimated_value: Optional[float]
    probability: Optional[int]
    veteran_population: Optional[int]
    usage_indicators: Optional[Dict[str, Any]]
    contact_name: Optional[str]
    contact_email: Optional[str]
    notes: Optional[str]
    next_action: Optional[str]
    next_action_date: Optional[datetime]
    assigned_owner: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime]

    class Config:
        from_attributes = True


class RevenueSummary(BaseModel):
    """Schema for revenue summary"""
    total_ytd: float
    total_30_days: float
    total_7_days: float
    active_streams: int
    pending_opportunities: int
    enterprise_leads: int
    avg_conversion_rate: float
    by_stream: Dict[str, float]
    top_partners: list
    trends: Dict[str, str]


class AlertCreate(BaseModel):
    """Schema for creating an alert"""
    type: str
    severity: str
    description: str
    impact: Optional[str] = None
    recommended_action: Optional[str] = None


class AlertResponse(BaseModel):
    """Schema for alert response"""
    id: str
    type: str
    severity: str
    description: str
    impact: Optional[str]
    recommended_action: Optional[str]
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class LogCreate(BaseModel):
    """Schema for creating a log entry"""
    actor: str
    action: str
    target: str
    target_id: Optional[str] = None
    result: str
    details: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LogResponse(BaseModel):
    """Schema for log response"""
    id: str
    timestamp: datetime
    actor: str
    action: str
    target: str
    target_id: Optional[str]
    result: str
    details: Optional[str]
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True
