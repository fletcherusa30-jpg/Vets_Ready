# VetsReady Developer Onboarding Guide

Welcome to the VetsReady development team! This guide will help you get up and running quickly.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Project Overview

**VetsReady** is a comprehensive veteran assistance platform that helps veterans navigate the VA disability claims process. The platform combines AI-powered theory generation, evidence organization, financial planning tools, and community resources.

### Tech Stack

#### Frontend
- **Framework**: React 18 + TypeScript 5.2
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.3
- **Routing**: React Router v6
- **State**: React Context + Zustand (complex state)
- **Forms**: React Hook Form + Zod validation

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic

#### AI & Services
- **LLM**: OpenAI GPT-4 Turbo
- **OCR**: Tesseract.js (client) + AWS Textract (server)

#### DevOps
- **Containers**: Docker + Docker Compose
- **Hosting**: AWS (ECS, RDS, S3)
- **CI/CD**: GitHub Actions

---

## Quick Start

### Prerequisites

- **Node.js**: v20+ ([Download](https://nodejs.org/))
- **Python**: 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL**: 15+ ([Download](https://www.postgresql.org/))
- **Redis**: 7+ ([Download](https://redis.io/))
- **Git**: Latest ([Download](https://git-scm.com/))
- **Docker**: (Optional) Latest ([Download](https://www.docker.com/))

### 1. Clone the Repository

```powershell
git clone https://github.com/your-org/vets-ready.git
cd vets-ready
```

### 2. Set Up Environment Variables

Create `.env` file in the root directory:

```bash
# Backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/vetsready
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-api-key-here
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
USE_MOCK_AI=true  # Set to false to use real OpenAI API

# Frontend
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_AI=true
VITE_ENVIRONMENT=development
```

Copy `.env.example` as a template:
```powershell
Copy-Item .env.example .env
```

### 3. Database Setup

Create PostgreSQL database:
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vetsready;

# Exit psql
\q
```

### 4. Start Development (PowerShell)

#### Option A: Using the Start Script (Recommended)

```powershell
.\scripts\Start-VetsReady.ps1
```

This script will:
- Install dependencies for frontend and backend
- Start PostgreSQL and Redis (if using Docker)
- Run database migrations
- Start frontend (localhost:5173) and backend (localhost:8000)

#### Option B: Manual Start

**Terminal 1 - Backend:**
```powershell
cd vets-ready-backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd vets-ready-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 5. Verify Installation

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (OpenAPI/Swagger)
- **Alternative Docs**: http://localhost:8000/redoc

---

## Project Structure

```
C:\Dev\Vets Ready\
│
├── docs/                              # All documentation
│   ├── VETSREADY_MASTER_SPEC.md      # Master specification (source of truth)
│   ├── IMPLEMENTATION_TASKS.md       # Task list & progress tracking
│   ├── DEVELOPER_ONBOARDING.md       # This file
│   ├── COMPLIANCE_AND_PRIVACY.md     # Legal & privacy guidelines
│   └── TECHNICAL_GUIDE.md            # API docs, data models
│
├── scripts/                           # Automation scripts
│   ├── Start-VetsReady.ps1           # One-click dev startup
│   ├── Build-VetsReady.ps1           # Build all services
│   └── Test-VetsReady.ps1            # Run all tests
│
├── vets-ready-frontend/              # React frontend
│   ├── src/
│   │   ├── main.tsx                  # App entry point
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── pages/                    # Page-level components
│   │   ├── components/               # Reusable UI components
│   │   │   ├── wizard/               # Disability Wizard (5 steps)
│   │   │   ├── EvidenceOrganizer.tsx # Evidence management
│   │   │   └── ClaimTracker.tsx      # Claim status tracking
│   │   ├── contexts/                 # React contexts (state)
│   │   ├── services/                 # API clients & utilities
│   │   │   ├── aiService.ts          # AI integration
│   │   │   └── exportService.ts      # Export to Markdown/PDF
│   │   ├── types/                    # TypeScript type definitions
│   │   │   └── wizard.types.ts       # Core data models
│   │   └── hooks/                    # Custom React hooks
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.ts                # Vite configuration
│
├── vets-ready-backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── config.py                 # Configuration & env vars
│   │   ├── database.py               # Database connection
│   │   ├── routers/                  # API route handlers
│   │   │   ├── ai.py                 # AI endpoints (NEW)
│   │   │   ├── disabilities.py       # Disability CRUD (TODO)
│   │   │   ├── evidence.py           # Evidence management (TODO)
│   │   │   └── claims.py             # Claims tracking
│   │   ├── services/                 # Business logic layer
│   │   │   ├── ai_service.py         # OpenAI integration (NEW)
│   │   │   └── ocr_service.py        # OCR processing (TODO)
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response models
│   │   │   └── ai_schemas.py         # AI request/response (NEW)
│   │   └── tests/                    # Backend tests
│   ├── alembic/                      # Database migrations
│   └── requirements.txt              # Python dependencies
│
├── docker-compose.yml                # Multi-service orchestration
└── .env.example                      # Environment variables template
```

---

## Development Workflow

### Typical Development Session

1. **Pull latest changes**
   ```powershell
   git pull origin main
   ```

2. **Create feature branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

3. **Start dev environment**
   ```powershell
   .\scripts\Start-VetsReady.ps1
   ```

4. **Make changes**
   - Frontend: Edit files in `vets-ready-frontend/src/`
   - Backend: Edit files in `vets-ready-backend/app/`
   - Hot reload enabled (changes reflect immediately)

5. **Test changes**
   ```powershell
   # Frontend tests
   cd vets-ready-frontend
   npm run test

   # Backend tests
   cd vets-ready-backend
   pytest
   ```

6. **Commit and push**
   ```powershell
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request** on GitHub

### Frontend Development

#### Running the Frontend

```powershell
cd vets-ready-frontend
npm run dev  # Start dev server
npm run build  # Production build
npm run preview  # Preview production build
npm run test  # Run tests
npm run lint  # Run ESLint
```

#### Adding a New Component

1. Create component file in `src/components/` or `src/pages/`
2. Use TypeScript and functional components
3. Import types from `types/wizard.types.ts`
4. Add tests in `tests/` directory

**Example:**
```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {/* Component content */}
    </div>
  );
};
```

#### Adding a New Service

1. Create service file in `src/services/`
2. Use async/await for API calls
3. Handle errors gracefully
4. Export functions, not classes

**Example:**
```typescript
// src/services/myService.ts
import { apiClient } from './apiClient';

export async function fetchData(id: string): Promise<MyData> {
  try {
    const response = await apiClient.get(`/api/my-endpoint/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

### Backend Development

#### Running the Backend

```powershell
cd vets-ready-backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start server
uvicorn app.main:app --reload  # Dev mode with hot reload
uvicorn app.main:app  # Production mode

# Run tests
pytest

# Run specific test file
pytest app/tests/test_ai_service.py

# Code coverage
pytest --cov=app
```

#### Adding a New Endpoint

1. Create router file in `app/routers/` (or add to existing)
2. Define Pydantic schemas in `app/schemas/`
3. Implement business logic in `app/services/`
4. Add tests in `app/tests/`

**Example:**
```python
# app/routers/my_router.py
from fastapi import APIRouter, HTTPException
from app.schemas.my_schemas import MyRequest, MyResponse
from app.services.my_service import process_data

router = APIRouter(prefix="/api/my-endpoint", tags=["MyFeature"])

@router.post("/", response_model=MyResponse)
async def create_item(request: MyRequest) -> MyResponse:
    """Create a new item"""
    try:
        result = await process_data(request)
        return MyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Database Migrations

**Create a new migration:**
```powershell
cd vets-ready-backend
alembic revision --autogenerate -m "Add new table"
```

**Apply migrations:**
```powershell
alembic upgrade head
```

**Rollback migration:**
```powershell
alembic downgrade -1  # Go back one migration
```

---

## Coding Standards

### TypeScript/React Standards

1. **Use TypeScript** - No `any` types unless absolutely necessary
2. **Functional Components** - Use React.FC with TypeScript interfaces
3. **Hooks** - Prefer hooks over class components
4. **Props Interface** - Always define props interface
5. **Naming**:
   - Components: PascalCase (`MyComponent.tsx`)
   - Hooks: camelCase with `use` prefix (`useMyHook.ts`)
   - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
6. **File Organization**:
   - One component per file
   - Colocate types with components
   - Export named, not default

**Example:**
```typescript
// Good
export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
};

// Bad
export default function MyComponent(props: any) {
  // Component logic
}
```

### Python/FastAPI Standards

1. **Type Hints** - Use type hints for all functions
2. **Pydantic Models** - Use Pydantic for request/response validation
3. **Async/Await** - Use async functions for I/O operations
4. **Docstrings** - Document all public functions (Google style)
5. **Naming**:
   - Functions: snake_case (`get_user_data()`)
   - Classes: PascalCase (`UserService`)
   - Constants: UPPER_SNAKE_CASE (`API_KEY`)
6. **File Organization**:
   - One router per domain (users, claims, etc.)
   - Services for business logic
   - Models for database tables

**Example:**
```python
# Good
async def get_user(user_id: str) -> UserResponse:
    """
    Get user by ID.

    Args:
        user_id: Unique user identifier

    Returns:
        UserResponse with user data

    Raises:
        HTTPException: If user not found
    """
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

# Bad
def get_user(id):
    return db.query(User).filter(User.id == id).first()
```

### General Standards

- **Formatting**: Prettier (frontend), Black (backend)
- **Linting**: ESLint (frontend), Flake8 (backend)
- **Comments**: Explain "why", not "what"
- **Git Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **Pull Requests**: Include description, screenshots (if UI), and tests

---

## Testing

### Frontend Tests (Jest + React Testing Library)

```powershell
cd vets-ready-frontend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

**Example Test:**
```typescript
// src/components/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" onSubmit={() => {}} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onSubmit when button clicked', () => {
    const mockSubmit = jest.fn();
    render(<MyComponent title="Test" onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Backend Tests (pytest)

```powershell
cd vets-ready-backend

# Run all tests
pytest

# Run specific test file
pytest app/tests/test_ai_service.py

# Run with coverage
pytest --cov=app --cov-report=html
```

**Example Test:**
```python
# app/tests/test_ai_service.py
import pytest
from app.services.ai_service import AIService

@pytest.mark.asyncio
async def test_generate_theory():
    """Test theory generation"""
    ai_service = AIService()
    theory = await ai_service.generate_theory(
        condition=DisabilityInput(name="PTSD", service_connection_type="direct")
    )
    assert theory.primary_theory is not None
    assert len(theory.policy_references) > 0
```

---

## Git Workflow

### Branching Strategy

- **main** - Production-ready code
- **develop** - Integration branch (if used)
- **feature/xxx** - New features
- **fix/xxx** - Bug fixes
- **docs/xxx** - Documentation updates

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(wizard): add Step 5 review page

Implemented the review and export step of the disability wizard.
Users can now see a summary of all conditions and export to Markdown.

Closes #123
```

### Pull Request Process

1. **Create PR** from your feature branch to `main`
2. **Fill out PR template** with description and testing notes
3. **Request review** from at least one team member
4. **Address feedback** if any
5. **Squash and merge** after approval

---

## Deployment

### Development Deployment (Local)

Use PowerShell script:
```powershell
.\scripts\Start-VetsReady.ps1
```

### Production Deployment (AWS)

**Prerequisites:**
- AWS CLI configured
- Docker installed
- Terraform (optional for IaC)

**Deploy with script:**
```powershell
.\scripts\Deploy-VetsReady.ps1 -Environment production
```

**Manual deployment steps:**
1. Build Docker images
2. Push to ECR (Elastic Container Registry)
3. Update ECS task definitions
4. Deploy to ECS/Fargate
5. Run database migrations

---

## Troubleshooting

### Frontend Issues

**Issue: "Module not found" errors**
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

**Issue: Vite cache issues**
```powershell
# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

**Issue: TypeScript errors**
```powershell
# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Backend Issues

**Issue: Database connection errors**
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Test connection
psql -U postgres -d vetsready -c "SELECT 1;"
```

**Issue: Migration errors**
```powershell
# Rollback and reapply
alembic downgrade -1
alembic upgrade head
```

**Issue: Import errors**
```powershell
# Recreate virtual environment
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Docker Issues

**Issue: Containers not starting**
```powershell
# View logs
docker-compose logs -f

# Rebuild containers
docker-compose down
docker-compose up --build
```

---

## Resources

### Documentation

- **Master Spec**: `docs/VETSREADY_MASTER_SPEC.md`
- **Implementation Tasks**: `docs/IMPLEMENTATION_TASKS.md`
- **API Reference**: http://localhost:8000/docs
- **Compliance Guidelines**: `docs/COMPLIANCE_AND_PRIVACY.md`

### External Documentation

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Pydantic**: https://docs.pydantic.dev/
- **OpenAI API**: https://platform.openai.com/docs/

### VA Resources (for context)

- **38 CFR**: https://www.ecfr.gov/current/title-38
- **M21-1 Manual**: https://www.knowva.ebenefits.va.gov/
- **VA.gov**: https://www.va.gov/
- **VA API (public)**: https://developer.va.gov/

### Support

- **Slack**: #vetsready-dev (if applicable)
- **Email**: dev@vetsready.com
- **GitHub Issues**: https://github.com/your-org/vets-ready/issues

---

## Welcome Aboard! 🇺🇸

You're now part of a mission to empower veterans through technology. If you have questions, don't hesitate to ask the team. Happy coding!

**Remember**: We're building for veterans who served our country. Quality, privacy, and respect are paramount.

---

**Last Updated**: January 24, 2026
**Maintained By**: VetsReady Development Team
