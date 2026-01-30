# Database Integration Setup

**Status**: COMPLETE ✓
**Date**: January 28, 2026
**Phase**: 2 - Database Integration

---

## What's Been Created

### 1. SQLAlchemy ORM Models ✓
**File**: `backend/app/models/database.py`

**Models Created** (13 total):
- **Veteran** - Core veteran profile with service info
- **ServiceRecord** - DD214 extracted data
- **TrainingRecord** - Military training courses
- **Certificate** - Professional credentials
- **Resume** - Generated veteran resumes
- **JobListing** - Job opportunity postings
- **JobMatch** - Job matching results with scores
- **Employer** - Employer company profiles
- **Budget** - Monthly financial budget
- **IncomeEntry** - Individual income line items
- **ExpenseEntry** - Individual expense line items
- **RetirementPlan** - Retirement projections
- **Organization** & **Condition** - Reference data

**Features**:
- ✓ Type-safe with SQLAlchemy declarative models
- ✓ Automatic timestamps (created_at, updated_at)
- ✓ Foreign key relationships with cascading deletes
- ✓ Enum fields (ServiceBranch, DischargeStatus, JobMatchStatus, BudgetStatus)
- ✓ JSON fields for complex data (MOS codes, awards, deployments)
- ✓ Proper indexing and constraints

---

### 2. Database Configuration ✓
**File**: `backend/app/core/database.py`

**Includes**:
- ✓ SQLAlchemy engine setup with connection pooling
- ✓ Connection pool: 10 persistent + 20 overflow connections
- ✓ Pool recycling (1 hour) and health checks
- ✓ Session factory (SessionLocal)
- ✓ FastAPI dependency injection (`get_db()`)
- ✓ Database initialization (`init_db()`)
- ✓ Seed data loading (`seed_database()`)
- ✓ Health check endpoint

**Configuration**:
```python
# SQLite (development)
DATABASE_URL = "sqlite:///./rallyforge.db"

# PostgreSQL (production)
DATABASE_URL = "postgresql://user:password@localhost:5432/rallyforge"
```

---

### 3. Migration Management ✓
**File**: `backend/app/core/migrations.py`

**Alembic Setup**:
- ✓ Automatic schema migration tracking
- ✓ Commands: init, migrate, upgrade, downgrade
- ✓ Version control for database changes
- ✓ Rollback capability

**Usage**:
```bash
# Initialize migrations
python backend/app/core/migrations.py init

# Create migration
python backend/app/core/migrations.py migrate "Add new column"

# Apply migrations
python backend/app/core/migrations.py upgrade

# Rollback
python backend/app/core/migrations.py downgrade

# Check current version
python backend/app/core/migrations.py current
```

---

### 4. Repository Pattern (Data Access Layer) ✓
**File**: `backend/app/core/repositories.py`

**Repositories Created** (9 total):
- **VeteranRepository** - Veteran queries (email, service branch, disability)
- **ServiceRecordRepository** - Service record queries (by veteran, unprocessed)
- **TrainingRecordRepository** - Training queries (by veteran, certified)
- **CertificateRepository** - Certificate queries (by veteran, active)
- **ResumeRepository** - Resume queries (by veteran, latest)
- **JobListingRepository** - Job queries (active, location, employer)
- **JobMatchRepository** - Match queries (for veteran, strong matches)
- **BudgetRepository** - Budget queries (by veteran, current)
- **EmployerRepository** - Employer queries (vet-friendly, by industry, top hirers)

**Generic BaseRepository**:
- ✓ CRUD operations (Create, Read, Update, Delete)
- ✓ Pagination support
- ✓ Extensible for custom queries

**Factory Pattern**:
```python
repos = get_repositories(db)
veterans = repos.veterans.get_by_email("john@example.com")
matches = repos.job_matches.get_strong_matches("VET_001")
```

---

## Database Schema

### Core Tables (13)

