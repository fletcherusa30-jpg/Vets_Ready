"""
Resume Builder Data Models
Defines all data structures for resume generation and management
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


@dataclass
class ExperienceItem:
    """Single experience entry"""
    id: str
    title: str
    organization: str
    start_date: str  # ISO format YYYY-MM-DD
    end_date: Optional[str] = None
    current: bool = False
    description: str = ""
    achievements: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    mos_codes: List[str] = field(default_factory=list)


@dataclass
class MOSMapping:
    """MOS to civilian job mapping"""
    mos_code: str
    mos_title: str
    civilian_job_titles: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)


@dataclass
class Resume:
    """Complete resume document"""
    id: str
    user_id: str
    title: str
    summary: str
    experience: List[ExperienceItem] = field(default_factory=list)
    education: List[Dict[str, Any]] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    certifications: List[Dict[str, Any]] = field(default_factory=list)
    contact_info: Dict[str, str] = field(default_factory=dict)
    custom_sections: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    version: int = 1


@dataclass
class ResumeTailoringRequest:
    """Request to tailor resume for specific job"""
    resume_id: str
    job_description: str
    target_job_title: str
    keywords: List[str] = field(default_factory=list)


@dataclass
class AchievementGeneratorRequest:
    """Request to generate achievement statements"""
    experience_id: str
    role_description: str
    key_metrics: List[str] = field(default_factory=list)
    impact_area: Optional[str] = None


@dataclass
class AchievementGeneratorResponse:
    """Generated achievement statements"""
    achievements: List[str] = field(default_factory=list)
    metrics_incorporated: List[str] = field(default_factory=list)
    confidence_score: float = 0.0
