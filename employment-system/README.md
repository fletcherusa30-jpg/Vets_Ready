# rallyforge Employment System

A comprehensive employment platform that translates military experience into civilian career success.

## Overview

The rallyforge Employment System is an enterprise-grade career management platform designed specifically for military veterans. It provides end-to-end support for:

- **Military-to-Civilian Translation**: Automatically converts military experience (MOS/AFSC/Rating) into civilian-relevant skills
- **Intelligent Job Matching**: AI-powered matching that understands veteran profiles and finds optimal opportunities
- **Resume Generation**: Creates ATS-optimized resumes that translate military experience effectively
- **Interview Preparation**: Tailored interview questions, STAR stories, and veteran-specific guidance
- **Credential Planning**: Recommends certifications and licenses with GI Bill eligibility
- **Career Pathfinding**: Discovers career paths based on military background and interests

## Architecture

```
employment-system/
├── src/
│   ├── core/                    # Core engines
│   │   ├── matching/            # Job matching engine
│   │   ├── scoring/             # Scoring algorithms
│   │   ├── profile/             # Profile management
│   │   └── recommendations/     # Recommendation engine
│   ├── domains/                 # Domain modules (25+)
│   │   ├── career_discovery/    # Career pathfinding
│   │   ├── skills_translation/  # Military → Civilian skills
│   │   ├── resume_tools/        # Resume generation
│   │   ├── interview_prep/      # Interview preparation
│   │   ├── credentialing/       # Certification planning
│   │   ├── job_matching/        # Job search & matching
│   │   └── [20+ more domains]   # Additional features
│   └── integrations/            # External integrations
│       ├── mos_engine/          # Military job intelligence
│       ├── benefits_engine/     # VA benefits data
│       ├── external_jobs/       # Job board APIs
│       └── external_credentials/# Certification providers
├── data/
│   ├── models/                  # Data schemas (Zod)
│   └── seed/                    # Seed data
├── tests/                       # Test suites
└── docs/                        # Documentation

```

## Features

### Core Matching Engine
- **Skill Matching**: Exact, partial, and transferable skill detection
- **Credential Matching**: Certification equivalency and alternatives
- **Location Matching**: Geography and remote work preferences
- **Salary Matching**: Range overlap and compensation alignment
- **Clearance Matching**: Security clearance level verification
- **Weighted Scoring**: Customizable weights for different factors

### Military-to-Civilian Translation
- **Universal Skills**: Leadership, communication, problem-solving
- **MOS-Specific Translation**: 150+ MOS/AFSC/Rating codes mapped
- **Transferable Skills Detection**: Military → Civilian skill mapping
- **ATS Keyword Generation**: Industry-specific keyword extraction
- **Skills Summary Generation**: Resume-ready skill descriptions

### Resume Tools
- **Multiple Formats**: Chronological, functional, hybrid, federal
- **ATS Optimization**: 100-point ATS compatibility scoring
- **STAR Bullet Generation**: Action-verb focused accomplishments
- **Quantified Achievements**: Metrics and impact statements
- **Export Options**: TXT, HTML, JSON, PDF (future)

### Interview Preparation
- **Question Generation**: Behavioral, technical, situational, veteran-specific
- **STAR Story Bank**: Pre-built stories from military experience
- **Answer Evaluation**: AI scoring with strengths/improvements
- **Common Mistakes**: Veteran-specific interview pitfalls
- **Dress Code Guidance**: Industry-appropriate recommendations

### Job Matching
- **Multi-Source Aggregation**: Indeed, LinkedIn, USAJobs, veteran boards
- **Smart Filtering**: Industry, location, salary, clearance, remote
- **Similarity Detection**: Find jobs like ones you're interested in
- **Application Tracking**: Track applications through hiring process
- **Saved Jobs**: Bookmark opportunities for later

### Credentialing
- **Intelligent Recommendations**: Priority-ranked certifications
- **GI Bill Integration**: Show GI Bill eligible programs
- **Cost Analysis**: Compare provider options and veteran discounts
- **Roadmap Planning**: Phased certification acquisition plans
- **MOS Alignment**: Recommendations based on military background

