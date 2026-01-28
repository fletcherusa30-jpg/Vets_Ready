import React from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepRetirementCrsc: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();

  const isMedicallyRetired = profile.retirementStatus === 'medical retiree' || profile.retirementStatus === 'medical <20 years';
  const yearsLessThan20 = (profile.yearsOfService || 0) < 20;
  const crscEligible = isMedicallyRetired && yearsLessThan20;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">🎯 Retirement & CRSC</h2>
        <p className="step-description">
          Help us understand your military retirement status
        </p>
      </div>

      <div className="form-grid">
        {/* Retirement Status */}
        <div className="form-section full-width">
          <h3 className="section-title">Retirement Status</h3>

          <div className="form-field">
            <label htmlFor="retirementStatus">Are you receiving military retirement pay?</label>
            <select
              id="retirementStatus"
              value={profile.retirementStatus || ''}
              onChange={(e) => updateProfile({ retirementStatus: e.target.value as any })}
            >
              <option value="">Select...</option>
              <option value="20+ retiree">20+ year retiree</option>
              <option value="medical retiree">Medically retired (20+ years)</option>
              <option value="medical <20 years">Medically retired (&lt;20 years)</option>
            </select>
          </div>

          {profile.retirementStatus && (
            <div className="form-field">
              <label htmlFor="yearsOfService">Years of Active Service</label>
              <input
                id="yearsOfService"
                type="number"
                min="0"
                max="50"
                value={profile.yearsOfService || ''}
                onChange={(e) => updateProfile({ yearsOfService: parseInt(e.target.value) || 0 })}
                placeholder="20"
              />
              <p className="helper-text">Total years of active duty service</p>
            </div>
          )}

          {profile.retirementStatus === '20+ retiree' && (
            <div className="info-card success">
              <strong>✓ 20+ Year Retiree</strong>
              <p>You receive DoD retirement pay. You can receive both VA disability compensation and DoD retirement pay concurrently (CRDP if 50%+ rating).</p>
            </div>
          )}
        </div>

        {/* CRSC Section */}
        {crscEligible && (
          <div className="form-section full-width crsc-section">
            <h3 className="section-title">CRSC (Combat-Related Special Compensation)</h3>

            <div className="alert-box">
              <strong>📢 You may be eligible for CRSC</strong>
              <p>CRSC is a tax-free payment for medically retired veterans with less than 20 years of service whose disabilities are combat-related.</p>
            </div>

            <div className="form-field">
              <div className="checkbox-field">
                <input
                  id="crscSelfIdentified"
                  type="checkbox"
                  checked={profile.crscSelfIdentified || false}
                  onChange={(e) => updateProfile({ crscSelfIdentified: e.target.checked })}
                />
                <label htmlFor="crscSelfIdentified">
                  <strong>I believe my disability is combat-related</strong>
                  <p className="helper-text">Check if you believe your service-connected disability resulted from combat or combat-related activities</p>
                </label>
              </div>
            </div>

            {profile.crscSelfIdentified && (
              <div className="crsc-indicators">
                <h4>CRSC Indicators (Select all that apply)</h4>
                <p className="helper-text">These help identify potential CRSC eligibility. Select any that apply to your situation:</p>

                <div className="indicator-list">
                  {[
                    { key: 'combatInjury', label: 'Combat injury or wound', description: 'Injury sustained during direct combat operations, enemy fire, or IED attacks' },
                    { key: 'combatTrainingAccident', label: 'Combat training accident', description: 'Injury during combat skills training, field exercises, war games, or live-fire drills' },
                    { key: 'hazardousDuty', label: 'Hazardous duty', description: 'Parachuting, airborne operations, flight operations, diving, EOD (demolition), or special operations assignments' },
                    { key: 'combatMentalHealth', label: 'PTSD or mental health from combat', description: 'PTSD, anxiety, depression from combat exposure or combat-related traumatic events' },
                    { key: 'combatHazards', label: 'Combat-related hazards', description: 'Exposure to burn pits, Agent Orange, depleted uranium, radiation, or Gulf War hazards in combat zones' },
                    { key: 'instrumentalityOfWar', label: 'Instrumentality of war', description: 'Injury from military weapons, vehicles, or equipment during armed conflict' },
                    { key: 'otherCombatRelated', label: 'Other combat-related circumstances', description: 'Other military service-related injuries or conditions with combat connection' }
                  ].map((indicator) => (
                    <div key={indicator.key} className="indicator-item">
                      <input
                        type="checkbox"
                        id={indicator.key}
                        checked={(profile.crscIndicators || []).includes(indicator.key)}
                        onChange={(e) => {
                          const current = profile.crscIndicators || [];
                          const updated = e.target.checked
                            ? [...current, indicator.key]
                            : current.filter((k: string) => k !== indicator.key);
                          updateProfile({ crscIndicators: updated });
                        }}
                      />
                      <label htmlFor={indicator.key}>
                        <strong>{indicator.label}</strong>
                        <span className="indicator-desc">{indicator.description}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="info-card">
                  <strong>ℹ️ Educational Information Only</strong>
                  <p>CRSC determination is made by your branch's retirement system, not the VA. This information helps identify potential eligibility for educational purposes.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {isMedicallyRetired && !yearsLessThan20 && (
          <div className="info-card">
            <strong>ℹ️ Medically Retired with 20+ Years</strong>
            <p>You receive DoD retirement pay. CRSC is typically for medically retired veterans with less than 20 years of service.</p>
          </div>
        )}
      </div>

      <style>{`
        .wizard-step { width: 100%; }
        .step-header { margin-bottom: 2rem; text-align: center; }
        .step-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .step-description { font-size: 1rem; color: var(--text-secondary); margin: 0; }

        .form-grid { display: grid; gap: 2rem; }
        .form-section { background: var(--bg-secondary); border-radius: 8px; padding: 1.5rem; }
        .form-section.full-width { grid-column: 1 / -1; }
        .section-title { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border-color); }

        .form-field { margin-bottom: 1.5rem; }
        .form-field:last-child { margin-bottom: 0; }
        .form-field label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .form-field input, .form-field select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); }
        .helper-text { font-size: 0.75rem; color: var(--text-secondary); margin: 0.25rem 0 0 0; }

        .checkbox-field { display: flex; gap: 0.75rem; align-items: flex-start; padding: 1rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border-color); }
        .checkbox-field input[type="checkbox"] { width: 20px; height: 20px; margin-top: 0.25rem; cursor: pointer; }
        .checkbox-field label { flex: 1; cursor: pointer; }
        .checkbox-field label strong { display: block; color: var(--text-primary); margin-bottom: 0.25rem; }

        .info-card { margin-top: 1rem; padding: 1rem; background: rgba(102, 126, 234, 0.1); border-left: 4px solid var(--accent-primary); border-radius: 4px; }
        .info-card.success { background: rgba(72, 187, 120, 0.1); border-left-color: #48bb78; }
        .info-card strong { color: var(--text-primary); display: block; margin-bottom: 0.5rem; }
        .info-card p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; line-height: 1.5; }

        .alert-box { padding: 1rem; background: rgba(237, 137, 54, 0.1); border: 2px solid #ed8936; border-radius: 8px; margin-bottom: 1.5rem; }
        .alert-box strong { color: #ed8936; display: block; margin-bottom: 0.5rem; }
        .alert-box p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; }

        .crsc-section { border: 2px solid var(--accent-primary); }

        .crsc-indicators h4 { margin: 1.5rem 0 0.5rem 0; color: var(--text-primary); font-size: 1rem; }
        .indicator-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
        .indicator-item { display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border-color); }
        .indicator-item input[type="checkbox"] { width: 20px; height: 20px; margin-top: 0.25rem; cursor: pointer; flex-shrink: 0; }
        .indicator-item label { flex: 1; cursor: pointer; }
        .indicator-item label strong { display: block; color: var(--text-primary); font-size: 0.875rem; margin-bottom: 0.25rem; }
        .indicator-desc { display: block; font-size: 0.75rem; color: var(--text-secondary); font-weight: normal; }
      `}</style>
    </div>
  );
};
