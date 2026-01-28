import React from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepVeteranBasics: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">👤 Veteran Basics</h2>
        <p className="step-description">
          Let's start with your basic information and service history
        </p>
      </div>

      <div className="form-grid">
        {/* Personal Information */}
        <div className="form-section">
          <h3 className="section-title">Personal Information</h3>

          <div className="form-field">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={profile.firstName}
              onChange={(e) => updateProfile({ firstName: e.target.value })}
              placeholder="John"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={profile.lastName}
              onChange={(e) => updateProfile({ lastName: e.target.value })}
              placeholder="Smith"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => updateProfile({ dateOfBirth: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Service Information */}
        <div className="form-section">
          <h3 className="section-title">Service Information</h3>

          <div className="form-field">
            <label htmlFor="branch">Branch of Service *</label>
            <select
              id="branch"
              value={profile.branch || ''}
              onChange={(e) => updateProfile({ branch: e.target.value as any })}
              required
            >
              <option value="">Select your branch...</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
              <option value="Marine Corps">Marine Corps</option>
              <option value="Coast Guard">Coast Guard</option>
              <option value="Space Force">Space Force</option>
              <option value="National Guard">National Guard</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="serviceStartDate">Service Start Date</label>
            <input
              id="serviceStartDate"
              type="date"
              value={profile.serviceStartDate}
              onChange={(e) => updateProfile({ serviceStartDate: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="serviceEndDate">Service End Date</label>
            <input
              id="serviceEndDate"
              type="date"
              value={profile.serviceEndDate}
              onChange={(e) => updateProfile({ serviceEndDate: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label htmlFor="rank">Rank (at separation)</label>
            <input
              id="rank"
              type="text"
              value={profile.rank}
              onChange={(e) => updateProfile({ rank: e.target.value })}
              placeholder="E-7, O-3, etc."
            />
          </div>

          <div className="form-field">
            <label htmlFor="characterOfDischarge">Character of Discharge</label>
            <select
              id="characterOfDischarge"
              value={profile.characterOfDischarge || ''}
              onChange={(e) => updateProfile({ characterOfDischarge: e.target.value as any })}
            >
              <option value="">Select...</option>
              <option value="Honorable">Honorable</option>
              <option value="General Under Honorable Conditions">General Under Honorable Conditions</option>
              <option value="Other Than Honorable">Other Than Honorable</option>
              <option value="Bad Conduct">Bad Conduct</option>
              <option value="Dishonorable">Dishonorable</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="form-section full-width">
          <h3 className="section-title">Location</h3>

          <div className="form-field">
            <label htmlFor="state">State of Residence *</label>
            <select
              id="state"
              value={profile.state || ''}
              onChange={(e) => updateProfile({ state: e.target.value })}
              required
            >
              <option value="">Select your state...</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              {/* Add all states */}
            </select>
            <p className="helper-text">Required for state-specific benefits</p>
          </div>
        </div>

        {/* Combat Service */}
        <div className="form-section full-width">
          <div className="checkbox-field">
            <input
              id="hasCombatService"
              type="checkbox"
              checked={profile.hasCombatService}
              onChange={(e) => updateProfile({ hasCombatService: e.target.checked })}
            />
            <label htmlFor="hasCombatService">
              <strong>I have combat or deployment service</strong>
              <p className="helper-text">Check if you deployed to a combat zone or have combat-related service</p>
            </label>
          </div>
        </div>
      </div>

      <style>{`
        .wizard-step {
          width: 100%;
        }

        .step-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .step-description {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .form-grid {
          display: grid;
          gap: 2rem;
        }

        .form-section {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .form-section.full-width {
          grid-column: 1 / -1;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .form-field {
          margin-bottom: 1.5rem;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .form-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .helper-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0 0;
        }

        .checkbox-field {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .checkbox-field input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 0.25rem;
          cursor: pointer;
        }

        .checkbox-field label {
          flex: 1;
          cursor: pointer;
        }

        .checkbox-field label strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
