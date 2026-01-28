"""
Database Configuration
Connection pooling, session management, and database setup
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import logging

logger = logging.getLogger(__name__)

# Database URL from environment or default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./vetsready.db"  # Default SQLite for development
)

# For PostgreSQL production:
# DATABASE_URL = "postgresql://user:password@localhost:5432/vetsready"

# SQLAlchemy engine configuration
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,  # Number of connections to keep in pool
        max_overflow=20,  # Additional connections beyond pool_size
        pool_recycle=3600,  # Recycle connections after 1 hour
        pool_pre_ping=True,  # Verify connections before using
        echo=False,  # Set to True for SQL debugging
    )
else:
    # SQLite configuration (development)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session
    Usage in endpoints: def my_endpoint(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from backend.app.models.database import Base

    logger.info(f"Initializing database: {DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def seed_database():
    """Load seed data into database"""
    import json
    from pathlib import Path
    from backend.app.models.database import (
        Veteran, ServiceRecord, TrainingRecord, Certificate,
        JobListing, Employer, Organization, Condition
    )

    db = SessionLocal()
    try:
        # Load veterans
        with open("data/seed_veterans.json") as f:
            veterans_data = json.load(f)

        for vet_data in veterans_data.get("veterans", []):
            if not db.query(Veteran).filter(Veteran.id == vet_data["id"]).first():
                veteran = Veteran(
                    id=vet_data["id"],
                    first_name=vet_data["first_name"],
                    last_name=vet_data["last_name"],
                    email=vet_data["email"],
                    phone=vet_data.get("phone"),
                    date_of_birth=vet_data["date_of_birth"],
                    service_branch=vet_data["service_branch"],
                    separation_rank=vet_data["separation_rank"],
                    years_service=vet_data["years_service"],
                    separation_date=vet_data["separation_date"],
                    disability_rating=vet_data.get("disability_rating", 0),
                    profile_complete=vet_data.get("profile_complete", False)
                )
                db.add(veteran)

        # Load jobs
        with open("data/seed_jobs.json") as f:
            jobs_data = json.load(f)

        for job_data in jobs_data.get("job_listings", []):
            if not db.query(JobListing).filter(JobListing.id == job_data["id"]).first():
                # Ensure employer exists first
                employer = db.query(Employer).filter(
                    Employer.name == job_data["company"]
                ).first()

                if not employer:
                    employer = Employer(
                        id=f"EMP_{job_data['id']}",
                        name=job_data["company"],
                        industry="Technology",
                        vet_friendly_status=True
                    )
                    db.add(employer)
                    db.flush()

                job = JobListing(
                    id=job_data["id"],
                    employer_id=employer.id,
                    title=job_data["title"],
                    description=job_data["description"],
                    location=job_data["location"],
                    salary_min=job_data.get("salary_min"),
                    salary_max=job_data.get("salary_max"),
                    required_skills=job_data.get("required_skills", []),
                    ideal_mos=job_data.get("ideal_mos", []),
                    remote=job_data.get("remote", False)
                )
                db.add(job)

        # Load employers
        with open("data/seed_employers.json") as f:
            employers_data = json.load(f)

        for emp_data in employers_data.get("employers", []):
            if not db.query(Employer).filter(Employer.id == emp_data["id"]).first():
                employer = Employer(
                    id=emp_data["id"],
                    name=emp_data["name"],
                    industry=emp_data["industry"],
                    veteran_hiring_percentage=emp_data.get("veteran_hiring_percentage", 0),
                    vet_friendly_status=emp_data.get("vet_friendly_status", False),
                    description=emp_data.get("description"),
                    headquarters=emp_data.get("headquarters"),
                    founded_year=emp_data.get("founded_year"),
                    employee_count=emp_data.get("employee_count")
                )
                db.add(employer)

        db.commit()
        logger.info("Seed data loaded successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


def health_check() -> dict:
    """Check database connection health"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


def get_engine():
    """Get SQLAlchemy engine"""
    return engine


def close_engine():
    """Close database connections"""
    engine.dispose()
