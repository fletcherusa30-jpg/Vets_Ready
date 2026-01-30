import React, { useState } from 'react';
import { useVeteranProfile } from '../../../contexts/VeteranProfileContext';

export const StepDisabilities: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const [newCondition, setNewCondition] = useState({
    name: '',
    rating: 0,
    effectiveDate: '',
    serviceConnected: true
  });

  const handleAddCondition = () => {
    if (newCondition.name.trim()) {
      const updated = [...(profile.serviceConnectedConditions || []), {
        name: newCondition.name,
        rating: newCondition.rating,
        effectiveDate: newCondition.effectiveDate || new Date().toISOString().split('T')[0]
      }];
      updateProfile({ serviceConnectedConditions: updated });
      setNewCondition({ name: '', rating: 0, effectiveDate: '', serviceConnected: true });
    }
  };

  const handleRemoveCondition = (index: number) => {
    const updated = profile.serviceConnectedConditions?.filter((_, i) => i !== index) || [];
    updateProfile({ serviceConnectedConditions: updated });
  };

  const totalRating = profile.vaDisabilityRating || 0;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">📋 Disabilities & Ratings</h2>
        <p className="step-description">
          Enter your VA disability rating and service-connected conditions
        </p>
      </div>

      <div className="form-grid">
        {/* Combined Rating */}
        <div className="form-section full-width">
          <h3 className="section-title">VA Combined Rating</h3>

          <div className="rating-selector">
            <label htmlFor="vaDisabilityRating">Current Combined Rating (%)</label>
            <select
              id="vaDisabilityRating"
              value={profile.vaDisabilityRating || 0}
              onChange={(e) => updateProfile({ vaDisabilityRating: parseInt(e.target.value) })}
              className="rating-select"
            >
              <option value="0">0% - Not rated or pending</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
            </select>
            <p className="helper-text">
              This is your combined rating from the VA, found on your rating decision letter
            </p>
          </div>

          {totalRating >= 30 && (
            <div className="info-card">
              <strong>💡 Note:</strong> At {totalRating}%, you may qualify for additional benefits including:
              <ul>
                {totalRating >= 30 && <li>Dependent allowances</li>}
                {totalRating >= 50 && <li>IU (Individual Unemployability) consideration</li>}
                {totalRating >= 70 && <li>Automobile allowance (if mobility-related)</li>}
                {totalRating === 100 && <li>Maximum VA healthcare, CHAMPVA for dependents</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Conditions List */}
        <div className="form-section full-width">
          <h3 className="section-title">Service-Connected Conditions</h3>

          {profile.serviceConnectedConditions && profile.serviceConnectedConditions.length > 0 ? (
            <div className="conditions-list">
              {profile.serviceConnectedConditions.map((condition: any, index: number) => (
                <div key={index} className="condition-card">
                  <div className="condition-info">
                    <strong>{condition.name}</strong>
                    <span className="condition-rating">{condition.rating}%</span>
                    <span className="condition-status">
                      {condition.serviceConnected ? '✓ Service-Connected' : 'Not Service-Connected'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCondition(index)}
                    className="remove-btn"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No conditions added yet. Add your conditions below.</p>
          )}

          {/* Add New Condition */}
          <div className="add-condition-form">
            <h4>Add Condition</h4>
            <div className="condition-inputs">
              <input
                type="text"
                placeholder="Condition name (e.g., PTSD, Tinnitus, Knee injury)"
                value={newCondition.name}
                onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
              />
              <select
                aria-label="Condition rating"
                value={newCondition.rating}
                onChange={(e) => setNewCondition({ ...newCondition, rating: parseInt(e.target.value) })}
              >
                <option value="0">0%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="50">50%</option>
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="100">100%</option>
              </select>
              <button onClick={handleAddCondition} className="add-btn" type="button">
                + Add
              </button>
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

        .rating-selector label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .rating-select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 1rem; background: var(--bg-primary); color: var(--text-primary); }
        .helper-text { font-size: 0.75rem; color: var(--text-secondary); margin: 0.5rem 0 0 0; }

        .info-card { margin-top: 1rem; padding: 1rem; background: rgba(72, 187, 120, 0.1); border-left: 4px solid #48bb78; border-radius: 4px; }
        .info-card strong { color: var(--text-primary); display: block; margin-bottom: 0.5rem; }
        .info-card li { color: var(--text-secondary); margin-left: 1.5rem; margin-top: 0.25rem; }

        .conditions-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .condition-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; }
        .condition-info { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
        .condition-info strong { color: var(--text-primary); font-size: 1rem; }
        .condition-rating { color: var(--accent-primary); font-weight: 700; font-size: 1.125rem; }
        .condition-status { font-size: 0.75rem; color: var(--text-secondary); }

        .remove-btn { padding: 0.5rem 1rem; background: #e53e3e; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
        .remove-btn:hover { background: #c53030; }

        .empty-state { padding: 2rem; text-align: center; color: var(--text-secondary); font-style: italic; }

        .add-condition-form { padding: 1.5rem; background: var(--bg-primary); border: 2px dashed var(--border-color); border-radius: 8px; }
        .add-condition-form h4 { margin: 0 0 1rem 0; color: var(--text-primary); }
        .condition-inputs { display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; }
        .condition-inputs input, .condition-inputs select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); }
        .add-btn { padding: 0.75rem 1.5rem; background: var(--accent-primary); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .add-btn:hover { background: var(--accent-secondary); }

        @media (max-width: 768px) {
          .condition-inputs { grid-template-columns: 1fr; }
          .condition-card { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
          .remove-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};
