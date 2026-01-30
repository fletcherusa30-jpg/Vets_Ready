import { useMemo, useState } from "react"
import { getVANavigationSteps } from "../services/vaNavigator"

export function useVABenefits() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = useMemo(() => getVANavigationSteps(), [])
  const current = steps[currentStep]

  return {
    steps,
    currentStep,
    current,
    goToStep: (step: number) => setCurrentStep(Math.max(0, Math.min(step, steps.length - 1))),
    nextStep: () => setCurrentStep((c) => Math.min(c + 1, steps.length - 1)),
    prevStep: () => setCurrentStep((c) => Math.max(c - 1, 0)),
    progress: { current: currentStep + 1, total: steps.length },
  }
}
