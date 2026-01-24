import { PensionInput } from "../types"

export function calculateMilitaryPension(input: PensionInput) {
  const retirementMultiplier = input.multiplier * input.yearsOfService
  const monthly = input.high3Average * retirementMultiplier
  const sbpCost = monthly * input.sbpCoverage * 0.065
  const survivorBenefit = monthly * input.sbpCoverage * 0.55
  return {
    monthlyPension: monthly - sbpCost,
    annualPension: (monthly - sbpCost) * 12,
    survivorBenefit,
    colaRate: input.colaRate,
  }
}

export function projectPension(pension: ReturnType<typeof calculateMilitaryPension>, years: number) {
  const table: { year: number; annual: number }[] = []
  let current = pension.annualPension
  for (let i = 0; i < years; i++) {
    table.push({ year: i + 1, annual: current })
    current *= 1 + pension.colaRate
  }
  return table
}
