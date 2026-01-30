# Employment System API Reference

Complete API documentation for the rallyforge Employment System.

## Core Matching Engine

### `matchVeteranToJobs(veteran, jobs, options)`

Matches a veteran to a list of job postings based on skills, credentials, location, salary, and clearance.

**Parameters:**
- `veteran: VeteranProfile` - The veteran's complete profile
- `jobs: JobPosting[]` - Array of job postings to match against
- `options: MatchingOptions` - Configuration for matching algorithm
  - `skillWeight?: number` - Weight for skill matching (default: 0.4)
  - `credentialWeight?: number` - Weight for credential matching (default: 0.25)
  - `locationWeight?: number` - Weight for location matching (default: 0.15)
  - `salaryWeight?: number` - Weight for salary matching (default: 0.1)
  - `clearanceWeight?: number` - Weight for clearance matching (default: 0.1)
  - `minMatchScore?: number` - Minimum match score threshold (default: 50)
  - `maxResults?: number` - Maximum number of results to return (default: 50)

**Returns:** `Promise<MatchResult[]>` - Array of match results sorted by score (highest first)

**Example:**
```typescript
const matches = await matchVeteranToJobs(
  veteranProfile,
  jobPostings,
  {
    skillWeight: 0.5, // Emphasize skills
    minMatchScore: 70, // Only strong matches
    maxResults: 10 // Top 10 results
  }
);
```

### `matchVeteranToJob(veteran, job, options)`

Match a veteran to a single job posting with detailed breakdown.

**Parameters:**
- `veteran: VeteranProfile`
- `job: JobPosting`
- `options: MatchingOptions`

**Returns:** `Promise<MatchResult>` - Detailed match result with component scores

## Scoring Algorithms

### `calculateSkillMatch(veteranSkills, requiredSkills, preferredSkills)`

Calculate skill compatibility score between veteran and job.

**Returns:** `SkillMatchResult` - Score (0-100) and detailed skill-by-skill breakdown

### `calculateCredentialMatch(veteranCredentials, requiredCredentials, preferredCredentials)`

Calculate credential/certification match score.

**Returns:** `CredentialMatchResult` - Score (0-100) and credential equivalency details

### `calculateLocationMatch(preferences, jobLocation, remoteOption)`

Calculate location compatibility.

**Returns:** `number` - Score (0-100)

### `calculateSalaryMatch(desiredRange, jobRange)`

Calculate salary range alignment.

**Returns:** `number` - Score (0-100)

### `calculateClearanceMatch(veteranClearance, clearanceStatus, requiredClearance)`

Calculate security clearance match.

**Returns:** `number` - Score (0-100)

## Career Discovery

### `discoverCareerPaths(veteran, limit)`

Discover optimal career paths based on military background and interests.

**Parameters:**
- `veteran: VeteranProfile`
- `limit: number` - Max number of recommendations (default: 5)

**Returns:** `Promise<CareerRecommendation[]>` - Ranked career path recommendations

**Example:**
```typescript
const careers = await discoverCareerPaths(veteranProfile, 5);
careers.forEach(rec => {
  console.log(`${rec.career.title}: ${rec.matchScore}% match`);
  console.log(`Reasons: ${rec.reasons.join(', ')}`);
});
```

## Skills Translation

### `translateMilitaryExperience(branchHistory)`

Translate all military experience to civilian-relevant skills.

**Parameters:**
- `branchHistory: BranchServiceRecord[]`

**Returns:** `Promise<TranslationResult[]>` - Comprehensive skill translations

### `translateMOS(branch, code, title)`

Translate specific MOS/AFSC/Rating to civilian skills.

**Returns:** `Promise<TranslationResult[]>`

### `generateSkillsSummary(branchHistory, targetIndustry)`

Generate resume-ready skills summary.

**Returns:** `Promise<string[]>` - Formatted skills by category

### `generateATSKeywords(branchHistory, targetJobTitle)`

Generate keywords for ATS optimization.

**Returns:** `Promise<string[]>` - Industry-specific keywords

## Resume Generation

### `generateResume(veteran, format, targetJob)`

Generate complete, ATS-optimized resume.

**Parameters:**
- `veteran: VeteranProfile`
- `format: 'chronological' | 'functional' | 'hybrid' | 'federal'` (default: 'chronological')
- `targetJob?: string` - Target role for customization

**Returns:** `Promise<Resume>` - Complete resume with sections and ATS score

**Example:**
```typescript
const resume = await generateResume(
  veteranProfile,
  'chronological',
  'Cybersecurity Analyst'
);

console.log(`ATS Score: ${resume.atsScore}/100`);
console.log(`Keywords: ${resume.keywords.join(', ')}`);
```

### `exportResume(resume, format)`

Export resume in different formats.

**Parameters:**
- `resume: Resume`
- `format: 'txt' | 'json' | 'html'`

**Returns:** `Promise<string>` - Formatted resume content

## Interview Preparation

### `generateInterviewPrep(veteran, job)`

Generate complete interview preparation package.

**Parameters:**
- `veteran: VeteranProfile`
- `job: JobPosting`

**Returns:** `Promise<InterviewPrep>` - Questions, STAR stories, tips, dress code

**Example:**
```typescript
const prep = await generateInterviewPrep(veteranProfile, jobPosting);

prep.questions.forEach(q => {
  console.log(`Q: ${q.question}`);
  console.log(`Tips: ${q.tips.join('\n')}`);
});
```

### `generateMockInterview(veteran, job, difficulty)`

Generate mock interview questions by difficulty level.

**Parameters:**
- `difficulty: 'beginner' | 'intermediate' | 'advanced'`

**Returns:** `Promise<InterviewQuestion[]>`

