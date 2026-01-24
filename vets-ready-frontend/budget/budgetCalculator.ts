import { calculateBudgetPlan } from "./services/budgetService"
import { BudgetBreakdown, BudgetInput } from "./types"

export function runBudgetCalculator(input: BudgetInput): BudgetBreakdown {
  return calculateBudgetPlan(input)
}
