import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DisabilityCalculator.css';

interface Condition {
  id: string;
  condition_name: string;
  percentage: number;
  side: 'LEFT' | 'RIGHT' | 'NONE';
  extremity_group?: 'ARM' | 'LEG' | 'ORGAN' | null;
}

interface CalculationResult {
  true_combined_rating: number;
  rounded_combined_rating: number;
  bilateral_applied: boolean;
  steps: string[];
  notes: string[];
}

const DisabilityCalculator: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: '1',
      condition_name: '',
      percentage: 10,
      side: 'NONE',
      extremity_group: null
    }
  ]);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [expandDetails, setExpandDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate whenever conditions change
  useEffect(() => {
    calculateRating();
  }, [conditions]);

  const calculateRating = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Filter out empty conditions
      const validConditions = conditions.filter(c => c.condition_name.trim() !== '');

      if (validConditions.length === 0) {
        setResult(null);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/api/disability/combined-rating`, {
        conditions: validConditions,
        apply_bilateral_factor: true
      });

      setResult(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : 'Failed to calculate disability rating';
      setError(errorMessage);
      console.error('Error calculating rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    const newId = Math.max(...conditions.map(c => parseInt(c.id)), 0) + 1;
    setConditions([
      ...conditions,
      {
        id: newId.toString(),
        condition_name: '',
        percentage: 10,
        side: 'NONE',
        extremity_group: null
      }
    ]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(
      conditions.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleSideChange = (id: string, newSide: string) => {
    updateCondition(id, { side: newSide as 'LEFT' | 'RIGHT' | 'NONE' });
  };

  const handleExtremityChange = (id: string, newGroup: string) => {
    updateCondition(id, {
      extremity_group: newGroup === '' ? null : (newGroup as 'ARM' | 'LEG' | 'ORGAN')
    });
  };

  return (
    <div className="disability-calculator-container">
      <div className="calculator-modal">
        {/* Header */}
        <div className="calculator-header">
          <h3>Quick Disability Rating Calculator</h3>
          <p className="calculator-subtitle">
            Uses VA-style combined rating mathematics
          </p>
        </div>

        {/* Conditions List */}
        <div className="conditions-section">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="conditions-list">
            {conditions.map((condition, idx) => (
              <div key={condition.id} className="condition-row">
                <div className="condition-inputs">
                  {/* Condition Name */}
                  <input
                    type="text"
                    placeholder="Condition name (e.g., Left Knee, Tinnitus)"
                    value={condition.condition_name}
                    onChange={(e) =>
                      updateCondition(condition.id, { condition_name: e.target.value })
                    }
                    className="input-condition-name"
                  />

                  {/* Percentage */}
                  <div className="percentage-input-group">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={condition.percentage}
                      onChange={(e) =>
                        updateCondition(condition.id, { percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                      }
                      className="input-percentage"
                    />
                    <span className="percentage-label">%</span>
                  </div>

                  {/* Side */}
                  <select
                    value={condition.side}
                    onChange={(e) => handleSideChange(condition.id, e.target.value)}
                    className="select-side"
                  >
                    <option value="NONE">Both/N/A</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                  </select>

                  {/* Extremity Group */}
                  {condition.side !== 'NONE' && (
                    <select
                      value={condition.extremity_group || ''}
                      onChange={(e) => handleExtremityChange(condition.id, e.target.value)}
                      className="select-extremity"
                    >
                      <option value="">Select extremity...</option>
                      <option value="ARM">Arm</option>
                      <option value="LEG">Leg</option>
                      <option value="ORGAN">Organ</option>
                    </select>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeCondition(condition.id)}
                  disabled={conditions.length === 1}
                  className="btn-remove"
                  title="Remove this condition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <button onClick={addCondition} className="btn-add-condition">
            + Add Condition
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <div className="rating-cards">
              {/* Rounded Rating (Primary) */}
              <div className="rating-card primary">
                <div className="rating-label">Combined Rating</div>
                <div className="rating-value">{result.rounded_combined_rating}%</div>
              </div>

              {/* True Rating */}
              <div className="rating-card secondary">
                <div className="rating-label">True Rating</div>
                <div className="rating-value small">{result.true_combined_rating.toFixed(2)}%</div>
              </div>

              {/* Bilateral Factor */}
              {result.bilateral_applied && (
                <div className="rating-card tertiary">
                  <div className="rating-label">Bilateral Factor</div>
                  <div className="rating-value small">✓ Applied</div>
                </div>
              )}
            </div>

            {/* Notes */}
            {result.notes.length > 0 && (
              <div className="notes-section">
                {result.notes.map((note, idx) => (
                  <div key={idx} className="note-item">
                    <span className="note-bullet">•</span>
                    <span className="note-text">{note}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Calculation Details Toggle */}
            <div className="details-toggle">
              <button
                onClick={() => setExpandDetails(!expandDetails)}
                className="btn-details"
              >
                {expandDetails ? '▼' : '▶'} Calculation Details
              </button>
            </div>

            {/* Calculation Steps */}
            {expandDetails && (
              <div className="calculation-details">
                <div className="steps-title">Step-by-Step Calculation</div>
                <ol className="steps-list">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="step-item">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !error && (
          <div className="empty-state">
            <p>Add conditions to calculate combined rating</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Calculating...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisabilityCalculator;
