/**
 * TypeScript Models for VetsReady Platform
 * Matches backend SQLAlchemy ORM models
 * Phase 3 - Frontend Development
 */

// ============================================================================
// ENUMS (Match backend enums)
// ============================================================================

export enum ServiceBranch {
  ARMY = 'ARMY',
  NAVY = 'NAVY',
  AIR_FORCE = 'AIR_FORCE',
  MARINES = 'MARINES',
  COAST_GUARD = 'COAST_GUARD',
  SPACE_FORCE = 'SPACE_FORCE'
}

export enum DischargeStatus {
  HONORABLE = 'HONORABLE',
  GENERAL = 'GENERAL',
  OTHER_THAN_HONORABLE = 'OTHER_THAN_HONORABLE',
  BAD_CONDUCT = 'BAD_CONDUCT',
  DISHONORABLE = 'DISHONORABLE',
  ENTRY_LEVEL = 'ENTRY_LEVEL'
}

export enum JobMatchStatus {
  POTENTIAL = 'POTENTIAL',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

// ============================================================================
// CORE MODELS
// ============================================================================

export interface Veteran {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  service_branch: ServiceBranch;
  separation_rank: string;
  years_service: number;
  separation_date: string; // ISO date string
  discharge_status: DischargeStatus;
  disability_rating: number;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  veteran_id: string;
  start_date?: string;
  end_date?: string;
  duty_station?: string;
  unit?: string;
  rank?: string;
  primary_mos?: string;
  decorations?: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  veteran_id: string;
  course_name: string;
  completion_date?: string;
  institution?: string;
  hours?: number;
  certification_earned?: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  veteran_id: string;
  certificate_type: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  verified: boolean;
  file_path?: string;
  created_at: string;
}

// ============================================================================
// RESUME MODELS
// ============================================================================

export interface ExperienceItem {
  title: string;
  organization: string;
  start_date?: string;
  end_date?: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduation_date?: string;
  field_of_study?: string;
}

export interface Resume {
  id: string;
  veteran_id: string;
  version: string;
  title: string;
  summary: string;
  skills: string[];
  experience_items: ExperienceItem[];
  education_items: EducationItem[];
  certifications: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// JOB RECRUITING MODELS
// ============================================================================

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string;
  required_skills: string[];
  preferred_skills: string[];
  salary_min?: number;
  salary_max?: number;
  remote: boolean;
  clearance_required?: string;
  status: string;
  posted_date?: string;
  employer_id?: string;
  created_at: string;
}

export interface JobMatch {
  id: string;
  veteran_id: string;
  job_id: string;
  match_score: number;
  status: JobMatchStatus;
  applied_date?: string;
  interview_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  job_listing?: JobListing;
}

export interface Employer {
  id: string;
  company_name: string;
  industry?: string;
  veteran_friendly: boolean;
  hiring_count: number;
  website?: string;
  contact_email?: string;
  created_at: string;
}

// ============================================================================
// FINANCIAL MODELS
// ============================================================================

export interface Budget {
  id: string;
  veteran_id: string;
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
  status: BudgetStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeEntry {
  id: string;
  budget_id: string;
  source: string;
  amount: number;
  frequency: string;
  description?: string;
  created_at: string;
}

export interface ExpenseEntry {
  id: string;
  budget_id: string;
  category: string;
  amount: number;
  frequency: string;
  description?: string;
  created_at: string;
}

export interface RetirementPlan {
  id: string;
  veteran_id: string;
  target_retirement_age: number;
  monthly_contribution: number;
  employer_match?: number;
  current_balance: number;
  target_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface RetirementProjectionRequest {
  current_age: number;
  retirement_age: number;
  current_savings: number;
  monthly_contribution: number;
  expected_growth_rate: number;
  inflation_rate: number;
  include_va_income: boolean;
  retirement_income_goal?: number;
}

export interface RetirementChartPoint {
  age: number;
  balance: number;
  inflation_adjusted_balance: number;
}

export interface RetirementChartBar {
  label: string;
  value: number;
}

export interface RetirementChartData {
  savings_growth: RetirementChartPoint[];
  income_comparison: RetirementChartBar[];
  contribution_breakdown: RetirementChartBar[];
}

export interface VAIncomeSource {
  id: string;
  name: string;
  monthly_amount: number;
  source_type: string;
}

export interface RetirementProjectionResponse {
  projected_savings: number;
  projected_savings_real: number;
  monthly_retirement_income: number;
  retirement_readiness_score: number;
  readiness_band: string;
  readiness_factors: Record<string, number>;
  goal_progress: number;
  years_to_retirement: number;
  years_covered: number;
  shortfall_amount: number;
  include_va_income: boolean;
  va_income_monthly: number;
  va_income_sources: VAIncomeSource[];
  status_message: string;
  action_required?: string;
  chart_data: RetirementChartData;
  insights: string[];
  inputs_used: Record<string, number>;
  budget_context: {
    monthly_net_cashflow: number;
    savings_rate?: number;
  };
  profile_context: {
    veteran_id: string;
    name: string;
    service_branch: string;
    disability_rating: number;
    calculated_age: number;
  };
  goal_context: {
    monthly_goal: number;
    goal_source: string;
  };
}

// ============================================================================
// PROFILE + PERSONALIZATION MODELS
// ============================================================================

export interface BackgroundOption {
  label: string;
  path: string;
  preview_url: string;
  category: 'branch' | 'custom';
  branch?: string;
  is_custom: boolean;
}

export interface BackgroundInventoryResponse {
  veteran_id: string;
  service_branch: string;
  current_background?: string | null;
  current_background_url?: string | null;
  branch_backgrounds: BackgroundOption[];
  custom_backgrounds: BackgroundOption[];
}

export interface BackgroundSelectionResponse {
  veteran_id: string;
  selected_path: string;
  preview_url: string;
}

export interface BackgroundUploadResponse {
  veteran_id: string;
  uploaded_background: BackgroundOption;
}

export interface BackgroundSelectionRequest {
  veteran_id: string;
  selected_path: string;
}

export interface InvestmentAccountInputModel {
  name: string;
  balance: number;
  monthly_contribution: number;
  annual_growth_rate: number;
}

export interface InvestmentAccountProjectionModel extends InvestmentAccountInputModel {
  projected_balance: number;
  inflation_adjusted_balance: number;
  contribution_component: number;
  current_component: number;
  share_of_total: number;
}

export interface IncomeStreamModel {
  name: string;
  monthly_amount: number;
}

export interface RetirementBudgetSummary {
  projected_savings: number;
  projected_savings_real: number;
  monthly_income: number;
  monthly_goal: number;
  shortfall: number;
  readiness_score: number;
  readiness_band: string;
  goal_progress: number;
}

export interface RetirementBudgetChart {
  savings_curve: RetirementChartPoint[];
  income_mix: RetirementChartBar[];
}

export interface RetirementBudgetRequest {
  current_age: number;
  retirement_age: number;
  inflation_rate: number;
  retirement_income_goal: number;
  accounts: InvestmentAccountInputModel[];
  va_disability_income: number;
  military_retirement_income: number;
  social_security_income: number;
  monthly_budget_surplus?: number;
  savings_rate?: number;
}

export interface RetirementBudgetResponse {
  veteran_id: string;
  years_to_retirement: number;
  summary: RetirementBudgetSummary;
  accounts: InvestmentAccountProjectionModel[];
  income_streams: IncomeStreamModel[];
  budget_link: BudgetContext;
  chart_data: RetirementBudgetChart;
  insights: string[];
  goals: string[];
}

export type TheoryTypeUnion = 'Direct' | 'Secondary' | 'Presumptive' | 'Aggravation' | 'Chronicity';

export interface EvidenceItemModel {
  source: string;
  reference: string;
  summary: string;
}

export interface TheoryOfEntitlementModel {
  theory_type: TheoryTypeUnion;
  rationale: string;
  evidence_required: string[];
  cfr_reference: string;
  confidence: number;
}

export interface ConditionSuggestionModel {
  name: string;
  basis: string;
  confidence: number;
  recommended_theories: TheoryTypeUnion[];
}

export interface ServiceOverviewModel {
  branch: string;
  years_of_service: number;
  mos_codes: string[];
  deployments: string[];
  exposures: string[];
  last_unit?: string;
  last_rank?: string;
}

export interface DisabilityWizardResponse {
  veteran_id: string;
  service_overview: ServiceOverviewModel;
  suggested_conditions: ConditionSuggestionModel[];
  evidence_review: Record<string, EvidenceItemModel[]>;
  theories_of_entitlement: Record<string, TheoryOfEntitlementModel[]>;
  strategy_summary: string[];
}

export interface DisabilityWizardRequest {
  veteran_id: string;
  conditions: string[];
  exposures?: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  count: number;
  data: T[];
  skip?: number;
  limit?: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    pool_size?: number;
  };
}

export interface PlatformStats {
  total_veterans: number;
  total_resumes: number;
  total_jobs: number;
  active_jobs: number;
  timestamp: string;
}

// ============================================================================
// REQUEST TYPES (for forms/API calls)
// ============================================================================

export interface VeteranCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  service_branch: ServiceBranch | string;
  separation_rank: string;
  years_service: number;
  separation_date: string;
  discharge_status: DischargeStatus | string;
  disability_rating: number;
}

export interface VeteranUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  disability_rating?: number;
  profile_complete?: boolean;
}

export interface ResumeGenerateRequest {
  veteran_id: string;
  title: string;
  summary?: string;
  skills?: string[];
}

export interface JobApplicationRequest {
  veteran_id: string;
  job_id: string;
  match_score: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    service_branch: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type VeteranSummary = Pick<Veteran, 'id' | 'first_name' | 'last_name' | 'email' | 'service_branch'>;

export type ResumeSummary = Pick<Resume, 'id' | 'version' | 'title' | 'created_at'>;

export type JobListingSummary = Pick<JobListing, 'id' | 'title' | 'company' | 'location' | 'remote'>;

export type BudgetSummary = Pick<Budget, 'id' | 'month' | 'year' | 'status'> & {
  net: number;
};
