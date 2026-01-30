# Rally Forge - Folder Structure Analysis Report
**Date**: January 24, 2026
**Project Root**: C:\Dev\Rally Forge
**Analysis Phase**: PHASE 1 - COMPLETE

---

## 🎯 Executive Summary

**Status**: The project has a **good foundation** but contains **misplaced items**, **duplicated files**, and **loose root-level documentation** that should be organized.

**Key Findings**:
- ✅ Core subsystems (frontend, backend, mobile, shared) exist and are correctly placed
- ⚠️ **13 items require relocation** (ai-engine, android, desktop, data, partnerships, tests, etc.)
- ⚠️ **24 documentation files loose in root** should move to docs/
- ⚠️ **1 SQL file in root** (seed-data.sql) should move to SQL/
- ⚠️ **Root-level .venv and node_modules** detected (build artifacts that should be in subsystems)
- ✅ Target folder structure mostly in place (scripts/, diagnostics/, docs/, SQL/, logs/, config/)

---

## 📊 Current Structure Analysis

### ✅ CORRECTLY PLACED (No Action Needed)

#### Primary Subsystems
| Folder | Status | Contents | Notes |
|--------|--------|----------|-------|
| `rally-forge-frontend/` | ✅ Correct | React + Vite app, 21 files/folders | Clean, well-organized |
| `rally-forge-backend/` | ✅ Correct | FastAPI app, alembic, requirements.txt | Contains own tests/ folder |
| `rally-forge-mobile/` | ✅ Correct | Capacitor config, android/, ios/ | Contains backup .bak files to clean |
| `rally-forge-shared/` | ✅ Correct | Shared modules | Only README.md currently |

#### Support Folders
| Folder | Status | Contents | Notes |
|--------|--------|----------|-------|
| `scripts/` | ✅ Correct | 155+ PowerShell/shell scripts | Well-organized |
| `diagnostics/` | ✅ Correct | Diagnostic logs | 1 file currently |
| `docs/` | ✅ Correct | 35+ documentation files | Could absorb root MD files |
| `SQL/` | ✅ Correct | 4 SQL files | seed-data.sql in root should join |
| `logs/` | ✅ Correct | Application logs | Operational logs |
| `config/` | ✅ Correct | appsettings.json | Could absorb .env.example files |

#### Root Configuration Files (Correct)
- ✅ `docker-compose.prod.yml` - Production Docker orchestration
- ✅ `package.json` - Root workspace configuration
- ✅ `package-lock.json` - Dependency lock
- ✅ `README.md` - Main project README (keep in root)
- ✅ `.gitignore` - Git ignore rules
- ✅ `.env.example`, `.env.production.example`, `.env.monitoring` - Environment templates
- ✅ `Start-rallyforge.ps1` - One-click startup script
- ✅ `.github/` - GitHub workflows
- ✅ `.vscode/` - VS Code settings
- ✅ `.idea/` - JetBrains IDE settings
- ✅ `.git/` - Git repository

---

### ⚠️ INCORRECTLY PLACED (Requires Relocation)

#### 1. AI Engine (Backend Component)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `ai-engine/` | `C:\Dev\Rally Forge\ai-engine\` | `rally-forge-backend/ai-engine/` | Python module, backend logic |

**Contents**:
- Python files: cfr_interpreter.py, claimstrategyengine.py, engine.py, evidence_inference.py
- Subdirectories: ai-engine/, config/, prompts/, tools/, workflows/
- **Action**: Move entire folder to backend

---

#### 2. Android Build Artifacts (Mobile Component)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `android/` | `C:\Dev\Rally Forge\android\` | **DUPLICATE** - Already in `rally-forge-mobile/android/` | Mobile platform code |

**Contents**:
- Gradle build files, Android Studio config
- app/, build/, capacitor-cordova-android-plugins/, gradle/
- **Action**: **ANALYZE for differences**, then merge/delete duplicate

