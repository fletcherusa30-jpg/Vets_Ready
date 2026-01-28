# STR Data Reference

This folder contains Service Training Records (STR) - military service documentation and data structures.

## Folder Organization

### `/samples`
**Purpose**: Sample DD214 records, training records, and certificates for testing and development

**Files**:
- `sample_dd214_john_smith.json` - Complete DD214 record example
- `sample_dd214_sarah_johnson.json` - Navy officer DD214 example
- `sample_training_records.json` - Military training coursework
- `sample_certificates.json` - Professional certifications

**Usage**:
```python
import json

with open('data/STR/samples/sample_dd214_john_smith.json') as f:
    dd214_data = json.load(f)

print(dd214_data['name'])  # "John Smith"
print(dd214_data['mos_codes'])  # ["11B", "12A"]
```

---

### `/reference`
**Purpose**: Reference data for lookups and validation

**Contains**:
- MOS code mapping (Military Occupational Specialties → Civilian roles)
- Service branch abbreviations and full names
- Rank structures by branch
- Award types and classifications
- Training institution mappings

---

## Sample DD214 Structure

Each DD214 record contains:

```json
{
  "veteran_id": "VET_001",
  "name": "John Smith",
  "service_branch": "Army",
  "rank": "Captain",
  "mos_codes": ["11B", "12A"],
  "service_dates": {
    "entry_active_duty": "2012-06-01",
    "separation": "2024-01-15",
    "total_years": 11.66
  },
  "awards": [...],
  "deployments": [...],
  "discharge_status": "Honorable",
  "medical_disability": {...},
  "confidence_score": 0.98
}
```

## Key Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `veteran_id` | String | Unique identifier | VET_001 |
| `name` | String | Full name | John Smith |
| `service_branch` | String | Army/Navy/Air Force/Marines/Coast Guard/Space Force | Army |
| `rank` | String | Highest rank attained | Captain (CPT) |
| `mos_codes` | Array | Military Occupational Specialties | ["11B", "12A"] |
| `service_dates` | Object | Service timeline | {start, end, total_years} |
| `awards` | Array | Military awards/medals | [{name, date_awarded}] |
| `deployments` | Array | Overseas locations/dates | [{location, start, end}] |
| `discharge_status` | String | Honorable/General/Other | Honorable |
| `medical_disability` | Object | VA disability rating | {rated, percent, disabilities} |
| `confidence_score` | Float | OCR/extraction confidence | 0.95-0.99 |

---

## Training Records Structure

```json
{
  "veteran_id": "VET_001",
  "training_id": "TRAIN_001",
  "course_name": "Leadership Development Course",
  "course_code": "LDC-2020",
  "provider": "U.S. Army Infantry School",
  "completion_date": "2019-03-15",
  "duration_hours": 120,
  "grade": "A",
  "certification_awarded": "Infantry Leader Course (ILC)",
  "certification_number": "ILC-2019-0045"
}
```

---

## Certificates Structure

```json
{
  "certificate_id": "CERT_001",
  "veteran_id": "VET_001",
  "certificate_name": "Six Sigma Green Belt",
  "issuing_organization": "American Society for Quality",
  "issue_date": "2020-03-10",
  "expiration_date": "2025-03-10",
  "credential_number": "ASQ-GSB-2020-145",
  "status": "active|expired"
}
```

---

## Using Sample Data for Testing

### Load and Process Sample DD214

```python
from backend.app.scanner import ScannerPipeline
import json

# Load sample
with open('data/STR/samples/sample_dd214_john_smith.json') as f:
    sample_data = json.load(f)

# Create scanner
scanner = ScannerPipeline()

# Test data extraction
extracted = scanner.field_extraction.extract_fields(sample_data)
print(f"Extracted {len(extracted.all_fields)} fields")
```

### Validate Against Reference Data

```python
import json

# Load reference MOS codes
with open('data/STR/reference/mos_mappings.json') as f:
    mos_reference = json.load(f)

# Validate MOS codes
sample_mos = sample_data['mos_codes']
for mos in sample_mos:
    if mos in mos_reference:
        print(f"{mos} → {mos_reference[mos]['civilian_title']}")
```

---

## Integration with Scanner Engine

The STR data feeds into:

1. **Scanner Engine** - Processes raw DD214 PDFs
   - Converts to structured data (using sample format)
   - Validates against reference data
   - Normalizes field values

2. **Resume Builder** - Generates civilian resumes
   - Uses MOS translations from reference data
   - Extracts skills from service record

3. **Job Recruiting** - Matches jobs to veteran profile
   - Uses service history from STR
   - Applies skills extraction

---

## Data Quality Notes

### Confidence Scores
- `0.95-0.99`: High confidence (OCR clear, fields extracted reliably)
- `0.85-0.94`: Medium confidence (some OCR errors, interpretations needed)
- `< 0.85`: Low confidence (manual review recommended)

### Common Extraction Issues
- **Date formats**: Standardized to YYYY-MM-DD
- **MOS codes**: Some records have outdated codes (mapped to current codes)
- **Rank abbreviations**: Standardized with service branch specific rules
- **Awards**: May have alternate names/spellings (normalized to standard)

---

## Next Steps

1. **Reference Data**: Populate `/reference` folder with:
   - MOS code mappings (mos_mappings.json)
   - Service branch codes (service_branches.json)
   - Rank structures (rank_by_branch.json)
   - Award classifications (awards_reference.json)

2. **Test Data**: Expand `/samples` with:
   - Air Force records
   - Coast Guard records
   - Reserve component records
   - Medical disability records

3. **Database**: Link STR data to persistence layer
   - Create SQLAlchemy models
   - Add relationships to Resume and JobRecruiting data

---

## References

- DD Form 214: https://militarybenefits.info/dd214/
- MOS Codes: https://en.wikipedia.org/wiki/Military_occupational_specialty
- VA Disability Ratings: https://www.va.gov/disability/
