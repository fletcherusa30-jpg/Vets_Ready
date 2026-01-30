/**
 * DIGITAL TWIN TYPE DEFINITIONS
 *
 * Core type definitions for the Digital Twin system.
 */

export interface DigitalTwin {
  // Service Identity
  branch?: 'Army' | 'Navy' | 'Air Force' | 'Marine Corps' | 'Coast Guard' | 'Space Force';
  rank?: string;
  serviceEra?: string[];
  mos?: string;
  units?: string[];
  deployments?: string[];
  serviceStartDate?: string;
  serviceEndDate?: string;

  // Disability Identity
  disabilities?: Disability[];
  combinedRating?: number;

  // Personal Identity
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  children?: number;
  dependents?: number;
  spouseName?: string;

  // Location Identity
  state?: string;
  zip?: string;
  county?: string;

  // Life Situation
  lifeSituation?: LifeSituation;

  // Employment & Education
  employment?: Employment;
  education?: Education;

  // Documents
  dd214Uploaded?: boolean;
  ratingLetterUploaded?: boolean;
  medicalRecordsCount?: number;
  statementsCount?: number;
  documents?: any[];

  // Life Events
  lifeEvents?: any[];

  // Subscription & Billing
  subscriptionTier?: 'free' | 'premium';
  billingStatus?: BillingStatus;
  billingCycle?: 'monthly' | 'annual';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface Disability {
  id: string;
  conditionName: string;
  diagnosticCode: string;
  percentage: number;
  effectiveDate?: string;
  source?: 'dd214' | 'narrative' | 'manual';
  bodyPart?: string;
  side?: 'left' | 'right' | 'bilateral' | 'n/a';
}

export interface LifeSituation {
  currentMode?: 'transitioning' | 'filing-claim' | 'appealing' | 'buying-home' |
                'going-to-school' | 'changing-careers' | 'starting-business' |
                'retired' | 'disabled-stable' | 'family-focused' | 'not-set';
  goals?: string[];
  changedAt?: string;
}

export interface Employment {
  status?: 'employed' | 'unemployed' | 'self-employed' | 'retired' | 'student' | 'disabled' | 'not-set';
  industry?: string;
}

export interface Education {
  status?: 'not-enrolled' | 'enrolled' | 'planning';
  level?: string;
}

export interface BillingStatus {
  isActive: boolean;
  renewalDate?: string;
  paymentMethod?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  failedPaymentAttempts?: number;
  canceledAt?: string;
  refundedAt?: string;
}
