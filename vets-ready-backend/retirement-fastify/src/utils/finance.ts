import { InflationInput, WithdrawalStrategyInput, YearlyBalance } from "../types"

export function compoundMonthly(balance: number, monthlyContribution: number, annualReturn: number, years: number): YearlyBalance[] {
  const yearly: YearlyBalance[] = []
  let current = balance
  for (let year = 1; year <= years; year++) {
    let contributions = 0
    let growth = 0
    for (let month = 0; month < 12; month++) {
      current += monthlyContribution
      contributions += monthlyContribution
      const monthlyReturn = annualReturn / 12
      const gains = current * monthlyReturn
      current += gains
      growth += gains
    }
    yearly.push({
      year,
      age: 0,
      nominalBalance: current,
      realBalance: current,
      contributions,
      growth,
    })
  }
  return yearly
}

export function adjustForInflation(value: number, inflationRate: number, years: number): number {
  return value / Math.pow(1 + inflationRate, years)
}

export function applyInflationToBalances(balances: YearlyBalance[], inflation: InflationInput, currentAge: number): YearlyBalance[] {
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
  const floor = balance * (0.03 - strategy.guardrailDrop)
  const ceiling = balance * (0.05 + strategy.guardrailRaise)
  return Math.max(floor, Math.min(balance * 0.04, ceiling))
}

export function weightedReturn(allocations: { percentage: number; expected: number }[]): number {
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0)
  if (total <= 0) return 0
  return allocations.reduce((sum, a) => sum + a.expected * (a.percentage / total), 0)
}
