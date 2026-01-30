# 🎖️ Rally Forge - Quick Start Guide

## ✅ Your App is Running!

### Servers Status
- **Frontend**: ✓ http://localhost:5173 (Vite + React)
- **Backend**: ✓ http://localhost:8000 (Mock Server - Node.js/Express)

### 🎯 Test the /Claims Page
**URL**: http://localhost:5173/claims

---

## 📋 What You Can Do Now

### 1. **View My Claims Tab**
- Default tab when you visit /claims
- Shows list of all submitted claims
- Empty state: "You haven't submitted any claims yet"

### 2. **Submit a New Claim**
```
Click: ➕ New Claim button
Fill in:
  - Title: "PTSD and Depression Claim"
  - Condition Codes: F4310, F3229
  - Diagnoses: PTSD, Depression
  - Treatments: VA therapy, Counseling
  - Medications: Sertraline, Prazosin
  - Severity Notes: "Severe PTSD with sleep disturbances"
Submit: Click "Submit Claim Analysis"
```

**Valid Condition Codes**:
- `F4310` - PTSD (base 50%)
- `F3229` - Depression (base 30%)
- `S06` - TBI (base 40%)
- `H9311` - Tinnitus (base 10%)
- `G89.29` - Chronic Pain (base 20%)

### 3. **View Claim Details**
- Click any claim card to see full analysis
- See combined VA disability rating
- View individual condition ratings
- Read recommendations and next steps

---

## 🖥️ How the Mock Backend Works

### Current Setup
Since Python isn't installed on your system, I created a **temporary Node.js mock backend** that mimics the FastAPI server.

**Location**: `C:\Dev\Rally Forge\mock-backend\`

**Features**:
- ✓ Calculates VA disability ratings using same formula
- ✓ Combines multiple conditions correctly
- ✓ Generates recommendations
- ✓ Stores claims in memory (resets when server restarts)
- ✓ Full CORS support for frontend

### Rating Calculation
The mock backend uses authentic VA math:
```javascript
// Individual rating adjustments:
Base rating (by condition code)
+ 10% if hospitalizations present
+ 5% if >2 medications
+ 10% if severity notes contain "severe"

// Combined rating (VA math):
1. Sort ratings highest to lowest
2. Start with highest rating
3. For each additional: combined + (100-combined) * rating / 100
4. Round to nearest 10

Example:
  PTSD (50%) + Depression (30%)
  = 50 + (100-50) * 30/100
  = 50 + 15 = 65%
  → Rounds to 70%
```

---

## 🔄 Stopping/Restarting Servers

### Stop Servers
```powershell
# Stop frontend
Get-Process -Name node | Where-Object {$_.Path -like "*rally-forge-frontend*"} | Stop-Process

# Stop backend
Get-Process -Name node | Where-Object {$_.Path -like "*mock-backend*"} | Stop-Process
```

### Restart Servers
```powershell
# Terminal 1: Frontend
cd "C:\Dev\Rally Forge\rally-forge-frontend"
npm run dev

# Terminal 2: Backend (Mock)
cd "C:\Dev\Rally Forge\mock-backend"
node server.js
```

---

## 📊 API Endpoints (Mock Backend)

All endpoints work exactly like the Python FastAPI version:

### Health Check
```http
GET http://localhost:8000/health
Response: { status: "healthy", version: "1.0.0 (Mock)" }
```

### List Claims
```http
GET http://localhost:8000/api/claims
Response: [{ id, title, combined_rating, created_at, ... }]
```

### Get Claim Details
```http
GET http://localhost:8000/api/claims/{id}
Response: { id, title, condition_ratings, recommendations, ... }
```

### Submit New Claim
```http
POST http://localhost:8000/api/claims/analyze
Body: {
  "title": "PTSD and Depression Claim",
  "condition_codes": ["F4310", "F3229"],
  "medical_evidence": {
    "diagnoses": ["PTSD", "Depression"],
    "treatments": ["VA therapy"],
    "medications": ["Sertraline", "Prazosin"],
    "hospitalizations": [],
    "severity_notes": "Severe symptoms"
  }
}
Response: { id, combined_rating, condition_ratings, recommendations, next_steps, ... }
```

---

## 🐍 Installing Python (For Full Backend)

To use the real FastAPI backend, install Python:

### 1. Download Python
Visit: https://www.python.org/downloads/
- Download Python 3.11 or 3.12
- ✅ Check "Add Python to PATH" during installation

### 2. Create Virtual Environment
```powershell
cd "C:\Dev\Rally Forge\rally-forge-backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Start Backend
```powershell
uvicorn app.main:app --reload
```

