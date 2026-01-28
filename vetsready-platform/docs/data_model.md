# VetsReady Platform - Data Model Reference

## Core Data Models

All data models are defined in `data/models/index.ts` and use TypeScript interfaces for type safety.

---

## Enum Types

### Branch
```typescript
enum Branch {
  ARMY = 'army',
  NAVY = 'navy',
  MARINES = 'marines',
  AIR_FORCE = 'air_force',
  COAST_GUARD = 'coast_guard',
  SPACE_FORCE = 'space_force',
  NATIONAL_GUARD = 'national_guard'
}
```

### DischargeType
```typescript
enum DischargeType {
  HONORABLE = 'honorable',
  GENERAL = 'general',
  OTHER_THAN_HONORABLE = 'other_than_honorable',
  BAD_CONDUCT = 'bad_conduct',
  DISHONORABLE = 'dishonorable'
}
```

### GoalType
```typescript
enum GoalType {
  BENEFITS = 'benefits',
  EMPLOYMENT = 'employment',
  EDUCATION = 'education',
  BUSINESS = 'business',
  FINANCIAL = 'financial',
  WELLNESS = 'wellness',
  HOUSING = 'housing',
  OTHER = 'other'
}
```

### GoalStatus
```typescript
enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}
```

---

## Primary Entities

### VeteranProfile
**Purpose**: Central record for a veteran user

```typescript
interface VeteranProfile {
  id: string;
  firstName: string;
  lastName: string;
  dob: Date;
  email: string;
  contactInfo: ContactInfo;
  location: Location;
  branchHistory: ServiceHistory[];
  dischargeType: DischargeType;
  dischargeDate: Date;
  goals: Goal[];
  disabilityProfileId?: string;
  benefitsProfileId?: string;
  employmentProfileId?: string;
  educationProfileId?: string;
  wellnessProfileId?: string;
  financialProfileId?: string;
  familyProfileId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}
```

**Fields**:
- `id`: Unique identifier (UUID)
- `firstName`, `lastName`: Veteran's name
- `dob`: Date of birth
- `email`: Primary email
- `contactInfo`: Phone, address, etc.
- `location`: Current city, state, country
- `branchHistory`: Array of military service records
- `dischargeType`: Type of discharge (honorable, general, etc.)
- `goals`: Array of veteran's goals
- `*ProfileId`: References to related profiles
- `createdAt`, `updatedAt`: Timestamps
- `isActive`: Account status

---

### ServiceHistory
**Purpose**: Record of military service

```typescript
interface ServiceHistory {
  id: string;
  branch: Branch;
  mosOrAfscOrRating: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  rankAtSeparation: string;
  deployments: Deployment[];
}
```

---

### Goal
**Purpose**: Veteran's objectives across domains

```typescript
interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  status: GoalStatus;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}
```

---

## Sub-Profiles

### DisabilityProfile (Educational)
**Purpose**: Organize disability information (educational only, no medical advice)

```typescript
interface DisabilityProfile {
  id: string;
  veteranId: string;
  conditions: DisabilityCondition[];
  symptoms: string[];
  ratings: DisabilityRating[];
  functionalImpact: string[];
  claimHistory: ClaimHistory[];
  totalRating?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Note**: This profile provides educational information about disabilities and ratings. It does NOT provide medical advice or diagnosis.

---

### BenefitsProfile
**Purpose**: Track VA and state benefits

```typescript
interface BenefitsProfile {
  id: string;
  veteranId: string;
  vaBenefits: Benefit[];
  stateBenefits: Benefit[];
  otherBenefits: Benefit[];
  eligibilityFlags: string[];
  utilizationStatus: {
    benefitId: string;
    utilization: number;
    lastUpdated: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### EmploymentProfile
**Purpose**: Career history, skills, and job search status

```typescript
interface EmploymentProfile {
  id: string;
  veteranId: string;
  skills: Skill[];
  credentials: Credential[];
  jobHistory: JobHistory[];
  targetRoles: string[];
  jobSearchStatus: 'not_searching' | 'passive' | 'active';
  industryPreferences: string[];
  locationPreferences: Location[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### EducationProfile
**Purpose**: Education history, training, and GI Bill usage

```typescript
interface EducationProfile {
  id: string;
  veteranId: string;
  highestEducation: EducationLevel;
  educationHistory: EducationLevel[];
  trainingHistory: TrainingProgram[];
  targetPrograms: string[];
  giBillUsage: GIBillUsage[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### WellnessProfile
**Purpose**: Track wellness routines and self-reported health

```typescript
interface WellnessProfile {
  id: string;
  veteranId: string;
  selfReportedStatus: 'excellent' | 'good' | 'fair' | 'poor';
  stressIndicators: string[];
  routines: WellnessRoutine[];
  nonClinicalResourcesUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### FinancialProfile
**Purpose**: Income, expenses, debts, and financial goals

```typescript
interface FinancialProfile {
  id: string;
  veteranId: string;
  incomeSources: IncomeSource[];
  expenses: Expense[];
  debts: Debt[];
  financialGoals: FinancialGoal[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### FamilyProfile
**Purpose**: Family structure and dependent information

```typescript
interface FamilyProfile {
  id: string;
  veteranId: string;
  dependents: Dependent[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  caregiverStatus: 'none' | 'primary_caregiver' | 'requires_care';
  familyNeeds: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Supporting Structures

### ContactInfo
```typescript
interface ContactInfo {
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
```

### Location
```typescript
interface Location {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}
```

### Benefit
```typescript
interface Benefit {
  id: string;
  type: string;
  name: string;
  status: 'eligible' | 'applied' | 'approved' | 'active' | 'inactive';
  amount?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
  notes?: string;
}
```

---

## Analytics Models

### AnalyticsEvent
```typescript
interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  domain: string;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}
```

### UserMetrics
```typescript
interface UserMetrics {
  userId: string;
  profileCompletion: number;
  goalsCreated: number;
  goalsCompleted: number;
  lastActive: Date;
  sessionCount: number;
  avgSessionDuration: number;
}
```

---

## Database Schema Considerations

### Indexes
```sql
CREATE INDEX idx_veteran_id ON profiles(veteran_id);
CREATE INDEX idx_veteran_email ON profiles(email);
CREATE INDEX idx_created_at ON profiles(created_at);
CREATE INDEX idx_discharge_type ON profiles(discharge_type);
CREATE INDEX idx_location ON profiles(state);
```

### Partitioning Strategy
- Partition user records by `created_at` (monthly)
- Archive analytics events older than 1 year

### Relationships
- One-to-Many: VeteranProfile → ServiceHistory
- One-to-One: VeteranProfile → DisabilityProfile
- One-to-One: VeteranProfile → BenefitsProfile
- One-to-One: VeteranProfile → EmploymentProfile
- One-to-One: VeteranProfile → EducationProfile
- One-to-One: VeteranProfile → WellnessProfile
- One-to-One: VeteranProfile → FinancialProfile
- One-to-One: VeteranProfile → FamilyProfile

---

## Type Safety

All models are defined with TypeScript interfaces for compile-time type checking and IDE support. Use strict mode (`strict: true` in tsconfig.json) to catch potential issues early.

---

## Future Considerations

- Add `tags` field for flexible categorization
- Add `metadata` field for extensibility
- Consider document database for flexible sub-profiles
- Implement soft deletes for audit trails
- Add encryption for sensitive PII fields
