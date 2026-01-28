# Employment System Data Models

Complete reference for all data structures in the VetsReady Employment System.

## Core Models

### VeteranProfile

The complete profile of a transitioning or transitioned veteran.

```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;

  // Military history
  branchHistory: BranchServiceRecord[];

  // Skills & credentials
  skills: Skill[];
  credentials: Credential[];

  // Interests & goals
  interests: string[];
  targetIndustries: string[];
  targetRoles: string[];
  locationPreferences: string[];

  // Security clearance
  clearanceLevel?: 'None' | 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
  clearanceStatus?: 'active' | 'expired' | 'pending';

  // Disability
  disabilityStatus?: boolean;
  disabilityRating?: number; // 0-100

  // Employment
  employmentGoals: string[];
  currentEmploymentStatus?: string;
  desiredSalaryRange?: SalaryRange;
}
```

### BranchServiceRecord

Military service history for one branch/period.

```typescript
{
  id: string;
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force';
  mosOrAfscOrRating: string; // MOS code, AFSC, or Rating
  title: string; // Job title
  startDate: string; // ISO date
  endDate?: string; // ISO date (undefined if currently serving)
  rankAtSeparation?: string;
  deployments?: Deployment[];
  awardsAndDecorations?: string[];
}
```

### Deployment

```typescript
{
  location: string;
  startDate: string;
  endDate: string;
  operation?: string;
}
```

### Skill

Represents a skill with proficiency level.

```typescript
{
  id: string;
  name: string;
  category: string; // e.g., 'Information Technology', 'Leadership', 'Logistics'
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  source: 'MOS' | 'self-reported' | 'inferred' | 'training' | 'certification';
  yearsOfExperience?: number;
}
```

### Credential

Certifications, licenses, degrees, apprenticeships.

```typescript
{
  id: string;
  name: string;
  type: 'certification' | 'license' | 'degree' | 'apprenticeship';
  provider: string;
  status: 'planned' | 'in-progress' | 'completed' | 'expired';
  issueDate?: string;
  completionDate?: string;
  expirationDate?: string;
  credentialId?: string;
}
```

### JobPosting

A job opportunity posting.

```typescript
{
  id: string;
  title: string;
  companyName: string;
  industry?: string;
  location: string;
  remoteOption: boolean;
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';

  // Compensation
  salaryRange?: SalaryRange;
  benefits?: string[];

  // Requirements
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredCredentials?: string[];
  preferredCredentials?: string[];
  experienceLevel?: string;
  educationLevel?: string;

  // Veteran-specific
  veteranFriendly: boolean;
  clearanceRequired?: 'None' | 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
  canSponsorClearance?: boolean;
  relevantMOS?: string[]; // MOS/AFSC codes this role maps to

  // Metadata
  postedDate: string;
  externalUrl?: string;
}
```

### SalaryRange

```typescript
{
  min: number;
  max: number;
  currency: string; // e.g., 'USD'
  period: 'hourly' | 'yearly';
}
```

### MatchResult

Result of matching a veteran to a job.

```typescript
{
  id: string;
  jobId: string;
  veteranId: string;
  matchScore: number; // 0-100 overall match

  // Component scores
  skillMatchScore: number; // 0-100
  credentialMatchScore: number; // 0-100
  locationMatchScore: number; // 0-100
  salaryMatchScore: number; // 0-100
  clearanceMatchScore: number; // 0-100

  // Detailed breakdowns
  skillMatchDetails: SkillMatchDetail[];
  credentialMatchDetails: CredentialMatchDetail[];

  // Insights
  strengths: string[]; // What makes this a good match
  gaps: string[]; // What's missing
  recommendations: string[]; // How to improve candidacy

  // Metadata
  matchedAt: string;
  rank?: number; // Position in ranked results
}
```

### SkillMatchDetail

