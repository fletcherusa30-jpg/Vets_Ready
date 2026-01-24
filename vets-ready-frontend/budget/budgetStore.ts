import { create } from "zustand"
import { BudgetInput, BudgetBreakdown, Expense, IncomeStream, SavingsGoal } from "./types"
import { calculateBudget } from "./utils/budgetMath"

export type BudgetState = {
  incomes: IncomeStream[]
  expenses: Expense[]
  goals: SavingsGoal[]
  result: BudgetBreakdown | null
  setIncomes: (items: IncomeStream[]) => void
  setExpenses: (items: Expense[]) => void
  setGoals: (items: SavingsGoal[]) => void
  recalc: () => void
}

const initial: BudgetInput = { incomes: [], expenses: [], savingsGoals: [] }

export const useBudgetStore = create<BudgetState>((set, get) => ({
  incomes: initial.incomes,
  expenses: initial.expenses,
  goals: initial.savingsGoals,
  result: null,
  setIncomes: (items) => set({ incomes: items }),
  setExpenses: (items) => set({ expenses: items }),
  setGoals: (items) => set({ goals: items }),
  recalc: () => {
    const { incomes, expenses, goals } = get()
    const result = calculateBudget({ incomes, expenses, savingsGoals: goals })
    set({ result })
  },
}))
