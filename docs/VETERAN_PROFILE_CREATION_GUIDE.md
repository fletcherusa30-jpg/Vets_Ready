# Veteran User Profile Creation & Management Guide

## Overview

VetsReady has two separate user management systems:

1. **Authentication User** (`vets-ready-backend`) - Core authentication, subscriptions, badges
2. **Veteran Profile** (`backend`) - Service details, disability ratings, benefits tracking

This guide explains how veterans create and manage their profiles.

---

## Current State

### 1. Authentication System (vets-ready-backend)
Located in: `vets-ready-backend/app/models/user.py`

**Current Fields**:
- `id`: UUID
- `email`: Unique email address
- `full_name`: Veteran's name
- `hashed_password`: Secure password
- `is_active`: Account status
- `military_branch`: Service branch (e.g., "Army")
- `service_start_date`: When service began
- `service_end_date`: Discharge/separation date
- `discharge_type`: Honorable, General, Other Than Honorable
- `mos`: Military Occupational Specialty
- `subscription_tier`: FREE, PRO, FAMILY, LIFETIME
- `profile_visibility`: private, public, vso_only

**Login Endpoint**:
```
POST /auth/login
Body: { "email": "...", "password": "..." }
Response: { "token": "...", "user": {...} }
```

### 2. Veteran Profile System (backend)
Located in: `backend/app/models` and `backend/app/main.py`

**Current Fields**:
- `first_name`, `last_name`
- `email`, `phone`
- `service_branch`: Army, Navy, Air Force, Marines, Coast Guard, Space Force
- `separation_rank`: Military rank at separation
- `years_service`: Total years
- `separation_date`: DD-214 date
- `discharge_status`: HONORABLE, GENERAL, OTHER_THAN_HONORABLE
- `disability_rating`: VA rating percentage
- `profile_complete`: Boolean flag

---

## How Veterans Create Their Profile

### Option 1: Via Login Page (Recommended)
**File**: `frontend/src/pages/Login.tsx`

**Flow**:
```
1. User clicks "Create Account" button
2. Redirected to signup form
3. Enters email, full name, password
4. Account created in authentication system
5. Redirected to Profile Setup Wizard (optional)
6. Veteran enters service details in 5-step wizard
7. Profile saved to database
8. Access all tools (Budget, Disability Calculator, Retirement, etc.)
```

### Option 2: Via Profile Page (If Already Logged In)
**File**: `frontend/src/pages/Profile.tsx`

**Current Implementation**:
```tsx
const Profile = () => {
  const user = useAppStore((s) => s.user);
  return (
    <Page title="Profile">
      <div style={{ maxWidth: 400 }}>
        <h2>User Profile</h2>
        {user ? (
          <>
            <div><strong>Email:</strong> {user.email}</div>
          </>
        ) : (
          <div>No user info available.</div>
        )}
      </div>
    </Page>
  );
};
```

**Issue**: Profile page doesn't show profile creation form or service details.

---

## Recommended Profile Creation Flow

### Step 1: Signup (New Veterans)

**Location**: `frontend/src/pages/Login.tsx` with "Create Account" tab

```typescript
interface SignupForm {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

// API Call:
POST /auth/register
{
  "email": "john.smith@example.com",
  "full_name": "John Smith",
  "password": "securepass123"
}

Response:
{
  "id": "uuid-123",
  "email": "john.smith@example.com",
  "full_name": "John Smith",
  "token": "jwt-token-here"
}
```

### Step 2: Veteran Profile Setup Wizard (5 Steps)

After successful signup, redirect to: `/profile-setup`

**Step 1: Basic Information**
- First Name
- Last Name
- Date of Birth
- Email (pre-filled)

**Step 2: Military Service**
- Service Branch (dropdown)
- Years of Service (number)
- Separation Rank (dropdown)
- Military Occupational Specialty (text)

**Step 3: Discharge Information**
- Discharge Date (date picker)
- Discharge Type (dropdown: Honorable, General, OTH, etc.)
- Separation Code (text)

**Step 4: Disability & Benefits**
- VA Disability Rating (dropdown: 0%, 10%, 20%, ... 100%)
- Combat-Related? (checkbox)
- CRSC Eligible? (checkbox)
- Upload DD-214 (optional)

**Step 5: Review & Confirm**
- Show summary of all entered data
- "Confirm & Create Profile" button

**API Call** (at end of wizard):
```
POST /api/veterans
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "phone": "555-1234",
  "service_branch": "Army",
  "separation_rank": "E-7",
  "years_service": 22,
  "separation_date": "2023-01-15",
  "discharge_status": "HONORABLE",
  "disability_rating": 30
}

Response:
{
  "id": "veteran-123",
  "message": "Veteran profile created successfully",
  "veteran": {
    "id": "veteran-123",
    "name": "John Smith",
    "email": "john.smith@example.com"
  }
}
```

### Step 3: Access Veteran Tools

