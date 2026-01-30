# rallyforge - Quick Testing Guide
## Post-Reorganization Testing

### ✅ Quick Start (5 Minutes)

#### 1. **Start the Development Server**
```powershell
cd "c:\Dev\Rally Forge\rally-forge-frontend"
npm run dev
```

#### 2. **Open the Application**
- Navigate to: `http://localhost:5173/`
- You should see the enhanced home page with the big "GET STARTED" button

---

### 🧪 Test Cases

#### **Test 1: Branch Theme Selection**
1. Click the ⚙️ settings gear icon (top-right corner)
2. Side panel should slide open from the right
3. Click each branch theme:
   - 🪖 Army (green theme)
   - ⚓ Navy (blue theme)
   - ✈️ Air Force (light blue theme)
   - 🦅 Marine Corps (red theme)
   - 🛟 Coast Guard (coast guard blue theme)
   - 🚀 Space Force (black with stars)
   - 🇺🇸 Patriotic (red/white/blue)
4. **Expected:** Background, header, and footer change colors instantly
5. **Expected:** Selected theme shows checkmark and yellow ring
6. Close settings panel
7. Refresh page
8. **Expected:** Selected theme persists (saved to localStorage)

---

#### **Test 2: Disability Search (Manual Entry)**
1. Click "START NOW - Get Your Benefits" button
2. Fill in Step 1 (Profile):
   - First Name: "John"
   - Last Name: "Smith"
   - Branch: Select "Army"
   - Years: "20"
   - Check "combat service" box
3. Click "Next →"
4. You're now on Step 2 (Disabilities)
5. **Test Disability Search:**
   - In the search box (Option 2), type: "knee"
   - **Expected:** Dropdown appears with "Knee Strain" and related conditions
   - Click "Knee Strain"
   - **Expected:** Condition added to "Selected Disabilities" list
   - **Expected:** Rating dropdown shows common percentages (0%, 10%, 20%, 30%, 40%, 50%)
   - Select "30%" from dropdown
6. Search again: "ptsd"
   - **Expected:** "Post-Traumatic Stress Disorder (PTSD)" appears
   - Click it
   - Select "70%" rating
7. Search: "back"
   - **Expected:** "Back Strain/Sprain" appears
   - Click it
   - Select "40%" rating
8. **Expected:** Combined rating displayed shows: **90%** (VA combined ratings table)
9. Click "Next →"

---

#### **Test 3: Document Upload (Optional - if you have a test PDF)**
1. On Step 2 (Disabilities)
2. Under "Option 1: Upload VA Rating Decision":
   - Click "📁 Choose File"
   - Select a PDF file (any PDF for testing)
   - Click "🔍 Scan Document"
3. **Expected:**
   - Progress messages appear: "📄 Reading document..." → "🔍 Analyzing..." → "🤖 AI extracting..."
   - If PDF contains disability keywords, they'll be extracted
   - Ratings will be auto-populated
4. **Note:** This feature works best with actual VA rating decision letters

---

#### **Test 4: Complete Onboarding Wizard**
1. Continue from Step 2 → Click "Next →"
2. **Step 3 (Dependents):**
   - Check "I am married"
   - Enter "2" for number of children
   - Check "dependents in school" (if applicable)
   - Click "Next →"
3. **Step 4 (Review):**
   - **Expected:** See all your entered information:
     - Personal Info (name, branch)
     - Disabilities with combined rating
     - Dependent info
   - Click "🚀 Go to Dashboard"
4. **Expected:** Navigate to `/dashboard` showing personalized benefits

---

#### **Test 5: Benefits Dashboard**
1. After completing wizard, you should be on the dashboard
2. **Expected to see:**
   - Header showing your name and combined rating
   - Monthly compensation amount
   - Benefit cards for:
     - VA Disability Compensation
     - Special Monthly Compensation (SMC) if eligible
     - DEA (Chapter 35) if eligible
     - Aid & Attendance if eligible
     - SAH Grant if eligible
     - SHA Grant if eligible
     - Housebound if eligible
     - CRSC if eligible
     - Vocational Rehab if eligible
3. Click on any benefit card
4. **Expected:** Modal opens showing:
   - Detailed requirements
   - Estimated amount
   - Next steps to apply
   - "Apply Now" button

---

#### **Test 6: Navigation & Persistence**
1. Click "Rally Forge" logo (top-left) → Go back to Home
2. **Expected:** Green "Welcome Back!" banner appears (profile completed)
3. Click "View My Benefits Dashboard"
4. **Expected:** Returns to dashboard with saved data
5. Navigate to different pages (Claims, Retirement, etc.)
6. **Expected:** Header/footer match selected theme
7. Close browser completely
8. Reopen `http://localhost:5173/`
9. **Expected:**
   - Theme persists
   - Profile data persists
   - "Welcome Back" banner shows

---

### 🐛 Common Issues & Fixes

#### **Issue: "Module not found" errors**
**Fix:**
```powershell
cd "c:\Dev\Rally Forge\rally-forge-frontend"
npm install
```

#### **Issue: PDF scanning doesn't work**
**Fix:**
- Ensure `pdfjs-dist` is installed:
```powershell
npm install pdfjs-dist
```

#### **Issue: Theme doesn't change**
**Fix:**
- Clear browser cache and localStorage:
  - Open DevTools (F12)
  - Application tab → Storage → Clear site data
  - Refresh page

#### **Issue: Settings panel doesn't open**
**Fix:**
- Check browser console (F12) for errors
- Ensure all context providers are wrapping the app correctly

---

### 📊 Visual Verification

#### **Expected Look:**
- **Home Page:** Big blue/purple gradient banner with "🎖️ Welcome, Veteran!"
- **Settings Panel:** Slides in from right, shows 7 theme cards with icons
- **Onboarding:** Clean white cards with progress bar at top
- **Dashboard:** Colorful benefit cards with eligibility badges

#### **Theme Colors Reference:**
- **Army:** Dark olive green (#4B5320)
- **Navy:** Dark blue (#000080)
- **Air Force:** Air force blue (#00308F)
- **Marines:** Scarlet red (#CC0000)
- **Coast Guard:** Coast guard blue (#034F8B)
- **Space Force:** Black (#000000) with white stars
- **Patriotic:** Blue/red/white (#003366, #B22234)

---

### ✅ Success Criteria

**All Tests Pass If:**
- ✅ Settings panel opens and changes theme
- ✅ Disability search returns results
- ✅ Manual condition entry works
- ✅ Combined rating calculates correctly
- ✅ Onboarding wizard completes all 4 steps
- ✅ Dashboard shows personalized benefits
- ✅ Data persists after browser refresh
- ✅ Navigation works throughout app
- ✅ No console errors (except linting warnings)

---

### 🚀 Performance Benchmarks

**Target Times:**
- Page load: < 2 seconds
- Theme change: Instant (< 100ms)
- Search results: < 200ms
- Wizard step change: < 100ms
- Dashboard load: < 1 second

---

### 📱 Mobile Testing (Optional)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "iPad"
4. Test all workflows above
5. **Note:** Header navigation may need hamburger menu for mobile

---

### 🎉 If Everything Works...

You should be able to:
1. **Upload a VA rating decision** → Auto-extract disabilities
2. **Or search and add** disabilities manually with predictive text
3. **Choose your branch theme** → See personalized colors everywhere
4. **Complete onboarding** → Get personalized benefits dashboard
5. **View all eligible benefits** → With amounts, requirements, and next steps

**Congratulations! The reorganization is complete and functional!** 🎊


