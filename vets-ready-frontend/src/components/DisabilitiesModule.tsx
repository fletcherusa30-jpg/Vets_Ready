/**
 * Disabilities & Ratings Module
 *
 * Allows veterans to enter individual conditions and calculates combined rating
 * using official VA math with bilateral factor.
 *
 * Legal Compliance:
 * - Educational estimates only
 * - Does not file claims
 * - Plain language explanations
 */

import React, { useState } from 'react';
import { useVeteranProfile } from '../context/VeteranProfileContext';
import {
  calculateCombinedRating,
  DisabilityRating,
  isValidVARating,
  roundToNearest10
} from '../utils/VAMath';

interface DisabilitiesModuleProps {
  onComplete?: () => void;
}

export const DisabilitiesModule: React.FC<DisabilitiesModuleProps> = ({ onComplete }) => {
  const { profile, updateProfile } = useVeteranProfile();
  const [disabilities, setDisabilities] = useState<DisabilityRating[]>(
    profile.disabilities || []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // New condition form
  const [newCondition, setNewCondition] = useState<DisabilityRating>({
    conditionName: '',
    rating: 0,
    extremity: '',
    isPaired: false,
    diagnosticCode: '',
    serviceConnected: true
  });

  // Calculate combined rating
  const mathResult = calculateCombinedRating(disabilities);

  /**
   * Add new condition
   */
  const handleAddCondition = () => {
    if (!newCondition.conditionName || newCondition.rating === 0) {
      alert('Please enter a condition name and rating');
      return;
    }

    if (!isValidVARating(newCondition.rating)) {
      alert('VA ratings must be in 10% increments (0, 10, 20, ... 100)');
      return;
    }

    const updated = [...disabilities, newCondition];
    setDisabilities(updated);
    updateProfile({ disabilities: updated });

    // Reset form
    setNewCondition({
      conditionName: '',
      rating: 0,
      extremity: '',
      isPaired: false,
      diagnosticCode: '',
      serviceConnected: true
    });
    setShowAddModal(false);
  };

  /**
   * Edit existing condition
   */
  const handleEditCondition = (index: number) => {
    setEditingIndex(index);
    setNewCondition(disabilities[index]);
    setShowAddModal(true);
  };

  /**
   * Save edited condition
   */
  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...disabilities];
    updated[editingIndex] = newCondition;
    setDisabilities(updated);
    updateProfile({ disabilities: updated });

    setEditingIndex(null);
    setNewCondition({
      conditionName: '',
      rating: 0,
      extremity: '',
      isPaired: false,
      diagnosticCode: '',
      serviceConnected: true
    });
    setShowAddModal(false);
  };

  /**
   * Delete condition
   */
  const handleDeleteCondition = (index: number) => {
    if (confirm('Are you sure you want to delete this condition?')) {
      const updated = disabilities.filter((_, i) => i !== index);
      setDisabilities(updated);
      updateProfile({ disabilities: updated });
    }
  };

  return (
    <div className="disabilities-module">
      <div className="module-header">
        <h1>📋 Disabilities & Ratings</h1>
        <p>Enter each service-connected condition and rating. We'll calculate your combined rating using official VA math.</p>
      </div>

      {/* Combined Rating Display */}
      <div className="combined-rating-card">
        <h2>Your Estimated Combined Rating</h2>
        <div className="rating-display">
          <div className="rating-number">{mathResult.roundedRating}%</div>
          <div className="rating-label">Combined VA Disability Rating</div>
        </div>

        {mathResult.bilateralFactor > 0 && (
          <div className="bilateral-notice">
            ✓ Bilateral factor applied: +{mathResult.bilateralFactor}%
          </div>
        )}

        <div className="rating-explanation">
          <p>{mathResult.explanation}</p>
        </div>

        {/* Show detailed calculations */}
        {disabilities.length > 0 && (
          <details className="calculation-details">
            <summary>Show detailed calculation</summary>
            <pre>{mathResult.calculations.join('\n')}</pre>
          </details>
        )}
      </div>

      {/* Conditions List */}
      <div className="conditions-section">
        <div className="section-header">
          <h3>Your Conditions ({disabilities.length})</h3>
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Condition
          </button>
        </div>

        {disabilities.length === 0 ? (
          <div className="empty-state">
            <p>No conditions added yet.</p>
            <p>Click "Add Condition" to get started.</p>
          </div>
        ) : (
          <div className="conditions-grid">
            {disabilities.map((disability, index) => (
              <div key={index} className="condition-card">
                <div className="condition-header">
                  <h4>{disability.conditionName}</h4>
                  <span className="rating-badge">{disability.rating}%</span>
                </div>

                <div className="condition-details">
                  {disability.extremity && (
                    <div className="detail-item">
                      <span className="label">Extremity:</span>
                      <span className="value">{disability.extremity}</span>
                    </div>
                  )}
                  {disability.diagnosticCode && (
                    <div className="detail-item">
                      <span className="label">Diagnostic Code:</span>
                      <span className="value">{disability.diagnosticCode}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Service-Connected:</span>
                    <span className="value">{disability.serviceConnected ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="condition-actions">
                  <button
                    className="btn-secondary-small"
                    onClick={() => handleEditCondition(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger-small"
                    onClick={() => handleDeleteCondition(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Condition Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIndex !== null ? 'Edit Condition' : 'Add Condition'}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingIndex(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Condition Name *</label>
                <input
                  type="text"
                  value={newCondition.conditionName}
                  onChange={(e) => setNewCondition({ ...newCondition, conditionName: e.target.value })}
                  placeholder="e.g., PTSD, Tinnitus, Knee Pain"
                />
              </div>

              <div className="form-group">
                <label>Current VA Rating * (must be 10% increments)</label>
                <select
                  value={newCondition.rating}
                  onChange={(e) => setNewCondition({ ...newCondition, rating: parseInt(e.target.value) })}
                >
                  <option value={0}>Select Rating</option>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(rating => (
                    <option key={rating} value={rating}>{rating}%</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service-Connected?</label>
                <select
                  value={newCondition.serviceConnected ? 'yes' : 'no'}
                  onChange={(e) => setNewCondition({ ...newCondition, serviceConnected: e.target.value === 'yes' })}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="pending">Not Sure / Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label>Body Part / Extremity (optional)</label>
                <select
                  value={newCondition.extremity || ''}
                  onChange={(e) => setNewCondition({ ...newCondition, extremity: e.target.value as any })}
                >
                  <option value="">Not applicable</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="bilateral">Bilateral (both sides)</option>
                </select>
                <small>Select "left" or "right" if this affects arms or legs to enable bilateral factor calculation.</small>
              </div>

              <div className="form-group">
                <label>Diagnostic Code (optional)</label>
                <input
                  type="text"
                  value={newCondition.diagnosticCode || ''}
                  onChange={(e) => setNewCondition({ ...newCondition, diagnosticCode: e.target.value })}
                  placeholder="e.g., 8520, 6260, 5257"
                />
                <small>Found on your VA rating decision letter (38 CFR Part 4)</small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingIndex(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={editingIndex !== null ? handleSaveEdit : handleAddCondition}
              >
                {editingIndex !== null ? 'Save Changes' : 'Add Condition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {disabilities.length > 0 && onComplete && (
        <div className="module-footer">
          <button className="btn-primary-large" onClick={onComplete}>
            Continue to Matrix Dashboard →
          </button>
        </div>
      )}

      <style>{`
        .disabilities-module {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .module-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .module-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .combined-rating-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .rating-display {
          text-align: center;
          margin: 1rem 0;
        }

        .rating-number {
          font-size: 4rem;
          font-weight: bold;
        }

        .rating-label {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .bilateral-notice {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.75rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
        }

        .rating-explanation {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          white-space: pre-line;
        }

        .calculation-details {
          margin-top: 1rem;
        }

        .calculation-details summary {
          cursor: pointer;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .calculation-details pre {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 0.5rem;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        .conditions-section {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f7fafc;
          border-radius: 8px;
          color: #718096;
        }

        .conditions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .condition-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .condition-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .condition-header h4 {
          margin: 0;
          flex: 1;
        }

        .rating-badge {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .condition-details {
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f7fafc;
        }

        .detail-item .label {
          font-weight: 600;
          color: #4a5568;
        }

        .condition-actions {
          display: flex;
          gap: 0.5rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #718096;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #718096;
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .module-footer {
          text-align: center;
          margin-top: 2rem;
        }

        .btn-primary {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary-large {
          background: #667eea;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #2d3748;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary-small {
          background: #e2e8f0;
          color: #2d3748;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .btn-danger-small {
          background: #fc8181;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .disabilities-module {
            padding: 1rem;
          }

          .conditions-grid {
            grid-template-columns: 1fr;
          }

          .rating-number {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DisabilitiesModule;
