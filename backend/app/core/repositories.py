"""
Repository Pattern - Data Access Layer
Abstracts database operations for all models
"""

from typing import List, Optional, TypeVar, Generic
from sqlalchemy.orm import Session
from backend.app.models.database import (
    Veteran, ServiceRecord, TrainingRecord, Certificate, Resume,
    JobListing, JobMatch, Employer, Budget, IncomeEntry, ExpenseEntry,
    RetirementPlan, Organization, Condition
)

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """Generic repository for common CRUD operations"""

    def __init__(self, db: Session, model_class):
        self.db = db
        self.model_class = model_class

    def get_by_id(self, id: str) -> Optional[T]:
        """Get record by ID"""
        return self.db.query(self.model_class).filter(
            self.model_class.id == id
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Get all records with pagination"""
        return self.db.query(self.model_class).offset(skip).limit(limit).all()

    def create(self, obj: T) -> T:
        """Create new record"""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, id: str, **kwargs) -> Optional[T]:
        """Update record"""
        obj = self.get_by_id(id)
        if obj:
            for key, value in kwargs.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)
            self.db.commit()
            self.db.refresh(obj)
        return obj

    def delete(self, id: str) -> bool:
        """Delete record"""
        obj = self.get_by_id(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False


# Veteran Repository
class VeteranRepository(BaseRepository[Veteran]):
    def __init__(self, db: Session):
        super().__init__(db, Veteran)

    def get_by_email(self, email: str) -> Optional[Veteran]:
        """Get veteran by email"""
        return self.db.query(Veteran).filter(Veteran.email == email).first()

    def get_by_service_branch(self, branch: str) -> List[Veteran]:
        """Get veterans by service branch"""
        return self.db.query(Veteran).filter(
            Veteran.service_branch == branch
        ).all()

    def get_disabled_veterans(self) -> List[Veteran]:
        """Get veterans with disability rating > 0"""
        return self.db.query(Veteran).filter(
            Veteran.disability_rating > 0
        ).all()


# Service Record Repository
class ServiceRecordRepository(BaseRepository[ServiceRecord]):
    def __init__(self, db: Session):
        super().__init__(db, ServiceRecord)

    def get_by_veteran(self, veteran_id: str) -> List[ServiceRecord]:
        """Get all service records for a veteran"""
        return self.db.query(ServiceRecord).filter(
            ServiceRecord.veteran_id == veteran_id
        ).all()

    def get_unprocessed(self) -> List[ServiceRecord]:
        """Get unprocessed records"""
        return self.db.query(ServiceRecord).filter(
            ServiceRecord.processed == False
        ).all()


# Training Record Repository
class TrainingRecordRepository(BaseRepository[TrainingRecord]):
    def __init__(self, db: Session):
        super().__init__(db, TrainingRecord)

    def get_by_veteran(self, veteran_id: str) -> List[TrainingRecord]:
        """Get all training records for a veteran"""
        return self.db.query(TrainingRecord).filter(
            TrainingRecord.veteran_id == veteran_id
        ).all()

    def get_certified(self) -> List[TrainingRecord]:
        """Get records with certifications"""
        return self.db.query(TrainingRecord).filter(
            TrainingRecord.certification_awarded != None
        ).all()


# Certificate Repository
class CertificateRepository(BaseRepository[Certificate]):
    def __init__(self, db: Session):
        super().__init__(db, Certificate)

    def get_by_veteran(self, veteran_id: str) -> List[Certificate]:
        """Get all certificates for a veteran"""
        return self.db.query(Certificate).filter(
            Certificate.veteran_id == veteran_id
        ).all()

    def get_active(self, veteran_id: str) -> List[Certificate]:
        """Get active certificates for a veteran"""
        return self.db.query(Certificate).filter(
            Certificate.veteran_id == veteran_id,
            Certificate.status == "active"
        ).all()


# Resume Repository
class ResumeRepository(BaseRepository[Resume]):
    def __init__(self, db: Session):
        super().__init__(db, Resume)

    def get_by_veteran(self, veteran_id: str) -> List[Resume]:
        """Get all resumes for a veteran"""
        return self.db.query(Resume).filter(
            Resume.veteran_id == veteran_id
        ).all()

    def get_latest(self, veteran_id: str) -> Optional[Resume]:
        """Get most recent resume for a veteran"""
        return self.db.query(Resume).filter(
            Resume.veteran_id == veteran_id
        ).order_by(Resume.generated_timestamp.desc()).first()


# Job Listing Repository
class JobListingRepository(BaseRepository[JobListing]):
    def __init__(self, db: Session):
        super().__init__(db, JobListing)

    def get_active(self) -> List[JobListing]:
        """Get all active job listings"""
        return self.db.query(JobListing).filter(
            JobListing.active == True
        ).all()

    def get_by_location(self, location: str) -> List[JobListing]:
        """Get jobs by location"""
        return self.db.query(JobListing).filter(
            JobListing.location == location,
            JobListing.active == True
        ).all()

    def get_by_employer(self, employer_id: str) -> List[JobListing]:
        """Get jobs by employer"""
        return self.db.query(JobListing).filter(
            JobListing.employer_id == employer_id
        ).all()


# Job Match Repository
class JobMatchRepository(BaseRepository[JobMatch]):
    def __init__(self, db: Session):
        super().__init__(db, JobMatch)

    def get_for_veteran(self, veteran_id: str) -> List[JobMatch]:
        """Get all job matches for a veteran"""
        return self.db.query(JobMatch).filter(
            JobMatch.veteran_id == veteran_id
        ).all()

    def get_strong_matches(self, veteran_id: str) -> List[JobMatch]:
        """Get strong/perfect matches for veteran (score >= 0.75)"""
        return self.db.query(JobMatch).filter(
            JobMatch.veteran_id == veteran_id,
            JobMatch.overall_score >= 0.75
        ).all()

    def get_viewed(self, veteran_id: str) -> List[JobMatch]:
        """Get jobs veteran has viewed"""
        return self.db.query(JobMatch).filter(
            JobMatch.veteran_id == veteran_id,
            JobMatch.viewed == True
        ).all()


# Budget Repository
class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: Session):
        super().__init__(db, Budget)

    def get_by_veteran(self, veteran_id: str) -> List[Budget]:
        """Get all budgets for a veteran"""
        return self.db.query(Budget).filter(
            Budget.veteran_id == veteran_id
        ).all()

    def get_current(self, veteran_id: str) -> Optional[Budget]:
        """Get most recent budget for veteran"""
        return self.db.query(Budget).filter(
            Budget.veteran_id == veteran_id
        ).order_by(Budget.created_at.desc()).first()


# Employer Repository
class EmployerRepository(BaseRepository[Employer]):
    def __init__(self, db: Session):
        super().__init__(db, Employer)

    def get_vet_friendly(self) -> List[Employer]:
        """Get all veteran-friendly employers"""
        return self.db.query(Employer).filter(
            Employer.vet_friendly_status == True
        ).all()

    def get_by_industry(self, industry: str) -> List[Employer]:
        """Get employers by industry"""
        return self.db.query(Employer).filter(
            Employer.industry == industry
        ).all()

    def get_top_veteran_hirers(self, limit: int = 10) -> List[Employer]:
        """Get top veteran-hiring employers"""
        return self.db.query(Employer).order_by(
            Employer.veteran_hiring_percentage.desc()
        ).limit(limit).all()


# Repository Factory
class RepositoryFactory:
    """Factory for creating repositories"""

    def __init__(self, db: Session):
        self.db = db

    @property
    def veterans(self) -> VeteranRepository:
        return VeteranRepository(self.db)

    @property
    def service_records(self) -> ServiceRecordRepository:
        return ServiceRecordRepository(self.db)

    @property
    def training_records(self) -> TrainingRecordRepository:
        return TrainingRecordRepository(self.db)

    @property
    def certificates(self) -> CertificateRepository:
        return CertificateRepository(self.db)

    @property
    def resumes(self) -> ResumeRepository:
        return ResumeRepository(self.db)

    @property
    def job_listings(self) -> JobListingRepository:
        return JobListingRepository(self.db)

    @property
    def job_matches(self) -> JobMatchRepository:
        return JobMatchRepository(self.db)

    @property
    def budgets(self) -> BudgetRepository:
        return BudgetRepository(self.db)

    @property
    def employers(self) -> EmployerRepository:
        return EmployerRepository(self.db)


def get_repositories(db: Session) -> RepositoryFactory:
    """Get repository factory"""
    return RepositoryFactory(db)
