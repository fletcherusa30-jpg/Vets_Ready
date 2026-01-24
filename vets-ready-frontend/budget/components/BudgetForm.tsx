import { ChangeEvent } from "react"
import { Expense, IncomeStream, SavingsGoal } from "../types"

export type BudgetFormProps = {
  incomes: IncomeStream[]
  expenses: Expense[]
  goals: SavingsGoal[]
  onIncomeChange: (items: IncomeStream[]) => void
  onExpenseChange: (items: Expense[]) => void
  onGoalChange: (items: SavingsGoal[]) => void
}

function updateField<T extends { id: string }>(items: T[], id: string, field: keyof T, value: string | number) {
  return items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
}

export function BudgetForm(props: BudgetFormProps) {
  const handleIncome = (id: string, field: keyof IncomeStream, event: ChangeEvent<HTMLInputElement>) => {
    props.onIncomeChange(updateField(props.incomes, id, field, event.target.value))
  }

  const handleExpense = (id: string, field: keyof Expense, event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = field === "category" ? event.target.value : Number(event.target.value)
    props.onExpenseChange(updateField(props.expenses, id, field, value))
  }

  const handleGoal = (id: string, field: keyof SavingsGoal, event: ChangeEvent<HTMLInputElement>) => {
    props.onGoalChange(updateField(props.goals, id, field, event.target.value))
  }

  return (
    <div className="budget-form">
      <h3>Income</h3>
      {props.incomes.map((inc) => (
        <div key={inc.id} className="row">
          <input value={inc.label} onChange={(e) => handleIncome(inc.id, "label", e)} placeholder="Label" />
          <input type="number" value={inc.monthly} onChange={(e) => handleIncome(inc.id, "monthly", e)} placeholder="Monthly" />
        </div>
      ))}

      <h3>Expenses</h3>
      {props.expenses.map((exp) => (
        <div key={exp.id} className="row">
          <input value={exp.label} onChange={(e) => handleExpense(exp.id, "label", e)} placeholder="Label" />
          <select value={exp.category} onChange={(e) => handleExpense(exp.id, "category", e)}>
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
            <option value="debt">Debt</option>
            <option value="discretionary">Discretionary</option>
          </select>
          <input type="number" value={exp.monthly} onChange={(e) => handleExpense(exp.id, "monthly", e)} placeholder="Monthly" />
        </div>
      ))}

      <h3>Savings Goals</h3>
      {props.goals.map((goal) => (
        <div key={goal.id} className="row">
          <input value={goal.label} onChange={(e) => handleGoal(goal.id, "label", e)} placeholder="Goal" />
          <input
            type="number"
            value={goal.targetMonthly}
            onChange={(e) => handleGoal(goal.id, "targetMonthly", e)}
            placeholder="Monthly Target"
          />
        </div>
      ))}
    </div>
  )
}