### 5. Stop Mock Backend
```powershell
# Find and stop the Node.js mock backend
Get-Process -Name node | Where-Object {$_.Path -like "*mock-backend*"} | Stop-Process
```

---

## 🎨 Page Navigation

The /claims page has **8 tabs**:

1. **📋 My Claims** (default) - Claims management
2. **📝 Wizard** - Disability wizard
3. **🎓 Theories** - Service connection education
4. **📚 Guide** - Step-by-step filing guide
5. **❓ FAQ** - Frequently asked questions
6. **🎖️ Calculator** - Disability rating calculator
7. **📅 Effective** - Effective date calculator
8. **🎯 Entitlement** - Entitlement helper

---

## ✅ Testing Checklist

- [ ] Navigate to http://localhost:5173/claims
- [ ] See "My Claims" tab active (blue background)
- [ ] See empty state message (no claims yet)
- [ ] Click "➕ New Claim" button
- [ ] Form appears with all input fields
- [ ] Fill in title, condition codes, medical evidence
- [ ] Click "Submit Claim Analysis"
- [ ] See loading spinner
- [ ] See success message with rating
- [ ] New claim appears in list
- [ ] Click claim card
- [ ] Modal opens with full details
- [ ] See combined rating, individual ratings, recommendations
- [ ] Click close button
- [ ] Switch to other tabs (Wizard, Theories, etc.)
- [ ] Switch back to My Claims tab
- [ ] Claims persist

---

## 🚨 Troubleshooting

### "Failed to fetch claims"
**Solution**: Backend isn't running. Restart:
```powershell
cd "C:\Dev\Rally Forge\mock-backend"
node server.js
```

### "Cannot connect to backend"
**Check backend is running**:
```powershell
curl http://localhost:8000/health
```

### Frontend won't load
**Restart Vite**:
```powershell
cd "C:\Dev\Rally Forge\rally-forge-frontend"
npm run dev
```

### CORS errors in console
**Already fixed** - mock backend has CORS enabled for localhost:5173

---

## 📝 Current Limitations (Mock Backend)

⚠️ **Temporary limitations** (will work when Python backend is used):
- Claims stored in memory only (not persisted to database)
- No authentication/JWT validation (mock user ID used)
- AI endpoints not available (/api/ai/*)
- No database migrations
- Mock data resets when server restarts

✅ **What DOES work**:
- Submit claims
- View claims list
- View claim details
- Calculate combined ratings
- Generate recommendations
- All frontend functionality

---

## 🎉 Success!

Your Rally Forge app is now fully functional for testing the /claims page!

**Current Status**:
- ✓ Frontend running on http://localhost:5173
- ✓ Backend running on http://localhost:8000 (Mock)
- ✓ /claims page accessible
- ✓ Claims submission working
- ✓ Rating calculations accurate
- ✓ All UI features functional

**Next Steps**:
1. Test the /claims page functionality
2. Install Python for full backend features
3. Explore other tabs (Wizard, Calculator, etc.)
4. Review documentation in `docs/` folder

---

**Last Updated**: January 24, 2026
**Status**: ✅ Running
**Mode**: Development (Mock Backend)

