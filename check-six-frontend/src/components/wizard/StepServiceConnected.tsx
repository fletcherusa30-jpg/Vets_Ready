/**
 * Step 1: Confirm Service-Connected Disabilities
 *
 * Allows veterans to review and confirm their existing service-connected disabilities
 * These will be used as the foundation for secondary condition analysis
 */

import React, { useState } from 'react';
import { WizardState, Disability, ServiceConnectionType } from '../../types/wizard.types';

interface StepServiceConnectedProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

export const StepServiceConnected: React.FC<StepServiceConnectedProps> = ({
  wizardState,
  updateWizardState,
  onNext,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    rating: '',
    description: '',
  });

  const handleAddCondition = () => {
    if (!newCondition.name || !newCondition.rating) return;

    const disability: Disability = {
      id: Date.now().toString(),
      name: newCondition.name,
      description: newCondition.description,
      serviceConnectionType: 'direct',
      status: 'service-connected',
      currentRating: parseInt(newCondition.rating),
      isServiceConnected: true,
      primaryConditionIds: [],
      secondaryConditionIds: [],
      diagnosedInService: true,
      worsenedOverTime: false,
      symptoms: [],
      treatments: [],
      serviceHistory: '',
      nexusEvidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateWizardState({
      serviceConnectedDisabilities: [...wizardState.serviceConnectedDisabilities, disability],
    });

    setNewCondition({ name: '', rating: '', description: '' });
    setShowAddForm(false);
  };

  const handleRemoveCondition = (id: string) => {
    updateWizardState({
      serviceConnectedDisabilities: wizardState.serviceConnectedDisabilities.filter(d => d.id !== id),
    });
  };

  const handleUpdateRating = (id: string, rating: number) => {
    updateWizardState({
      serviceConnectedDisabilities: wizardState.serviceConnectedDisabilities.map(d =>
        d.id === id ? { ...d, currentRating: rating, updatedAt: new Date().toISOString() } : d
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-3xl mr-3">ℹ️</span>
          <div>
            <h3 className="font-bold text-lg text-blue-900 mb-2">
              Step 1: Confirm Your Service-Connected Disabilities
            </h3>
            <p className="text-blue-800 mb-2">
              These are disabilities that the VA has already granted you service connection for.
              We'll use these as the foundation to explore potential secondary conditions.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Review the disabilities listed below</li>
              <li>Add any service-connected conditions that are missing</li>
              <li>Update ratings if they've changed</li>
              <li>Remove any that are incorrect</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Service-Connected Disabilities List */}
      {wizardState.serviceConnectedDisabilities.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Your Service-Connected Disabilities ({wizardState.serviceConnectedDisabilities.length})
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Condition
            </button>
          </div>

          <div className="grid gap-4">
            {wizardState.serviceConnectedDisabilities.map((disability) => (
              <div
                key={disability.id}
                className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{disability.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {disability.currentRating}% SC
                        </span>
                        <select
                          value={disability.currentRating || 0}
                          onChange={(e) => handleUpdateRating(disability.id, parseInt(e.target.value))}
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                          aria-label={`Update rating for ${disability.name}`}
                        >
                          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(rating => (
                            <option key={rating} value={rating}>{rating}%</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {disability.description && (
                      <p className="text-gray-700 text-sm">{disability.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCondition(disability.id)}
                    className="ml-4 text-red-600 hover:text-red-800 font-bold text-xl"
                    aria-label={`Remove ${disability.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Service-Connected Disabilities Yet</h3>
          <p className="text-gray-600 mb-6">
            Add your service-connected disabilities to get started with secondary condition analysis
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            + Add Your First Condition
          </button>
        </div>
      )}

      {/* Add Condition Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Service-Connected Condition</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCondition({ name: '', rating: '', description: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCondition.name}
                  onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PTSD, Lower Back Pain, Tinnitus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Rating <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCondition.rating}
                  onChange={(e) => setNewCondition({ ...newCondition, rating: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Rating</option>
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(rating => (
                    <option key={rating} value={rating}>{rating}%</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCondition.description}
                  onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the condition"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddCondition}
                  disabled={!newCondition.name || !newCondition.rating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold"
                >
                  Add Condition
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCondition({ name: '', rating: '', description: '' });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {wizardState.serviceConnectedDisabilities.length === 0 ? (
            <span className="text-yellow-600 font-semibold">⚠️ Add at least one service-connected condition to continue</span>
          ) : (
            <span className="text-green-600 font-semibold">✓ {wizardState.serviceConnectedDisabilities.length} condition(s) confirmed</span>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={wizardState.serviceConnectedDisabilities.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          Continue to Add Conditions
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
