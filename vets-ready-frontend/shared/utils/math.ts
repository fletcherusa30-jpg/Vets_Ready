import { DEFAULT_INFLATION } from "../constants/finance"

export function compoundMonthly(balance: number, monthlyContribution: number, annualReturn: number, years: number) {
  const rows: { year: number; nominal: number; contributions: number; growth: number }[] = []
  let current = balance
  for (let y = 1; y <= years; y++) {
    let contrib = 0
    let growth = 0
    for (let m = 0; m < 12; m++) {
      current += monthlyContribution
      contrib += monthlyContribution
      const monthlyRate = annualReturn / 12
      const gains = current * monthlyRate
      current += gains
      growth += gains
    }
    rows.push({ year: y, nominal: current, contributions: contrib, growth })
  }
  return rows
}

export function compoundAnnual(balance: number, annualContribution: number, annualReturn: number, years: number) {
  const rows: { year: number; nominal: number; contributions: number; growth: number }[] = []
  let current = balance
  for (let y = 1; y <= years; y++) {
    current += annualContribution
    const gains = current * annualReturn
    current += gains
    rows.push({ year: y, nominal: current, contributions: annualContribution, growth: gains })
  }
  return rows
}

export function adjustForInflation(value: number, inflationRate: number = DEFAULT_INFLATION, years: number) {
  return value / Math.pow(1 + inflationRate, years)
}

export function realReturn(nominalReturn: number, inflationRate: number) {
  return (1 + nominalReturn) / (1 + inflationRate) - 1
}

export function weightedReturn(allocations: { weight: number; expectedReturn: number }[]) {
  const total = allocations.reduce((sum, a) => sum + a.weight, 0)
  if (total <= 0) return 0
  return allocations.reduce((sum, a) => sum + (a.expectedReturn * a.weight) / total, 0)
}

export function safeWithdrawal(balance: number, rate: number) {
  return balance * rate
}

export function guardrailWithdrawal(balance: number, baseRate: number, drop: number, raise: number) {
  const floor = balance * (baseRate - drop)
  const ceiling = balance * (baseRate + raise)
  return Math.max(floor, Math.min(balance * baseRate, ceiling))
}
