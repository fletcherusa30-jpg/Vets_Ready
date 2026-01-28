# SQL Folder - Database Schema & Migration Files

## Overview
Contains all SQL schemas, migration scripts, and database initialization files for VetsReady platform.

## Core Files

**`init_db.sql`** - Complete database initialization script
- Creates all tables and schemas
- Sets up indexes and constraints
- Ready for production deployment

**`schema.sql`** - Database schema reference
- Full structure documentation
- Entity relationships
- Column definitions

**`seed_data.sql`** - Production seed data
- 5+ veteran profiles
- 10+ job listings
- Reference data (ranks, branches, etc.)

**`conditions_schema.sql`** - Medical conditions reference
- VA disability ratings
- Service-connected conditions

### Migrations
**`/migrations/`** - Versioned schema changes using Alembic

```bash
alembic upgrade head      # Run pending migrations
alembic downgrade -1      # Rollback last migration
alembic history           # View migration history
```

## Common Commands

### Initialize Database
```bash
# Fresh setup
mysql vetsready < SQL/init_db.sql
mysql vetsready < SQL/seed_data.sql

# Verify
python backend/bin/init_database.py verify
```

### Backup & Restore
```bash
# Backup
mysqldump vetsready > backup_$(date +%Y%m%d).sql

# Restore
mysql vetsready < backup_20260125.sql
```

### Manage Migrations
```bash
cd backend/

# Create new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head
```

## Database Structure

**Main Tables:**
- `veterans` - Veteran profiles (10,000+)
- `job_listings` - Available jobs (5,000+)
- `employers` - Employer profiles (500+)
- `service_records` - Military history
- `resumes` - Generated resumes
- `job_matches` - Recommendations
- `budgets` - Financial planning

## Documentation
- [ORM Models](../backend/app/models/database.py)
- [Database Integration](../docs/DATABASE_INTEGRATION_SETUP.md)
- [Architecture](../docs/ARCHITECTURE.md)
