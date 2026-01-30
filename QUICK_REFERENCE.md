# rallyforge Implementation Quick Reference

## 📋 Quick Navigation

### Scanner Engine (Document Processing)
- **Location**: `backend/app/scanner/`
- **Entry Point**: `ScannerPipeline()` from `scanner.pipeline`
- **Key Classes**: `DocumentInput`, `OCRResult`, `ClassifiedDocument`, `NormalizedOutput`
- **Usage**: Process military documents (DD214, certificates, awards)

### Resume Builder
- **Location**: `backend/app/resume_builder/`
- **Entry Point**: `ResumeBuilderEndpoints()` from `resume_builder.endpoints`
- **Key Classes**: `Resume`, `ExperienceItem`, `MOSMapping`
- **Features**: Generate resumes, translate MOS codes, tailor for jobs

### Job Recruiting Platform
- **Location**: `backend/app/job_recruiting/`
- **Entry Point**: `JobRecruitingEndpoints()` from `job_recruiting.endpoints`
- **Key Classes**: `VeteranProfile`, `Job`, `JobMatch`
- **Features**: Job matching, employer search, certifications

### Financial Tools
- **Location**: `backend/app/financial_tools/`
- **Entry Point**: `FinancialToolsEndpoints()` from `financial_tools.endpoints`
- **Key Classes**: `Budget`, `RetirementInputs`, `RetirementProjection`
- **Features**: Budget planning, retirement projections, savings goals

### Pipeline Framework
- **Location**: `backend/app/pipeline_completeness.py`
- **Entry Point**: `CompletePipeline()`
- **Key Classes**: `PipelineStage`, `InputContract`, `OutputContract`
- **Features**: Universal pipeline orchestration

---

## 🔧 Common Tasks

### Create a Veteran Profile
```python
from backend.app.job_recruiting import JobRecruitingEndpoints

recruiter = JobRecruitingEndpoints()
profile = recruiter.create_profile("user_123", {
    "name": "John Smith",
    "service_branch": "Army",
    "mos_codes": ["11B"],
    "years_service": 10.0,
    "skills": ["Leadership", "Planning"]
})
```

### Generate a Resume
```python
from backend.app.resume_builder import ResumeBuilderEndpoints

builder = ResumeBuilderEndpoints()
resume = builder.generate_resume("user_123", {
    "title": "Operations Manager",
    "summary": "Experienced leader",
    "experience": [...],
    "skills": [...]
})
```

### Search for Jobs
```python
recruiter = JobRecruitingEndpoints()
matches = recruiter.search_jobs("user_123", limit=10)
for match in matches:
    print(f"Match: {match.match_score}%")
```

### Create a Budget
```python
from backend.app.financial_tools import FinancialToolsEndpoints

finance = FinancialToolsEndpoints()
budget = finance.create_budget("user_123", {
    "name": "Monthly Budget",
    "income": [{"source": "employment", "amount": 5000}],
    "expenses": [{"category": "housing", "amount": 1500}]
})
```

### Plan Retirement
```python
retirement = finance.create_retirement_plan("user_123", {
    "current_age": 40,
    "retirement_age": 65,
    "current_savings": 100000,
    "annual_contribution": 10000
})
projection = finance.get_retirement_projection(retirement.id)
```

---

## 📊 Data Models Reference

### Scanner Models
- `DocumentInput` - Input document metadata
- `RawPage` - Single page from document
- `OCRResult` - OCR extraction result
- `ClassifiedDocument` - Document type classification
- `ExtractedFields` - Structured data extracted
- `ValidationResult` - Data validation results
- `NormalizedOutput` - Final standardized output

### Resume Models
- `Resume` - Complete resume document
- `ExperienceItem` - Single work experience
- `MOSMapping` - Military to civilian mapping

### Job Models
- `VeteranProfile` - Veteran candidate profile
- `Job` - Job posting
- `JobMatch` - Job match with scoring
- `CertificationPathway` - Career development
- `EmployerProfile` - Company profile

### Financial Models
- `Budget` - Monthly/annual budget
- `IncomeEntry` - Single income source
- `ExpenseEntry` - Single expense
- `RetirementInputs` - Retirement planning inputs
- `RetirementProjection` - Projected retirement finances

---

## 🧪 Testing

Run all tests:
```bash
python backend/tests/test_all_systems.py
```

Test categories:
- Scanner Engine Tests
- Resume Builder Tests
- Job Recruiting Tests
- Financial Tools Tests
- Integration Tests

---

## 🚀 Integration Example

See `backend/app/integration_example.py` for complete flow:
1. Scan DD214
2. Create veteran profile
3. Generate resume
4. Search for jobs
5. Plan finances
6. Project retirement

---

## 📁 Directory Structure

```
backend/app/
├── scanner/              (Document processing pipeline)
├── resume_builder/       (Resume generation & tailoring)
├── job_recruiting/       (Job matching & placement)
├── financial_tools/      (Budget & retirement planning)
├── pipeline_completeness.py  (Universal framework)
└── integration_example.py    (Complete example)
```

---

## 🔑 Key Endpoints Summary

### Resume Builder (10 endpoints)
- `POST /resume/generate`
- `POST /resume/tailor`
- `POST /resume/achievements`
- `GET /mos/translate/{mosCode}`

### Job Recruiting (12 endpoints)
- `POST /jobs/search`
- `POST /employers/search`
- `GET /certifications/pathway/{certName}`

### Financial Tools (10 endpoints)
- `POST /budget/create`
- `POST /retirement/plan`
- `POST /savings-goal`
- `POST /spending-analysis`

---

## 💡 Best Practices

1. **Always validate input** using input contracts
2. **Handle errors gracefully** with ErrorHandler
3. **Log important events** using ScannerLogger
4. **Use data models** for type safety
5. **Chain operations** in pipelines
6. **Validate output** using output contracts
7. **Track metrics** for performance monitoring

---

## 🎯 Performance Targets

- Scanner pipeline: < 5 sec per page
- Resume generation: < 500ms
- Job matching: < 1 sec for 1000 jobs
- Financial calculations: < 100ms
- Overall availability: 99.5%

---

## 📚 Documentation

- `IMPLEMENTATION_COMPLETE.md` - Full implementation guide
- `integration_example.py` - Complete example flow
- Docstrings on all classes and methods
- Type hints throughout codebase

---

## ✅ Implementation Status

- ✅ Scanner Engine (7-stage pipeline)
- ✅ Resume Builder (10 endpoints)
- ✅ Job Recruiting (12 endpoints)
- ✅ Financial Tools (10 endpoints)
- ✅ Pipeline Framework (universal)
- ✅ Testing (18+ tests)
- ✅ Documentation (complete)

**Ready for:** Database integration, authentication, frontend implementation, API documentation

---

Generated: January 28, 2026

