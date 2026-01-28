import React, { useEffect, useMemo, useState } from 'react';
import Page from '../components/layout/Page';
import { disabilityAPI } from '../services/api';
import { useAppStore } from '../store/appStore';
import type {
  ConditionSuggestionModel,
  DisabilityWizardRequest,
  DisabilityWizardResponse,
  TheoryOfEntitlementModel,
} from '../types/models';
import './DisabilityWizard.css';

const steps = [
  'Service Overview',
  'Condition Selection',
  'Evidence Review',
  'Theory of Entitlement',
  'Strategy Summary',
];

const DisabilityWizard = () => {
  const user = useAppStore((s) => s.user);
  const [manualVeteranId, setManualVeteranId] = useState('');
  const veteranId = user?.id || manualVeteranId.trim() || null;

  const [wizard, setWizard] = useState<DisabilityWizardResponse | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!veteranId) {
        setWizard(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await disabilityAPI.getWizard(veteranId);
        setWizard(data);
        setSelectedConditions(data.suggested_conditions.map((condition) => condition.name));
        setCurrentStep(0);
      } catch (err: any) {
        const detail = err?.response?.data?.detail || err?.message || 'Unable to load wizard data';
        setError(detail);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [veteranId]);

  const exposures = useMemo(() => (wizard?.service_overview?.exposures as string[]) || [], [wizard]);

  const handleConditionToggle = (name: string) => {
    setSelectedConditions((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const refreshWizard = async () => {
    if (!veteranId || selectedConditions.length === 0) {
      setError('Select at least one condition before refreshing insights.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: DisabilityWizardRequest = {
        veteran_id: veteranId,
        conditions: selectedConditions,
        exposures,
      };
      const data = await disabilityAPI.runWizard(payload);
      setWizard(data);
      setCurrentStep(0);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to update wizard';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const renderServiceOverview = () => (
    <div className="wizard-card grid">
      <div>
        <p>Branch</p>
        <strong>{wizard?.service_overview.branch}</strong>
      </div>
      <div>
        <p>Years of Service</p>
        <strong>{wizard?.service_overview.years_of_service}</strong>
      </div>
      <div>
        <p>MOS</p>
        <strong>{(wizard?.service_overview.mos_codes || []).join(', ')}</strong>
      </div>
      <div>
        <p>Deployments</p>
        <strong>{(wizard?.service_overview.deployments || []).join(', ')}</strong>
      </div>
      <div>
        <p>Exposures</p>
        <strong>{exposures.join(', ') || 'N/A'}</strong>
      </div>
    </div>
  );

  const renderConditionSelection = () => (
    <div className="wizard-stack">
      {wizard?.suggested_conditions.map((condition: ConditionSuggestionModel) => (
        <label key={condition.name} className={`condition-card ${selectedConditions.includes(condition.name) ? 'selected' : ''}`}>
          <div className="condition-header">
            <input
              type="checkbox"
              checked={selectedConditions.includes(condition.name)}
              onChange={() => handleConditionToggle(condition.name)}
            />
            <div>
              <h4>{condition.name}</h4>
              <p>{condition.basis}</p>
            </div>
          </div>
          <div className="condition-footer">
            <span>Confidence {(condition.confidence * 100).toFixed(0)}%</span>
            <span>Theories: {condition.recommended_theories.join(', ')}</span>
          </div>
        </label>
      ))}
      <button type="button" onClick={refreshWizard} disabled={loading}>
        {loading ? 'Rebuilding…' : 'Refresh Insights with Selection'}
      </button>
    </div>
  );

  const renderEvidence = () => (
    <div className="wizard-stack">
      {selectedConditions.map((condition) => (
        <article key={condition} className="evidence-card">
          <h4>{condition}</h4>
          <ul>
            {(wizard?.evidence_review[condition] || []).map((item) => (
              <li key={`${item.source}-${item.reference}`}>
                <strong>{item.source}</strong>
                <span>{item.reference}</span>
                <p>{item.summary}</p>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );

  const renderTheories = () => (
    <div className="wizard-stack">
      {selectedConditions.map((condition) => (
        <article key={condition} className="theory-card">
          <h4>{condition}</h4>
          <div className="theory-grid">
            {(wizard?.theories_of_entitlement[condition] || []).map((theory: TheoryOfEntitlementModel) => (
              <div key={theory.theory_type} className="theory-pill">
                <header>
                  <span>{theory.theory_type}</span>
                  <span>{theory.confidence.toFixed(0)}%</span>
                </header>
                <p>{theory.rationale}</p>
                <p className="cfr">{theory.cfr_reference}</p>
                <ul>
                  {theory.evidence_required.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );

  const renderStrategy = () => (
    <div className="wizard-card">
      <ol>
        {wizard?.strategy_summary.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );

  const renderStepContent = () => {
    if (!wizard) {
      return <div className="placeholder">{veteranId ? 'Loading wizard data…' : 'Enter a Veteran ID to begin.'}</div>;
    }
    switch (currentStep) {
      case 0:
        return renderServiceOverview();
      case 1:
        return renderConditionSelection();
      case 2:
        return renderEvidence();
      case 3:
        return renderTheories();
      case 4:
        return renderStrategy();
      default:
        return null;
    }
  };

  return (
    <Page title="Disability Claim Wizard">
      <div className="wizard-shell">
        <header className="wizard-header">
          {!user?.id && (
            <div>
              <label htmlFor="wizard-vet">Veteran ID</label>
              <input
                id="wizard-vet"
                type="text"
                placeholder="VET_001"
                value={manualVeteranId}
                onChange={(event) => setManualVeteranId(event.target.value)}
              />
            </div>
          )}
          <div className="stepper">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                className={index === currentStep ? 'active' : ''}
                onClick={() => setCurrentStep(index)}
                disabled={!wizard}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section>{renderStepContent()}</section>

        <footer className="wizard-footer">
          <button type="button" onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} disabled={currentStep === 0}>
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((step) => Math.min(steps.length - 1, step + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </button>
        </footer>
      </div>
    </Page>
  );
};

export default DisabilityWizard;
