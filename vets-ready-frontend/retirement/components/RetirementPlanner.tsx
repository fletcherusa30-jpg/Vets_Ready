import { useMemo } from "react"
import { RetirementPlanInput, ScenarioRequest } from "../types"
import { useRetirementPlanner } from "../hooks/useRetirementPlanner"
import { RetirementGrowthChart, IncomeMixChart } from "../charts/RetirementCharts"

export function RetirementPlanner({ initialPlan }: { initialPlan: RetirementPlanInput }) {
  const { plan, setPlan, result, scenarios, setScenarioRequest } = useRetirementPlanner(initialPlan)

  const handleScenario = (request: ScenarioRequest) => setScenarioRequest(request)

  const readinessText = useMemo(() => {
    if (!result) return "";
    const score = result.summary.readinessScore
    if (score >= 80) return "On Track"
    if (score >= 60) return "Watch"
    return "At Risk"
  }, [result])

  return (
    <div className="retirement-planner">
      <header className="panel">
        <div>
          <div className="label">Monthly Income (Nominal)</div>
          <div className="value">${result.summary.monthlyIncomeNominal.toFixed(0)}</div>
        </div>
        <div>
          <div className="label">Readiness Score</div>
          <div className="value">{result.summary.readinessScore} ({readinessText})</div>
        </div>
        <div>
          <div className="label">Portfolio at Retirement</div>
          <div className="value">${result.summary.projectedPortfolioAtRetirement.toFixed(0)}</div>
        </div>
      </header>

      <section className="charts">
        <RetirementGrowthChart result={result} />
        <IncomeMixChart result={result} />
      </section>

      <section className="scenarios">
        <h3>Scenario Comparison</h3>
        <button
          onClick={() =>
            handleScenario({
              base: plan,
              scenarios: [
                { name: "Retire 2y Later", overrides: { retirementAge: plan.retirementAge + 2 } },
                { name: "+2% Savings", overrides: { accounts: plan.accounts.map((a) => ({ ...a, monthlyContribution: a.monthlyContribution * 1.02 })) } },
              ],
            })
          }
        >
          Run Quick Scenarios
        </button>
        <ul>
          {scenarios.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong>: Score {s.result.summary.readinessScore}, Portfolio ${s.result.summary.projectedPortfolioAtRetirement.toFixed(0)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