```typescript
{
  skillId: string;
  skillName: string;
  status: 'matched' | 'partial' | 'missing' | 'transferable';
  weight: number; // Importance (0-1)
  matchReason?: string; // Why it's a match
  veteranLevel?: string; // Veteran's proficiency
  requiredLevel: 'required' | 'preferred';
}
```

### CredentialMatchDetail

```typescript
{
  credentialId: string;
  credentialName: string;
  status: 'matched' | 'missing' | 'alternative-available' | 'in-progress';
  weight: number; // Importance (0-1)
  alternative?: string; // Name of alternative credential veteran has
}
```

### CareerPath

A defined career progression path.

```typescript
{
  id: string;
  title: string; // e.g., "Cybersecurity Analyst"
  industry: string;
  description: string;

  // Requirements
  requiredSkills: string[];
  preferredSkills?: string[];
  requiredCredentials?: string[];
  educationLevel: string;

  // Progression
  entryLevelRoles: string[];
  midLevelRoles?: string[];
  seniorLevelRoles?: string[];

  // Economics
  salaryRange: SalaryRange;
  growthOutlook: 'high-growth' | 'growing' | 'stable' | 'declining';
  demandLevel: 'very-high' | 'high' | 'moderate' | 'low';

  // Work characteristics
  physicalDemands: 'low' | 'moderate' | 'high';
  stressLevel: 'low' | 'moderate' | 'high';
  travelRequirement: 'none' | 'occasional' | 'frequent' | 'constant';

  // Veteran fit
  relevantMOS?: string[]; // Which MOS/AFSC map to this career
  veteranFit?: number; // 0-100 score based on veteran survey data
}
```

## Domain-Specific Models

### ResumeSection

```typescript
{
  title: string;
  content: string[];
  order: number; // Display order
}
```

### Resume

```typescript
{
  format: 'chronological' | 'functional' | 'hybrid' | 'federal';
  sections: ResumeSection[];
  keywords: string[]; // ATS keywords
  atsScore: number; // 0-100 ATS compatibility
}
```

### InterviewQuestion

```typescript
{
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'veteran-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAnswer?: string;
  tips: string[];
}
```

### STARStory

STAR method story template.

```typescript
{
  id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  applicableQuestions: string[]; // Which questions this story answers
}
```

### CredentialRecommendation

```typescript
{
  credential: CredentialInfo;
  priority: 'high' | 'medium' | 'low';
  reasons: string[]; // Why recommended
  cost: number;
  timeToComplete: string;
  giBillEligible: boolean;
  providerOptions: CredentialProvider[];
}
```

### CareerForecast

```typescript
{
  veteranId: string;
  timeframe: '1-year' | '3-year' | '5-year' | '10-year';
  projections: CareerProjection[];
  marketTrends: MarketTrend[];
  recommendations: ForecastRecommendation[];
}
```

### DigitalTwin

```typescript
{
  veteranId: string;
  currentState: CareerState;
  simulations: CareerSimulation[];
  predictions: CareerPrediction[];
  recommendations: TwinRecommendation[];
  lastUpdated: string;
}
```

## Validation

All models are validated using Zod schemas. Example:

```typescript
import { VeteranProfileSchema } from './data/models';

const veteran = VeteranProfileSchema.parse(rawData);
// Throws error if validation fails
```

## Type Exports

Import TypeScript types:

```typescript
import type {
  VeteranProfile,
  JobPosting,
  MatchResult,
  CareerPath
} from './data/models';
```

## Enums

### Branch

```typescript
type Branch = 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force';
```

### ClearanceLevel

```typescript
type ClearanceLevel = 'None' | 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
```

### SkillLevel

```typescript
type SkillLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';
```

### CredentialType

```typescript
type CredentialType = 'certification' | 'license' | 'degree' | 'apprenticeship';
```

### CredentialStatus

```typescript
type CredentialStatus = 'planned' | 'in-progress' | 'completed' | 'expired';
```

### JobType

```typescript
type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary';
```

## Sample Data

See `/data/seed/` directory for sample veteran profiles, job postings, and test data.