```
veterans
├── veteran_id (PK)
├── personal info (name, email, DOB)
├── service info (branch, rank, years, discharge)
├── disability_rating
└── timestamps (created_at, updated_at)

service_records
├── record_id (PK)
├── veteran_id (FK)
├── extracted data (MOS, awards, deployments)
├── confidence_score
└── processing metadata

training_records
├── training_id (PK)
├── veteran_id (FK)
├── course details
└── certification

certificates
├── cert_id (PK)
├── veteran_id (FK)
├── cert details
└── status (active/expired)

resumes
├── resume_id (PK)
├── veteran_id (FK)
├── version (original, tailored)
├── content (title, skills, experience)
└── file_path

job_listings
├── job_id (PK)
├── employer_id (FK)
├── job details (title, description, location)
├── salary range
└── skills, MOS requirements

job_matches
├── match_id (PK)
├── veteran_id (FK)
├── job_id (FK)
├── scores (skill, experience, cultural)
└── status (viewed, applied, hired)

employers
├── employer_id (PK)
├── company details
├── vet_friendly_status
└── hiring percentage

budgets
├── budget_id (PK)
├── veteran_id (FK)
├── month_year
├── income breakdown
├── expense breakdown
└── net income

income_entries / expense_entries
├── entry_id (PK)
├── budget_id (FK)
├── amount, category, frequency

retirement_plans
├── plan_id (PK)
├── veteran_id (FK)
├── projections (balance, monthly income)
└── parameters (rate, inflation)

organizations / conditions
├── reference data
└── lookup tables
```

---

## Connection Pooling Strategy

**SQLite** (Development):
- Single-threaded
- Direct file-based access
- No connection pooling

**PostgreSQL** (Production):
```
Connection Pool:
├── Pool Size: 10 connections (active)
├── Max Overflow: 20 connections (on-demand)
├── Pool Recycle: 3600 seconds (refresh hourly)
└── Pre-ping: Verify connection health
```

**Benefits**:
- ✓ Efficient resource usage
- ✓ Automatic connection reuse
- ✓ Prevents connection leaks
- ✓ Handles stale connections

---

## Integration with Backend Systems

### Scanner Engine → Database

```python
from backend.app.core.repositories import get_repositories
from backend.app.core.database import SessionLocal

db = SessionLocal()
repos = get_repositories(db)

# After scanning, save to database
scanner_result = scanner.process_document(...)

if scanner_result.success:
    service_record = ServiceRecord(
        id=f"SR_{scanner_result.document_id}",
        veteran_id=scanner_result.veteran_id,
        mos_codes=scanner_result.mos_codes,
        confidence_score=scanner_result.confidence_score,
        processed=True
    )
    repos.service_records.create(service_record)
```

### Resume Builder → Database

```python
resume = Resume(
    id=f"RES_{veteran_id}",
    veteran_id=veteran_id,
    version="original",
    title="Operations Manager",
    skills=[...],
    experience_items=[...],
    generated_timestamp=datetime.utcnow()
)
repos.resumes.create(resume)
```

### Job Recruiting → Database

```python
match = JobMatch(
    id=f"MATCH_{match_id}",
    veteran_id=veteran_id,
    job_listing_id=job_id,
    overall_score=0.87,
    skill_match=0.85,
    experience_match=0.90,
    cultural_match=0.85,
    match_status=JobMatchStatus.STRONG
)
repos.job_matches.create(match)
```

### Financial Tools → Database

```python
budget = Budget(
    id=f"BUDGET_{budget_id}",
    veteran_id=veteran_id,
    month_year="2024-01",
    total_income=6500.00,
    total_expenses=4200.00,
    net_income=2300.00
)
repos.budgets.create(budget)
```

---

## FastAPI Integration

### Updated Endpoint Example

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.repositories import get_repositories

app = FastAPI()

@app.get("/api/veterans/{veteran_id}")
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    """Get veteran profile from database"""
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        return {"error": "Veteran not found"}

    return {
        "id": veteran.id,
        "name": f"{veteran.first_name} {veteran.last_name}",
        "service_branch": veteran.service_branch,
        "years_service": veteran.years_service,
        "disability_rating": veteran.disability_rating
    }