**Analysis Required**:
```
Root android/ = 15 items (build.gradle, gradle.properties, app/, etc.)
rally-forge-mobile/android/ = exists inside mobile subsystem

Question: Is root android/ a duplicate or does it contain unique build configs?
```

---

#### 3. Desktop App (Electron)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `desktop/` | `C:\Dev\Rally Forge\desktop\` | `rally-forge-desktop/` (new subsystem) | Separate platform |

**Contents**:
- electron-builder.yml
- node_modules/
- **Action**: Create new subsystem OR move to rally-forge-mobile/ if integrated

**Recommendation**: Since .gitignore excludes `desktop/`, this might be build output. **Verify if source code or build artifact**.

---

#### 4. Data Files (Backend or Config)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `data/` | `C:\Dev\Rally Forge\data\` | `SQL/` OR `rally-forge-backend/data/` | Database schemas and seeds |

**Contents**:
- schema.sql
- seed_conditions.json
- seed_organizations.json
- **Action**: Move SQL to SQL/, move JSON to backend/data/ or SQL/

---

#### 5. Partnerships Documentation
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `partnerships/` | `C:\Dev\Rally Forge\partnerships\` | `docs/partnerships/` | Documentation |

**Contents**:
- ATTORNEY_PARTNERSHIP_PROPOSAL.md
- MILITARY_INSTALLATION_PARTNERSHIP.md
- VSO_PARTNERSHIP_PROPOSAL.md
- **Action**: Move to docs/ as subdirectory

---

#### 6. Root-Level Tests
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `tests/` | `C:\Dev\Rally Forge\tests\` | Split between subsystems | Test files for specific components |

**Contents**:
- conftest.py (backend)
- test_backend.py (backend)
- test_subscriptions.py (backend)
- test_frontend.txt (frontend)
- **Action**:
  - Move backend tests → `rally-forge-backend/tests/`
  - Move frontend tests → `rally-forge-frontend/tests/` (if tests/ doesn't exist, create it)

**Note**: Backend already has its own tests/ folder

---

#### 7. Backup Folder
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `Backups/` | `C:\Dev\Rally Forge\Backups\` | `_archive/` (create) or DELETE | Old build scripts |

**Contents**:
- build-scripts/
- **Action**: Archive or delete (verify no critical files)

---

#### 8. Root SQL File
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `seed-data.sql` | `C:\Dev\Rally Forge\seed-data.sql` | `SQL/seed-data.sql` | **DUPLICATE** already exists |

**Action**: **Delete** root copy (duplicate already in SQL/)

---

#### 9. Root .venv (Build Artifact)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `.venv/` | `C:\Dev\Rally Forge\.venv\` | **DELETE** or confirm | Likely stale Python venv |

**Action**: Backend has its own .venv/. Root-level venv should be removed unless used for root-level Python scripts.

---

#### 10. Root node_modules (Build Artifact)
| Item | Current Location | Target Location | Reason |
|------|------------------|-----------------|--------|
| `node_modules/` | `C:\Dev\Rally Forge\node_modules\` | Keep (root package.json) | Root workspace dependencies |

**Action**: **KEEP** - Root package.json exists, so node_modules is valid

---

#### 11. Root Documentation Files (24 Files)
| Files | Current Location | Target Location | Reason |
|-------|------------------|-----------------|--------|
| APPLICATION_SETUP_COMPLETE.md | Root | `docs/setup/` | Setup documentation |
| BUILD_SETUP_SUMMARY.md | Root | `docs/setup/` | Setup documentation |
| COMPLIANCE_AUDIT.md | Root | `docs/compliance/` | Compliance documentation |
| COMPLIANCE_IMPLEMENTATION_SUMMARY.md | Root | `docs/compliance/` | Compliance documentation |
| DEPLOYMENT_CHECKLIST.md | Root | `docs/deployment/` | Deployment guides |
| DEPLOYMENT_GUIDE.md | Root | `docs/deployment/` | Deployment guides |
| FILE_MANIFEST.md | Root | `docs/` | Project documentation |
| FULL_COMPLIANCE_VALIDATION_COMPLETE.md | Root | `docs/compliance/` | Compliance documentation |
| IMPLEMENTATION_COMPLETE.md | Root | `docs/` | Project documentation |
| NEXT_STEPS_AUTOMATED.md | Root | `docs/` | Project documentation |
| POST_COMPLIANCE_QUICK_REFERENCE.md | Root | `docs/compliance/` | Compliance documentation |
| PRODUCTION_ARCHITECTURE.md | Root | `docs/architecture/` | Architecture documentation |
| PROJECT_CONFIRMATION.md | Root | `docs/` | Project documentation |
| PROJECT_STRUCTURE.md | Root | `docs/` | Project documentation |
| QUICK_DEPLOY.md | Root | `docs/deployment/` | Deployment guides |
| QUICK_REFERENCE.md | Root | `docs/` | Quick reference |
| QUICK_REFERENCE_STARTUP.md | Root | `docs/setup/` | Setup documentation |
| QUICK_START.md | Root | `docs/setup/` | Setup documentation |
| QUICK_START_DEPLOYMENT.md | Root | `docs/deployment/` | Deployment guides |
| STARTUP_GUIDE.md | Root | `docs/setup/` | Setup documentation |
| STRATEGIC_RECOMMENDATIONS.md | Root | `docs/` | Project documentation |
| rally_forge_APPLICATION_COMPLETE.md | Root | `docs/` | Project documentation |
| APP_OVERVIEW.html | Root | `docs/` | Project overview |

**Action**: Move to `docs/` with subdirectories for organization:
- `docs/setup/` - Setup and startup guides
- `docs/deployment/` - Deployment guides
- `docs/compliance/` - Compliance documentation
- `docs/architecture/` - Architecture documentation

**EXCEPTION**: Keep `README.md` in root (standard practice)

---

### 🔍 ITEMS REQUIRING INVESTIGATION

#### 1. android/ Folder (Root vs Mobile)
**Question**: Is `C:\Dev\Rally Forge\android\` a duplicate of `rally-forge-mobile/android/`?

**Investigation Needed**:
```powershell
# Compare directories
Compare-Object (Get-ChildItem "C:\Dev\Rally Forge\android" -Recurse) `
               (Get-ChildItem "C:\Dev\Rally Forge\rally-forge-mobile\android" -Recurse)
```

