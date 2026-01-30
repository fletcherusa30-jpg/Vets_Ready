# rallyforge - Unified Project Structure

**Last Updated:** January 28, 2026

## 🎯 Overview

rallyforge is now a **unified, single-application platform** that combines all veteran support features into one coherent structure.

---

## 📁 Primary Application Structure

```
rallyforge/
├── rally-forge-frontend/          # Main React Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   │   ├── profile/         # Profile-related components
│   │   │   └── Dashboard/       # Dashboard widgets
│   │   ├── pages/               # Page-level components
│   │   │   ├── DisabilityWizard.tsx
│   │   │   ├── Scanner.tsx
│   │   │   ├── RetirementTool.tsx
│   │   │   ├── Budget.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/            # API services and utilities
│   │   ├── store/               # State management (Zustand)
│   │   ├── types/               # TypeScript type definitions
│   │   └── App.tsx              # Main app component
│   └── package.json
│
├── rally-forge-backend/           # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── routers/             # API route handlers
│   │   │   ├── disability_wizard.py
│   │   │   ├── scanner_upload.py
│   │   │   ├── retirement_planner.py
│   │   │   └── profile_background.py
│   │   ├── core/                # Core business logic
│   │   │   ├── database.py
│   │   │   ├── disability_calculator.py
│   │   │   └── repositories.py
│   │   ├── services/            # Service layer
│   │   │   ├── retirement_engine.py
│   │   │   └── theory_engine.py
│   │   ├── scanner/             # Document scanner engine
│   │   ├── schemas/             # Pydantic models
│   │   └── models/              # Database models
│   ├── bin/                     # Utility scripts
│   └── tests/                   # Backend tests
│
├── data/                         # Data files and seeds
│   ├── seed_veterans.json
│   ├── seed_jobs.json
│   ├── seed_employers.json
│   └── STR/                     # Service record reference data
│
├── docs/                         # Documentation
│   ├── COMPREHENSIVE_SUMMARY.md
│   ├── DISABILITY_CALCULATOR.md
│   ├── SCANNER_IMPLEMENTATION_COMPLETE.md
│   └── RETIREMENT_TOOL_REBUILD.md
│
├── config/                       # Configuration files
│   └── upload_config.json
│
├── package.json                  # Root package management
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # Container definition
└── README.md                     # Main readme
```

---

## 🚀 Quick Start

### Development Mode (Full Stack)
```bash
npm run dev:all
```
This starts both frontend (port 5173/5174) and backend (port 8000) concurrently.

### Frontend Only
```bash
npm run dev
```

### Backend Only
```bash
npm run dev:backend
```

---

## 🔧 Key Features

### Current Implementation

✅ **Disability Wizard** - 5-step guided claim strategy builder
✅ **Document Scanner** - DD214 and military document OCR
✅ **Retirement Planner** - Comprehensive retirement projection tool
✅ **Budget Tool** - Income/expense tracking and analysis
✅ **Profile Management** - Veteran profile with customization
✅ **Settings** - User preferences and configuration

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Recharts for visualizations

**Backend:**
- Python 3.11+ with FastAPI
- SQLAlchemy for database ORM
- Pydantic for data validation
- Tesseract for OCR
- PostgreSQL for production database

---

## 📦 Archived Directories

The following directories have been archived to `_archive/` to maintain a clean structure:

- `_archive/frontend-duplicate-YYYYMMDD/` - Older Capacitor-based mobile structure
- `_archive/backend-duplicate-YYYYMMDD/` - Duplicate backend implementation
- `_archive/rallyforge-platform-reference-YYYYMMDD/` - TypeScript domain architecture reference

These are kept for reference but are no longer part of the active codebase.

---

## 🎨 Design System

Located in `design_system/` with Figma exports and design tokens.

---

## 🗄️ Database

- **Development:** SQLite (`rallyforge.db`)
- **Production:** PostgreSQL (configured via environment variables)

---

## 📝 Environment Variables

Create a `.env` file in the root:

```env
# Backend
DATABASE_URL=sqlite:///./rallyforge.db
OPENAI_API_KEY=your-key-here
USE_MOCK_AI=true

# Frontend
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_AI=true
```

---

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
npm run test:backend

# Coverage
npm run test:coverage
```

---

## 🏗️ Build & Deploy

```bash
# Build frontend
npm run build

# Build backend dependencies
npm run build:backend

# Docker
docker-compose up --build
```

---

## 📚 Documentation

- [README.md](./README.md) - Main project overview
- [COMPREHENSIVE_SUMMARY.md](./docs/COMPREHENSIVE_SUMMARY.md) - Complete feature guide
- [SCANNER_IMPLEMENTATION_COMPLETE.md](./docs/SCANNER_IMPLEMENTATION_COMPLETE.md) - Scanner docs
- [DISABILITY_CALCULATOR.md](./docs/DISABILITY_CALCULATOR.md) - Disability wizard docs

---

## 🤝 Contributing

1. Work from the unified structure (`rally-forge-frontend` + `rally-forge-backend`)
2. Follow the established patterns and conventions
3. Update documentation as needed
4. Test thoroughly before committing

---

## ✅ Current Status

**Active Development** - All features consolidated into single coherent application structure.

**Next Steps:**
- Enhance mobile responsiveness
- Add more domain features (Employment, Education, etc.)
- Improve test coverage
- Deploy to production

---

**rallyforge: Supporting Veterans on Every Path Forward** 🇺🇸


