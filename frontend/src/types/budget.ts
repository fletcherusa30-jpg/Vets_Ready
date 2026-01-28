/**
 * Budget System TypeScript Types
 * Mirror of backend models and schemas
 */

export enum IncomeSourceType {
  PRIMARY_EMPLOYMENT = "Primary Employment",
  SECONDARY_EMPLOYMENT = "Secondary Employment",
  VA_DISABILITY = "VA Disability Compensation",
  MILITARY_RETIREMENT = "Military Retirement",
  GI_BILL_HOUSING = "GI Bill Housing Allowance",
  INVESTMENTS = "Investments/Interest",
  FREELANCE = "Freelance/Side Gigs",
  OTHER = "Other",
}

export enum ExpenseCategory {
  HOUSING = "Housing",
  UTILITIES = "Utilities",
  TRANSPORTATION = "Transportation",
  INSURANCE = "Insurance",
  HEALTHCARE = "Healthcare",
  GROCERIES = "Groceries",
  DINING = "Dining & Entertainment",
  SUBSCRIPTIONS = "Subscriptions",
  DEBT_PAYMENT = "Debt Payments",
  CHILDCARE = "Childcare",
  PERSONAL_CARE = "Personal Care",
  EDUCATION = "Education",
  CHARITY = "Charity/Donations",
  OTHER = "Other",
}

export enum GoalType {
  EMERGENCY_FUND = "Emergency Fund",
  HOME_DOWN_PAYMENT = "Home Down Payment",
  VEHICLE = "Vehicle Purchase",
  EDUCATION = "Education",
  VACATION = "Vacation",
  RETIREMENT = "Retirement",
  DEBT_PAYOFF = "Debt Payoff",
  OTHER = "Other",
}

export enum GoalStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  ON_TRACK = "On Track",
  BEHIND = "Behind",
  COMPLETED = "Completed",
}

export enum BudgetStatus {
  ACTIVE = "Active",
  PAUSED = "Paused",
  ARCHIVED = "Archived",
}

// Income Source
export interface IncomeSource {
  id: number;
  budget_profile_id: number;
  source_type: IncomeSourceType;
  monthly_amount: number;
  annual_amount?: number;
  description?: string;
  is_irregular: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeSourceCreate {
  source_type: IncomeSourceType;
  monthly_amount?: number;
  annual_amount?: number;
  description?: string;
  is_irregular?: boolean;
}

export interface IncomeSourceUpdate {
  source_type?: IncomeSourceType;
  monthly_amount?: number;
  annual_amount?: number;
  description?: string;
  is_irregular?: boolean;
}

// Expense Item
export interface ExpenseItem {
  id: number;
  budget_profile_id: number;
  category: ExpenseCategory;
  description: string;
  monthly_amount: number;
  is_debt_payment: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseItemCreate {
  category: ExpenseCategory;
  description: string;
  monthly_amount: number;
  is_debt_payment?: boolean;
}

export interface ExpenseItemUpdate {
  category?: ExpenseCategory;
  description?: string;
  monthly_amount?: number;
  is_debt_payment?: boolean;
}

// Savings Goal
export interface SavingsGoal {
  id: number;
  budget_profile_id: number;
  goal_type: GoalType;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalCreate {
  goal_type: GoalType;
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  priority?: number;
}

export interface SavingsGoalUpdate {
  goal_type?: GoalType;
  name?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string;
  priority?: number;
}

// Subscription Item
export interface SubscriptionItem {
  id: number;
  budget_profile_id: number;
  name: string;
  monthly_cost: number;
  usage_level: string; // High, Medium, Low, None
  billing_cycle: string; // Monthly, Quarterly, Annual
  auto_renew: boolean;
  cancellation_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionItemCreate {
  name: string;
  monthly_cost: number;
  usage_level: string;
  billing_cycle: string;
  auto_renew?: boolean;
  cancellation_url?: string;
}

export interface SubscriptionItemUpdate {
  name?: string;
  monthly_cost?: number;
  usage_level?: string;
  billing_cycle?: string;
  auto_renew?: boolean;
  cancellation_url?: string;
}

// Budget Profile
export interface BudgetProfile {
  id: number;
  veteran_id: number;
  monthly_income_total: number;
  monthly_expense_total: number;
  monthly_net_cashflow: number;
  savings_rate: number;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
}

// Summary and Reporting
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface BudgetSummary {
  budget_id: number;
  monthly_income: number;
  monthly_expenses: number;
  net_cashflow: number;
  savings_rate: number;
  category_breakdown: CategoryBreakdown[];
  active_goals: number;
  total_goal_amount: number;
  current_goal_progress: number;
  active_subscriptions: number;
  total_subscription_cost: number;
  status: BudgetStatus;
}

export interface SpendingAlert {
  type: string;
  severity: string; // critical, warning, info
  message: string;
  amount?: number;
}

export interface Recommendation {
  priority: string; // high, medium, low
  category: string;
  title: string;
  description: string;
  potential_savings?: number;
  action: string;
}

export interface VeteranInsight {
  title: string;
  description: string;
  action: string;
}

export interface Insights {
  savings_rate: number;
  spending_trend: string; // Increasing, Stable, Decreasing
  emergency_fund_months: number;
  spending_alerts: SpendingAlert[];
  category_insights: { [key: string]: any };
  subscription_waste: number;
  recommendations: Recommendation[];
  veteran_specific_insights: VeteranInsight[];
}

// Scenario Simulation
export interface ScenarioRequest {
  income_change: number;
  expense_change: number;
  description?: string;
}

export interface GoalImpactProjection {
  goal_id: number;
  goal_name: string;
  months_to_completion: number;
  projected_completion: string;
}

export interface ScenarioResult {
  scenario_description: string;
  simulated_monthly_income: number;
  simulated_monthly_expenses: number;
  simulated_net_cashflow: number;
  simulated_savings_rate: number;
  vs_current: {
    income_change: number;
    expense_change: number;
    cashflow_change: number;
    savings_rate_change: number;
  };
  goal_impact: GoalImpactProjection[];
}
