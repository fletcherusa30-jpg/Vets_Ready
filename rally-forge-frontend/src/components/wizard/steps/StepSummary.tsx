import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepSummary: React.FC = () => {
  const { profile } = useVeteranProfile();
  const navigate = useNavigate();

  const completeness = calculateCompleteness();

  function calculateCompleteness() {
    let score = 0;
    let max = 8;

    if (profile.firstName && profile.lastName) score++;
    if (profile.branch) score++;
    if (profile.state) score++;
    if (profile.vaDisabilityRating !== undefined) score++;
    if (profile.serviceConnectedConditions && profile.serviceConnectedConditions.length > 0) score++;
    if (profile.retirementStatus) score++;
    if (profile.characterOfDischarge) score++;
    if (profile.serviceStartDate && profile.serviceEndDate) score++;

    return Math.round((score / max) * 100);
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">✅ Summary & Next Steps</h2>
        <p className="step-description">
          Review your information and proceed to your personalized Dashboard
        </p>
      </div>

      {/* Readiness Score */}
      <div className="form-section full-width readiness-section">
        <h3 className="section-title">Profile Readiness</h3>

        <div className="readiness-display">
          <div className="score-circle">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={completeness >= 80 ? '#48bb78' : completeness >= 50 ? '#ed8936' : '#e53e3e'}
                strokeWidth="12"
                strokeDasharray={`${(completeness / 100) * 440} 440`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <text
                x="80"
                y="75"
                textAnchor="middle"
                fontSize="32"
                fontWeight="700"
                fill="var(--text-primary)"
              >
                {completeness}%
              </text>
              <text
                x="80"
                y="95"
                textAnchor="middle"
                fontSize="12"
                fill="var(--text-secondary)"
              >
                Complete
              </text>
            </svg>
          </div>
          <div className="readiness-info">
            <h4>
              {completeness >= 80 ? '🎉 Excellent!' : completeness >= 50 ? '👍 Good Progress' : '📝 Getting Started'}
            </h4>
            <p>
              {completeness >= 80
                ? 'Your profile is well-populated! The Matrix Engine can provide accurate recommendations.'
                : completeness >= 50
                ? 'Good start! Adding more information will improve recommendation accuracy.'
                : 'Keep going! More information helps us provide better guidance.'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="form-section full-width">
        <h3 className="section-title">Your Information</h3>

        <div className="summary-grid">
          <div className="summary-card">
            <h4>👤 Personal</h4>
            <div className="summary-item">
              <span>Name:</span>
              <strong>{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : '—'}</strong>
            </div>
            <div className="summary-item">
              <span>DOB:</span>
              <strong>{profile.dateOfBirth || '—'}</strong>
            </div>
            <div className="summary-item">
              <span>State:</span>
              <strong>{profile.state || '—'}</strong>
            </div>
          </div>

          <div className="summary-card">
            <h4>🎖️ Service</h4>
            <div className="summary-item">
              <span>Branch:</span>
              <strong>{profile.branch || '—'}</strong>
            </div>
            <div className="summary-item">
              <span>Service:</span>
              <strong>
                {profile.serviceStartDate && profile.serviceEndDate
                  ? `${profile.serviceStartDate} to ${profile.serviceEndDate}`
                  : '—'}
              </strong>
            </div>
            <div className="summary-item">
              <span>Discharge:</span>
              <strong>{profile.characterOfDischarge || '—'}</strong>
            </div>
          </div>

          <div className="summary-card">
            <h4>📊 Disability</h4>
            <div className="summary-item">
              <span>Combined Rating:</span>
              <strong className="rating-highlight">
                {profile.vaDisabilityRating !== undefined ? `${profile.vaDisabilityRating}%` : '—'}
              </strong>
            </div>
            <div className="summary-item">
              <span>Conditions:</span>
              <strong>{profile.serviceConnectedConditions?.length || 0} listed</strong>
            </div>
          </div>

          <div className="summary-card">
            <h4>🎯 Retirement</h4>
            <div className="summary-item">
              <span>Status:</span>
              <strong>
                {profile.retirementStatus
                  ? profile.retirementStatus.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : '—'}
              </strong>
            </div>
            {profile.yearsOfService && (
              <div className="summary-item">
                <span>Years:</span>
                <strong>{profile.yearsOfService} years</strong>
              </div>
            )}
            {profile.crscSelfIdentified && (
              <div className="summary-item">
                <span>CRSC:</span>
                <strong className="crsc-highlight">Potential CRSC candidate</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="form-section full-width next-steps-section">
        <h3 className="section-title">What Happens Next</h3>

        <div className="next-steps-list">
          <div className="next-step">
            <span className="step-icon">📊</span>
            <div>
              <strong>Benefits Matrix Analysis</strong>
              <p>See federal, state, and local benefits you may qualify for based on your profile</p>
            </div>
          </div>
          <div className="next-step">
            <span className="step-icon">🎯</span>
            <div>
              <strong>Smart Recommendations</strong>
              <p>Get personalized suggestions like CRSC, SAH/SHA, discharge upgrade, TDIU, and more</p>
            </div>
          </div>
          <div className="next-step">
            <span className="step-icon">📈</span>
            <div>
              <strong>Readiness Dashboard</strong>
              <p>Track missing information and see what data would improve recommendation accuracy</p>
            </div>
          </div>
          <div className="next-step">
            <span className="step-icon">🗂️</span>
            <div>
              <strong>Document Center</strong>
              <p>Upload DD214, rating decisions, and evidence for future analysis (coming soon)</p>
            </div>
          </div>
        </div>

        <div className="cta-container">
          <button onClick={handleGoToDashboard} className="cta-button">
            Go to Dashboard →
          </button>
          <p className="cta-note">You can always come back to update your information</p>
        </div>
      </div>

      <style>{`
        .wizard-step { width: 100%; }
        .step-header { margin-bottom: 2rem; text-align: center; }
        .step-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .step-description { font-size: 1rem; color: var(--text-secondary); margin: 0; }

        .form-section { background: var(--bg-secondary); border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
        .form-section.full-width { grid-column: 1 / -1; }
        .section-title { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin: 0 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border-color); }

        .readiness-section { border: 2px solid var(--accent-primary); }
        .readiness-display { display: flex; align-items: center; gap: 2rem; }
        .score-circle { flex-shrink: 0; }
        .readiness-info h4 { font-size: 1.5rem; color: var(--text-primary); margin: 0 0 0.5rem 0; }
        .readiness-info p { color: var(--text-secondary); margin: 0; line-height: 1.5; }

        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .summary-card { padding: 1.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; }
        .summary-card h4 { margin: 0 0 1rem 0; color: var(--text-primary); font-size: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
        .summary-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .summary-item:last-child { border-bottom: none; }
        .summary-item span { color: var(--text-secondary); font-size: 0.875rem; }
        .summary-item strong { color: var(--text-primary); font-size: 0.875rem; }
        .rating-highlight { color: var(--accent-primary) !important; font-size: 1.125rem !important; font-weight: 700 !important; }
        .crsc-highlight { color: #48bb78 !important; }

        .next-steps-section { border: 2px solid #48bb78; }
        .next-steps-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .next-step { display: flex; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; }
        .step-icon { font-size: 2rem; flex-shrink: 0; }
        .next-step strong { display: block; color: var(--text-primary); margin-bottom: 0.25rem; }
        .next-step p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; line-height: 1.4; }

        .cta-container { text-align: center; padding-top: 1.5rem; border-top: 2px solid var(--border-color); }
        .cta-button { padding: 1rem 3rem; background: var(--accent-gradient); color: white; border: none; border-radius: 8px; font-size: 1.125rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .cta-note { margin: 1rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem; font-style: italic; }

        @media (max-width: 768px) {
          .readiness-display { flex-direction: column; text-align: center; }
          .summary-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
