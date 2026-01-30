import React from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import { useNavigate } from 'react-router-dom';

interface MissingField {
  field: string;
  label: string;
  importance: 'critical' | 'high' | 'medium';
  reason: string;
  action: string;
  path?: string;
}

export const MissingInformationDetector: React.FC = () => {
  const { profile } = useVeteranProfile();
  const navigate = useNavigate();

  const detectMissingFields = (): MissingField[] => {
    const missing: MissingField[] = [];

    // Critical fields
    if (!profile.branch) {
      missing.push({
        field: 'branch',
        label: 'Branch of Service',
        importance: 'critical',
        reason: 'Required for accurate benefits calculation and branch-specific programs',
        action: 'Add branch',
        path: '/profile'
      });
    }

    if (!profile.vaDisabilityRating || profile.vaDisabilityRating === 0) {
      missing.push({
        field: 'vaDisabilityRating',
        label: 'VA Disability Rating',
        importance: 'critical',
        reason: 'Most benefits are tied to your disability rating percentage',
        action: 'Add rating',
        path: '/profile'
      });
    }

    if (!profile.state) {
      missing.push({
        field: 'state',
        label: 'State of Residence',
        importance: 'high',
        reason: 'Unlocks state-specific benefits, property tax exemptions, and housing programs',
        action: 'Add state',
        path: '/profile'
      });
    }

    // High importance fields
    if (!profile.characterOfDischarge) {
      missing.push({
        field: 'characterOfDischarge',
        label: 'Character of Discharge',
        importance: 'high',
        reason: 'Determines eligibility for many federal and state benefits',
        action: 'Add discharge status',
        path: '/profile'
      });
    }

    if (!profile.retirementStatus) {
      missing.push({
        field: 'retirementStatus',
        label: 'Retirement Status',
        importance: 'high',
        reason: 'Affects CRDP/CRSC eligibility and concurrent receipt calculations',
        action: 'Add retirement info',
        path: '/profile'
      });
    }

    if (!profile.serviceConnectedConditions || profile.serviceConnectedConditions.length === 0) {
      missing.push({
        field: 'serviceConnectedConditions',
        label: 'Service-Connected Conditions',
        importance: 'high',
        reason: 'Details enable secondary condition detection and appeals guidance',
        action: 'Add conditions',
        path: '/profile'
      });
    }

    // Medium importance fields
    if (profile.numberOfDependents === undefined && !profile.isMarried) {
      missing.push({
        field: 'dependents',
        label: 'Dependent Information',
        importance: 'medium',
        reason: 'Affects compensation amounts, education benefits, and healthcare coverage',
        action: 'Add dependents',
        path: '/profile'
      });
    }

    if (!profile.hasCombatService) {
      missing.push({
        field: 'hasCombatService',
        label: 'Combat Service History',
        importance: 'medium',
        reason: 'Unlocks presumptive conditions and combat-related benefits',
        action: 'Add combat history',
        path: '/profile'
      });
    }

    return missing.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2 };
      return order[a.importance] - order[b.importance];
    });
  };

  const missingFields = detectMissingFields();

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'critical': return '#e53e3e';
      case 'high': return '#ed8936';
      case 'medium': return '#ecc94b';
      default: return '#718096';
    }
  };

  const getImportanceIcon = (importance: string): string => {
    switch (importance) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return 'ℹ️';
      default: return '📌';
    }
  };

  if (missingFields.length === 0) {
    return (
      <div className="missing-info-detector">
        <div className="detector-header">
          <h3 className="detector-title">✅ Profile Complete</h3>
          <p className="detector-subtitle">All critical information provided</p>
        </div>
        <div className="complete-message">
          <p>Your profile is comprehensive! Keep it updated to maintain accuracy.</p>
        </div>

        <style>{`
          .missing-info-detector {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
          }

          .detector-header {
            margin-bottom: 1rem;
          }

          .detector-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.5rem 0;
          }

          .detector-subtitle {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
          }

          .complete-message {
            background: #f0fff4;
            border: 1px solid #48bb78;
            border-radius: 8px;
            padding: 1rem;
            color: #22543d;
            text-align: center;
          }

          .complete-message p {
            margin: 0;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="missing-info-detector">
      <div className="detector-header">
        <h3 className="detector-title">📋 Missing Information</h3>
        <p className="detector-subtitle">
          Complete these {missingFields.length} field{missingFields.length > 1 ? 's' : ''} to improve accuracy
        </p>
      </div>

      <div className="missing-fields">
        {missingFields.map((field, index) => (
          <div key={index} className="missing-field">
            <div className="field-header">
              <span className="field-icon">{getImportanceIcon(field.importance)}</span>
              <div className="field-info">
                <h4 className="field-label">{field.label}</h4>
                <span
                  className="field-importance"
                  style={{ color: getImportanceColor(field.importance) }}
                >
                  {field.importance.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="field-reason">{field.reason}</p>
            <button
              onClick={() => field.path && navigate(field.path)}
              className="field-action"
            >
              {field.action} →
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .missing-info-detector {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .detector-header {
          margin-bottom: 1.5rem;
        }

        .detector-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .detector-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .missing-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .missing-field {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .missing-field:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .field-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .field-icon {
          font-size: 1.5rem;
        }

        .field-info {
          flex: 1;
        }

        .field-label {
          font-size: 0.938rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .field-importance {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .field-reason {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .field-action {
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .field-action:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};
