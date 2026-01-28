 Microsoft 365 Copilot PowerShell Instruction Manual

Master Operational Guidance for Generating the VeteranApp Bootstrap & Integrity Checker Script

---

1. Purpose of This Document

This document provides Microsoft 365 Copilot with complete, explicit, and consolidated instructions for generating a single, idempotent PowerShell script that:

- Bootstraps the entire VeteranApp project  
- Validates the entire folder and file structure  
- Creates missing folders  
- Creates missing files  
- Logs all actions  
- Produces a final integrity report  
- Never deletes or overwrites anything  
- Is safe to run repeatedly  
- Uses clear helper functions  
- Uses Test-Path for all checks  
- Echoes progress to the console  

This is the master operational guidance for Copilot.

---

2. Script Requirements (Authoritative)

Microsoft 365 Copilot must generate a PowerShell script that:

2.1 Is idempotent
- Running it multiple times must never break anything  
- It must only create missing items  
- It must never overwrite existing files  

2.2 Is safe and additive
- No destructive operations  
- No deletions  
- No overwrites  
- No resets  

2.3 Uses helper functions
Copilot must define and use:

- New-FolderIfMissing  
- New-FileIfMissing  
- Write-Log (optional)  

2.4 Uses Test-Path
Every file and folder creation must be preceded by:

`
if (-not (Test-Path ...)) { ... }
`

2.5 Logs all actions
Every creation event must be logged with Write-Host.

2.6 Produces a final summary
At the end, the script must output:

- Items created  
- Items already existing  
- Items missing that could not be created  

2.7 Uses clear comments
Every major block must include comments explaining:

- What the block does  
- Why it exists  
- What files/folders it creates  

2.8 Does NOT create a .ps1 file
Copilot must output the script as text only, not as a file.

---

3. Root Folder Requirement

The script must begin by creating the root folder:

`
VeteranApp
`

This is mandatory.

Copilot must:

- Create the folder if missing  
- Set-Location into it  
- Never delete or overwrite anything  

---

4. Required Folder Structure

Copilot must ensure the following folders exist:

`
VeteranApp/
    frontend/
    backend/
    ai-engine/
    data/
    mobile/
    scripts/
    docs/
    tests/
    logs/
    config/
`

Each folder must be created only if missing.

---

5. Required Files (Authoritative List)

Copilot must ensure the following files exist, creating placeholders if missing.

5.1 Frontend
`
frontend/web/src/pages/Home.tsx
frontend/web/src/pages/Calculators.tsx
frontend/web/src/pages/Guidance.tsx
frontend/web/src/pages/Community.tsx

frontend/web/src/components/NavBar.tsx
frontend/web/src/components/BranchBackgroundSwitcher.tsx
`

Each file must contain placeholder JSX and comments describing its purpose.

---

5.2 Backend (FastAPI)
`
backend/main.py
backend/routers/claims.py
backend/routers/calculators.py
backend/routers/community.py
backend/models.py
backend/database.py
backend/config.py
`

Each file must contain Python boilerplate and comments.

---

5.3 AI Engine
`
ai-engine/init.py
ai-engine/cfr_interpreter.py
ai-engine/claimstrategyengine.py
ai-engine/evidence_inference.py
ai-engine/secondaryconditionmapper.py
`

Each file must contain function stubs with docstrings.

---

5.4 Data Layer
`
data/schema.sql
data/seed_conditions.json
data/seed_organizations.json
`

---

5.5 Mobile
`
mobile/README.md
mobile/android/
mobile/ios/
`

---

5.6 Scripts
`
scripts/Initialize-Environment.ps1
scripts/Build-Frontend.ps1
scripts/Run-Backend.ps1
scripts/Run-AIEngine-Tests.ps1
scripts/Bootstrap-All.ps1
`

Each script must contain placeholder logic and comments.

---

5.7 Documentation
`
docs/README.md
docs/Architecture.md
`

---

5.8 Config & Logs
`
config/appsettings.json
logs/.gitkeep
`

---

6. Integrity Checker Requirements

Copilot must generate logic that:

- Compares expected vs actual structure  
- Identifies missing folders  
- Identifies missing files  
- Creates missing items  
- Logs all actions  
- Produces a final integrity report  

The script must maintain two arrays:

- $CreatedItems  
- $ExistingItems  

At the end, Copilot must output both.

---

7. Bootstrap Logic Requirements

Copilot must generate logic that:

1. Initializes environment  
2. Creates root folder  
3. Creates all subfolders  
4. Creates all placeholder files  
5. Prepares frontend  
6. Prepares backend  
7. Prepares AI engine  
8. Prepares data layer  
9. Prepares mobile shell  
10. Prepares documentation  
11. Prepares PowerShell automation scripts  

---

8. Required Helper Functions

Copilot must define:

8.1 New-FolderIfMissing
- Checks for folder  
- Creates if missing  
- Logs action  

8.2 New-FileIfMissing
- Checks for file  
- Creates placeholder  
- Logs action  

8.3 Write-Log (optional)
- Logs timestamped messages  

---

9. Script Output Requirements

At the end, Copilot must output:

- "Bootstrap complete."  
- A list of created items  
- A list of existing items  
- A list of missing items (if any)  

---

10. Copilot Output Format Requirements

When generating the script, Copilot must:

- Output only the script text  
- Not wrap it in a file  
- Not create a .ps1  
- Not include markdown code fences unless explicitly requested  
- Not add commentary outside the script  

---

11. Summary for Microsoft 365 Copilot

When Copilot receives this document, it must generate:

- A single PowerShell script  
- Idempotent  
- Safe  
- Additive  
- Fully logged  
- Fully commented  
- Fully structured  
- Capable of building and validating the entire VeteranApp project  

This document is the complete operational guidance for Copilot.

---

If you want, I can now generate:

E - The actual PowerShell script itself (text only)
ready for you to paste into Microsoft 365 Copilot as a "reference example."

Just say the word.

