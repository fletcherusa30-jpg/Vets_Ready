import { useVABenefits } from "../hooks/useVABenefits"

export function VABenefitsNavigator() {
  const { steps, currentStep, current, nextStep, prevStep, progress } = useVABenefits()

  if (!current) return <div>Loading VA Benefits Navigator...</div>

  return (
    <div className="va-navigator">
      <h2>VA Benefits Navigator</h2>
      <div className="progress">
        Step {progress.current} of {progress.total}
      </div>

      <div className="wizard-step">
        <h3>{current.title}</h3>
        <p>{current.description}</p>

        <div className="benefits-list">
          {current.benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-card">
              <h4>{benefit.name}</h4>
              <p>{benefit.description}</p>
              <p>
                <strong>Eligibility:</strong> {benefit.eligibility}
              </p>
              <p>
                <strong>Processing Time:</strong> {benefit.processingTime}
              </p>
              <a href={benefit.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn">
                Apply Now
              </a>
            </div>
          ))}
        </div>

        <div className="actions">
          {current.actions.map((action, idx) => (
            <div key={idx} className="action-item">
              <input type="checkbox" id={`action-${idx}`} />
              <label htmlFor={`action-${idx}`}>{action}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="navigation">
        <button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </div>
    </div>
  )
}
