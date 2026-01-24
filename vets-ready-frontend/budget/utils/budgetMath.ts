import { BudgetInput, BudgetBreakdown, ExpenseCategory } from "../types"

export function calculateBudget(input: BudgetInput): BudgetBreakdown {
  const totalIncome = input.incomes.reduce((sum, i) => sum + Math.max(0, i.monthly), 0)
  const totalExpenses = input.expenses.reduce((sum, e) => sum + Math.max(0, e.monthly), 0)
  const totalGoals = input.savingsGoals.reduce((sum, g) => sum + Math.max(0, g.targetMonthly), 0)
  const availableSavings = Math.max(0, totalIncome - totalExpenses)
  const meetsGoal = availableSavings >= totalGoals
  const shortfallAmount = meetsGoal ? 0 : totalGoals - availableSavings

  const byCategory: Record<ExpenseCategory, number> = {
    fixed: 0,
    variable: 0,
    debt: 0,
    discretionary: 0,
  }
  input.expenses.forEach((e) => {
    byCategory[e.category] += Math.max(0, e.monthly)
  })

  return {
    totalIncome,
    totalExpenses,
    availableSavings,
    totalGoals,
    meetsGoal,
    shortfallAmount,
    byCategory,
  }
}