Once profile is created, veteran can access:
- ✅ Budget Tool (plan finances)
- ✅ Disability Calculator (calculate VA rating)
- ✅ Retirement Tool (plan retirement)
- ✅ Scanner (upload DD-214)
- ✅ Resume Builder (create military resume)
- ✅ Job Matching (find jobs)

---

## Update Existing Profile

If veteran already has a profile and wants to update:

```
PUT /api/veterans/{veteran_id}
{
  "disability_rating": 50,  // Update only changed fields
  "phone": "555-9999"
}

Response:
{
  "message": "Veteran profile updated successfully",
  "veteran": {
    "id": "veteran-123",
    "name": "John Smith",
    "updated_at": "2026-01-28T15:30:00Z"
  }
}
```

---

## Profile Page Redesign (Recommended)

Currently shows "No user info available." - should be redesigned to:

### Option A: Show Profile Summary + Edit Button
```typescript
const Profile = () => {
  const user = useAppStore((s) => s.user);
  const [veteran, setVeteran] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      // Fetch veteran profile
      axios.get(`/api/veterans/${user.id}`)
        .then(res => setVeteran(res.data))
        .catch(() => setIsEditing(true)); // If no profile, show form
    }
  }, [user]);

  if (!veteran && !isEditing) {
    return <CreateProfileForm />;
  }

  return (
    <Page title="Profile">
      <div className="profile-container">
        <div className="profile-card">
          <h2>{veteran?.first_name} {veteran?.last_name}</h2>
          <div className="profile-details">
            <div><strong>Email:</strong> {veteran?.email}</div>
            <div><strong>Service Branch:</strong> {veteran?.service_branch}</div>
            <div><strong>Years of Service:</strong> {veteran?.years_service}</div>
            <div><strong>Discharge:</strong> {veteran?.discharge_status}</div>
            <div><strong>VA Disability:</strong> {veteran?.disability_rating}%</div>
          </div>
          <button onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
        </div>

        {isEditing && <EditProfileForm veteranId={veteran?.id} />}

        {/* Profile Completion Status */}
        <div className="completion-status">
          <h3>Profile Completion</h3>
          <ProgressBar value={veteran?.profile_complete ? 100 : 60} />
          {!veteran?.profile_complete && (
            <button>Complete Profile →</button>
          )}
        </div>

        {/* Account Settings */}
        <div className="account-settings">
          <h3>Account Settings</h3>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Two-Factor Authentication</label>
            <button>Enable</button>
          </div>
          <button className="btn-danger">Logout</button>
        </div>
      </div>
    </Page>
  );
};
```

### Option B: Settings Page Solution

Move profile settings to dedicated Settings page:

**File**: `frontend/src/pages/Settings.tsx` (currently blank)

```typescript
const Settings = () => {
  const user = useAppStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');

  return (
    <Page title="Settings">
      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            🧑 Profile
          </button>
          <button
            className={activeTab === 'account' ? 'active' : ''}
            onClick={() => setActiveTab('account')}
          >
            🔐 Account
          </button>
          <button
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
        </div>

        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'account' && <AccountTab user={user} />}
        {activeTab === 'preferences' && <PreferencesTab user={user} />}
      </div>
    </Page>
  );
};
```

---

## Create Profile Form Component

**File**: `frontend/src/components/CreateProfileForm.tsx`

```typescript
import React, { useState } from 'react';
import axios from 'axios';

const CreateProfileForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    service_branch: '',
    separation_rank: '',
    years_service: '',
    separation_date: '',
    discharge_status: '',
    disability_rating: 0
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/veterans', formData);
      alert('Profile created successfully!');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      alert('Error creating profile: ' + error.response?.data?.detail);
    }
  };

  return (
    <div className="create-profile-form">
      <h1>Complete Your Veteran Profile</h1>
      <div className="progress-bar">
        <div style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>

      {step === 1 && (
        <div className="form-step">
          <h2>Basic Information</h2>
          <input placeholder="First Name" onChange={(e) => handleChange('first_name', e.target.value)} />
          <input placeholder="Last Name" onChange={(e) => handleChange('last_name', e.target.value)} />
          <input placeholder="Email" onChange={(e) => handleChange('email', e.target.value)} />
        </div>
      )}

      {step === 2 && (
        <div className="form-step">
          <h2>Military Service</h2>
          <select onChange={(e) => handleChange('service_branch', e.target.value)}>
            <option>Select Branch...</option>
            <option value="Army">Army</option>
            <option value="Navy">Navy</option>
            <option value="Air Force">Air Force</option>
            <option value="Marines">Marines</option>
            <option value="Coast Guard">Coast Guard</option>
            <option value="Space Force">Space Force</option>
          </select>
          <input type="number" placeholder="Years of Service" onChange={(e) => handleChange('years_service', e.target.value)} />
          <input placeholder="Separation Rank (E-7, O-4, etc.)" onChange={(e) => handleChange('separation_rank', e.target.value)} />
        </div>
      )}

      {step === 3 && (
        <div className="form-step">
          <h2>Discharge Information</h2>
          <input type="date" onChange={(e) => handleChange('separation_date', e.target.value)} />
          <select onChange={(e) => handleChange('discharge_status', e.target.value)}>
            <option>Select Discharge Type...</option>
            <option value="HONORABLE">Honorable</option>
            <option value="GENERAL">General Under Honorable Conditions</option>
            <option value="OTHER_THAN_HONORABLE">Other Than Honorable</option>
          </select>
        </div>
      )}

      {step === 4 && (
        <div className="form-step">
          <h2>VA Disability & Benefits</h2>
          <select onChange={(e) => handleChange('disability_rating', parseInt(e.target.value))}>
            <option value="0">No Disability Rating</option>
            <option value="10">10%</option>
            <option value="20">20%</option>
            <option value="30">30%</option>
            <option value="40">40%</option>
            <option value="50">50%</option>
            <option value="60">60%</option>
            <option value="70">70%</option>
            <option value="80">80%</option>
            <option value="90">90%</option>
            <option value="100">100%</option>
          </select>
        </div>
      )}

      {step === 5 && (
        <div className="form-step">
          <h2>Review Your Information</h2>
          <div className="summary">
            <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
            <p><strong>Branch:</strong> {formData.service_branch}</p>
            <p><strong>Years:</strong> {formData.years_service}</p>
            <p><strong>Disability:</strong> {formData.disability_rating}%</p>
          </div>
          <button onClick={handleSubmit} className="btn-primary">
            Create Profile
          </button>
        </div>
      )}

      <div className="form-buttons">
        {step > 1 && <button onClick={() => setStep(step - 1)}>← Back</button>}
        {step < 5 && <button onClick={() => setStep(step + 1)}>Next →</button>}
      </div>
    </div>
  );
};

export default CreateProfileForm;
```

