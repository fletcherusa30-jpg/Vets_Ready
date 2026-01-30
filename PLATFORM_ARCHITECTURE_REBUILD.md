# rallyforge Platform Architecture & Rebuild Specification

## Executive Summary

This document outlines the complete architecture for rebuilding and integrating 38 tools across the rallyforge platform. The rebuild follows a modular, service-based architecture with:

- **Modular tool system** with plugin architecture
- **Unified data flow** through Profile and DocumentVault
- **Non-destructive data operations** (never overwrite, only augment)
- **Comprehensive audit logging** for compliance
- **Confidence scoring** across all extractions
- **VA-aligned business logic** with CFR references
- **Event-driven background processing** for large operations

---

## Part 1: Core Architecture

### 1.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  rallyforge Platform                 │
├─────────────────────────────────────────────────────┤
│                    Frontend (React)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │ Pages: Dashboard, Profile, Settings, Scanner │   │
│  │ Components: Sidebar, Header, Page Wrapper    │   │
│  │ Store: Zustand app state management          │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                   API Gateway Layer                  │
│  ┌──────────────────────────────────────────────┐   │
│  │ REST API: /api/* endpoints                   │   │
│  │ Auth: JWT token validation                   │   │
│  │ Rate limiting, CORS, error handling          │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│              Backend Services (FastAPI)              │
│  ┌─────────────┬──────────────┬───────────────────┐ │
│  │Tool Registry│DocumentVault │Profile Service    │ │
│  ├─────────────┼──────────────┼───────────────────┤ │
│  │ Scanner     │ Storage      │ Field Management  │ │
│  │ Tools (38)  │ Retrieval    │ Autofill Logic    │ │
│  │ Processors  │ Versioning   │ Completeness      │ │
│  └─────────────┴──────────────┴───────────────────┘ │
├─────────────────────────────────────────────────────┤
│         Data Layer (SQLAlchemy + Database)           │
│  ┌──────────────────────────────────────────────┐   │
│  │ Tables: Veterans, Profile, DocumentVault,    │   │
│  │         AuditLog, ExtractionCache            │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│              Background Processing                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Celery/FastAPI Tasks: OCR, Rating Calcs,     │   │
│  │ Financial Projections, Data Synthesis         │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 1.2 Tool Execution Pipeline

```
User Input
   ↓
[Tool Selection]
   ↓
[Input Validation] → Reject if invalid
   ↓
[Tool Execution] → Call tool service
   ↓
[Confidence Calculation] → Rate 0.0-1.0
   ↓
[Profile Autofill] → Non-destructive update
   ↓
[DocumentVault Storage] → Save extraction + metadata
   ↓
[Audit Logging] → Record who, what, when, why
   ↓
[Response to User] → Show results + confidence
```

### 1.3 Core Data Models

**Veteran Profile**
```python
class VeteranProfile:
    id: UUID
    email: str

    # Personal Info
    first_name: Optional[str]
    last_name: Optional[str]
    middle_name: Optional[str]
    date_of_birth: Optional[date]

    # Military Service
    service_branch: Optional[str]  # Army, Navy, Marines, Air Force, Coast Guard
    service_entry_date: Optional[date]
    service_separation_date: Optional[date]
    rank_at_separation: Optional[str]
    military_occupation_specialty: Optional[str]
    discharge_status: Optional[str]  # Honorable, General, Medical, etc.
    discharge_code: Optional[str]  # JGA, RE1-4, etc.

    # VA Disability
    disability_rating: Optional[int]  # 0-100
    rating_effective_date: Optional[date]
    service_connected_conditions: Optional[List[str]]

    # Career/Education
    current_occupation: Optional[str]
    education_level: Optional[str]
    skills: Optional[List[str]]

    # Financial
    annual_income: Optional[float]
    dependents: Optional[int]

    # Metadata
    profile_completeness: float  # 0.0-1.0
    last_updated: datetime
    created_at: datetime
```

**DocumentVault Entry**
```python
class DocumentVault:
    id: UUID
    veteran_id: UUID

    # File Info
    file_name: str
    file_path: str  # Server filesystem location
    upload_date: datetime

    # Document Type
    document_type: str  # DD-214, STR, MEB, Rating, Claim, Resume, etc.

    # Extracted Data
    extracted_data: dict  # All fields extracted

    # Metadata
    metadata: dict  # {
                    #   "confidence": 0.85,
                    #   "extraction_source": "dd214_extractor_enhanced",
                    #   "extracted_fields": ["name", "rank", "branch"],
                    #   "processing_time_ms": 245
                    # }

    # Processing Status
    processed: bool
    processing_timestamp: Optional[datetime]

    # Audit Trail
    created_at: datetime
    updated_at: datetime
    created_by: UUID  # Veteran ID or System
```

**AuditLog Entry**
```python
class AuditLog:
    id: UUID
    veteran_id: UUID

    action: str  # "profile_autofill", "tool_execution", "document_upload"
    tool_name: str  # "dd214_extractor", "disability_calculator"

    changes: dict  # {
                   #   "first_name": {"old": null, "new": "John"},
                   #   "rank_at_separation": {"old": null, "new": "SGT"}
                   # }

    fields_updated: List[str]
    confidence: float

    timestamp: datetime
    user_id: Optional[UUID]
    ip_address: Optional[str]

    success: bool
    error_message: Optional[str]
```

---

## Part 2: Tool Module System

### 2.1 Tool Base Class

```python
# backend/app/tools/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional, List

@dataclass
class ToolInput:
    """Standardized input for any tool"""
    data: Dict[str, Any]
    source: str = "user"  # "user", "scanner", "api"
    confidence_threshold: float = 0.5

@dataclass
class ToolOutput:
    """Standardized output from any tool"""
    success: bool
    data: Dict[str, Any]
    confidence: float  # 0.0-1.0
    extracted_fields: List[str]
    error_message: Optional[str] = None
    processing_time_ms: float = 0
    source_tool: str = ""

class BaseTool(ABC):
    """
    All tools inherit from this base class.
    Enforces consistent interface across all 38 tools.
    """

    def __init__(self, name: str, version: str):
        self.name = name
        self.version = version
        self.metadata = {
            "name": name,
            "version": version,
            "category": "",  # "disability", "document", "career", etc.
            "requires_profile": False,
            "requires_documents": False,
            "background_processing": False
        }

    @abstractmethod
    def validate_input(self, tool_input: ToolInput) -> tuple[bool, str]:
        """
        Validate that input has required fields.
        Returns (is_valid, error_message)
        """
        pass

    @abstractmethod
    def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute the tool's core logic.
        Must be deterministic - same input = same output.
        """
        pass

    def calculate_confidence(self, output: Dict[str, Any]) -> float:
        """
        Default confidence calculation.
        Override in specific tools for custom logic.
        Returns 0.0-1.0 score.
        """
        # Count how many fields were successfully extracted
        total_expected_fields = len(output.keys())
        extracted_fields = sum(1 for v in output.values() if v is not None)
        return extracted_fields / total_expected_fields if total_expected_fields > 0 else 0.0

    def get_metadata(self) -> Dict[str, Any]:
        """Return tool metadata"""
        return self.metadata

class ToolRegistry:
    """
    Central registry for all 38 tools.
    Handles tool discovery, loading, and execution.
    """

    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self.categories = {
            "disability": [],
            "document": [],
            "career": [],
            "financial": [],
            "benefits": [],
            "system": []
        }

    def register(self, tool: BaseTool, category: str):
        """Register a tool in the registry"""
        self.tools[tool.name] = tool
        self.categories[category].append(tool.name)

    def get_tool(self, name: str) -> Optional[BaseTool]:
        """Get a tool by name"""
        return self.tools.get(name)

    def get_tools_by_category(self, category: str) -> List[str]:
        """Get all tools in a category"""
        return self.categories.get(category, [])

    def list_all_tools(self) -> Dict[str, List[str]]:
        """List all tools organized by category"""
        return self.categories

# Global registry instance
tool_registry = ToolRegistry()
```

### 2.2 Tool Service Layer

```python
# backend/app/services/tool_service.py

class ToolService:
    """
    Service for executing tools with standard pipeline:
    1. Validate input
    2. Execute tool
    3. Calculate confidence
    4. Update profile (non-destructive)
    5. Store in DocumentVault
    6. Log to AuditLog
    """

    async def execute_tool(
        self,
        tool_name: str,
        veteran_id: UUID,
        input_data: Dict[str, Any],
        background: bool = False
    ) -> ToolOutput:
        """
        Execute a tool with full pipeline.

        Args:
            tool_name: Name of tool to execute
            veteran_id: Which veteran
            input_data: Input for the tool
            background: Process async in background?

        Returns:
            ToolOutput with results, confidence, extracted fields
        """

        # 1. Get tool from registry
        tool = tool_registry.get_tool(tool_name)
        if not tool:
            return ToolOutput(
                success=False,
                data={},
                confidence=0.0,
                extracted_fields=[],
                error_message=f"Tool '{tool_name}' not found"
            )

        # 2. Validate input
        is_valid, error_msg = tool.validate_input(ToolInput(data=input_data))
        if not is_valid:
            return ToolOutput(
                success=False,
                data={},
                confidence=0.0,
                extracted_fields=[],
                error_message=error_msg
            )

        if background and tool.metadata.get("background_processing"):
            # Queue for background processing
            await self._queue_background_task(tool_name, veteran_id, input_data)
            return ToolOutput(
                success=True,
                data={"status": "processing"},
                confidence=0.0,
                extracted_fields=[],
                error_message=None
            )
        else:
            # Execute synchronously
            return await self._execute_tool_sync(tool, veteran_id, input_data)

    async def _execute_tool_sync(
        self,
        tool: BaseTool,
        veteran_id: UUID,
        input_data: Dict[str, Any]
    ) -> ToolOutput:
        """Execute tool synchronously with full pipeline"""

        import time
        start_time = time.time()

        try:
            # Execute tool
            tool_output = tool.execute(ToolInput(data=input_data))
            tool_output.processing_time_ms = (time.time() - start_time) * 1000

            if not tool_output.success:
                # Log failure
                await self._log_audit(
                    veteran_id=veteran_id,
                    action="tool_execution",
                    tool_name=tool.name,
                    success=False,
                    error_message=tool_output.error_message
                )
                return tool_output

            # Calculate confidence
            confidence = tool.calculate_confidence(tool_output.data)
            tool_output.confidence = confidence

            # Get veteran profile
            profile = await self._get_profile(veteran_id)

            # Autofill profile (non-destructive)
            updates = await self._autofill_profile(profile, tool_output.data)

            # Store in DocumentVault
            vault_entry = await self._store_in_vault(
                veteran_id=veteran_id,
                tool_name=tool.name,
                extracted_data=tool_output.data,
                confidence=confidence,
                extracted_fields=tool_output.extracted_fields
            )

            # Log to AuditLog
            await self._log_audit(
                veteran_id=veteran_id,
                action="tool_execution",
                tool_name=tool.name,
                changes=updates,
                fields_updated=list(updates.keys()),
                confidence=confidence,
                success=True
            )

            return tool_output

        except Exception as e:
            await self._log_audit(
                veteran_id=veteran_id,
                action="tool_execution",
                tool_name=tool.name,
                success=False,
                error_message=str(e)
            )
            return ToolOutput(
                success=False,
                data={},
                confidence=0.0,
                extracted_fields=[],
                error_message=str(e)
            )

    async def _autofill_profile(
        self,
        profile: VeteranProfile,
        extracted_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Non-destructive profile autofill.
        Only updates empty fields - NEVER overwrites existing data.

        Returns dict of fields that were actually updated.
        """

        updates = {}

        # Mapping of extracted fields to profile fields
        field_mapping = {
            "first_name": "first_name",
            "last_name": "last_name",
            "middle_name": "middle_name",
            "service_branch": "service_branch",
            "rank": "rank_at_separation",
            "mos": "military_occupation_specialty",
            # ... more mappings
        }

        for extracted_field, profile_field in field_mapping.items():
            if extracted_field in extracted_data:
                extracted_value = extracted_data[extracted_field]
                # Only update if profile field is empty AND extracted value exists
                if extracted_value and not getattr(profile, profile_field, None):
                    setattr(profile, profile_field, extracted_value)
                    updates[profile_field] = extracted_value

        # Save profile updates
        await db.commit()

        return updates

    async def _store_in_vault(
        self,
        veteran_id: UUID,
        tool_name: str,
        extracted_data: Dict[str, Any],
        confidence: float,
        extracted_fields: List[str]
    ) -> DocumentVault:
        """Store extraction in DocumentVault"""

        entry = DocumentVault(
            id=UUID4(),
            veteran_id=veteran_id,
            file_name=f"extraction_{tool_name}_{datetime.now().isoformat()}",
            file_path="",  # Extracted from memory, not a file
            document_type=tool_name,
            extracted_data=extracted_data,
            metadata={
                "confidence": confidence,
                "extraction_source": tool_name,
                "extracted_fields": extracted_fields,
                "processing_time_ms": 0
            },
            processed=True,
            processing_timestamp=datetime.utcnow()
        )

        db.add(entry)
        await db.commit()

        return entry

    async def _log_audit(
        self,
        veteran_id: UUID,
        action: str,
        tool_name: str,
        success: bool,
        changes: Optional[Dict] = None,
        fields_updated: Optional[List[str]] = None,
        confidence: float = 0.0,
        error_message: Optional[str] = None
    ):
        """Log action to AuditLog"""

        log_entry = AuditLog(
            id=UUID4(),
            veteran_id=veteran_id,
            action=action,
            tool_name=tool_name,
            changes=changes or {},
            fields_updated=fields_updated or [],
            confidence=confidence,
            timestamp=datetime.utcnow(),
            success=success,
            error_message=error_message
        )

        db.add(log_entry)
        await db.commit()
```

---

## Part 3: Tool Categories & Specifications

### 3.1 Category 1: Disability & Claims Tools (13 tools)

**Priority Order & Dependencies:**

```
1. DD214/NGB-22 Parser ──┐
                          ├─→ 4. Theory of Entitlement Engine
2. STR Review Engine ────┤
                          ├─→ 8. Risk of Denial Analyzer
3. Medical Evidence ─────┤
   Builder               │
                         ├─→ 6. Secondary Conditions
                         │
5. Quick Rating      ────┼─→ 13. Disability Wizard
   Calculator             │
                          ├─→ 7. Claim Strategy Advisor
6. Full Rating Engine ───┤
                          ├─→ 9. Denied Conditions Helper
7. Claim Strategy ───────┤
   Advisor               │
                         ├─→ 10. DBQ Auto-Fill
8. C&P Exam Analyzer ────┘

9. Risk of Denial Analyzer (uses 1, 2, 3, 4, 5, 6)
10. Denied Conditions Helper (uses 1, 2, 3, 4)
11. Secondary Conditions (uses 1, 2, 3, 4)
12. Disability Wizard (uses all of above)
13. DBQ Auto-Fill (uses 1, 2, 3)
```

**Tool 1: DD214/NGB-22 Parser** (COMPLETE - reuse enhanced extractor)
- Input: Raw PDF text or file
- Output: Structured DD-214 data
- Fields: Name, rank, service branch, entry date, separation date, MOS, awards, discharge status, narrative reason
- Confidence: 0.88 average (see Scanner summary)
- Integration: Feeds all downstream disability tools

**Tool 2: STR Review Engine**
- Input: Service Treatment Records (PDF/text)
- Output: Medical diagnoses, treatment dates, providers, recommendations
- Methods:
  - `extract_diagnoses()` - Find medical conditions (ICD-10 codes)
  - `extract_treatment_timeline()` - Dates of treatment
  - `extract_medications()` - Medications prescribed
  - `extract_recommendations()` - Provider recommendations
  - `correlate_with_dd214()` - Link treatments to service dates
- Confidence: Based on date/condition matches with DD-214
- Integration: Feeds Medical Evidence Builder, Theory of Entitlement

**Tool 3: Medical Evidence Builder**
- Input: STR data + Condition descriptions
- Output: Organized evidence package
- Methods:
  - `organize_by_condition()` - Group evidence per claimed condition
  - `find_nexus()` - Evidence linking condition to service
  - `strength_assessment()` - Rate evidence quality (weak/moderate/strong)
  - `identify_gaps()` - What evidence is missing
  - `generate_summary()` - Brief narrative
- Output: Evidence package ready for claim
- Confidence: Based on evidence completeness and quality

**Tool 4: Theory of Entitlement Engine**
- Input: DD-214 + STR + Claimed conditions
- Output: Entitlement analysis for each claimed condition
- Logic:
  - `is_service_connected()` - Check if condition likely service-connected
  - `calculate_probability()` - Confidence 0.0-1.0 for rating approval
  - `find_cfrreferences()` - Relevant CFR sections (38 CFR Part 4)
  - `identify_challenges()` - Common denial reasons
  - `recommend_strategy()` - How to strengthen claim
- CFR Integration: Reference 38 CFR 3.303 (causation), 38 CFR 3.304 (presumptive), etc.
- Confidence: Based on strength of entitlement evidence

**Tool 5: Quick Disability Rating Calculator**
- Input: Service-connected conditions list + severity descriptions
- Output: Quick estimated disability rating
- Methods:
  - `search_rating_table()` - Look up condition in VA rating schedule
  - `apply_comb_formula()` - Combined rating formula (VA's official method)
  - `estimate_range()` - 0%, 10%, 20%, ... 100%
- VA Formula: Combined = 100% - (100% - A%) × (100% - B%) × (100% - C%)...
- Output: Estimated rating with confidence interval
- Confidence: 0.6-0.8 (quick estimate, not official)

**Tool 6: Full Disability Rating Engine**
- Input: All disabilities with detailed descriptions
- Output: Detailed rating analysis
- Methods:
  - `match_to_rating_sheet()` - Find exact rating criteria
  - `apply_secondary_rules()` - Secondary ratings
  - `calculate_effective_date()` - Rating effective date
  - `generate_rating_letter()` - Mock VA rating decision letter
- Output: Detailed breakdown of each condition's rating
- Confidence: 0.75-0.85 (more detailed than quick calc)

**Tool 7: Claim Strategy Advisor**
- Input: DD-214 + STR + Conditions + Risk analysis
- Output: Recommended strategy
- Advice:
  - Which conditions to claim first
  - Which to defer
  - Recommended evidence to gather
  - Timeline recommendations
  - VSO recommendation
- Methods:
  - `prioritize_conditions()` - Easiest to hardest to prove
  - `estimate_approval_probability()` - Likelihood for each
  - `estimate_timeline()` - How long to expect
  - `recommend_next_steps()` - Action items
- Output: Step-by-step claim strategy

**Tool 8: C&P Exam Analyzer**
- Input: C&P exam results/notes
- Output: Analysis and recommendations
- Methods:
  - `extract_findings()` - What examiner found
  - `compare_to_claim()` - How does it match claimed condition?
  - `assess_adequacy()` - Was exam thorough enough?
  - `identify_issues()` - Examiner missed something?
  - `recommend_rebuttal()` - If exam is unfavorable
- Output: Analysis of exam quality and recommendations

**Tool 9: Risk of Denial Analyzer**
- Input: DD-214 + STR + Claimed conditions + Evidence
- Output: Risk assessment for each condition
- Methods:
  - `assess_service_connection_risk()` - Likelihood of denial
  - `identify_red_flags()` - Common denial triggers
  - `estimate_approval_probability()` - 0.0-1.0 per condition
  - `recommend_mitigations()` - How to reduce risk
- Output: Risk scorecard with mitigations
- Confidence: Based on evidence strength and VA precedent

**Tool 10: Denied Conditions Helper**
- Input: Previous denial letter + Condition details
- Output: Appeal strategy
- Methods:
  - `parse_denial_reasons()` - Why was it denied?
  - `find_rebuttals()` - Evidence that addresses denial
  - `identify_va_errors()` - Did VA misinterpret anything?
  - `recommend_appeal_strategy()` - How to appeal
  - `generate_rebuttal()` - Draft rebuttal arguments
- Output: Step-by-step appeal guide
- CFR References: 38 CFR Part 20 (appeals process)

**Tool 11: Secondary Conditions Recommender**
- Input: Primary service-connected condition
- Output: List of likely secondary conditions
- Logic:
  - `find_secondaries()` - VA medical literature
  - `assess_probability()` - Likelihood of each secondary
  - `estimate_ratings()` - Rating impact
  - `recommend_evidence()` - What to claim
- Output: Recommended secondary conditions with supporting evidence
- Confidence: Based on VA medical nexus precedent

**Tool 12: Disability Wizard (Multi-step)**
- Input: User answers to wizard questions
- Output: Structured claim ready to submit
- Steps:
  1. Service information (auto-fill from DD-214)
  2. Medical conditions (free text entry)
  3. Service connection evidence
  4. Supporting documents (upload)
  5. Strategy review (get recommendations)
  6. Final verification
- Output: Structured claim data ready to integrate with VA.gov
- Integration: Feeds profile, DocumentVault, generates claim file

**Tool 13: DBQ Auto-Fill Generator**
- Input: DD-214 + STR + Profile data
- Output: Pre-filled Disability Benefits Questionnaire (DBQ) PDF
- Methods:
  - `map_to_dbq_fields()` - VA's DBQ format
  - `pre_fill_demographics()` - Name, SSN, service info
  - `pre_fill_medical()` - From STR data
  - `generate_pdf()` - Create fillable PDF
- Output: PDF ready for C&P examiner to review/sign
- Integration: Saves to DocumentVault, ready to upload to VA.gov

---

### 3.2 Category 2: Document Tools (5 tools)

**Tool 1: Scanner Engine** ✅ COMPLETE
- See Scanner implementation summary
- Input: PDF, DOCX, TXT, JPG, PNG files
- Output: OCR text + document classification + structured field extraction
- Confidence: 70-80% for DD-214, 50-60% for STR/medical, 30-50% for claims

**Tool 2: Document Classifier**
- Input: Raw text from Scanner
- Output: Document type + classification confidence
- Types: DD-214, STR, MEB, Rating Decision, Claim Letter, Narrative Summary, Awards, etc.
- Methods:
  - `detect_document_type()` - Keyword-based detection
  - `calculate_confidence()` - 0.0-1.0
  - `extract_metadata()` - Date, sender, subject, etc.
- Output: Classified document with metadata

**Tool 3: Document Vault Manager**
- Input: DocumentVault queries (search, filter, retrieve)
- Output: Organized access to all uploaded documents
- Methods:
  - `list_documents()` - By type, date, confidence
  - `search_documents()` - By keyword or field
  - `retrieve_document()` - Get specific document
  - `get_extraction_history()` - All extractions for a document
  - `delete_old_versions()` - Keep vault organized
- Output: Document records with extracted data

**Tool 4: Evidence Packet Generator**
- Input: Conditions claimed + Documents from Vault
- Output: Organized evidence packet for claim
- Methods:
  - `collect_evidence()` - Gather relevant docs from vault
  - `organize_by_condition()` - Group docs per claimed condition
  - `add_annotations()` - Highlight relevant passages
  - `generate_cover_sheet()` - Index of evidence
  - `create_packet_pdf()` - Single organized file
- Output: Ready-to-submit evidence packet PDF
- Integration: Uses DocumentVault, outputs to Vault

**Tool 5: OCR Accuracy Improver**
- Input: Scanned document + Raw OCR text
- Output: Corrected OCR text
- Methods:
  - `detect_ocr_errors()` - Common OCR mistakes
  - `suggest_corrections()` - Context-aware fixes
  - `validate_corrections()` - Don't create false data
  - `confidence_per_line()` - Which parts were hard to read?
- Output: Improved text with confidence per line
- Integration: Feeds back into extraction engines

---

### 3.3 Category 3: Career & Resume Tools (5 tools)

**Tool 1: MOS Translator**
- Input: Military Occupation Specialty code (e.g., "11B")
- Output: Civilian job equivalents
- Logic:
  - `lookup_mos_description()` - What does 11B mean?
  - `find_civilian_equivalents()` - Closest civilian jobs
  - `extract_skills()` - Technical + soft skills
  - `estimate_salary_range()` - Expected civilian pay
- Output: MOS details + civilian job matches + skills + salary
- Data Source: VA MOS translation database

**Tool 2: Civilian Skills Extractor**
- Input: DD-214 + MOS description
- Output: List of transferable civilian skills
- Methods:
  - `extract_from_mos()` - Skills implied by MOS
  - `extract_from_positions()` - Actual positions held
  - `categorize_skills()` - Technical vs soft
  - `rate_transferability()` - How useful in civilian world?
- Output: Skills list with transferability ratings

**Tool 3: Resume Builder**
- Input: Profile data + DD-214 + Skills
- Output: Generated resume
- Methods:
  - `auto_fill_header()` - Name, contact info
  - `generate_summary()` - Professional summary
  - `format_experience()` - Military service formatted for civilian
  - `add_skills_section()` - Civilian-mapped skills
  - `add_education()` - GI Bill eligible programs
  - `generate_pdf()` - Professional resume PDF
- Output: Ready-to-submit resume PDF
- Integration: Auto-fills from profile, uses MOS/Skills tools

**Tool 4: Job Matching Engine**
- Input: Resume + Skills + Preferences
- Output: Matching job opportunities
- Methods:
  - `search_job_boards()` - Indeed, LinkedIn, government jobs
  - `match_skills()` - Compare resume to job requirements
  - `calculate_match_score()` - 0.0-1.0 fit
  - `rank_opportunities()` - Best matches first
  - `estimate_salary()` - Expected pay for matches
- Output: Ranked list of job opportunities with match scores

**Tool 5: Career Pathway Recommender**
- Input: MOS + Skills + Education + Goals
- Output: Recommended career pathways
- Logic:
  - `find_common_transitions()` - Where do people with your MOS go?
  - `identify_skill_gaps()` - What training would help?
  - `estimate_salary_growth()` - Career earning potential
  - `recommend_certifications()` - High-value certs
  - `timeline_recommendations()` - How long to each milestone
- Output: 3-5 recommended career pathways with milestones

---

### 3.4 Category 4: Financial Tools (5 tools)

**Tool 1: Budget Tool** (Restore & enhance)
- Input: Income (VA benefits, employment) + Expenses
- Output: Budget analysis and recommendations
- Methods:
  - `categorize_expenses()` - Housing, food, transportation, etc.
  - `identify_savings_opportunities()` - Where to cut costs
  - `analyze_spending()` - Trends and patterns
  - `generate_recommendations()` - Budget improvement tips
- Output: Visual budget breakdown with suggestions
- VA Integration: Auto-fill VA disability compensation
- Visual: Charts showing income vs expenses

**Tool 2: Retirement Projection Engine**
- Input: Current age, income, savings, expenses, retirement age
- Output: Retirement readiness analysis
- Methods:
  - `calculate_lifetime_needs()` - How much money needed?
  - `project_va_benefits()` - Future VA compensation with COLA adjustments
  - `project_savings_growth()` - Investment returns over time
  - `calculate_gap()` - Surplus or shortfall?
  - `sensitivity_analysis()` - What if...? scenarios
- Output: Detailed retirement projection with scenarios
- Confidence: Based on assumptions (inflation rate, investment returns)
- Integration: Uses profile income data

**Tool 3: Savings Goal Tracker**
- Input: Savings goals + Current savings + Income
- Output: Goal progress and timeline
- Methods:
  - `create_goal()` - Target amount, timeline
  - `calculate_monthly_savings()` - How much to save per month?
  - `track_progress()` - Are you on pace?
  - `recommend_adjustments()` - How to catch up if behind
- Output: Goal dashboard with progress tracking

**Tool 4: Subscription Tracker**
- Input: List of subscriptions (Netflix, Gym, etc.)
- Output: Annual cost analysis
- Methods:
  - `calculate_annual_cost()` - All subscriptions
  - `identify_unused()` - Not being used
  - `find_duplicates()` - Multiple similar services
  - `estimate_savings()` - By canceling unused/duplicates
- Output: Subscription audit with savings recommendations

**Tool 5: Financial Insights Engine**
- Input: Income, expenses, goals, age, family
- Output: Personalized financial advice
- Logic:
  - `identify_patterns()` - Spending trends
  - `benchmark_to_peers()` - How do you compare to similar veterans?
  - `generate_insights()` - "You spend 45% on housing, recommended is 30%"
  - `prioritize_actions()` - What matters most?
  - `veteran_specific_advice()` - VA benefits, survivor benefits, etc.
- Output: Personalized financial insights and recommendations

---

### 3.5 Category 5: Benefits Tools (4 tools)

**Tool 1: Eligibility Pre-Check Engine**
- Input: Service info + Discharge status + Disability rating
- Output: List of VA benefits you likely qualify for
- Methods:
  - `check_basic_eligibility()` - Service-connected disability required?
  - `check_income_limits()` - Need to be below certain income?
  - `check_special_situations()` - Purple Heart? MEB? Survivor?
  - `estimate_monthly_benefit()` - Expected payment amount
  - `explain_why()` - Why you qualify (cite CFR)
- Output: List of benefits with eligibility certainty (high/medium/low)
- CFR References: 38 CFR Part 3 (eligibility), Part 4 (ratings), etc.

**Tool 2: Benefits Matrix Engine**
- Input: Profile data + Conditions + Service info
- Output: Comprehensive benefits matrix
- Coverage:
  - Disability compensation (20+ scenarios)
  - Healthcare (CHAMPVA, dental, vision, etc.)
  - Education benefits (GI Bill transferability)
  - Home loans
  - Vocational rehab
  - Dependent benefits
  - Survivor benefits
  - State-level benefits
- Output: Interactive matrix showing which benefits apply
- Confidence: Based on eligibility rules

**Tool 3: SMC Auto-Suggest Engine**
- Input: Disabilities + Family status
- Output: Special Monthly Compensation (SMC) eligibility
- Logic:
  - `check_special_circumstances()` - Need aid/attendance? Housebound?
  - `check_dependent_status()` - Spouse, children, parents?
  - `calculate_smc_amount()` - Expected additional payment
  - `explain_requirements()` - What's needed to qualify
- Output: SMC recommendations with qualifying conditions
- Integration: Feeds benefits matrix

**Tool 4: State-Level Benefits Integrator**
- Input: State of residence + Disability rating + Income
- Output: State-specific benefits available
- Coverage: 50 states + territories
- Benefits: Tax breaks, property exemptions, healthcare, education, jobs programs
- Methods:
  - `lookup_state_benefits()` - What does your state offer?
  - `apply_veteran_tax_breaks()` - Federal and state
  - `find_hiring_incentives()` - State veteran employment programs
  - `calculate_tax_savings()` - Estimated annual benefit
- Output: State-level benefits checklist with contacts
- Data Source: State veteran affairs databases

---

### 3.6 Category 6: System & Integration Tools (6 tools)

**Tool 1: Profile Autofill Engine**
- Input: All extraction sources (Scanner, tools, user input)
- Output: Intelligently merged profile data
- Logic:
  - `non_destructive_merge()` - Never overwrite, only fill gaps
  - `conflict_resolution()` - Different sources say different things?
  - `confidence_weighting()` - Trust more confident extractions
  - `change_tracking()` - What changed and why?
- Output: Updated profile with audit trail
- Integration: Used by every tool via ToolService

**Tool 2: Profile Completeness Score**
- Input: Veteran profile
- Output: Completeness percentage + recommendations to improve
- Scoring:
  - Basic info (name, email, DOB) = 20%
  - Military service (branch, dates, rank, MOS) = 30%
  - VA disability (rating, conditions) = 20%
  - Career/education = 15%
  - Financial = 10%
  - Dependents = 5%
- Output: Overall score (0-100%) + which sections need work
- Integration: Displayed on Dashboard

**Tool 3: Onboarding Wizard**
- Input: New veteran user (empty profile)
- Output: Completed profile ready to use
- Steps:
  1. Upload DD-214 (auto-extract service info)
  2. Upload Medical Records (auto-extract conditions)
  3. Confirm disability rating (or request rating)
  4. Add dependents
  5. Confirm education level
  6. Confirm current employment
  7. Review completeness score
  8. Choose which tools to enable
- Output: Fully onboarded profile ready for all tools
- Integration: Uses Scanner, all extraction tools

**Tool 4: Enterprise Dashboard** (Admin view)
- Input: All veterans' data (admin only)
- Output: System analytics and management
- Metrics:
  - Total users, active users, new signups
  - Tool usage (which tools most used?)
  - Document uploads per month
  - Profile completeness average
  - Benefits claimed (estimates)
  - Errors and issues
- Output: Dashboards, reports, export capabilities
- Security: Admin-only access, full audit trail

**Tool 5: Bulk Processing Engine**
- Input: Batch of documents or operations
- Output: Processed results
- Operations:
  - Bulk document upload + auto-extract
  - Bulk profile updates (CSV import)
  - Bulk rating recalculations
  - Bulk report generation
- Methods:
  - `queue_batch()` - Accept batch
  - `process_async()` - Background processing
  - `track_progress()` - Monitor batch
  - `generate_summary()` - Results report
- Output: Processed batch with results summary and audit log
- Integration: Uses ToolService for each item

**Tool 6: Comprehensive Audit System** (Cross-cutting)
- Input: All operations across all tools
- Output: Complete audit trail
- Logging:
  - Who changed what
  - When changes were made
  - Why (which tool/action triggered it)
  - Before/after values
  - Confidence scores
  - Success/failure status
- Methods:
  - `log_change()` - Record every change
  - `query_audit()` - Search audit history
  - `generate_audit_report()` - Export audit trail
  - `ensure_immutability()` - Audit log can't be changed
- Output: Searchable, immutable audit log
- Compliance: VA audit trail requirements

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Fix Settings page integration (DONE ✅)
- [ ] Create tool base class (base.py)
- [ ] Create tool registry system
- [ ] Create tool service layer
- [ ] Create database models for audit logging
- [ ] Write tests for tool infrastructure

### Phase 2: Disability & Claims Tools (Week 3-6)
Priority order:
1. DD214/NGB-22 Parser (reuse enhanced extractor)
2. STR Review Engine
3. Medical Evidence Builder
4. Theory of Entitlement Engine
5. Quick Disability Rating Calculator
6. Full Disability Rating Engine
7. Claim Strategy Advisor
8. C&P Exam Analyzer
9. Risk of Denial Analyzer
10. Denied Conditions Helper
11. Secondary Conditions Recommender
12. Disability Wizard
13. DBQ Auto-Fill Generator

### Phase 3: Document Tools (Week 7)
- [ ] Enhance Scanner classifier
- [ ] Document Vault Manager
- [ ] Evidence Packet Generator
- [ ] OCR Accuracy Improver

### Phase 4: Career Tools (Week 8)
- [ ] MOS Translator
- [ ] Civilian Skills Extractor
- [ ] Resume Builder
- [ ] Job Matching Engine
- [ ] Career Pathway Recommender

### Phase 5: Financial Tools (Week 9)
- [ ] Budget Tool (restore & enhance)
- [ ] Retirement Projection Engine
- [ ] Savings Goal Tracker
- [ ] Subscription Tracker
- [ ] Financial Insights Engine

### Phase 6: Benefits Tools (Week 10)
- [ ] Eligibility Pre-Check Engine
- [ ] Benefits Matrix Engine
- [ ] SMC Auto-Suggest Engine
- [ ] State-Level Benefits Integrator

### Phase 7: System Tools (Week 11)
- [ ] Profile Autofill Engine (enhance)
- [ ] Profile Completeness Score
- [ ] Onboarding Wizard
- [ ] Enterprise Dashboard
- [ ] Bulk Processing Engine
- [ ] Comprehensive Audit System

### Phase 8: Integration & Testing (Week 12+)
- [ ] Full system integration tests
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Compliance review
- [ ] Production deployment

---

## Part 5: Global Rules Implementation

### Rule 1: Never Delete or Overwrite Existing Data
- All updates conditional on empty field check
- Pattern: `if not profile.field and extracted_data.field: update()`
- Audit trail for all changes
- Soft deletes only (mark as deleted, keep data)
- Implemented in: `_autofill_profile()` method

### Rule 2: Never Expose Scanner Output Unless Required
- Raw OCR text: Hidden from UI, logged only for debugging
- Structured extraction: Shown to user with confidence score
- User can hide confidence scores in settings
- Scanner raw outputs: Stored in vault but not user-visible
- Implemented in: Scanner response filtering

### Rule 3: All Tools Modular, Testable, Auditable
- Each tool: Standalone module in `app/tools/{name}.py`
- Each tool: 50+ unit tests in `tests/test_tools_{name}.py`
- Each tool: Comprehensive logging with structured formats
- Each tool: Version tracked in registry
- Implemented in: BaseTool class with enforce structure

### Rule 4: All Logic Transparent, Deterministic, VA-Aligned
- CFR references in code comments: `# 38 CFR 3.303`
- Decision trees documented: Each decision has "why" comment
- Reproducible: Same input always produces same output
- VA-aligned: Use official VA rating formulas, not approximations
- Implemented in: Documentation in each tool

### Rule 5: All Tools Integrate with Profile, DocumentVault, Benefits Engine
- Standard integration points via ToolService
- Non-destructive autofill only
- Event-driven updates (tools notify when they finish)
- Benefits Engine feeds from Profile + Vault
- Implemented in: ToolService and Event system

### Rule 6: Support Silent Background Processing
- Long-running tools: 202 Accepted, process async
- UI shows immediate confirmation
- Background task updates vault + profile
- User notified when complete
- Implemented in: ToolService background execution

---

## Part 6: Testing Strategy

### Unit Tests (Per Tool)
- Input validation tests
- Core logic tests
- Confidence calculation tests
- Edge case tests
- Error handling tests
- Target: 80%+ code coverage

### Integration Tests
- Tool + Profile integration
- Tool + DocumentVault integration
- Tool + Tool integration (where applicable)
- End-to-end tool execution pipeline

### UI Tests
- Component rendering
- Tool invocation
- Results display
- Error handling

### Accuracy Tests
- Compare extraction output to known data
- Measure confidence score accuracy
- Test against 6 sample PDFs (already provided)

---

## Part 7: Deployment Strategy

1. Deploy Foundation (base classes, registry)
2. Deploy Disability/Claims tools (13 tools, in priority order)
3. Deploy Document tools (4 additional tools)
4. Deploy Career tools (5 tools)
5. Deploy Financial tools (5 tools)
6. Deploy Benefits tools (4 tools)
7. Deploy System tools (6 tools)
8. Full integration testing
9. User acceptance testing
10. Production launch

---

## Summary

This architecture provides:

✅ **Modularity**: 38 independent tools, each can be developed/tested separately
✅ **Non-destructive**: Profile data never overwritten, only augmented
✅ **Auditable**: Every change logged with who/what/when/why
✅ **Scalable**: Background processing for long-running operations
✅ **Integrated**: All tools feed into unified Profile + DocumentVault
✅ **VA-aligned**: CFR references, official formulas, veteran-specific logic
✅ **Confident**: Confidence scoring throughout
✅ **Transparent**: Decision trees documented, logic clear

The rebuild follows a logical priority: Foundation → Disability/Claims (highest value) → Documents → Career → Financial → Benefits → System.

Total tools: 38
Total implementation: ~150 files (code + tests + docs)
Estimated timeline: 12 weeks with 1-2 developers

