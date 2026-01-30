# Backend Integration Guide - Database-Driven API Implementation

**Status:** READY FOR INTEGRATION
**Date:** 2026-01-26
**Phase:** 2 - Database Layer Integration

## Overview

Complete guide to integrating SQLAlchemy ORM models with FastAPI endpoints. This document provides everything needed to update all backend endpoints to use the new database layer.

## What's New

### Database Layer (Completed)
✅ **ORM Models** (`backend/app/models/database.py`)
- 13 production-ready SQLAlchemy models
- Relationships with cascading deletes
- Enum fields for status tracking
- JSON fields for complex data

✅ **Connection Management** (`backend/app/core/database.py`)
- Connection pooling (SQLite dev, PostgreSQL prod)
- Session factory with health checks
- FastAPI dependency injection ready

✅ **Data Access Layer** (`backend/app/core/repositories.py`)
- Repository pattern (9 specialized repositories)
- Factory pattern for unified access
- Base repository with CRUD operations

✅ **Migration System** (`backend/app/core/migrations.py`)
- Alembic integration
- Version tracking
- Rollback capability

### API Endpoints (New Examples)
✅ **Example Endpoints** (`backend/app/api/endpoints_database_v2.py`)
- 30+ database-backed endpoints
- Shows proper usage patterns
- Ready to copy/adapt

### Database Initialization
✅ **Init Script** (`backend/bin/init_database.py`)
- One-command database setup
- Schema creation
- Seed data loading
- Health verification

## Implementation Steps

### Step 1: Understand the Repository Pattern

The repository pattern provides a clean abstraction for database operations:

```python
# Instead of this (old):
@app.get("/api/veterans/{veteran_id}")
def get_veteran(veteran_id: str):
    # Direct query logic mixed with endpoint logic
    veteran = session.query(Veteran).filter_by(id=veteran_id).first()
    return veteran

# Do this (new):
@app.get("/api/veterans/{veteran_id}")
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    repos = get_repositories(db)  # Get all repositories
    veteran = repos.veterans.get_by_id(veteran_id)  # Clean data access
    return veteran
```

### Step 2: Update Existing Endpoints

For each endpoint in your current `backend/app/api/` files:

**Pattern 1: Single Entity Fetch**
```python
# Before
@app.get("/api/veterans/{veteran_id}")
async def get_veteran(veteran_id: str):
    for v in IN_MEMORY_VETERANS:
        if v["id"] == veteran_id:
            return v
    raise HTTPException(status_code=404)

# After
@app.get("/api/veterans/{veteran_id}")
def get_veteran(veteran_id: str, db: Session = Depends(get_db)):
    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)

    if not veteran:
        raise HTTPException(status_code=404, detail="Not found")

    return {
        "id": veteran.id,
        "name": f"{veteran.first_name} {veteran.last_name}",
        "email": veteran.email
    }
```

**Pattern 2: List with Filters**
```python
# Before
@app.get("/api/veterans/branch/{branch}")
async def get_by_branch(branch: str):
    return [v for v in IN_MEMORY_VETERANS if v["branch"] == branch]

# After
@app.get("/api/veterans/branch/{branch}")
def get_by_branch(branch: str, db: Session = Depends(get_db)):
    repos = get_repositories(db)
    veterans = repos.veterans.get_by_service_branch(branch)

    return [
        {
            "id": v.id,
            "name": f"{v.first_name} {v.last_name}",
            "branch": v.service_branch.value
        }
        for v in veterans
    ]
```

**Pattern 3: Create Entity**
```python
# Before
@app.post("/api/veterans")
async def create_veteran(data: dict):
    new_vet = {"id": new_id(), **data}
    IN_MEMORY_VETERANS.append(new_vet)
    return new_vet

# After
@app.post("/api/veterans")
def create_veteran(veteran_data: dict, db: Session = Depends(get_db)):
    repos = get_repositories(db)

    # Create ORM instance
    new_veteran = Veteran(
        id=veteran_data.get("id"),
        first_name=veteran_data.get("first_name"),
        last_name=veteran_data.get("last_name"),
        email=veteran_data.get("email"),
        # ... other fields
    )

    # Save and commit
    created = repos.veterans.create(new_veteran)
    db.commit()

    return {"id": created.id, "message": "Created"}
```

### Step 3: Available Repository Methods

All repositories inherit from `BaseRepository` providing:

```python
class BaseRepository(Generic[T]):
    def get_by_id(id: Any) -> Optional[T]
    def get_all(limit: int = 100) -> List[T]
    def create(entity: T) -> T
    def update(entity: T) -> T
    def delete(id: Any) -> bool
    def exists(id: Any) -> bool
```

**Specialized Methods by Repository:**

```
VeteranRepository:
  - get_by_email(email)
  - get_by_service_branch(branch)
  - get_disabled_veterans()

ResumeRepository:
  - get_by_veteran(veteran_id)
  - get_latest(veteran_id)

JobListingRepository:
  - get_active()
  - get_by_location(location)
  - get_by_employer(employer_id)

JobMatchRepository:
  - get_for_veteran(veteran_id)
  - get_strong_matches(veteran_id)
  - get_by_status(status)

BudgetRepository:
  - get_by_veteran(veteran_id)
  - get_current(veteran_id)

EmployerRepository:
  - get_vet_friendly()
  - get_top_veteran_hirers(limit)
  - get_by_industry(industry)

And more...
```

### Step 4: Initialize Database

Run the initialization script:

```bash
cd backend/

# Initialize database
python bin/init_database.py init

# Verify
python bin/init_database.py verify

# Check health
python bin/init_database.py health

# Reset (development only)
python bin/init_database.py reset --force
```