@app.get("/api/jobs/matches/{veteran_id}")
def get_job_matches(veteran_id: str, db: Session = Depends(get_db)):
    """Get job matches for veteran from database"""
    repos = get_repositories(db)
    matches = repos.job_matches.get_strong_matches(veteran_id)

    return [
        {
            "job_id": match.job_listing_id,
            "title": match.job_listing.title,
            "company": match.job_listing.employer.name,
            "match_score": match.overall_score
        }
        for match in matches
    ]
```

---

## Next Steps

### Step 1: Install Database Dependencies
```bash
pip install sqlalchemy alembic psycopg2-binary
```

### Step 2: Initialize Database
```python
from backend.app.core.database import init_db, seed_database

# Create tables
init_db()

# Load seed data
seed_database()
```

### Step 3: Set Up Alembic
```bash
python backend/app/core/migrations.py init
```

### Step 4: Create Initial Migration
```bash
python backend/app/core/migrations.py migrate "Initial schema"
```

### Step 5: Apply Migrations
```bash
python backend/app/core/migrations.py upgrade
```

### Step 6: Test Database
```python
from backend.app.core.database import SessionLocal, health_check
from backend.app.core.repositories import get_repositories

# Health check
health = health_check()
print(health)  # {"status": "healthy", "database": "connected"}

# Test queries
db = SessionLocal()
repos = get_repositories(db)
veterans = repos.veterans.get_all()
print(f"Total veterans: {len(veterans)}")
db.close()
```

---

## Configuration

### Environment Variables

```bash
# Development (SQLite)
DATABASE_URL=sqlite:///./rallyforge.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/rallyforge
POOL_SIZE=10
POOL_MAX_OVERFLOW=20
POOL_RECYCLE=3600
```

### Database Connection String Examples

**SQLite**:
```
sqlite:///./rallyforge.db
```

**PostgreSQL**:
```
postgresql://rallyforge_user:secure_password@db.rallyforge.com:5432/rallyforge
```

**MySQL**:
```
mysql+pymysql://user:password@localhost:3306/rallyforge
```

---

## File Locations

```
backend/
├── app/
│   ├── models/
│   │   └── database.py               ✓ ORM Models (13 models)
│   └── core/
│       ├── database.py               ✓ Config & Connection Pool
│       ├── migrations.py             ✓ Alembic Setup
│       └── repositories.py           ✓ Data Access Layer (9 repos)
│
├── tests/
│   └── test_database.py              (To be created)
│
└── main.py                            (Updated with DB initialization)
```

---

## Testing

### Unit Tests (To Create)

```python
def test_veteran_create():
    """Test creating a veteran"""
    db = SessionLocal()
    repos = get_repositories(db)

    vet = Veteran(
        id="VET_TEST_001",
        first_name="Test",
        last_name="Veteran",
        email="test@example.com",
        service_branch="Army",
        separation_rank="Captain",
        years_service=10.0,
        separation_date=datetime.now()
    )

    created = repos.veterans.create(vet)
    assert created.id == "VET_TEST_001"

    db.close()

def test_job_matching():
    """Test job matching queries"""
    db = SessionLocal()
    repos = get_repositories(db)

    matches = repos.job_matches.get_strong_matches("VET_001")
    assert len(matches) > 0

    db.close()
```

---

## Database Migration Example

**Before** (Memory only):
```python
def get_veteran(veteran_id):
    return in_memory_database[veteran_id]
```

**After** (Database):
```python
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    repos = get_repositories(db)
    return repos.veterans.get_by_id(veteran_id)
```

---

## Performance Considerations

- ✓ Connection pooling for efficiency
- ✓ Indexed primary/foreign keys
- ✓ Pagination for large result sets
- ✓ Lazy loading relationships
- ✓ Query optimization with repositories

---

## Status

**Phase 2 Progress**:
- ✓ SQLAlchemy models (13 models created)
- ✓ Connection pooling (configured)
- ✓ Alembic migrations (setup ready)
- ✓ Repository pattern (9 repositories)
- ✓ Seed data loading (ready)
- → Update backend endpoints (Next)
- → Database initialization (Next)
- → Test integration (Next)

---

**Ready for**: Backend endpoint updates, frontend development, testing

*Generated: January 28, 2026*
*rallyforge Database Integration Phase 2*

