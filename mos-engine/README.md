# rallyforge MOS Engine

## Military Job Intelligence & Resume Generation System

A comprehensive, adaptive system for collecting, normalizing, and translating military job codes (MOS/AFSC/Rating) into resume-ready civilian language for all U.S. military veterans.

## Features

- **Multi-Branch Coverage**: Army, Marines, Navy, Air Force, Coast Guard, Space Force
- **Unified Schema**: Normalize all military jobs into a single, queryable format
- **Resume Generation**: Auto-generate civilian-friendly resume bullets for every job
- **Skill Taxonomy**: Map military skills to civilian equivalents
- **Job Matching**: Suggest civilian careers based on military experience
- **ATS Optimization**: Generate keywords for Applicant Tracking Systems
- **Certification Mapping**: Identify relevant civilian certifications
- **Adaptive Updates**: Automatically detect new, changed, or retired jobs

## Quick Start

```bash
# Install dependencies
npm install

# Ingest all military jobs
npm run ingest:all

# Normalize into unified format
npm run normalize

# Generate resume language
npm run generate:resume

# Run full pipeline
npm run pipeline

# Check for updates
npm run update:check
```

## Architecture

### Data Flow

```
Raw Data → Ingestion → Normalization → Enhancement → Output
```

1. **Ingestion**: Collect job data from official sources (CSV, JSON, web scraping)
2. **Normalization**: Merge all branches into unified `MilitaryJob` schema
3. **Enhancement**: Add skills, resume bullets, civilian matches, certifications
4. **Output**: Generate JSON for rallyforge platform consumption

### Core Modules

- **models**: TypeScript schemas and validators (Zod)
- **ingestion**: Branch-specific parsers (Army, Navy, etc.)
- **normalization**: Merge and deduplicate jobs
- **resume_language**: Generate resume bullets with action verbs and metrics
- **skills**: Build skill taxonomy and mappings
- **civilian_mapping**: Match military jobs to civilian careers
- **certifications**: Map to relevant credentials (PMP, CompTIA, etc.)
- **update_checker**: Detect dataset changes over time

## Data Schema

### MilitaryJob

```typescript
{
  id: string;              // "11B", "25B", "CTN", etc.
  branch: string;          // "Army", "Navy", etc.
  category: string;        // "Infantry", "IT", "Medical"
  title: string;           // "Infantryman", "IT Specialist"
  description: string;     // Plain-language description
  source: string;          // Data source URL
  lastVerified: string;    // ISO 8601 date
  status: "active" | "retired" | "unknown";
  skills: string[];        // ["Leadership", "Troubleshooting"]
  softSkills: string[];    // ["Team coordination", "Communication"]
  certifications: string[]; // ["CompTIA A+", "PMP"]
  civilianMatches: {       // Civilian job equivalents
    title: string;
    socCode?: string;
    industry: string;
    matchScore?: number;
  }[];
  resumeBullets: string[]; // Pre-generated bullets
  impactExamples: string[]; // Quantifiable achievements
  keywords: string[];      // ATS keywords
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run ingest:all` | Ingest all branches |
| `npm run ingest:army` | Ingest Army MOS only |
| `npm run normalize` | Merge and validate all jobs |
| `npm run generate:resume` | Generate resume language |
| `npm run generate:skills` | Build skill taxonomy |
| `npm run generate:civilian` | Match civilian jobs |
| `npm run update:check` | Check for job code changes |
| `npm run update:apply` | Apply detected updates |
| `npm run pipeline` | Run full end-to-end process |
| `npm test` | Run all tests |

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Test Coverage Requirements

- ✅ All branches must have > 0 jobs
- ✅ Total jobs must be >= 5,000
- ✅ All jobs must pass schema validation
- ✅ Resume bullets must use action verbs
- ✅ All jobs must have >= 3 resume bullets

## VS Code Tasks

Open Command Palette (`Ctrl+Shift+P`) and run:

- **Ingest All Military Jobs**
- **Normalize Dataset**
- **Generate Resume Language**
- **Check for Updates**
- **Run Full Pipeline**

## Directory Structure

```
mos-engine/
├── docs/                   # Documentation
├── data/
│   ├── raw/               # Raw data by branch
│   │   ├── army/
│   │   ├── marines/
│   │   ├── navy/
│   │   ├── airforce/
│   │   ├── coastguard/
│   │   └── spaceforce/
│   └── processed/         # Unified output
│       ├── all_jobs.json
│       ├── all_jobs_with_resume.json
│       └── update_report.json
├── src/
│   ├── models/            # TypeScript schemas
│   ├── ingestion/         # Branch-specific parsers
│   ├── normalization/     # Merge logic
│   ├── resume_language/   # Resume generators
│   ├── skills/            # Skill taxonomy
│   ├── civilian_mapping/  # Job matching
│   ├── certifications/    # Credential mapping
│   └── update_checker/    # Change detection
└── tests/                 # Unit tests
```

## Contributing

1. Add raw data to `data/raw/<branch>/`
2. Create ingestion script in `src/ingestion/`
3. Update normalization engine if needed
4. Add tests
5. Run `npm run pipeline` to validate

## License

MIT

