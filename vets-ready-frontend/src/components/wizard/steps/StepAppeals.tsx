import React from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepAppeals: React.FC = () => {
  const { profile } = useVeteranProfile();

  const hasLowRatings = profile.serviceConnectedConditions?.some((c: any) => c.rating < 50) || false;
  const totalRating = profile.vaDisabilityRating || 0;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">⚠️ Appeals & Rating Review</h2>
        <p className="step-description">
          Review your rating decisions and identify potential appeal opportunities
        </p>
      </div>

      <div className="form-grid">
        {/* Appeals Overview */}
        <div className="form-section full-width">
          <h3 className="section-title">Understanding VA Appeals</h3>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            If you disagree with a VA rating decision, you have options to appeal or request a review. Common reasons include:
          </p>

          <div className="reasons-grid">
            <div className="reason-card">
              <div className="reason-icon">📉</div>
              <h4>Low Rating</h4>
              <p>Condition rated lower than expected based on symptoms</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">❌</div>
              <h4>Denial</h4>
              <p>Claim denied entirely (no service connection found)</p>
            </div>
            <div className="reason-card">
              <div className="reason-icon">📅</div>
              <h4>Effective Date</h4>
              <p>Benefits awarded but start date is later than expected</p>
            </div>
          </div>
        </div>

        {/* Issue Detection */}
        {totalRating > 0 && (
          <div className="form-section full-width">
            <h3 className="section-title">Potential Issues Detected</h3>

            {hasLowRatings ? (
              <div className="alert-box warning">
                <strong>🔍 Low Ratings Detected</strong>
                <p>You have conditions rated below 50%. If your symptoms are more severe than your rating reflects, you may want to file for an increase.</p>
                <div className="low-rating-list">
                  {profile.serviceConnectedConditions
                    ?.filter((c: any) => c.rating < 50)
                    .map((condition: any, index: number) => (
                      <div key={index} className="issue-item">
                        <strong>{condition.name}</strong>
                        <span className="rating-badge">{condition.rating}%</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="alert-box success">
                <strong>✓ No Obvious Low Ratings</strong>
                <p>Your conditions appear to be rated at 50% or higher. However, if your symptoms worsen or you have new evidence, you can still file for an increase.</p>
              </div>
            )}
          </div>
        )}

        {/* Appeal Options */}
        <div className="form-section full-width">
          <h3 className="section-title">Appeal Options Overview</h3>

          <div className="options-grid">
            <div className="option-card">
              <h4>📝 Supplemental Claim</h4>
              <p><strong>Best for:</strong> New and relevant evidence</p>
              <p><strong>Timeline:</strong> ~125 days average</p>
              <p><strong>What it is:</strong> Submit new evidence that wasn't part of the original decision.</p>
            </div>

            <div className="option-card">
              <h4>🔄 Higher-Level Review</h4>
              <p><strong>Best for:</strong> No new evidence, but decision was wrong</p>
              <p><strong>Timeline:</strong> ~125 days average</p>
              <p><strong>What it is:</strong> Senior reviewer looks at same evidence with fresh eyes.</p>
            </div>

            <div className="option-card">
              <h4>⚖️ Board Appeal</h4>
              <p><strong>Best for:</strong> Complex cases, want a hearing</p>
              <p><strong>Timeline:</strong> 1-3+ years depending on docket</p>
              <p><strong>What it is:</strong> Veterans Law Judge reviews your case. Options for direct review, evidence submission, or hearing.</p>
            </div>
          </div>

          <div className="info-card">
            <strong>ℹ️ Educational Information Only</strong>
            <p>VetsReady does not provide legal advice or represent you in appeals. We recommend consulting with:</p>
            <ul>
              <li>VA-accredited attorney or claims agent</li>
              <li>Veterans Service Organization (VSO) like DAV, VFW, American Legion</li>
              <li>County Veteran Service Officer (CVSO)</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>The Local Resources page can help you find accredited representatives in your area.</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="form-section full-width cta-section">
          <h3 className="section-title">What Happens Next</h3>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            After completing this wizard, your Dashboard will show:
          </p>

          <div className="next-steps-list">
            <div className="next-step-item">
              <span className="step-number">1</span>
              <div>
                <strong>Appeals Issue Cards</strong>
                <p>Detailed breakdown of potential appeal opportunities based on your profile</p>
              </div>
            </div>
            <div className="next-step-item">
              <span className="step-number">2</span>
              <div>
                <strong>Evidence Suggestions</strong>
                <p>Educational guidance on what types of evidence typically help (medical records, DBQs, nexus letters, etc.)</p>
              </div>
            </div>
            <div className="next-step-item">
              <span className="step-number">3</span>
              <div>
                <strong>Local Resources</strong>
                <p>VA-accredited attorneys, VSOs, and county service officers in your area</p>
              </div>
            </div>
          </div>
        </div>
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

        .reasons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .reason-card { padding: 1.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; text-align: center; }
        .reason-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .reason-card h4 { color: var(--text-primary); font-size: 1rem; margin: 0 0 0.5rem 0; }
        .reason-card p { color: var(--text-secondary); font-size: 0.75rem; margin: 0; line-height: 1.4; }

        .alert-box { padding: 1rem; border-radius: 8px; border-left: 4px solid; }
        .alert-box.warning { background: rgba(237, 137, 54, 0.1); border-left-color: #ed8936; }
        .alert-box.success { background: rgba(72, 187, 120, 0.1); border-left-color: #48bb78; }
        .alert-box strong { display: block; margin-bottom: 0.5rem; color: var(--text-primary); }
        .alert-box p { color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.875rem; }

        .low-rating-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
        .issue-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; }
        .issue-item strong { color: var(--text-primary); }
        .rating-badge { padding: 0.25rem 0.75rem; background: #ed8936; color: white; border-radius: 12px; font-weight: 700; font-size: 0.875rem; }

        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .option-card { padding: 1.5rem; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: 8px; }
        .option-card h4 { color: var(--accent-primary); margin: 0 0 1rem 0; font-size: 1.125rem; }
        .option-card p { color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0; line-height: 1.5; }
        .option-card p strong { color: var(--text-primary); }

        .info-card { padding: 1.5rem; background: rgba(102, 126, 234, 0.1); border-left: 4px solid var(--accent-primary); border-radius: 4px; }
        .info-card strong { display: block; color: var(--accent-primary); margin-bottom: 0.75rem; }
        .info-card p { color: var(--text-secondary); margin: 0.5rem 0; font-size: 0.875rem; line-height: 1.5; }
        .info-card ul { margin: 0.5rem 0; padding-left: 1.5rem; color: var(--text-secondary); }
        .info-card li { margin: 0.25rem 0; }

        .cta-section { border: 2px solid var(--accent-primary); }
        .next-steps-list { display: flex; flex-direction: column; gap: 1rem; }
        .next-step-item { display: flex; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; }
        .step-number { flex-shrink: 0; width: 36px; height: 36px; background: var(--accent-gradient); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; }
        .next-step-item strong { display: block; color: var(--text-primary); margin-bottom: 0.25rem; }
        .next-step-item p { color: var(--text-secondary); margin: 0; font-size: 0.875rem; }
      `}</style>
    </div>
  );
};
