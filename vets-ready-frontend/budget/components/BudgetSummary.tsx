import { BudgetBreakdown } from "../types"

export function BudgetSummary({ breakdown }: { breakdown: BudgetBreakdown }) {
  return (
    <div className="budget-summary">
      <div className="metric">Total Income: ${breakdown.totalIncome.toFixed(2)}</div>
      <div className="metric">Total Expenses: ${breakdown.totalExpenses.toFixed(2)}</div>
      <div className="metric">Available Savings: ${breakdown.availableSavings.toFixed(2)}</div>
      <div className="metric">Savings Goals: ${breakdown.totalGoals.toFixed(2)}</div>
      <div className="metric">Shortfall: ${breakdown.shortfallAmount.toFixed(2)}</div>
      <div className={`status ${breakdown.meetsGoal ? "ok" : "warn"}`}>
        {breakdown.meetsGoal ? "On Track" : "Shortfall"}
      </div>
    </div>
  )
}
