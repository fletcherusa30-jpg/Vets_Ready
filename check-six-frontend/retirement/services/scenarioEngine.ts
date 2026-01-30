import { RetirementPlanInput, ScenarioRequest, ScenarioResult } from "../types"
import { runRetirementPlan } from "./retirementEngine"

function mergePlan(base: RetirementPlanInput, overrides: Partial<RetirementPlanInput>): RetirementPlanInput {
  return {
    ...base,
    ...overrides,
    accounts: overrides.accounts ?? base.accounts,
    pension: { ...base.pension, ...overrides.pension },
    vaDisability: { ...base.vaDisability, ...overrides.vaDisability },
    socialSecurity: { ...base.socialSecurity, ...overrides.socialSecurity },
    spending: { ...base.spending, ...overrides.spending },
    inflation: { ...base.inflation, ...overrides.inflation },
    withdrawal: { ...base.withdrawal, ...overrides.withdrawal },
  }
}

export function runScenarios(request: ScenarioRequest): ScenarioResult[] {
  const results: ScenarioResult[] = []
  const baseResult = runRetirementPlan(request.base)
  results.push({ name: "base", result: baseResult })

  request.scenarios.forEach((scenario) => {
    const merged = mergePlan(request.base, scenario.overrides)
    results.push({ name: scenario.name, result: runRetirementPlan(merged) })
  })

  return results
}
