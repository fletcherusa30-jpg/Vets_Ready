import { useMemo, useState } from "react"
import { runRetirementPlan } from "../services/retirementEngine"
import { runScenarios } from "../services/scenarioEngine"
import { RetirementPlanInput, RetirementPlanResult, ScenarioRequest, ScenarioResult } from "../types"

export function useRetirementPlanner(initialPlan: RetirementPlanInput) {
  const [plan, setPlan] = useState<RetirementPlanInput>(initialPlan)
  const [scenarioRequest, setScenarioRequest] = useState<ScenarioRequest | null>(null)

  const result: RetirementPlanResult = useMemo(() => runRetirementPlan(plan), [plan])
  const scenarios: ScenarioResult[] = useMemo(() => (scenarioRequest ? runScenarios(scenarioRequest) : []), [scenarioRequest])

  return { plan, setPlan, result, scenarios, setScenarioRequest }
}
