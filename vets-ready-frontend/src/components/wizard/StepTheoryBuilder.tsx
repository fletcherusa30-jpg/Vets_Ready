/**
 * Step 4: Theory of Entitlement Builder
 *
 * Generates AI-powered theories of entitlement for each condition
 */

import React, { useState } from 'react';
import { WizardState, Disability, AiEntitlementTheory } from '../../types/wizard.types';

interface StepTheoryBuilderProps {
  wizardState: WizardState;
  updateWizardState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const StepTheoryBuilder: React.FC<StepTheoryBuilderProps> = ({
  wizardState,
  updateWizardState,
  onNext,
  onPrevious,
  isLoading,
  setIsLoading,
  error,
  setError,
}) => {
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const allConditions = [
    ...wizardState.candidateConditions,
    ...wizardState.deniedConditions,
  ];

  const handleGenerateTheory = async (condition: Disability) => {
    setGeneratingFor(condition.id);
    setError(null);

    try {
      // Expert stub: Integrate with OpenAI API or other LLM
      // Robust fallback: Simulate API call
      // Future: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTheory = generateMockTheory(condition, wizardState);

      // Update the condition with the theory
      const updateConditions = (conditions: Disability[]) =>
        conditions.map(c =>
          c.id === condition.id
            ? { ...c, aiTheory: mockTheory, updatedAt: new Date().toISOString() }
            : c
        );

      updateWizardState({
        candidateConditions: updateConditions(wizardState.candidateConditions),
        deniedConditions: updateConditions(wizardState.deniedConditions),
      });
    } catch (err) {
      setError('Failed to generate theory. Please try again.');
    } finally {
      setGeneratingFor(null);
    }
  };

  const generateMockTheory = (condition: Disability, state: WizardState): AiEntitlementTheory => {
    const isPrimary = condition.serviceConnectionType === 'direct';
    const primaryCondition = condition.primaryConditionIds.length > 0
      ? state.serviceConnectedDisabilities.find(c => c.id === condition.primaryConditionIds[0])
      : null;

    if (isPrimary) {
      return {
        primaryTheory: `Direct service connection for ${condition.name} is established through evidence of in-service incurrence or aggravation. The condition must have been diagnosed during service or manifested within a presumptive period post-discharge, with competent medical evidence linking the condition to a specific in-service event, injury, or exposure.`,
        alternativeTheories: [
          `Aggravation theory: If pre-existing, ${condition.name} was permanently worsened beyond natural progression due to military service.`,
        ],
        nexusRationale: {
          medicalBasis: `${condition.name} has established diagnostic criteria and can be linked to service through contemporaneous medical records, lay statements, and expert medical opinions establishing the nexus between service and the current disability.`,
          legalBasis: '38 CFR § 3.303 - Direct Service Connection requires: (1) Current disability, (2) In-service incurrence or aggravation, (3) Nexus linking the two.',
        },
        policyReferences: [
          {
            source: '38 CFR § 3.303',
            citation: 'Direct Service Connection',
            relevance: 'Establishes the three-element framework for proving direct service connection',
          },
          {
            source: 'M21-1, Part III, Subpart iv, Chapter 4',
            citation: 'Developing Claims for Service Connection',
            relevance: 'Provides guidance on evidence needed to establish service connection',
          },
        ],
        recommendedEvidence: [
          {
            type: 'medical',
            description: 'Current diagnosis from a qualified medical professional',
            priority: 'critical',
            whereToObtain: 'VA examination or private medical provider',
          },
          {
            type: 'medical',
            description: 'Medical nexus opinion linking current condition to in-service event',
            priority: 'critical',
            whereToObtain: 'IME (Independent Medical Exam) or DBQ (Disability Benefits Questionnaire)',
          },
          {
            type: 'service-records',
            description: 'Service medical records documenting in-service treatment or diagnosis',
            priority: 'high',
            whereToObtain: 'Request from National Personnel Records Center or eVetRecs',
          },
          {
            type: 'lay-statement',
            description: 'Buddy statements from fellow service members who witnessed symptoms',
            priority: 'medium',
            whereToObtain: 'VA Form 21-4138 - Statement in Support of Claim',
          },
        ],
        strengthAssessment: 'moderate',
        challenges: [
          'Lack of contemporaneous service medical records',
          'Need for medical nexus opinion if not diagnosed in service',
        ],
        opportunities: [
          'Lay testimony is competent evidence for observable symptoms',
          'Post-service medical records showing continuous treatment strengthen claim',
        ],
        nextSteps: [
          'Obtain current medical diagnosis',
          'Request service medical records',
          'Secure medical nexus opinion if diagnosed post-service',
          'Gather lay statements from service members or family',
        ],
        disclaimers: [
          'This is AI-generated educational content, not legal advice',
          'Consult with a VSO or VA-accredited attorney before filing',
          'Individual claim outcomes vary based on specific facts and evidence',
        ],
        generatedAt: new Date().toISOString(),
        modelVersion: 'mock-v1',
      };
    } else {
      // Secondary condition
      return {
        primaryTheory: `Secondary service connection for ${condition.name} can be established by proving it was caused or aggravated by the already service-connected condition: ${primaryCondition?.name}. This requires medical evidence establishing a causal nexus between the primary condition and the secondary condition.`,
        alternativeTheories: [
          `Aggravation theory: ${condition.name} existed prior to or independent of ${primaryCondition?.name}, but was permanently worsened by the primary condition.`,
        ],
        nexusRationale: {
          medicalBasis: `Medical literature supports that ${primaryCondition?.name} can cause or aggravate ${condition.name} through [physiological mechanism]. A medical nexus opinion should explain the causal relationship using the "at least as likely as not" standard (>50% probability).`,
          legalBasis: '38 CFR § 3.310(a) - Secondary service connection: A disability that is proximately due to or the result of a service-connected disease or injury shall be service connected.',
        },
        policyReferences: [
          {
            source: '38 CFR § 3.310(a)',
            citation: 'Disabilities That Are Proximately Due to, or Aggravated by, Service-Connected Disabilities',
            relevance: 'Legal basis for secondary service connection claims',
          },
          {
            source: 'Allen v. Brown, 7 Vet. App. 439 (1995)',
            citation: 'Secondary Service Connection Case Law',
            relevance: 'Establishes that VA must consider secondary service connection theories',
          },
        ],
        recommendedEvidence: [
          {
            type: 'medical',
            description: `Current diagnosis of ${condition.name}`,
            priority: 'critical',
            whereToObtain: 'VA examination or private medical provider',
          },
          {
            type: 'medical',
            description: `Medical nexus opinion linking ${condition.name} to ${primaryCondition?.name}`,
            priority: 'critical',
            whereToObtain: 'IME or DBQ from specialist familiar with both conditions',
          },
          {
            type: 'medical',
            description: `Treatment records showing ${condition.name} worsened after onset of ${primaryCondition?.name}`,
            priority: 'high',
            whereToObtain: 'Private medical records or VA treatment records',
          },
          {
            type: 'lay-statement',
            description: `Personal statement describing how ${primaryCondition?.name} affects daily life and led to ${condition.name}`,
            priority: 'medium',
            whereToObtain: 'VA Form 21-4138',
          },
        ],
        strengthAssessment: 'moderate',
        challenges: [
          'Must prove causal relationship, not just correlation',
          'May require specialist medical opinion',
          'Need to rule out other causes',
        ],
        opportunities: [
          'Well-established medical relationship between these conditions',
          'VA must consider secondary theories even if not explicitly claimed',
        ],
        nextSteps: [
          `Obtain diagnosis of ${condition.name}`,
          `Secure medical nexus opinion from provider familiar with both conditions`,
          `Document timeline showing ${condition.name} developed after ${primaryCondition?.name}`,
          'Gather any medical literature supporting the causal relationship',
        ],
        disclaimers: [
          'This is AI-generated educational content, not legal advice',
          'Secondary connection requires competent medical evidence',
          'Each claim is evaluated on its individual merits',
        ],
        generatedAt: new Date().toISOString(),
        modelVersion: 'mock-v1',
      };
    }
  };

  const conditionsWithTheories = allConditions.filter(c => c.aiTheory);
  const conditionsWithoutTheories = allConditions.filter(c => !c.aiTheory);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
        <div className="flex items-start">
          <span className="text-purple-600 text-3xl mr-3">⚖️</span>
          <div>
            <h3 className="font-bold text-lg text-purple-900 mb-2">
              Step 4: Build Theories of Entitlement
            </h3>
            <p className="text-purple-800 mb-2">
              For each condition, our AI will generate a comprehensive theory of entitlement that explains:
            </p>
            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
              <li>The legal framework for service connection (direct, secondary, aggravation, etc.)</li>
              <li>Medical nexus requirements and rationale</li>
              <li>Relevant CFR regulations and VA policy references</li>
              <li>Evidence you'll need to prove your claim</li>
              <li>Strength assessment and potential challenges</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conditions Without Theories */}
      {conditionsWithoutTheories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span>
            Conditions Needing Theories ({conditionsWithoutTheories.length})
          </h3>
          <div className="grid gap-4">
            {conditionsWithoutTheories.map(condition => (
              <div
                key={condition.id}
                className="bg-white border-2 border-gray-300 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{condition.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <strong>Type:</strong> {condition.serviceConnectionType}
                      </div>
                      {condition.primaryConditionIds.length > 0 && (
                        <div>
                          <strong>Secondary to:</strong>{' '}
                          {wizardState.serviceConnectedDisabilities
                            .find(c => c.id === condition.primaryConditionIds[0])?.name}
                        </div>
                      )}
                      <div>
                        <strong>Status:</strong> {condition.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateTheory(condition)}
                    disabled={generatingFor === condition.id}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                  >
                    {generatingFor === condition.id ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate Theory
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions With Theories */}
      {conditionsWithTheories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>✅</span>
            Completed Theories ({conditionsWithTheories.length})
          </h3>
          <div className="grid gap-4">
            {conditionsWithTheories.map(condition => (
              <TheoryCard
                key={condition.id}
                condition={condition}
                onRegenerate={() => handleGenerateTheory(condition)}
                isRegenerating={generatingFor === condition.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {allConditions.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Conditions to Analyze</h3>
          <p className="text-gray-600">
            Go back to Step 2 to add conditions you want to file for
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
          <div className="flex items-start">
            <span className="text-red-600 text-3xl mr-3">❌</span>
            <div>
              <h3 className="font-bold text-lg text-red-900 mb-2">Error</h3>
              <p className="text-red-800">{error}</p>
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
            {conditionsWithTheories.length} of {allConditions.length} theories generated • Optional step
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          Continue to Review
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

// Theory Card Component
interface TheoryCardProps {
  condition: Disability;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const TheoryCard: React.FC<TheoryCardProps> = ({ condition, onRegenerate, isRegenerating }) => {
  const [expanded, setExpanded] = useState(false);

  if (!condition.aiTheory) return null;

  const theory = condition.aiTheory;

  const getStrengthBadge = () => {
    switch (theory.strengthAssessment) {
      case 'strong':
        return <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
          STRONG
        </span>;
      case 'moderate':
        return <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold">
          MODERATE
        </span>;
      case 'weak':
        return <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">
          WEAK
        </span>;
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-purple-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold text-gray-900">{condition.name}</h4>
              {getStrengthBadge()}
              <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
                {condition.serviceConnectionType.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">{theory.primaryTheory}</p>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              disabled={isRegenerating}
              className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
            >
              {isRegenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
            </button>
            <div className="text-2xl text-gray-400">
              {expanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-purple-300 p-6 bg-white space-y-6">
          {/* Primary Theory */}
          <div>
            <h5 className="font-bold text-gray-900 mb-2">📜 Primary Theory</h5>
            <p className="text-gray-700 text-sm">{theory.primaryTheory}</p>
          </div>

          {/* Nexus Rationale */}
          {theory.nexusRationale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-gray-900 mb-2">🏥 Medical Basis</h5>
                <p className="text-gray-700 text-sm">{theory.nexusRationale.medicalBasis}</p>
              </div>
              <div>
                <h5 className="font-bold text-gray-900 mb-2">⚖️ Legal Basis</h5>
                <p className="text-gray-700 text-sm">{theory.nexusRationale.legalBasis}</p>
              </div>
            </div>
          )}

          {/* Policy References */}
          {theory.policyReferences && theory.policyReferences.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-3">📚 Policy References</h5>
              <div className="space-y-2">
                {theory.policyReferences.map((ref, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-300 rounded p-3">
                    <div className="font-semibold text-gray-900 text-sm">{ref.source}: {ref.citation}</div>
                    <div className="text-xs text-gray-600 mt-1">{ref.relevance}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Evidence */}
          {theory.recommendedEvidence && theory.recommendedEvidence.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-3">📋 Recommended Evidence</h5>
              <div className="space-y-2">
                {theory.recommendedEvidence.map((evidence, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-300 rounded p-3">
                    <div className="flex items-start gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        evidence.priority === 'critical' ? 'bg-red-200 text-red-800' :
                        evidence.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {evidence.priority.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{evidence.description}</span>
                    </div>
                    <div className="text-xs text-gray-600 ml-2">
                      <strong>Where to get it:</strong> {evidence.whereToObtain}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theory.challenges && theory.challenges.length > 0 && (
              <div>
                <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  Challenges
                </h5>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {theory.challenges.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
            {theory.opportunities && theory.opportunities.length > 0 && (
              <div>
                <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>✨</span>
                  Opportunities
                </h5>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {theory.opportunities.map((opportunity, idx) => (
                    <li key={idx}>{opportunity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Next Steps */}
          {theory.nextSteps && theory.nextSteps.length > 0 && (
            <div>
              <h5 className="font-bold text-gray-900 mb-2">🎯 Next Steps</h5>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                {theory.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
