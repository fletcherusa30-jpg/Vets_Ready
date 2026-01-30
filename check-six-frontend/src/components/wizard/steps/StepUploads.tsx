import React from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepUploads: React.FC = () => {
  const { profile } = useVeteranProfile();

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">📄 Document Uploads</h2>
        <p className="step-description">
          Upload your DD214 and VA rating decision for faster data extraction
        </p>
      </div>

      <div className="form-grid">
        {/* DD214 Upload */}
        <div className="form-section full-width">
          <h3 className="section-title">DD214 (Certificate of Release or Discharge)</h3>

          <div className="upload-placeholder">
            <div className="upload-icon">📋</div>
            <h4>DD214 Upload Coming Soon</h4>
            <p>This feature will extract your service information automatically:</p>
            <ul>
              <li>Branch of service</li>
              <li>Service dates</li>
              <li>Character of discharge</li>
              <li>Separation code & narrative reason</li>
              <li>Awards and decorations</li>
            </ul>
            <div className="placeholder-note">
              For now, please enter this information manually in the Veteran Basics step.
            </div>
          </div>
        </div>

        {/* Rating Decision Upload */}
        <div className="form-section full-width">
          <h3 className="section-title">VA Rating Decision Letter</h3>

          <div className="upload-placeholder">
            <div className="upload-icon">📊</div>
            <h4>Rating Decision Upload Coming Soon</h4>
            <p>This feature will extract your disability information automatically:</p>
            <ul>
              <li>Combined disability rating</li>
              <li>Individual condition ratings</li>
              <li>Effective dates</li>
              <li>Service connection status</li>
              <li>Diagnostic codes</li>
            </ul>
            <div className="placeholder-note">
              For now, please enter your rating information manually in the Disabilities & Ratings step.
            </div>
          </div>
        </div>

        {/* Optional Evidence */}
        <div className="form-section full-width">
          <h3 className="section-title">Additional Evidence (Optional)</h3>

          <div className="upload-placeholder minimal">
            <p>You can upload additional evidence documents later from your Dashboard → Document Center</p>
            <ul>
              <li>Medical records</li>
              <li>Lay/buddy statements</li>
              <li>Service treatment records</li>
              <li>Private medical opinions</li>
              <li>Nexus letters</li>
            </ul>
          </div>
        </div>

        {/* Current Data Summary */}
        <div className="form-section full-width data-summary">
          <h3 className="section-title">Data Entered So Far</h3>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Name:</span>
              <span className="summary-value">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : 'Not provided'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Branch:</span>
              <span className="summary-value">{profile.branch || 'Not provided'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">VA Rating:</span>
              <span className="summary-value">
                {profile.vaDisabilityRating ? `${profile.vaDisabilityRating}%` : 'Not provided'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Conditions:</span>
              <span className="summary-value">
                {profile.serviceConnectedConditions?.length || 0} entered
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Retirement:</span>
              <span className="summary-value">
                {profile.retirementStatus ? profile.retirementStatus.replace(/-/g, ' ') : 'Not provided'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">State:</span>
              <span className="summary-value">{profile.state || 'Not provided'}</span>
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

        .upload-placeholder { text-align: center; padding: 2rem; border: 2px dashed var(--border-color); border-radius: 8px; background: var(--bg-primary); }
        .upload-placeholder.minimal { padding: 1.5rem; }
        .upload-icon { font-size: 3rem; margin-bottom: 1rem; }
        .upload-placeholder h4 { color: var(--text-primary); margin: 0 0 1rem 0; }
        .upload-placeholder p { color: var(--text-secondary); margin: 0 0 0.75rem 0; }
        .upload-placeholder ul { text-align: left; max-width: 400px; margin: 1rem auto; color: var(--text-secondary); }
        .upload-placeholder li { margin: 0.5rem 0; }
        .placeholder-note { margin-top: 1rem; padding: 0.75rem; background: rgba(237, 137, 54, 0.1); border-radius: 6px; color: #ed8936; font-size: 0.875rem; font-weight: 600; }

        .data-summary { border: 2px solid var(--accent-primary); }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .summary-item { display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border-color); }
        .summary-label { font-weight: 600; color: var(--text-secondary); }
        .summary-value { color: var(--text-primary); font-weight: 600; }
      `}</style>
    </div>
  );
};
