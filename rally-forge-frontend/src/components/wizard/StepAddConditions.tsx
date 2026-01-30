/**
 * Step 2: Add Current, Planned, or Denied Conditions
 *
 * Allows veterans to add conditions they want to explore for service connection
 */

import React, { useState } from 'react';
import { WizardState, Disability, ServiceConnectionType, ClaimStatus } from '../../types/wizard.types';

interface StepAddConditionsProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepAddConditions: React.FC<StepAddConditionsProps> = ({
  wizardState,
  updateWizardState,
  onNext,
  onPrevious,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    connectionType: 'direct' as ServiceConnectionType,
    status: 'planned' as ClaimStatus,
    primaryConditionId: '',
    diagnosedInService: false,
    serviceHistory: '',
  });

  const allConditions = [
    ...wizardState.candidateConditions,
    ...wizardState.deniedConditions,
  ];

  const handleAddCondition = () => {
    if (!formData.name) return;

    const disability: Disability = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      serviceConnectionType: formData.connectionType,
      status: formData.status,
      isServiceConnected: false,
      primaryConditionIds: formData.primaryConditionId ? [formData.primaryConditionId] : [],
      secondaryConditionIds: [],
      diagnosedInService: formData.diagnosedInService,
      worsenedOverTime: false,
      symptoms: [],
      treatments: [],
      serviceHistory: formData.serviceHistory,
      nexusEvidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (formData.status === 'denied') {
      updateWizardState({
        deniedConditions: [...wizardState.deniedConditions, disability],
      });
    } else {
      updateWizardState({
        candidateConditions: [...wizardState.candidateConditions, disability],
      });
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      connectionType: 'direct',
      status: 'planned',
      primaryConditionId: '',
      diagnosedInService: false,
      serviceHistory: '',
    });
    setShowAddForm(false);
  };

  const handleRemoveCondition = (id: string, isDenied: boolean) => {
    if (isDenied) {
      updateWizardState({
        deniedConditions: wizardState.deniedConditions.filter(d => d.id !== id),
      });
    } else {
      updateWizardState({
        candidateConditions: wizardState.candidateConditions.filter(d => d.id !== id),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
        <div className="flex items-start">
          <span className="text-purple-600 text-3xl mr-3">📝</span>
          <div>
            <h3 className="font-bold text-lg text-purple-900 mb-2">
              Step 2: Add Conditions to Explore
            </h3>
            <p className="text-purple-800 mb-2">
              Add any conditions you're considering filing for, have been denied for, or want to explore
              for service connection.
            </p>
            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
              <li>New conditions you want to file for</li>
              <li>Denied conditions you want to appeal or file as supplemental claims</li>
              <li>Secondary conditions linked to your service-connected disabilities</li>
              <li>Aggravation of pre-existing conditions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Condition
        </button>
      </div>

      {/* Candidate Conditions */}
      {wizardState.candidateConditions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🎯</span>
            Planned/Current Conditions ({wizardState.candidateConditions.length})
          </h3>
          <div className="grid gap-4">
            {wizardState.candidateConditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                serviceConnectedConditions={wizardState.serviceConnectedDisabilities}
                onRemove={() => handleRemoveCondition(condition.id, false)}
                isDenied={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Denied Conditions */}
      {wizardState.deniedConditions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>❌</span>
            Denied Conditions ({wizardState.deniedConditions.length})
          </h3>
          <div className="grid gap-4">
            {wizardState.deniedConditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                serviceConnectedConditions={wizardState.serviceConnectedDisabilities}
                onRemove={() => handleRemoveCondition(condition.id, true)}
                isDenied={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allConditions.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Conditions Added Yet</h3>
          <p className="text-gray-600 mb-6">
            Add conditions you want to explore for service connection
          </p>
        </div>
      )}

      {/* Add Condition Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Condition</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Condition Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Sleep Apnea, Knee Pain, Depression"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Claim Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ClaimStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="planned">Planned - Considering filing</option>
                  <option value="filed">Filed - Currently under review</option>
                  <option value="denied">Denied - Previously denied by VA</option>
                </select>
              </div>

              {/* Service Connection Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Connection Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as ServiceConnectionType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="direct">Direct - Caused by military service</option>
                  <option value="secondary">Secondary - Caused by service-connected condition</option>
                  <option value="aggravation">Aggravation - Pre-existing condition worsened by service</option>
                  <option value="presumptive">Presumptive - Agent Orange, Gulf War, PACT Act, etc.</option>
                </select>
              </div>

              {/* Primary Condition (for secondary) */}
              {formData.connectionType === 'secondary' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Service-Connected Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.primaryConditionId}
                    onChange={(e) => setFormData({ ...formData, primaryConditionId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select the condition this is secondary to</option>
                    {wizardState.serviceConnectedDisabilities.map(condition => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name} ({condition.currentRating}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This condition must be caused or aggravated by an already service-connected condition
                  </p>
                </div>
              )}

              {/* Diagnosed in Service */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="diagnosedInService"
                  checked={formData.diagnosedInService}
                  onChange={(e) => setFormData({ ...formData, diagnosedInService: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="diagnosedInService" className="text-sm text-gray-700">
                  <span className="font-semibold">Was this condition diagnosed during military service?</span>
                  <p className="text-xs text-gray-500 mt-1">
                    This strengthens your direct service connection claim
                  </p>
                </label>
              </div>

              {/* Service History */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Connection Details
                </label>
                <textarea
                  value={formData.serviceHistory}
                  onChange={(e) => setFormData({ ...formData, serviceHistory: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe how this condition is related to your military service or service-connected condition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Any additional details about this condition"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddCondition}
                  disabled={!formData.name || (formData.connectionType === 'secondary' && !formData.primaryConditionId)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold"
                >
                  Add Condition
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
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
        <button
          onClick={onPrevious}
          className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2"
        >
          <span>←</span>
          Back
        </button>
        <div className="text-center">
          <div className="text-sm text-gray-600">
            {allConditions.length} condition(s) added • Optional step
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          Continue to AI Suggestions
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

// Condition Card Component
interface ConditionCardProps {
  condition: Disability;
  serviceConnectedConditions: Disability[];
  onRemove: () => void;
  isDenied: boolean;
}

const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  serviceConnectedConditions,
  onRemove,
  isDenied,
}) => {
  const primaryCondition = condition.primaryConditionIds.length > 0
    ? serviceConnectedConditions.find(c => c.id === condition.primaryConditionIds[0])
    : null;

  const getConnectionTypeLabel = (type: ServiceConnectionType) => {
    switch (type) {
      case 'direct': return '⚡ Direct';
      case 'secondary': return '🔗 Secondary';
      case 'aggravation': return '📈 Aggravation';
      case 'presumptive': return '🌿 Presumptive';
      default: return type;
    }
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${
      isDenied
        ? 'bg-red-50 border-red-300'
        : 'bg-blue-50 border-blue-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-bold text-gray-900">{condition.name}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDenied
                ? 'bg-red-200 text-red-800'
                : 'bg-blue-200 text-blue-800'
            }`}>
              {isDenied ? 'DENIED' : condition.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Type:</span>
              <span className="text-gray-900">{getConnectionTypeLabel(condition.serviceConnectionType)}</span>
            </div>

            {primaryCondition && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Secondary to:</span>
                <span className="bg-green-100 px-2 py-1 rounded text-green-800 font-medium">
                  {primaryCondition.name} ({primaryCondition.currentRating}%)
                </span>
              </div>
            )}

            {condition.diagnosedInService && (
              <div className="flex items-center gap-2 text-green-700">
                <span>✓</span>
                <span>Diagnosed in service</span>
              </div>
            )}

            {condition.serviceHistory && (
              <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                <p className="text-gray-700">{condition.serviceHistory}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onRemove}
          className="ml-4 text-red-600 hover:text-red-800 font-bold text-xl"
          aria-label={`Remove ${condition.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