---

## Integration Points

### 1. Navigation
Add "Create Profile" link in navbar:
```typescript
{!user?.profileComplete && (
  <Link to="/profile-setup">Create Profile</Link>
)}
```

### 2. Settings Link (Currently Broken)
**Issue**: Settings page is blank
**Solution**:
- Route to Settings should navigate to `/settings`
- Settings page should handle profile management
- Add theme toggle (currently only feature)

### 3. Dashboard Integration
After profile creation, redirect to Dashboard showing:
- Profile completion status
- Available tools
- Quick stats

---

## Database Schema

### Users Table (vets-ready-backend)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  hashed_password VARCHAR(255),
  military_branch VARCHAR(50),
  service_start_date DATETIME,
  service_end_date DATETIME,
  mos VARCHAR(20),
  subscription_tier VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Veterans Table (backend)
```sql
CREATE TABLE veterans (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  service_branch VARCHAR(50),
  separation_rank VARCHAR(20),
  years_service INT,
  separation_date DATE,
  discharge_status VARCHAR(50),
  disability_rating INT,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Reference

### Create Veteran Profile
```
POST /api/veterans
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "555-1234",
  "service_branch": "Army",
  "separation_rank": "E-7",
  "years_service": 22,
  "separation_date": "2023-01-15",
  "discharge_status": "HONORABLE",
  "disability_rating": 30
}

Response: 201 Created
{
  "id": "vet-123",
  "message": "Veteran profile created successfully",
  "veteran": {
    "id": "vet-123",
    "name": "John Smith",
    "email": "john@example.com"
  }
}
```

### Get Veteran Profile
```
GET /api/veterans/{veteran_id}

Response: 200 OK
{
  "id": "vet-123",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "service_branch": "Army",
  "years_service": 22,
  "disability_rating": 30,
  "profile_complete": true,
  "created_at": "2026-01-15T10:00:00Z"
}
```

### Update Veteran Profile
```
PUT /api/veterans/{veteran_id}
Content-Type: application/json

{
  "disability_rating": 50,
  "phone": "555-9999"
}

Response: 200 OK
{
  "message": "Veteran profile updated successfully",
  "veteran": { ... }
}
```

### Delete Veteran Profile
```
DELETE /api/veterans/{veteran_id}

Response: 204 No Content
```

---

## Summary: How Veterans Add Their Profile

### Quick Answer
1. **Login/Signup** → Create account with email & password
2. **Profile Setup Wizard** → 5 steps (basic info, military, discharge, disability, review)
3. **Submit** → Profile saved to database
4. **Access Tools** → Budget, Calculator, Retirement, etc.

### Where to Add "Create Profile" Button
- Login page: "Don't have a profile? Create one →"
- Dashboard: Prominent "Complete Your Profile" card
- Sidebar/Nav: Profile menu with "Setup Profile" option
- Settings page: "Complete Your Veteran Profile"

### What Happens Behind Scenes
1. Veteran fills form (frontend)
2. Frontend calls `POST /api/veterans`
3. Backend validates and stores profile
4. Frontend stores `profileComplete` flag
5. Veteran gains access to all tools
6. Can edit profile anytime via Settings

---

**Status**: Documentation complete for implementation
**Next Steps**: Implement profile creation form + Settings page + fix blank Settings page
