# Getting Started with PhoneApp 2.0

**Version:** 2.0 | **Last Updated:** January 23, 2026

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ & npm 9+
- Python 3.10+
- Git
- (Optional) Docker & Docker Compose

### Install & Run Locally

```bash
# 1. Clone repository
git clone https://github.com/yourorg/phoneapp.git
cd phoneapp

# 2. Install dependencies
npm install          # Root dependencies
cd frontend && npm install && cd ..
cd mobile && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..
cd desktop && npm install && cd ..

# 3. Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env

# 4. Initialize database
cd backend
python -m alembic upgrade head
cd ..

# 5. Start all services (from root)
npm run dev
# Or start individually:
# Terminal 1:
cd backend && uvicorn app.main:app --reload
# Terminal 2:
cd frontend && npm run dev
# Terminal 3:
cd mobile && npm start
```

**Expected Output:**
```
✓ Frontend: http://localhost:5173
✓ Backend:  http://localhost:8000
✓ Mobile:   http://localhost:3000
✓ Docs:     http://localhost:8000/docs
```

---

## Project Structure

```
phoneapp/
├── frontend/           # React dashboard (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/   # API calls
│   │   └── App.tsx
│   └── package.json
├── mobile/            # React Native (Capacitor)
│   ├── src/
│   ├── capacitor.config.ts
│   └── package.json
├── android/           # Android native build
│   ├── app/
│   ├── build.gradle
│   └── gradle.properties
├── desktop/           # Electron app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Request/response schemas
│   │   ├── services/  # Business logic
│   │   └── main.py
│   ├── tests/         # Test suite
│   ├── requirements.txt
│   └── alembic/       # Database migrations
├── ai-engine/         # Python ML service
│   ├── engine.py
│   ├── model.json
│   └── tools/
├── data/              # Seed data
│   ├── seed_conditions.json
│   └── schema.sql
├── docs/              # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
├── .github/workflows/ # CI/CD pipelines
│   └── ci-cd.yml
├── scripts/           # Helper scripts
│   └── Cleanup-Workspace.ps1
└── .gitignore         # Git ignore rules
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | 18+, 5.0+ |
| **Mobile** | React Native + Capacitor | 0.12+ |
| **Desktop** | Electron + React | 27+ |
| **Backend** | FastAPI + SQLAlchemy | 0.104+, 2.0+ |
| **Database** | SQLite (dev), PostgreSQL (prod) | 3.43+, 15+ |
| **AI Engine** | Python ML | 3.10+ |
| **Deployment** | Docker + GitHub Actions | Latest |

---

## Development Workflows

### Frontend Development
```bash
cd frontend
npm run dev              # Start dev server with HMR
npm run build           # Production build
npm test                # Run tests
npm run lint            # ESLint + Prettier
```

### Backend Development
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
uvicorn app.main:app --reload  # Auto-reloading server
pytest                  # Run tests
pytest --cov           # With coverage
black .                # Format code
flake8 .               # Lint code
```

### Mobile Development
```bash
cd mobile
npm run dev:ios         # iOS simulator
npm run dev:android     # Android emulator
npm run build:ios       # iOS production build
npm run build:android   # Android production build
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"  # Create migration
alembic upgrade head    # Apply migrations
alembic downgrade -1    # Undo last migration
```

---

## Common Tasks

### Running Tests Locally

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && pytest -v --cov

# Mobile
cd mobile && npm test

# All tests
npm run test:all
```

### Building for Production

```bash
# Frontend
cd frontend && npm run build
# Output: dist/

# Backend
cd backend && docker build -t phoneapp-backend:latest .

# Mobile
cd mobile && npm run build:ios && npm run build:android

# Desktop
cd desktop && npm run build
```

### Database Setup

```bash
# Initialize development database
cd backend
rm instance/dev.db              # Reset (careful!)
python -c "from app.database import init_db; init_db()"

# Or with migrations
alembic upgrade head
python scripts/seed_data.py    # Load seed data
```

### Debugging Backend API

```bash
# View interactive API docs
open http://localhost:8000/docs

# View ReDoc documentation
open http://localhost:8000/redoc

# Test endpoint from terminal
curl -X GET http://localhost:8000/api/conditions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port
lsof -i :8000           # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Check database URL in .env
cat backend/.env | grep DATABASE_URL

# Reset database
cd backend && rm instance/dev.db && alembic upgrade head
```

### Frontend Not Connecting to Backend
```bash
# Check VITE_API_BASE_URL in .env
cat frontend/.env | grep VITE_API_BASE_URL

# Should be: http://localhost:8000
# Verify CORS enabled in backend
```

### Module Import Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Python
rm -rf backend/__pycache__ backend/.pytest_cache
pip install -r backend/requirements.txt
```

---

## Code Style & Standards

### Frontend (TypeScript)
- **Format:** Prettier (runs on commit)
- **Lint:** ESLint with TypeScript parser
- **Testing:** Jest + React Testing Library
- **Example:** `src/components/ClaimsAnalyzer.tsx`

```typescript
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ClaimsAnalyzerProps {
  onAnalyze?: (results: AnalysisResults) => void;
}

export const ClaimsAnalyzer: React.FC<ClaimsAnalyzerProps> = ({ onAnalyze }) => {
  const { user } = useAuth();

  return (
    <div className="claims-analyzer">
      {/* Component content */}
    </div>
  );
};

export default ClaimsAnalyzer;
```

### Backend (Python)
- **Format:** Black (auto-format)
- **Lint:** Flake8
- **Type Checking:** mypy
- **Testing:** pytest
- **Example:** `backend/app/services/conditions.py`

```python
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.condition import Condition
from app.schemas.conditions import ConditionCreate

class ConditionsService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, condition: ConditionCreate) -> Condition:
        """Create a new condition."""
        db_condition = Condition(**condition.dict())
        self.db.add(db_condition)
        self.db.commit()
        self.db.refresh(db_condition)
        return db_condition

    def list(self) -> List[Condition]:
        """List all conditions."""
        return self.db.query(Condition).all()
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_VERSION=2.0.0
VITE_SENTRY_DSN=
```

### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///./instance/dev.db
# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
# Logging
LOG_LEVEL=INFO
```

---

## Resources & Documentation

- **Architecture:** See [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment:** See [docs/DEPLOYMENT.md](DEPLOYMENT.md)
- **Testing:** See [docs/TESTING.md](TESTING.md)
- **Module Guide:** See [docs/MODULE_PURPOSES.md](MODULE_PURPOSES.md)

---

## Git Workflow

### Feature Development
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
git add .
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature

# After review and merge
git checkout main
git pull origin main
```

### Commit Message Format
```
feat: add new feature              # New feature
fix: resolve login issue            # Bug fix
docs: update README                # Documentation
style: reformat code               # Code style
test: add test coverage            # Tests
chore: update dependencies        # Maintenance
```

---

## Support & Help

- **Documentation:** Check `docs/` folder
- **Issues:** GitHub Issues tracker
- **Discussions:** GitHub Discussions
- **Team Slack:** #engineering channel

---

## Next Steps

1. ✅ Read [docs/ARCHITECTURE.md](ARCHITECTURE.md) to understand system design
2. ✅ Read [docs/MODULE_PURPOSES.md](MODULE_PURPOSES.md) for module responsibilities
3. ✅ Run tests locally to verify setup: `npm run test:all`
4. ✅ Pick a task and start coding!

**Happy coding! 🚀**