**Possible Outcomes**:
- If identical: Delete root android/
- If different: Determine which is authoritative, merge unique files
- If root is newer: Replace mobile/android/ with root android/

---

#### 2. desktop/ Folder
**Question**: Is this source code or build output?

**.gitignore says**: Exclude desktop/ (implies build output)

**Investigation Needed**:
- Check if desktop/ contains source files or just compiled binaries
- If source: Create `rally-forge-desktop/` subsystem
- If build output: Delete (regenerate from build scripts)

---

#### 3. Root .venv/
**Question**: Is this used by root-level scripts or is it stale?

**Investigation Needed**:
- Check if any root-level Python scripts require this venv
- Backend has its own .venv/, so root-level might be obsolete
- **Recommendation**: Delete unless confirmed needed

---

#### 4. Backups/ Folder
**Contents**: build-scripts/

**Question**: Are these scripts still needed or historical?

**Investigation Needed**:
- Compare with current scripts/
- If duplicates: Delete
- If unique/historical: Move to `_archive/`

---

### 📋 MISSING ITEMS

The following standard project items are **missing** or **should be created**:

| Item | Purpose | Recommendation |
|------|---------|----------------|
| `_archive/` | Historical backups | Create for old Backups/ folder |
| `rally-forge-desktop/` | Desktop app subsystem (if needed) | Create if desktop/ contains source code |
| `docs/setup/` | Setup documentation subdirectory | Create to organize setup guides |
| `docs/deployment/` | Deployment documentation subdirectory | Create to organize deployment guides |
| `docs/compliance/` | Compliance documentation subdirectory | Create to organize compliance docs |
| `docs/architecture/` | Architecture documentation subdirectory | Create to organize architecture docs |
| `docker-compose.yml` | Development Docker compose | Consider creating (currently only prod exists) |
| `.env` | Root environment file | May not be needed (subsystems have their own) |