### `evaluateAnswer(question, answer)`

Evaluate an interview answer with AI feedback.

**Returns:** `Promise<AnswerEvaluation>` - Score, strengths, improvements

## Job Matching & Search

### `searchJobs(veteran, criteria)`

Search and match jobs with advanced filtering.

**Parameters:**
- `veteran: VeteranProfile`
- `criteria: JobSearchCriteria`
  - `industries?: string[]`
  - `locations?: string[]`
  - `salaryMin?: number`
  - `salaryMax?: number`
  - `remoteOnly?: boolean`
  - `veteranFriendlyOnly?: boolean`
  - `clearanceRequired?: string`
  - `keywords?: string[]`
  - `limit?: number`

**Returns:** `Promise<MatchResult[]>` - Matched and ranked jobs

### `getRecommendedJobs(veteran, limit)`

Get job recommendations based on MOS/AFSC.

**Returns:** `Promise<MatchResult[]>`

### `getSimilarJobs(jobId, limit)`

Find jobs similar to a given posting.

**Returns:** `Promise<JobPosting[]>`

### `trackApplication(veteranId, jobId, status)`

Track job application status.

**Returns:** `Promise<JobApplication>`

## Credentialing

### `recommendCredentials(veteran, targetIndustry)`

Recommend certifications and licenses.

**Parameters:**
- `veteran: VeteranProfile`
- `targetIndustry?: string` - Focus on specific industry

**Returns:** `Promise<CredentialRecommendation[]>` - Prioritized credentials with costs and providers

### `createCredentialRoadmap(veteran, targetRole)`

Create phased credential acquisition plan.

**Returns:** `Promise<CredentialRoadmap>` - 3-phase roadmap with total cost and time

## AI Coaching

### `startCoachingSession(veteranId, topic)`

Start an AI coaching session.

**Parameters:**
- `veteranId: string`
- `topic: string` - e.g., "resume help", "interview prep", "career transition"

**Returns:** `Promise<CoachingSession>`

### `generateCoachingResponse(session, veteranMessage, veteranProfile)`

Generate AI coaching response.

**Returns:** `Promise<string>` - Personalized coaching advice

### `createCoachingGoal(veteranId, description, targetDate)`

Create career goal with milestones.

**Returns:** `Promise<CoachingGoal>`

## Predictive Forecasting

### `generateCareerForecast(veteran, timeframe)`

Generate career trajectory forecast.

**Parameters:**
- `timeframe: '1-year' | '3-year' | '5-year' | '10-year'`

**Returns:** `Promise<CareerForecast>` - Projections, market trends, recommendations

### `predictOptimalCareerPath(veteran)`

Predict best career path with timeline and salary progression.

**Returns:** `Promise<CareerPathPrediction>`

## Workplace Readiness

### `assessWorkplaceReadiness(veteran)`

Assess readiness for civilian workplace.

**Returns:** `Promise<ReadinessAssessment>` - Scores across 8 dimensions, action plan

### `generateCultureGuide()`

Generate military-to-civilian culture guide.

**Returns:** `Promise<CultureGuide>` - Differences, tips, challenges, strategies

## Application Automation

### `autoApplyToJobs(veteran, jobs, config)`

Automatically apply to matching jobs.

**Parameters:**
- `config: ApplicationConfig`
  - `autoApplyEnabled: boolean`
  - `minMatchScore: number`
  - `maxApplicationsPerDay: number`
  - `targetIndustries: string[]`
  - `excludedCompanies: string[]`
  - `customResponses: Record<string, string>`

**Returns:** `Promise<ApplicationResult[]>` - Application submission results

### `trackApplicationStatus(applicationId)`

Track application progress.

**Returns:** `Promise<ApplicationTracking>` - Status, timeline, next steps

### `getApplicationStats(veteranId)`

Get application statistics and analytics.

**Returns:** `Promise<ApplicationStats>` - Response rates, top industries, etc.

## Digital Twin

### `createDigitalTwin(veteran)`

Create virtual career representation.

**Returns:** `Promise<DigitalTwin>` - Current state, simulations, predictions

### `updateDigitalTwin(twinId, veteran)`

Update twin with new data.

**Returns:** `Promise<DigitalTwin>`

## Integration APIs

### MOS Engine

```typescript
import { fetchMOSData, convertMilitaryServiceToSkills } from './integrations/mos_engine';

const mosData = await fetchMOSData('Army', '25D');
const skills = await convertMilitaryServiceToSkills(serviceRecord);
```

### Benefits Engine

```typescript
import { fetchBenefitsData, getEducationBenefits } from './integrations/benefits_engine';

const benefits = await fetchBenefitsData(veteranId);
const giBill = await getEducationBenefits(veteranId);
```

### External Jobs

```typescript
import { aggregateJobsFromAllSources } from './integrations/external_jobs';

const jobs = await aggregateJobsFromAllSources('Cybersecurity', 'San Diego, CA');
```

## Error Handling

All API methods return Promises and should be wrapped in try-catch blocks:

```typescript
try {
  const matches = await matchVeteranToJobs(veteran, jobs);
} catch (error) {
  console.error('Matching failed:', error);
}
```

## TypeScript Types

All models are fully typed with Zod validation. Import types:

```typescript
import {
  VeteranProfile,
  JobPosting,
  MatchResult,
  CareerPath,
  Skill,
  Credential
} from './data/models';
```

## Rate Limits

- External job APIs: 100 requests/hour
- AI coaching responses: 50 messages/hour
- Application automation: 25 applications/day per veteran

## Authentication

Future versions will require API key authentication:

```typescript
const client = new rallyforgeEmploymentClient({
  apiKey: process.env.rallyforge_API_KEY
});
```

