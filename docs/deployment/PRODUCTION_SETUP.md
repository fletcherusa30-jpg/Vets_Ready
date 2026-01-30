# ================================================
# Rally Forge - PRODUCTION SETUP GUIDE
# ================================================

## QUICK START

### 1. Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL 15+ (optional, using SQLite for development)

### 2. Backend Setup

```powershell
# Navigate to backend
cd "C:\Dev\Rally Forge\rally-forge-backend"

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py

# Seed database with test data (optional)
python scripts/seed_data.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**
API documentation: **http://localhost:8000/docs**

### 3. Frontend Setup

```powershell
# Navigate to frontend (new terminal)
cd "C:\Dev\Rally Forge\rally-forge-frontend"

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## IMPLEMENTED FEATURES

### ✅ Backend API (FastAPI + SQLAlchemy)
- **Authentication** (`/api/auth/*`)
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - User login
  - GET `/api/auth/verify` - Verify token

- **Claims Management** (`/api/claims/*`)
  - POST `/api/claims/analyze` - Analyze disability claim
  - GET `/api/claims/my-claims` - Get user's claims
  - GET `/api/claims/{id}` - Get specific claim
  - DELETE `/api/claims/{id}` - Delete claim

- **Retirement Planning** (`/api/retirement/*`)
  - POST `/api/retirement/eligibility` - Check eligibility
  - POST `/api/retirement/pension` - Calculate pension
  - POST `/api/retirement/budget` - Budget calculator

- **Conditions** (`/api/conditions/*`)
  - GET `/api/conditions` - List all VA conditions

- **Employer/Job Board** (`/api/employers/*`)
  - GET `/api/employers/pricing` - Get employer pricing
  - POST `/api/employers/accounts` - Create employer account
  - POST `/api/employers/jobs` - Post job listing
  - GET `/api/employers/jobs` - Search jobs

- **Subscriptions** (`/api/subscriptions/*`)
  - GET `/api/subscriptions/pricing` - Get veteran pricing tiers
  - POST `/api/subscriptions/subscribe` - Create subscription

### ✅ Frontend Pages (React + TypeScript + Tailwind)
- **Home** (`/`) - Landing page with stats, calculator, resources
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Claims** (`/claims`) - File disability claim + calculator
- **Retirement** (`/retirement`) - Pension calculator
- **Job Board** (`/jobs`) - Military-friendly job listings
- **Benefits** (`/benefits`) - Benefits tracking dashboard
- **Evidence** (`/evidence`) - Document upload

### ✅ Core Components
- **Calculator** - VA disability rating calculator
  - Multiple conditions support
  - Combined rating calculation (official VA formula)
  - Monthly/annual payment estimates
  - Dependents calculator
  - Real-time updates

### ✅ API Integration
- Axios HTTP client configured
- JWT authentication with interceptors
- Token storage and management
- Auto-redirect on 401 unauthorized

---

## TEST CREDENTIALS

After running `python scripts/seed_data.py`:

```
Email: veteran@test.com
Password: password123
```

---

## API ENDPOINTS REFERENCE

### Authentication
```
POST /api/auth/register
Body: {
  "email": "veteran@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "military_branch": "Army"
}

POST /api/auth/login
Body: {
  "email": "veteran@example.com",
  "password": "password123"
}
```

### Claims Analysis
```
POST /api/claims/analyze
Headers: Authorization: Bearer {token}
Body: {
  "conditions": [
    {"name": "PTSD", "rating": 70},
    {"name": "Tinnitus", "rating": 10}
  ],
  "service_connected": true
}

Response: {
  "combined_rating": 70,
  "monthly_payment": 1716,
  "annual_payment": 20592,
  "recommendations": [...]
}
```

### Retirement Calculation
```
POST /api/retirement/pension
Headers: Authorization: Bearer {token}
Body: {
  "base_pay": 5000,
  "years_of_service": 20,
  "disability_rating": 70
}

Response: {
  "monthly_pension": 2500,
  "disability_pay": 1716,
  "total_monthly": 4216,
  "total_annual": 50592
}
```

---

## ENVIRONMENT VARIABLES

### Backend `.env`
```env
DATABASE_URL=sqlite:///./instance/dev.db
JWT_SECRET=rally-forge-super-secret-jwt-key-change-in-production-minimum-32-characters
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

### Security
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `DEBUG=false` in production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/TLS
- [ ] Configure Stripe production keys
- [ ] Set up Sentry error tracking

### Database
- [ ] Run migrations: `alembic upgrade head`
- [ ] Set up database backups
- [ ] Configure connection pooling

### Performance
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Set up load balancing

### Monitoring
- [ ] Configure application monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Enable performance monitoring

---

## NEXT IMPLEMENTATION STEPS

### High Priority
1. **Connect Frontend to Backend**
   - Update API service calls to use real endpoints
   - Handle loading states and errors
   - Implement token refresh

2. **Complete Authentication Flow**
   - Protected routes
   - User profile page
   - Password reset

3. **Enhanced Claims Features**
   - Claim history/tracking
   - Evidence upload (S3/Azure Blob)
   - AI-powered recommendations

### Medium Priority
4. **Subscription/Payment Integration**
   - Stripe checkout
   - Subscription management
   - Payment history

5. **Employer Features**
   - Job posting interface
   - Applicant tracking
   - Resume search

6. **Admin Panel**
   - User management
   - Analytics dashboard
   - Content moderation

### Low Priority
7. **Mobile App**
   - Capacitor integration
   - Native features
   - Push notifications

---

## TROUBLESHOOTING

### Backend won't start
```powershell
# Check Python version
python --version  # Should be 3.11+

# Recreate virtual environment
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend errors
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Database errors
```powershell
# Reset database
Remove-Item instance/dev.db
python scripts/init_db.py
python scripts/seed_data.py
```

### CORS errors
- Ensure backend CORS_ORIGINS includes frontend URL
- Check that backend is running on port 8000
- Verify frontend is calling correct API_URL

---

## CONTACT & SUPPORT

For questions or issues:
1. Check API documentation: http://localhost:8000/docs
2. Review application logs
3. Test endpoints with Postman/Insomnia

---

**Built with ❤️ for Veterans**
🇺🇸 Serving Those Who Served 🇺🇸