---

## 🗂️ PROPOSED REORGANIZATION PLAN

### Phase 2 Actions (Organized by Priority)

#### **PRIORITY 1: Move Misplaced Folders**
```powershell
# Move AI Engine to backend
Move-Item "C:\Dev\Rally Forge\ai-engine" "C:\Dev\Rally Forge\rally-forge-backend\ai-engine"

# Move partnerships to docs
New-Item -ItemType Directory "C:\Dev\Rally Forge\docs\partnerships"
Move-Item "C:\Dev\Rally Forge\partnerships\*" "C:\Dev\Rally Forge\docs\partnerships\"
Remove-Item "C:\Dev\Rally Forge\partnerships"

# Move data files
Move-Item "C:\Dev\Rally Forge\data\schema.sql" "C:\Dev\Rally Forge\SQL\"
New-Item -ItemType Directory "C:\Dev\Rally Forge\rally-forge-backend\data"
Move-Item "C:\Dev\Rally Forge\data\*.json" "C:\Dev\Rally Forge\rally-forge-backend\data\"
Remove-Item "C:\Dev\Rally Forge\data"

# Move root tests to backend (conftest.py, test_backend.py, test_subscriptions.py)
Move-Item "C:\Dev\Rally Forge\tests\conftest.py" "C:\Dev\Rally Forge\rally-forge-backend\tests\"
Move-Item "C:\Dev\Rally Forge\tests\test_backend.py" "C:\Dev\Rally Forge\rally-forge-backend\tests\"
Move-Item "C:\Dev\Rally Forge\tests\test_subscriptions.py" "C:\Dev\Rally Forge\rally-forge-backend\tests\"
Move-Item "C:\Dev\Rally Forge\tests\test_frontend.txt" "C:\Dev\Rally Forge\rally-forge-frontend\"
Remove-Item "C:\Dev\Rally Forge\tests"
```

#### **PRIORITY 2: Remove Duplicates**
```powershell
# Delete duplicate seed-data.sql in root (already in SQL/)
Remove-Item "C:\Dev\Rally Forge\seed-data.sql"
```