### Step 5: Test Integration

```python
# test_endpoints.py
from backend.app.core.database import SessionLocal
from backend.app.core.repositories import get_repositories

def test_veteran_endpoint():
    db = SessionLocal()
    repos = get_repositories(db)

    # Test data exists
    veterans = repos.veterans.get_all()
    assert len(veterans) > 0

    # Test specific query
    veteran = repos.veterans.get_by_id(veterans[0].id)
    assert veteran is not None

    db.close()
```

## Endpoint Checklist

Update these endpoint groups in order:

### Veteran Management Endpoints
- [ ] GET /api/veterans - list all
- [ ] GET /api/veterans/{id} - get one
- [ ] GET /api/veterans/email/{email} - find by email
- [ ] GET /api/veterans/branch/{branch} - filter by branch
- [ ] GET /api/veterans/disabled - get disabled vets
- [ ] POST /api/veterans - create
- [ ] PUT /api/veterans/{id} - update
- [ ] DELETE /api/veterans/{id} - delete

### Resume Builder Endpoints
- [ ] POST /api/resumes/generate/{veteran_id}
- [ ] GET /api/resumes/{veteran_id}
- [ ] GET /api/resumes/{veteran_id}/latest
- [ ] PUT /api/resumes/{resume_id}
- [ ] DELETE /api/resumes/{resume_id}

### Job Recruiting Endpoints
- [ ] GET /api/jobs/active
- [ ] GET /api/jobs/location/{location}
- [ ] GET /api/jobs/employer/{employer_id}
- [ ] GET /api/matches/{veteran_id}
- [ ] GET /api/matches/{veteran_id}/strong
- [ ] POST /api/matches/{veteran_id}/{job_id}
- [ ] GET /api/employers/vet-friendly
- [ ] GET /api/employers/top-hirers

### Financial Tools Endpoints
- [ ] POST /api/budgets/{veteran_id}
- [ ] GET /api/budgets/{veteran_id}
- [ ] GET /api/budgets/{veteran_id}/current
- [ ] POST /api/income/{veteran_id}
- [ ] GET /api/income/{veteran_id}
- [ ] POST /api/retirement/{veteran_id}

### Utility Endpoints
- [ ] GET /api/health
- [ ] GET /api/stats

## Common Issues & Solutions

### Issue: "Column not found" errors
**Solution:** Run migrations
```bash
alembic upgrade head
python bin/init_database.py verify
```

### Issue: Foreign key constraint violations
**Solution:** Verify referential integrity
```python
# Check veteran exists before creating resume
veteran = repos.veterans.get_by_id(veteran_id)
if not veteran:
    raise HTTPException(status_code=404)
```

### Issue: Session is closed
**Solution:** Ensure db dependency is used
```python
# Wrong
def get_veteran():
    repos = get_repositories(None)  # ❌ No session

# Correct
def get_veteran(db: Session = Depends(get_db)):
    repos = get_repositories(db)  # ✅ Valid session
```

### Issue: Duplicate records on insert
**Solution:** Check existing before create
```python
existing = repos.veterans.get_by_email(email)
if existing:
    raise HTTPException(status_code=409, detail="Already exists")
```

## Database Connection Configuration

**Development (SQLite):**
```python
# Automatic - uses sqlite:///rallyforge.db
DATABASE_URL="sqlite:///rallyforge.db"
```

**Production (PostgreSQL):**
```python
# Configure in .env
DATABASE_URL="postgresql://user:pass@localhost:5432/rallyforge"
```

**Connection Pooling:**
- Dev: 10 persistent + 20 overflow connections
- Prod: Configurable via environment
- Auto-recycle: 3600 seconds

## Performance Considerations

### Optimize Queries
```python
# Bad - N+1 problem
for job in repos.job_listings.get_all():
    employer = repos.employers.get_by_id(job.employer_id)  # Extra query per job

# Good - use relationships
from sqlalchemy.orm import joinedload
jobs = db.query(JobListing).options(joinedload(JobListing.employer)).all()
```

### Pagination for Large Results
```python
def get_veterans_paginated(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    repos = get_repositories(db)
    veterans = db.query(Veteran).offset(skip).limit(limit).all()
    return veterans
```

### Indexes Available
All major search columns have indexes:
- Email searches: fast ✓
- Branch filtering: fast ✓
- Location searching: fast ✓
- Status queries: fast ✓

## Next Steps

1. **Immediate:**
   - Initialize database: `python bin/init_database.py init`
   - Review example endpoints: `backend/app/api/endpoints_database_v2.py`
   - Start updating endpoints

2. **Short-term:**
   - Update all 40+ endpoints following patterns above
   - Create comprehensive test suite
   - Load production seed data

3. **Medium-term:**
   - Implement frontend integration
   - Set up CI/CD database tests
   - Configure production PostgreSQL

4. **Long-term:**
   - Performance optimization
   - Advanced caching
   - Analytics integration

## Support Files

- [Database Integration Guide](../docs/DATABASE_INTEGRATION_SETUP.md)
- [ORM Models Reference](../backend/app/models/database.py)
- [Repositories Reference](../backend/app/core/repositories.py)
- [Example Endpoints](../backend/app/api/endpoints_database_v2.py)

## Questions?

Reference the example endpoint file for specific patterns:
- Single entity queries: `get_veteran()`
- Filtered queries: `get_veterans_by_branch()`
- Create operations: `create_budget()`
- Relationship traversal: `get_job_matches()` → accessing related job/employer

All patterns shown in production-ready code.