## Data Models

### VeteranProfile
- Personal information (name, email, phone, location)
- Branch history (MOS/AFSC, rank, deployments)
- Skills (category, level, source, years)
- Credentials (certifications, licenses, degrees)
- Employment goals (target industries, roles, salary)
- Security clearance (level, status)
- Disability status (rating, percentage)

### JobPosting
- Job details (title, company, industry, location)
- Requirements (skills, credentials, clearance)
- Compensation (salary range, benefits)
- Veteran-friendliness (veteran-friendly flag, MOS mapping)
- Remote options, job type, posting date

### MatchResult
- Match score (0-100)
- Component scores (skills, credentials, location, salary, clearance)
- Detailed breakdowns (skill matches, credential matches)
- Strengths and gaps
- Recommendations for improvement

### CareerPath
- Career progression (entry/mid/senior roles)
- Required skills and credentials
- Salary ranges and growth outlook
- Demand level and veteran fit score
- Relevant MOS/AFSC codes

## Integration Points

### MOS Engine
- Fetch MOS data (skills, civilian jobs, certifications)
- Convert military service to skills
- Get civilian job recommendations
- Get recommended certifications

### Benefits Engine
- VA disability rating and compensation
- GI Bill eligibility and remaining months
- Vocational Rehabilitation (VR&E)
- Financial assistance programs

### External Jobs
- Indeed API
- LinkedIn API
- USAJobs API
- Veteran-specific job boards
- Clearance jobs (ClearanceJobs.com)

## Usage

### Match Veteran to Jobs

```typescript
import { matchVeteranToJobs } from './src/core/matching';

const matches = await matchVeteranToJobs(
  veteranProfile,
  jobPostings,
  {
    skillWeight: 0.4,
    credentialWeight: 0.25,
    locationWeight: 0.15,
    minMatchScore: 50,
    maxResults: 20
  }
);
```

### Generate Resume

```typescript
import { generateResume, exportResume } from './src/domains/resume_tools/service';

const resume = await generateResume(
  veteranProfile,
  'chronological',
  'Cybersecurity Analyst'
);

const htmlResume = await exportResume(resume, 'html');
```

### Discover Career Paths

```typescript
import { discoverCareerPaths } from './src/domains/career_discovery/service';

const recommendations = await discoverCareerPaths(veteranProfile, 5);
```

### Prepare for Interview

```typescript
import { generateInterviewPrep } from './src/domains/interview_prep/service';

const prep = await generateInterviewPrep(veteranProfile, jobPosting);
```

## Scripts

```bash
# Build the project
npm run build

# Run tests
npm run test

# Match jobs
npm run match:jobs

# Discover careers
npm run discover:careers

# Build resume
npm run build:resume

# Interview prep
npm run prep:interview

# Generate models
npm run generate:models

# Generate domain code
npm run generate:domains
```

## Roadmap

### Phase 1: Foundation (Complete)
- ✅ Core data models
- ✅ Matching engine
- ✅ Scoring algorithms
- ✅ Basic domain modules

### Phase 2: Enhancement (In Progress)
- ⏳ Remaining 20 domain modules
- ⏳ Advanced AI features
- ⏳ Complete test coverage
- ⏳ Full documentation

### Phase 3: Integration
- 🔲 MOS Engine connection
- 🔲 Benefits Engine connection
- 🔲 External job board APIs
- 🔲 Credential provider APIs

### Phase 4: Deployment
- 🔲 API layer
- 🔲 Frontend UI
- 🔲 Production database
- 🔲 National scaling

## Contributing

This is an enterprise-grade system built to production standards. All contributions must maintain:

- Type safety (TypeScript strict mode)
- Comprehensive validation (Zod schemas)
- Complete test coverage
- Detailed documentation
- Production-ready code quality

## License

Proprietary - rallyforge Platform

## Support

For questions or support, contact the rallyforge development team.

