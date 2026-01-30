export type IncomeStream = {
  id: string
  label: string
  monthly: number
}

export type ExpenseCategory = "fixed" | "variable" | "debt" | "discretionary"

export type Expense = {
  id: string
  label: string
  category: ExpenseCategory
  monthly: number
}

export type SavingsGoal = {
  id: string
  label: string
  targetMonthly: number
}

export type BudgetInput = {
  incomes: IncomeStream[]
  expenses: Expense[]
  savingsGoals: SavingsGoal[]
}

export type BudgetBreakdown = {
  totalIncome: number
  totalExpenses: number
  availableSavings: number
  totalGoals: number
  meetsGoal: boolean
  shortfallAmount: number
  byCategory: Record<ExpenseCategory, number>
}
