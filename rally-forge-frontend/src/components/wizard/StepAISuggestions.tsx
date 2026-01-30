/**
 * Step 3: AI Secondary Condition Suggestions
 *
 * Displays AI-generated suggestions for secondary conditions based on service-connected disabilities
 */

import React, { useEffect } from 'react';
import { WizardState, Disability, AiSuggestion } from '../../types/wizard.types';

interface StepAISuggestionsProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const StepAISuggestions: React.FC<StepAISuggestionsProps> = ({
  wizardState,
  updateWizardState,
  onNext,
  onPrevious,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  // Generate suggestions on mount (mock for now)
  useEffect(() => {
    if (Object.keys(wizardState.aiSuggestions).length === 0) {
      generateSuggestions();
    }
  }, []);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      const mockSuggestions: Record<string, AiSuggestion[]> = {};

      wizardState.serviceConnectedDisabilities.forEach(condition => {
        // Mock suggestions based on condition name
        const suggestions = getMockSuggestionsForCondition(condition.name);
        if (suggestions.length > 0) {
          mockSuggestions[condition.id] = suggestions;
        }
      });

      updateWizardState({ aiSuggestions: mockSuggestions });
    } catch (err) {
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMockSuggestionsForCondition = (conditionName: string): AiSuggestion[] => {
    const lowerName = conditionName.toLowerCase();
    const suggestions: AiSuggestion[] = [];

    // PTSD-related
    if (lowerName.includes('ptsd') || lowerName.includes('stress')) {
      suggestions.push({
        conditionName: 'Sleep Apnea',
        commonality: 'very-common',
        medicalBasis: 'PTSD often causes sleep disturbances, hyperarousal, and nightmares, which can contribute to or worsen obstructive sleep apnea. Studies show veterans with PTSD have significantly higher rates of sleep apnea.',
        vaPatterns: 'Frequently granted as secondary to PTSD. Strong medical literature support.',
        confidence: 0.85,
      });
      suggestions.push({
        conditionName: 'Major Depressive Disorder',
        commonality: 'very-common',
        medicalBasis: 'PTSD and depression are highly comorbid conditions. The persistent stress, intrusive thoughts, and avoidance behaviors of PTSD often lead to or exacerbate depressive symptoms.',
        vaPatterns: 'Commonly granted as secondary to PTSD with supporting psychiatric evidence.',
        confidence: 0.90,
      });
      suggestions.push({
        conditionName: 'Gastroesophageal Reflux Disease (GERD)',
        commonality: 'common',
        medicalBasis: 'Chronic stress from PTSD can increase stomach acid production and affect digestive function. Anxiety and hypervigilance may also worsen GERD symptoms.',
        vaPatterns: 'Increasingly recognized secondary condition. Requires medical nexus opinion.',
        confidence: 0.65,
      });
    }

    // Knee/Joint conditions
    if (lowerName.includes('knee') || lowerName.includes('leg')) {
      suggestions.push({
        conditionName: 'Lower Back Pain',
        commonality: 'very-common',
        medicalBasis: 'Knee injuries often cause altered gait and biomechanics, leading to compensatory strain on the lower back. This is a well-established orthopedic relationship.',
        vaPatterns: 'Frequently granted with evidence of altered gait or biomechanical dysfunction.',
        confidence: 0.80,
      });
      suggestions.push({
        conditionName: 'Hip Pain (Same Side)',
        commonality: 'common',
        medicalBasis: 'Knee injuries cause compensatory stress on the hip joint of the same leg, leading to arthritis or bursitis over time.',
        vaPatterns: 'Commonly granted with orthopedic exam showing altered gait mechanics.',
        confidence: 0.75,
      });
    }

    // Back conditions
    if (lowerName.includes('back') || lowerName.includes('spine')) {
      suggestions.push({
        conditionName: 'Radiculopathy',
        commonality: 'very-common',
        medicalBasis: 'Spinal conditions often cause nerve compression, leading to radicular pain, numbness, or weakness in the extremities.',
        vaPatterns: 'Granted when MRI/EMG shows nerve root compression.',
        confidence: 0.85,
      });
      suggestions.push({
        conditionName: 'Sleep Disturbance',
        commonality: 'common',
        medicalBasis: 'Chronic pain from spinal conditions frequently disrupts sleep quality, leading to insomnia or other sleep disorders.',
        vaPatterns: 'Secondary claims for sleep issues due to pain are increasingly recognized.',
        confidence: 0.70,
      });
    }

    // Tinnitus/Hearing
    if (lowerName.includes('tinnitus') || lowerName.includes('hearing')) {
      suggestions.push({
        conditionName: 'Migraine Headaches',
        commonality: 'common',
        medicalBasis: 'Constant tinnitus can trigger or worsen migraines due to auditory overstimulation and stress.',
        vaPatterns: 'Recognized relationship, requires medical nexus linking tinnitus to migraine onset.',
        confidence: 0.60,
      });
    }

    return suggestions;
  };

  const handleAcceptSuggestion = (primaryConditionId: string, suggestion: AiSuggestion) => {
    // Add to candidate conditions
    const disability: Disability = {
      id: `suggested-${Date.now()}`,
      name: suggestion.conditionName,
      description: `AI-suggested secondary condition: ${suggestion.medicalBasis}`,
      serviceConnectionType: 'secondary',
      status: 'planned',
      isServiceConnected: false,
      primaryConditionIds: [primaryConditionId],
      secondaryConditionIds: [],
      diagnosedInService: false,
      worsenedOverTime: false,
      symptoms: [],
      treatments: [],
      nexusEvidence: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateWizardState({
      candidateConditions: [...wizardState.candidateConditions, disability],
    });

    // Remove from suggestions
    const updatedSuggestions = { ...wizardState.aiSuggestions };
    updatedSuggestions[primaryConditionId] = updatedSuggestions[primaryConditionId].filter(
      s => s.conditionName !== suggestion.conditionName
    );
    updateWizardState({ aiSuggestions: updatedSuggestions });
  };

  const handleDismissSuggestion = (primaryConditionId: string, suggestionName: string) => {
    const updatedSuggestions = { ...wizardState.aiSuggestions };
    updatedSuggestions[primaryConditionId] = updatedSuggestions[primaryConditionId].filter(
      s => s.conditionName !== suggestionName
    );
    updateWizardState({ aiSuggestions: updatedSuggestions });
  };

  const allSuggestionsCount = Object.values(wizardState.aiSuggestions).reduce(
    (sum, suggestions) => sum + suggestions.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-3xl mr-3">🤖</span>
          <div>
            <h3 className="font-bold text-lg text-blue-900 mb-2">
              Step 3: AI Secondary Condition Suggestions
            </h3>
            <p className="text-blue-800 mb-2">
              Based on your service-connected disabilities, our AI has identified potential secondary conditions
              that are medically recognized and have established patterns of VA approval.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Review each suggestion and its medical basis</li>
              <li>Accept suggestions to add them to your claim strategy</li>
              <li>Dismiss suggestions that don't apply to you</li>
              <li>You can always add custom conditions in the previous step</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-12 text-center">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Analyzing Your Conditions...</h3>
          <p className="text-gray-600">Our AI is reviewing medical literature and VA patterns</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
          <div className="flex items-start">
            <span className="text-red-600 text-3xl mr-3">❌</span>
            <div>
              <h3 className="font-bold text-lg text-red-900 mb-2">Error</h3>
              <p className="text-red-800">{error}</p>
              <button
                onClick={generateSuggestions}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && !error && (
        <>
          {wizardState.serviceConnectedDisabilities.map(primary => {
            const suggestions = wizardState.aiSuggestions[primary.id] || [];
            if (suggestions.length === 0) return null;

            return (
              <div key={primary.id} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="bg-green-100 px-4 py-2 rounded-lg">
                    {primary.name} ({primary.currentRating}%)
                  </span>
                  <span className="text-gray-600 text-base font-normal">
                    → {suggestions.length} suggested {suggestions.length === 1 ? 'condition' : 'conditions'}
                  </span>
                </h3>

                <div className="grid gap-4">
                  {suggestions.map((suggestion, idx) => (
                    <SuggestionCard
                      key={idx}
                      suggestion={suggestion}
                      onAccept={() => handleAcceptSuggestion(primary.id, suggestion)}
                      onDismiss={() => handleDismissSuggestion(primary.id, suggestion.conditionName)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* No Suggestions */}
          {allSuggestionsCount === 0 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Additional Suggestions</h3>
              <p className="text-gray-600">
                Our AI didn't find common secondary conditions for your current service-connected disabilities.
                You can still add conditions manually in Step 2.
              </p>
            </div>
          )}
        </>
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
            {allSuggestionsCount} suggestion(s) remaining • Optional step
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          Continue to Theory Builder
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: AiSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onAccept, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  const getCommonalityBadge = () => {
    switch (suggestion.commonality) {
      case 'very-common':
        return <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
          VERY COMMON
        </span>;
      case 'common':
        return <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
          COMMON
        </span>;
      case 'possible':
        return <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold">
          POSSIBLE
        </span>;
      case 'rare':
        return <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold">
          RARE
        </span>;
    }
  };

  const getConfidenceBar = () => {
    const percentage = Math.round(suggestion.confidence * 100);
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              percentage >= 75 ? 'bg-green-500' :
              percentage >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-bold text-gray-900">{suggestion.conditionName}</h4>
            {getCommonalityBadge()}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <strong>AI Confidence:</strong>
            <div className="mt-1">{getConfidenceBar()}</div>
          </div>
        </div>
      </div>

      {/* Medical Basis */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>🏥</span>
          Medical Basis
        </h5>
        <p className="text-sm text-gray-700">{suggestion.medicalBasis}</p>
      </div>

      {/* VA Patterns */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>📊</span>
          VA Approval Patterns
        </h5>
        <p className="text-sm text-gray-700">{suggestion.vaPatterns}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          <span>✓</span>
          Accept & Add to Claims
        </button>
        <button
          onClick={onDismiss}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
