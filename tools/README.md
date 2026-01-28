# Tools Folder - Development Resources

## Overview
Reference folder for development tools and utilities. The primary scripts location is `C:\Dev\Vets Ready\scripts\`.

## Primary Scripts Location
**`../scripts/`** - All development scripts (100+ files)
- Build scripts (Build-Frontend.ps1, Build-Android.ps1, etc.)
- Deployment scripts (Deploy-VetsReady.ps1, Deploy-Docker.ps1)
- Utilities (Cleanup-Workspace.ps1, Integrity-Scanner.ps1)
- Database management (Seed-Database.ps1)
- Service management (Start-All-Services.ps1, Run-Backend.ps1)

## Custom Project Tools (To Create As Needed)

For VetsReady-specific utilities, create in the main project:
- **Backend Scripts:** `backend/bin/` directory
  - `init_database.py` ✅ Already created
  - Add more Python utilities here

- **Database Tools:** `SQL/` directory
  - Migration scripts
  - Backup utilities
  - Query helpers

## Quick Commands

### Database Management
```bash
cd backend/
python bin/init_database.py init        # Initialize database
python bin/init_database.py verify      # Verify setup
python bin/init_database.py health      # Check health
```

### Backend Services
```bash
# From scripts/ folder:
.\Run-Backend.ps1                       # Start backend API
.\Start-All-Services.ps1                # Start all services
```

### Setup
Prerequisites: `pip install python-dotenv pydantic sqlalchemy pandas`

## See Also
- [Backend Documentation](../docs/ARCHITECTURE.md)
- [Database Guide](../docs/DATABASE_INTEGRATION_SETUP.md)