#### **PRIORITY 3: Organize Documentation**
```powershell
# Create subdirectories in docs/
New-Item -ItemType Directory "C:\Dev\Rally Forge\docs\setup"
New-Item -ItemType Directory "C:\Dev\Rally Forge\docs\deployment"
New-Item -ItemType Directory "C:\Dev\Rally Forge\docs\compliance"
New-Item -ItemType Directory "C:\Dev\Rally Forge\docs\architecture"

# Move setup documentation
Move-Item "C:\Dev\Rally Forge\APPLICATION_SETUP_COMPLETE.md" "C:\Dev\Rally Forge\docs\setup\"
Move-Item "C:\Dev\Rally Forge\BUILD_SETUP_SUMMARY.md" "C:\Dev\Rally Forge\docs\setup\"
Move-Item "C:\Dev\Rally Forge\QUICK_REFERENCE_STARTUP.md" "C:\Dev\Rally Forge\docs\setup\"
Move-Item "C:\Dev\Rally Forge\QUICK_START.md" "C:\Dev\Rally Forge\docs\setup\"
Move-Item "C:\Dev\Rally Forge\STARTUP_GUIDE.md" "C:\Dev\Rally Forge\docs\setup\"

# Move deployment documentation
Move-Item "C:\Dev\Rally Forge\DEPLOYMENT_CHECKLIST.md" "C:\Dev\Rally Forge\docs\deployment\"
Move-Item "C:\Dev\Rally Forge\DEPLOYMENT_GUIDE.md" "C:\Dev\Rally Forge\docs\deployment\"
Move-Item "C:\Dev\Rally Forge\QUICK_DEPLOY.md" "C:\Dev\Rally Forge\docs\deployment\"
Move-Item "C:\Dev\Rally Forge\QUICK_START_DEPLOYMENT.md" "C:\Dev\Rally Forge\docs\deployment\"

# Move compliance documentation
Move-Item "C:\Dev\Rally Forge\COMPLIANCE_AUDIT.md" "C:\Dev\Rally Forge\docs\compliance\"
Move-Item "C:\Dev\Rally Forge\COMPLIANCE_IMPLEMENTATION_SUMMARY.md" "C:\Dev\Rally Forge\docs\compliance\"
Move-Item "C:\Dev\Rally Forge\FULL_COMPLIANCE_VALIDATION_COMPLETE.md" "C:\Dev\Rally Forge\docs\compliance\"
Move-Item "C:\Dev\Rally Forge\POST_COMPLIANCE_QUICK_REFERENCE.md" "C:\Dev\Rally Forge\docs\compliance\"

# Move architecture documentation
Move-Item "C:\Dev\Rally Forge\PRODUCTION_ARCHITECTURE.md" "C:\Dev\Rally Forge\docs\architecture\"

# Move general project documentation
Move-Item "C:\Dev\Rally Forge\APP_OVERVIEW.html" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\FILE_MANIFEST.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\IMPLEMENTATION_COMPLETE.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\NEXT_STEPS_AUTOMATED.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\PROJECT_CONFIRMATION.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\PROJECT_STRUCTURE.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\QUICK_REFERENCE.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\STRATEGIC_RECOMMENDATIONS.md" "C:\Dev\Rally Forge\docs\"
Move-Item "C:\Dev\Rally Forge\rally_forge_APPLICATION_COMPLETE.md" "C:\Dev\Rally Forge\docs\"
```

#### **PRIORITY 4: Investigate & Decide**
```powershell
# android/ - Compare with rally-forge-mobile/android/, then decide
# desktop/ - Determine if source or build output, then move or delete
# .venv/ - Confirm if needed, then delete if not
# Backups/ - Archive or delete
```

---

## 🎯 FINAL TARGET STRUCTURE

After reorganization, the structure should be:

```
C:\Dev\Rally Forge\
│
├── rally-forge-frontend/              ✅ React + Vite frontend
├── rally-forge-backend/               ✅ FastAPI backend
│   ├── ai-engine/                    🔄 MOVED FROM ROOT
│   ├── data/                         🔄 MOVED FROM ROOT (JSON files)
│   ├── app/
│   ├── alembic/
│   ├── tests/                        🔄 MERGED root tests/
│   └── ...
├── rally-forge-mobile/                ✅ Capacitor mobile app
│   ├── android/                      🔍 VERIFY vs root android/
│   ├── ios/
│   └── mobile/
├── rally-forge-shared/                ✅ Shared TypeScript modules
├── rally-forge-desktop/               🆕 CREATE IF NEEDED (Electron app)
│
├── config/                           ✅ Configuration files
│   └── appsettings.json
├── scripts/                          ✅ Build & automation scripts (155 files)
├── diagnostics/                      ✅ Diagnostic tools & logs
├── docs/                             ✅ All documentation
│   ├── setup/                        🆕 Setup guides (5 files)
│   ├── deployment/                   🆕 Deployment guides (4 files)
│   ├── compliance/                   🆕 Compliance docs (4 files)
│   ├── architecture/                 🆕 Architecture docs (1 file)
│   ├── partnerships/                 🔄 MOVED FROM ROOT (3 files)
│   ├── generated/
│   ├── root/
│   └── ... (35+ existing files + 24 moved from root)
├── SQL/                              ✅ Database scripts
│   ├── schema.sql                    🔄 MOVED FROM data/
│   └── ... (4 existing + 1 moved)
├── logs/                             ✅ Application logs
│
├── .github/                          ✅ GitHub workflows
├── .vscode/                          ✅ VS Code settings
├── .idea/                            ✅ JetBrains settings
├── node_modules/                     ✅ Root dependencies (KEEP)
│
├── docker-compose.prod.yml           ✅ Production Docker
├── docker-compose.yml                ❓ CREATE for dev (optional)
├── .env.example                      ✅ Environment template
├── .env.production.example           ✅ Production env template
├── .env.monitoring                   ✅ Monitoring env template
├── .gitignore                        ✅ Git ignore rules
├── package.json                      ✅ Root workspace config
├── package-lock.json                 ✅ Dependency lock
├── Start-rallyforge.ps1               ✅ One-click startup
└── README.md                         ✅ Main README (KEEP IN ROOT)
```

