import React from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepHousing: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">🏠 Housing & Accessibility</h2>
        <p className="step-description">
          Help us understand your housing situation and accessibility needs
        </p>
      </div>

      <div className="form-grid">
        {/* Homeownership Status */}
        <div className="form-section">
          <h3 className="section-title">Homeownership</h3>

          <div className="form-field">
            <label>Do you own a home?</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="homeownership"
                  checked={profile.homeownershipStatus === 'own'}
                  onChange={() => updateProfile({ homeownershipStatus: 'own' })}
                />
                <span>Yes, I own a home</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="homeownership"
                  checked={profile.homeownershipStatus === 'rent'}
                  onChange={() => updateProfile({ homeownershipStatus: 'rent' })}
                />
                <span>No, I rent</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="homeownership"
                  checked={profile.homeownershipStatus === 'other'}
                  onChange={() => updateProfile({ homeownershipStatus: 'other' })}
                />
                <span>Other (staying with family, transitional, etc.)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Accessibility Needs */}
        <div className="form-section">
          <h3 className="section-title">Accessibility Needs</h3>

          <p className="helper-text" style={{ marginBottom: '1rem' }}>
            Select any that apply. This helps identify potential SAH/SHA/TRA benefits.
          </p>

          <div className="checkbox-list">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('wheelchair')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'wheelchair']
                    : current.filter(n => n !== 'wheelchair');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Wheelchair or mobility device user</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('ramps')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'ramps']
                    : current.filter(n => n !== 'ramps');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Need wheelchair ramps</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('bathroom')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'bathroom']
                    : current.filter(n => n !== 'bathroom');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Need accessible bathroom modifications</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('doorways')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'doorways']
                    : current.filter(n => n !== 'doorways');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Need widened doorways</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('blindness')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'blindness']
                    : current.filter(n => n !== 'blindness');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Blind or visually impaired</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={(profile.accessibilityNeeds || []).includes('other')}
                onChange={(e) => {
                  const current = profile.accessibilityNeeds || [];
                  const updated = e.target.checked
                    ? [...current, 'other']
                    : current.filter(n => n !== 'other');
                  updateProfile({ accessibilityNeeds: updated });
                }}
              />
              <span>Other accessibility modifications needed</span>
            </label>
          </div>
        </div>

        {/* VA Housing Benefits Info */}
        <div className="form-section full-width">
          <h3 className="section-title">VA Housing Benefits Overview</h3>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🏡</div>
              <h4>VA Home Loan</h4>
              <p>No down payment, competitive rates, no PMI. Available to eligible veterans and active duty.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">♿</div>
              <h4>SAH Grant</h4>
              <p>Specially Adapted Housing grant (up to $109,986 in 2026) for veterans with severe service-connected disabilities.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🔧</div>
              <h4>SHA Grant</h4>
              <p>Special Housing Adaptation grant (up to $21,998 in 2026) for specific disabilities requiring home modifications.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🛠️</div>
              <h4>TRA Grant</h4>
              <p>Temporary Residence Adaptation grant for veterans living temporarily in a family member's home.</p>
            </div>
          </div>

          {(profile.vaDisabilityRating || 0) >= 50 && (profile.accessibilityNeeds || []).length > 0 && (
            <div className="alert-box">
              <strong>💡 You may qualify for SAH/SHA grants</strong>
              <p>Based on your rating ({profile.vaDisabilityRating}%) and accessibility needs, you may be eligible for housing adaptation grants. The Matrix Dashboard will provide more details.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .wizard-step { width: 100%; }
        .step-header { margin-bottom: 2rem; text-align: center; }
        .step-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .step-description { font-size: 1rem; color: var(--text-secondary); margin: 0; }

        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        .form-section { background: var(--bg-secondary); border-radius: 8px; padding: 1.5rem; }
        .form-section.full-width { grid-column: 1 / -1; }
        .section-title { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border-color); }

        .form-field label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; }
        .helper-text { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }

        .radio-group { display: flex; flex-direction: column; gap: 0.75rem; }
        .radio-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .radio-option:hover { border-color: var(--accent-primary); }
        .radio-option input[type="radio"] { width: 18px; height: 18px; cursor: pointer; }
        .radio-option span { color: var(--text-primary); }

        .checkbox-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .checkbox-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .checkbox-item:hover { border-color: var(--accent-primary); }
        .checkbox-item input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }
        .checkbox-item span { color: var(--text-primary); }

        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .benefit-card { padding: 1.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; text-align: center; }
        .benefit-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .benefit-card h4 { color: var(--text-primary); font-size: 1rem; margin: 0 0 0.5rem 0; }
        .benefit-card p { color: var(--text-secondary); font-size: 0.75rem; margin: 0; line-height: 1.4; }

        .alert-box { padding: 1rem; background: rgba(72, 187, 120, 0.1); border-left: 4px solid #48bb78; border-radius: 4px; }
        .alert-box strong { color: #48bb78; display: block; margin-bottom: 0.5rem; }
        .alert-box p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
