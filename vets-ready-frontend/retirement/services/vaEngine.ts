import { VaDisabilityInput } from "../types"

const VA_BASE = {
  0: 0,
  10: 171,
  20: 338,
  30: 524,
  40: 755,
  50: 1075,
  60: 1361,
  70: 1716,
  80: 1995,
  90: 2241,
  100: 3737,
}

export function estimateVaIncome(input: VaDisabilityInput) {
  const base = VA_BASE[Math.min(Math.round(input.rating / 10) * 10, 100) as keyof typeof VA_BASE] ?? 0
  const dependentBump = input.dependents * 90
  const monthly = base + dependentBump
  return {
    monthly,
    annual: monthly * 12,
    colaRate: input.colaRate,
  }
}

export function projectVaIncome(va: ReturnType<typeof estimateVaIncome>, years: number) {
  const table: { year: number; annual: number }[] = []
  let current = va.annual
  for (let i = 0; i < years; i++) {
    table.push({ year: i + 1, annual: current })
    current *= 1 + va.colaRate
  }
  return table
}