---

## 📊 STATISTICS

### Before Reorganization
- **Root-level folders**: 28 folders
- **Root-level files**: 34 files
- **Misplaced folders**: 7 (ai-engine, android, desktop, data, partnerships, tests, Backups)
- **Loose documentation**: 24 MD/HTML files in root
- **Duplicate files**: 2 (seed-data.sql, android/)

### After Reorganization (Projected)
- **Root-level folders**: 15 folders (clean subsystems + support folders)
- **Root-level files**: 10 essential config files
- **Misplaced folders**: 0
- **Loose documentation**: 1 (README.md only)
- **Duplicate files**: 0

### Improvement Metrics
- **Root complexity reduction**: 59% (62 items → 25 items)
- **Documentation organization**: 100% (24 files organized into subdirectories)
- **Subsystem isolation**: 100% (all code in proper subsystems)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Moving android/ breaks mobile build | High | Compare directories first, verify before delete |
| Deleting desktop/ loses source code | High | Verify if source or build output before delete |
| Moving ai-engine breaks backend imports | Medium | Update import paths in backend after move |
| Documentation moves break links | Low | Update internal links in moved docs |
| Root .venv still needed | Low | Test root scripts, confirm not needed |

---

## ✅ PHASE 1 COMPLETION CHECKLIST

- [x] Scanned entire directory tree
- [x] Identified all frontend code (rally-forge-frontend/)
- [x] Identified all backend code (rally-forge-backend/)
- [x] Identified all mobile code (rally-forge-mobile/)
- [x] Identified shared modules (rally-forge-shared/)
- [x] Identified documentation (docs/ + 24 root files)
- [x] Identified scripts (scripts/ - 155 files)
- [x] Identified diagnostics (diagnostics/)
- [x] Identified SQL files (SQL/ + data/)
- [x] Identified logs (logs/)
- [x] Identified environment files (config/ + root .env.*)
- [x] Identified Dockerfiles (in subsystems)
- [x] Identified configuration files (root + config/)
- [x] Detected misplaced folders (7 folders)
- [x] Detected duplicated folders (android/, seed-data.sql)
- [x] Detected loose files (24 documentation files)
- [x] Detected empty/obsolete folders (mobile/mobile/ is empty)
- [x] Produced comprehensive report
- [x] Documented what is correctly placed
- [x] Documented what is incorrectly placed
- [x] Documented what needs to be moved
- [x] Documented what is missing
- [x] Documented what should be created
- [x] Provided reorganization plan
- [x] Provided risk analysis

---

## 🚦 RECOMMENDATION

**Proceed to PHASE 2** with the following approach:

1. **Execute Priority 1** (move misplaced folders) - **Low Risk**
2. **Execute Priority 2** (remove duplicates) - **Low Risk**
3. **Execute Priority 3** (organize documentation) - **Low Risk**
4. **Investigate Priority 4** (android/, desktop/, .venv/, Backups/) - **Medium Risk**
5. **Validate all moves** (Phase 3)
6. **Update import paths** if needed
7. **Test builds** to ensure nothing broke

---

**PHASE 1 STATUS**: ✅ **COMPLETE**
**Ready for PHASE 2**: ✅ **YES**
**Approval Required**: Yes (for Priority 4 deletions)

---

*Analysis completed by GitHub Copilot - January 24, 2026*


