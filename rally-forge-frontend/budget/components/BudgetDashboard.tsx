import { useBudgetCalculator } from "../hooks/useBudgetCalculator"
import { BudgetForm } from "./BudgetForm"
import { BudgetSummary } from "./BudgetSummary"
import { IncomeStream, Expense, SavingsGoal } from "../types"

const sampleIncome: IncomeStream[] = [
  { id: "base", label: "Base Pay", monthly: 4200 },
  { id: "bah", label: "BAH", monthly: 1800 },
]

const sampleExpenses: Expense[] = [
  { id: "rent", label: "Housing", category: "fixed", monthly: 1700 },
  { id: "food", label: "Food", category: "variable", monthly: 600 },
  { id: "car", label: "Auto", category: "debt", monthly: 350 },
]

const sampleGoals: SavingsGoal[] = [
  { id: "emergency", label: "Emergency Fund", targetMonthly: 300 },
  { id: "tsp", label: "TSP", targetMonthly: 500 },
]

export function BudgetDashboard() {
  const { incomes, expenses, goals, result, setIncomes, setExpenses, setGoals } = useBudgetCalculator({
    incomes: sampleIncome,
    expenses: sampleExpenses,
    savingsGoals: sampleGoals,
  })

  return (
    <div className="budget-dashboard">
      <BudgetForm
        incomes={incomes}
        expenses={expenses}
        goals={goals}
        onIncomeChange={setIncomes}
        onExpenseChange={setExpenses}
        onGoalChange={setGoals}
      />
      <BudgetSummary breakdown={result} />
    </div>
  )
}
