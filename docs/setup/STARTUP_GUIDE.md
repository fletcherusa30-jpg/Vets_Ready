# Vets Ready - Application Startup Guide

## Quick Start (One Command)

### Development Mode (Recommended for Development)
```powershell
.\Start-VetsReady.ps1
```

This will:
1. ✅ Check all prerequisites (Node.js, Python, PostgreSQL, Redis)
2. ✅ Install frontend dependencies (npm)
3. ✅ Install backend dependencies (pip in virtual environment)
4. ✅ Initialize database with migrations
5. ✅ Start frontend dev server (http://localhost:5173)
6. ✅ Start backend API server (http://localhost:8000)

### Docker Mode (Production-like Environment)
```powershell
.\Start-VetsReady.ps1 -Mode docker
```

### Fresh Installation
```powershell
.\Start-VetsReady.ps1 -Fresh
```

### Skip Dependency Installation (Faster Restarts)
```powershell
.\Start-VetsReady.ps1 -SkipDeps
```

---

## Prerequisites

### Required Software

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| Node.js | 20.0.0+ | https://nodejs.org/ |
| Python | 3.11.0+ | https://www.python.org/ |
| PostgreSQL | 15.0.0+ | https://www.postgresql.org/ |
| Redis | 7.0.0+ | https://redis.io/ |
| Docker Desktop | 24.0.0+ (optional) | https://www.docker.com/ |

### Installing PostgreSQL (Windows)

1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for `postgres` user
4. Remember the port (default: 5432)

### Installing Redis (Windows)

**Option 1: WSL (Recommended)**
```powershell
wsl --install
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**Option 2: Windows Native**
Download from: https://github.com/microsoftarchive/redis/releases

---

## Manual Setup (If You Prefer Step-by-Step)

### 1. Frontend Setup

```powershell
cd vets-ready-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 2. Backend Setup

```powershell
cd vets-ready-backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start backend server
python -m uvicorn app.main:app --reload
```

Backend API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 3. Database Setup

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE vetsready_db;
CREATE USER vetsready WITH PASSWORD 'vetsready123';
GRANT ALL PRIVILEGES ON DATABASE vetsready_db TO vetsready;
\q
```

---

## Docker Setup (Production-like)

### Build and Run

```powershell
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

### Access Points
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **API Docs**: http://localhost/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Environment Configuration

### Frontend (.env in vets-ready-frontend/)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="Vets Ready"
VITE_APP_VERSION="1.0.0"
VITE_ENVIRONMENT=development
```

### Backend (.env in vets-ready-backend/)
```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql://vetsready:vetsready123@localhost:5432/vetsready_db
JWT_SECRET=your-super-secret-key-change-in-production
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_key_here
```

---

## Troubleshooting

### Frontend Issues

**Problem: `npm install` fails**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstall
npm install
```

**Problem: Port 5173 already in use**
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Backend Issues

**Problem: Python dependencies fail to install**
```powershell
# Make sure you're in the virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install build tools
pip install wheel setuptools

# Try installing again
pip install -r requirements.txt
```

**Problem: Database connection fails**
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL
Start-Service postgresql-x64-15

# Test connection
psql -U postgres -c "SELECT version();"
```

**Problem: Redis connection fails**
```powershell
# If using WSL
wsl
sudo service redis-server start
redis-cli ping  # Should return PONG

# If using Windows native
redis-server
```

### Docker Issues

**Problem: Docker containers won't start**
```powershell
# Check Docker is running
docker --version

# View container logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## Development Workflow

### Typical Development Session

1. **Start the application:**
   ```powershell
   .\Start-VetsReady.ps1 -SkipDeps
   ```

2. **Make changes to code**
   - Frontend changes auto-reload (Vite HMR)
   - Backend changes auto-reload (uvicorn --reload)

3. **Test your changes**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/docs

4. **Stop servers:** Press `Ctrl+C`

### Running Tests

**Frontend Tests:**
```powershell
cd vets-ready-frontend
npm run test
npm run test:coverage
```

**Backend Tests:**
```powershell
cd vets-ready-backend
.\.venv\Scripts\Activate.ps1
pytest
pytest --cov=app tests/
```

### Database Migrations

**Create a new migration:**
```powershell
cd vets-ready-backend
.\.venv\Scripts\Activate.ps1
alembic revision --autogenerate -m "Description of changes"
```

**Apply migrations:**
```powershell
alembic upgrade head
```

**Rollback migration:**
```powershell
alembic downgrade -1
```

---

## Project Structure

```
C:\Dev\Vets Ready\
├── vets-ready-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API services
│   │   └── lib/                  # Utilities
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript config
│   └── .env                      # Frontend environment
│
├── vets-ready-backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── main.py               # FastAPI application
│   │   ├── routers/              # API endpoints
│   │   ├── models/               # Database models
│   │   ├── schemas/              # Pydantic schemas
│   │   └── services/             # Business logic
│   ├── alembic/                  # Database migrations
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Backend environment
│
├── docker-compose.prod.yml       # Docker orchestration
├── Start-VetsReady.ps1           # One-click startup script
└── README.md                     # This file
```

---

## Key Features

### Frontend (React + Vite + TypeScript)
- ⚡ Lightning-fast HMR with Vite
- 🎨 Tailwind CSS for styling
- 🔄 React Query for data fetching
- 📱 PWA support with offline capabilities
- 🧪 Vitest for testing

### Backend (FastAPI + Python)
- 🚀 High-performance async API
- 📊 PostgreSQL database with SQLAlchemy ORM
- 🔒 JWT authentication
- 💳 Stripe payment integration
- 📝 Automatic API documentation (OpenAPI/Swagger)
- 🔄 Database migrations with Alembic
- 📈 Redis caching layer

---

## Support & Resources

### Documentation
- **API Documentation**: http://localhost:8000/docs (when running)
- **Frontend Components**: See `vets-ready-frontend/src/components/`
- **Database Schema**: See `vets-ready-backend/alembic/versions/`

### Logs
- **Startup logs**: `logs/startup-YYYYMMDD-HHmmss.log`
- **Frontend logs**: Browser console
- **Backend logs**: Terminal output or `logs/` directory

### Getting Help
1. Check this README
2. Review logs in `logs/` directory
3. Check API documentation at http://localhost:8000/docs
4. Review error messages carefully

---

## Next Steps

1. ✅ **Get the application running** with `.\Start-VetsReady.ps1`
2. 📖 **Explore the API docs** at http://localhost:8000/docs
3. 🎨 **Check out the frontend** at http://localhost:5173
4. 🔧 **Configure environment variables** in `.env` files
5. 🧪 **Run tests** to ensure everything works
6. 🚀 **Start building features!**

---

## Production Deployment

For production deployment instructions, see:
- `docs/DEPLOYMENT.md` - Comprehensive deployment guide
- `docs/PRODUCTION_ARCHITECTURE.md` - Architecture overview
- `docker-compose.prod.yml` - Production Docker configuration

---

**Happy Coding! 🎉**

For issues or questions, review the logs at `logs/startup-*.log`
