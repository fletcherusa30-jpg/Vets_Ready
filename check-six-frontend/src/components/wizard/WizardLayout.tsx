import React, { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Veteran Basics', description: 'Service info, location, retirement & CRSC' },
  { id: 2, title: 'Disabilities & Ratings', description: 'Conditions and VA rating' },
  { id: 3, title: 'Uploads', description: 'DD214 and rating narrative' },
  { id: 4, title: 'Housing', description: 'Housing needs and benefits' },
  { id: 5, title: 'Appeals', description: 'Rating decision review' },
  { id: 6, title: 'Summary', description: 'Review and finalize' }
];

interface WizardLayoutProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  onStepChange,
  children
}) => {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const progress = (currentStep / wizardSteps.length) * 100;
  const currentStepInfo = wizardSteps.find(s => s.id === currentStep);

  const handleSaveAndExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/dashboard');
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      onStepChange(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="wizard-layout">
      {/* Sticky Header with Progress */}
      <div className="wizard-header">
        <div className="wizard-header-content">
          <div className="wizard-title-section">
            <h1 className="wizard-title">🧭 Rally Forge Wizard</h1>
            <p className="wizard-subtitle">
              Step {currentStep} of {wizardSteps.length}: {currentStepInfo?.title}
            </p>
          </div>
          <button onClick={handleSaveAndExit} className="save-exit-btn">
            💾 Save & Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators">
          {wizardSteps.map((step) => (
            <div
              key={step.id}
              className={`step-indicator ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              title={step.title}
            >
              <div className="step-number">
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <span className="step-label">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="wizard-content">
        <div className="wizard-step-content">
          {children}
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-nav">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="wizard-btn wizard-btn-secondary"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="wizard-btn wizard-btn-primary"
          >
            {currentStep === wizardSteps.length ? 'Finish' : 'Next'} →
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Save & Exit Wizard?</h3>
            <p>Your progress has been saved. You can resume anytime from the Dashboard.</p>
            <div className="modal-actions">
              <button onClick={() => setShowExitConfirm(false)} className="modal-btn-secondary">
                Cancel
              </button>
              <button onClick={confirmExit} className="modal-btn-primary">
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wizard-layout {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .wizard-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow);
        }

        .wizard-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wizard-title-section {
          flex: 1;
        }

        .wizard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .wizard-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .save-exit-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-exit-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--accent-primary);
        }

        .progress-container {
          height: 4px;
          background: var(--bg-secondary);
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: var(--accent-gradient);
          transition: width 0.5s ease-out;
        }

        .step-indicators {
          display: flex;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          overflow-x: auto;
        }

        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 80px;
          opacity: 0.5;
          transition: all 0.2s;
        }

        .step-indicator.active,
        .step-indicator.completed {
          opacity: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .step-indicator.active .step-number {
          background: var(--accent-gradient);
          border-color: var(--accent-primary);
          color: white;
          transform: scale(1.1);
        }

        .step-indicator.completed .step-number {
          background: #48bb78;
          border-color: #48bb78;
          color: white;
        }

        .step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
        }

        .step-indicator.active .step-label {
          color: var(--accent-primary);
        }

        .wizard-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .wizard-step-content {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow);
        }

        .wizard-nav {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .wizard-btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .wizard-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .wizard-btn-primary {
          background: var(--accent-gradient);
          color: white;
        }

        .wizard-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .wizard-btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .wizard-btn-secondary:hover:not(:disabled) {
          background: var(--bg-secondary);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .modal-content h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .modal-content p {
          margin: 0 0 1.5rem 0;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .modal-btn-primary,
        .modal-btn-secondary {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-btn-primary {
          background: var(--accent-primary);
          color: white;
          border: none;
        }

        .modal-btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .step-label {
            display: none;
          }

          .wizard-nav {
            flex-direction: column;
          }

          .wizard-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
