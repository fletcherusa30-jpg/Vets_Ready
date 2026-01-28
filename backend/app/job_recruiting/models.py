"""
Job Recruiting Platform Data Models
Defines all data structures for job matching and recruiting
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class EmploymentType(str, Enum):
    """Type of employment"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERNSHIP = "internship"


class ExperienceLevel(str, Enum):
    """Required experience level"""
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    EXECUTIVE = "executive"


@dataclass
class Job:
    """Job posting"""
    id: str
    title: str
    company: str
    description: str
    location: str
    salary_range: Dict[str, float] = field(default_factory=dict)
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    experience_level: ExperienceLevel = ExperienceLevel.MID
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    certifications_required: List[str] = field(default_factory=list)
    related_mos_codes: List[str] = field(default_factory=list)
    posted_date: datetime = field(default_factory=datetime.now)
    application_deadline: Optional[datetime] = None
    remote_friendly: bool = False
    relocation_assistance: bool = False
    veteran_friendly: bool = False


@dataclass
class VeteranProfile:
    """Veteran candidate profile"""
    id: str
    user_id: str
    name: str
    service_branch: str
    separation_rank: str
    mos_codes: List[str] = field(default_factory=list)
    years_service: float = 0.0
    skills: List[str] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    geographic_preference: Optional[str] = None
    remote_preference: bool = False
    employment_type_preference: List[EmploymentType] = field(default_factory=list)
    salary_expectation: Dict[str, float] = field(default_factory=dict)
    transportation_assistance_needed: bool = False
    disability_rating: Optional[int] = None


@dataclass
class JobMatch:
    """Job match result with scoring"""
    job_id: str
    candidate_id: str
    match_score: float  # 0-100
    skill_match: float
    experience_match: float
    cultural_match: float
    matched_skills: List[str] = field(default_factory=list)
    missing_skills: List[str] = field(default_factory=list)
    matched_at: datetime = field(default_factory=datetime.now)


@dataclass
class CertificationPathway:
    """Certification pathway recommendation"""
    id: str
    certification_name: str
    mos_codes_required: List[str] = field(default_factory=list)
    difficulty_level: str = "intermediate"  # beginner, intermediate, advanced
    estimated_hours: int = 0
    cost: float = 0.0
    career_impact: str = ""
    prerequisites: List[str] = field(default_factory=list)
    resources: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class EmployerProfile:
    """Employer/company profile"""
    id: str
    name: str
    industry: str
    size: str  # startup, small, medium, large, enterprise
    veteran_hiring_program: bool = False
    military_spouse_friendly: bool = False
    disability_inclusion: bool = False
    remote_jobs_available: bool = False
    headquarters_location: str = ""
    website: Optional[str] = None
    contact_email: Optional[str] = None
