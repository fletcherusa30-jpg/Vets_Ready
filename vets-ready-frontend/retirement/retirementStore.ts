import { create } from "zustand"
import { RetirementPlanInput, RetirementPlanResult, ScenarioRequest, ScenarioResult } from "./types"
import { runRetirementPlan } from "./services/retirementEngine"
import { runScenarios } from "./services/scenarioEngine"

export type RetirementState = {
  plan: RetirementPlanInput | null
  result: RetirementPlanResult | null
  scenarios: ScenarioResult[]
  setPlan: (plan: RetirementPlanInput) => void
  calculate: () => void
  runScenarioSet: (payload: ScenarioRequest) => void
}

export const useRetirementStore = create<RetirementState>((set, get) => ({
  plan: null,
  result: null,
  scenarios: [],
  setPlan: (plan) => set({ plan }),
  calculate: () => {
    const plan = get().plan
    if (!plan) return
    const result = runRetirementPlan(plan)
    set({ result })
  },
  runScenarioSet: (payload) => {
    const scenarios = runScenarios(payload)
    set({ scenarios })
  },
}))
