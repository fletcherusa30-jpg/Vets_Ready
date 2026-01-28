/**
 * Finances Domain Service
 * Financial planning, budgeting, scenario modeling
 */

export interface BudgetTemplate {
  id: string;
  name: string;
  categories: BudgetCategory[];
  description: string;
}

export interface BudgetCategory {
  name: string;
  type: 'income' | 'expense';
  subcategories: string[];
  percentageOfIncome?: number;
}

export interface FinancialSnapshot {
  veteranId: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
}

export interface FinancialScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    ratingChange?: number;
    jobChangeIncome?: number;
    relocationState?: string;
  };
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  cashFlowChange: number;
}

export interface DebtStrategy {
  strategy: 'avalanche' | 'snowball' | 'custom';
  debts: DebtPayoff[];
  estimatedPayoffMonths: number;
  totalInterestPaid: number;
}

export interface DebtPayoff {
  debtId: string;
  currentBalance: number;
  monthlyPayment: number;
  estimatedPayoffMonths: number;
  interestSaved: number;
}

export interface IFinancesService {
  // Income & Expense Tracking
  getFinancialSnapshot(veteranId: string): Promise<FinancialSnapshot>;
  updateIncome(veteranId: string, sources: any[]): Promise<void>;
  updateExpenses(veteranId: string, expenses: any[]): Promise<void>;

  // Budgeting
  getBudgetTemplates(): Promise<BudgetTemplate[]>;
  createBudget(veteranId: string, template: BudgetTemplate): Promise<Budget>;
  updateBudget(budgetId: string, updates: any): Promise<Budget>;
  getBudget(veteranId: string): Promise<Budget | null>;
  compareBudgetToActual(budgetId: string): Promise<BudgetVariance>;

  // Scenario Modeling
  createScenario(veteranId: string, scenario: FinancialScenario): Promise<FinancialScenario>;
  simulateRatingChange(veteranId: string, newRating: number): Promise<FinancialImpact>;
  simulateJobChange(veteranId: string, newIncome: number): Promise<FinancialImpact>;
  simulateRelocation(veteranId: string, state: string): Promise<FinancialImpact>;

  // Debt Management
  analyzDebt(veteranId: string): Promise<DebtAnalysis>;
  createDebtPayoffPlan(veteranId: string, strategy: 'avalanche' | 'snowball'): Promise<DebtStrategy>;
  getDebtFreeProjection(veteranId: string): Promise<Date>;

  // Goal Planning
  getFinancialGoals(veteranId: string): Promise<FinancialGoal[]>;
  createFinancialGoal(veteranId: string, goal: FinancialGoal): Promise<FinancialGoal>;
}

export interface Budget {
  id: string;
  veteranId: string;
  template: BudgetTemplate;
  allocations: BudgetAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
}

export interface BudgetVariance {
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  variancePercentage: number;
  byCategory: BudgetAllocation[];
  insights: string[];
}

export interface DebtAnalysis {
  totalDebt: number;
  debts: any[];
  debtToIncomeRatio: number;
  averageInterestRate: number;
  totalInterestPaid: number;
  payoffStrategies: DebtStrategy[];
}

export interface FinancialImpact {
  currentSituation: FinancialSnapshot;
  projectedSituation: FinancialSnapshot;
  monthlyChange: number;
  annualChange: number;
  impactOnGoals: string[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  monthlyContribution: number;
  onTrack: boolean;
}
