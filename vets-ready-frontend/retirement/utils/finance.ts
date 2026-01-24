import { InflationInput, WithdrawalStrategyInput, YearlyBalance } from "../types"
import { adjustForInflation, compoundMonthly, weightedReturn, guardrailWithdrawal } from "../../shared/utils/math"

export function projectAccountGrowth(balance: number, monthlyContribution: number, expectedReturn: number, years: number): YearlyBalance[] {
  const base = compoundMonthly(balance, monthlyContribution, expectedReturn, years)
  return base.map((row, idx) => ({
    year: row.year,
    age: 0,
    nominalBalance: row.nominal,
    realBalance: row.nominal,
    contributions: row.contributions,
    growth: row.growth,
  }))
}

export function applyInflation(balances: YearlyBalance[], inflation: InflationInput, currentAge: number): YearlyBalance[] {
  return balances.map((b) => ({
    ...b,
    age: currentAge + b.year,
    realBalance: adjustForInflation(b.nominalBalance, inflation.general, b.year),
  }))
}

export function safeWithdrawalAmount(balance: number, strategy: WithdrawalStrategyInput): number {
  if (strategy.strategy === "three-percent") return balance * 0.03
  if (strategy.strategy === "four-percent") return balance * 0.04
  if (strategy.strategy === "five-percent") return balance * 0.05
  return guardrailWithdrawal(balance, 0.04, strategy.guardrailDrop, strategy.guardrailRaise)
}

export function weightedFundReturn(allocations: { percentage: number; expected: number }[]): number {
  return weightedReturn(allocations.map((a) => ({ weight: a.percentage, expectedReturn: a.expected })))
}
