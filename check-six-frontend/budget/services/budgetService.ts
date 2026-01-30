import { z } from "zod"
import { calculateBudget } from "../utils/budgetMath"
import { BudgetBreakdown, BudgetInput } from "../types"

export const incomeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  monthly: z.number().nonnegative(),
})

export const expenseSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  category: z.enum(["fixed", "variable", "debt", "discretionary"]),
  monthly: z.number().nonnegative(),
})

export const savingsGoalSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  targetMonthly: z.number().nonnegative(),
})

export const budgetInputSchema = z.object({
  incomes: z.array(incomeSchema),
  expenses: z.array(expenseSchema),
  savingsGoals: z.array(savingsGoalSchema),
})

export function validateBudgetInput(payload: unknown): BudgetInput {
  const parsed = budgetInputSchema.safeParse(payload)
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
    throw new Error(`Invalid budget input: ${message}`)
  }
  return parsed.data
}

export function calculateBudgetPlan(payload: unknown): BudgetBreakdown {
  const input = validateBudgetInput(payload)
  return calculateBudget(input)
}
