import { useMemo, useState } from "react"
import { calculateBudgetPlan } from "../services/budgetService"
import { BudgetBreakdown, BudgetInput, Expense, IncomeStream, SavingsGoal } from "../types"

export function useBudgetCalculator(initial?: BudgetInput) {
  const [incomes, setIncomes] = useState<IncomeStream[]>(initial?.incomes ?? [])
  const [expenses, setExpenses] = useState<Expense[]>(initial?.expenses ?? [])
  const [goals, setGoals] = useState<SavingsGoal[]>(initial?.savingsGoals ?? [])

  const result: BudgetBreakdown = useMemo(() => {
    return calculateBudgetPlan({ incomes, expenses, savingsGoals: goals })
  }, [incomes, expenses, goals])

  return {
    incomes,
    expenses,
    goals,
    result,
    setIncomes,
    setExpenses,
    setGoals,
  }
}
