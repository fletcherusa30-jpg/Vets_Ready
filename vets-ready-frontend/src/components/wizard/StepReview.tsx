/**
 * Step 5: Review & Export
 *
 * Review all conditions, theories, and export claim strategy
 */

import React, { useState } from 'react';
import { WizardState, Disability, AiEntitlementTheory } from '../../types/wizard.types';

interface StepReviewProps {
  wizardState: WizardState;
  onPrevious: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  wizardState,
  onPrevious,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown'>('pdf');
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const allConditions = [
    ...wizardState.serviceConnectedDisabilities,
    ...wizardState.candidateConditions,
    ...wizardState.deniedConditions,
  ];

  const conditionsWithTheories = allConditions.filter(c => c.aiTheory);
  const totalPotentialRating = wizardState.candidateConditions.reduce((sum, c) => {
    if (c.aiTheory?.projectedRating) {
      return sum + c.aiTheory.projectedRating;
    }
    return sum;
  }, 0);

  const shouldRecommendProfessional = () => {
    const hasDenials = wizardState.deniedConditions.length > 0;
    const hasComplexSecondary = wizardState.candidateConditions.some(
      c => c.primaryConditionIds.length > 0
    );
    const isTDIUCandidate = wizardState.userPreferences.isTDIUCandidate;
    const totalConditions = allConditions.length;

    return {
      recommend: hasDenials || (totalConditions > 8) || isTDIUCandidate,
      reasons: [
        hasDenials && 'You have previously denied conditions that may require appeal',
        totalConditions > 8 && 'Your claim involves multiple conditions (complexity: high)',
        hasComplexSecondary && 'Complex secondary condition chains may benefit from expert review',
        isTDIUCandidate && 'TDIU eligibility determination requires careful documentation',
      ].filter(Boolean) as string[],
    };
  };

  const professionalRec = shouldRecommendProfessional();

  const handleExport = async (format: 'pdf' | 'markdown') => {
    // Expert stub: Implement export logic
    // For now, use existing markdown export and PDF export from exportService
    if (format === 'pdf') {
      await generatePDFExport(wizardState);
    } else {
      const content = generateMarkdown();
      // ...existing code...
    }

    if (format === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claim-strategy-${Date.now()}.md`;
      a.click();
    } else {
      // PDF export would use a library like jsPDF or pdfmake
      alert('PDF export coming soon! Please use Markdown for now.');
    }
  };

  const generateMarkdown = (): string => {
    let md = `# VA Disability Claim Strategy\n\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    md += `**Complexity:** ${wizardState.complexity}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Service-Connected Conditions:** ${wizardState.serviceConnectedDisabilities.length}\n`;
    md += `- **Planned/Current Claims:** ${wizardState.candidateConditions.length}\n`;
    md += `- **Denied Conditions:** ${wizardState.deniedConditions.length}\n`;
    md += `- **Projected Additional Rating:** ${totalPotentialRating}%\n\n`;

    if (wizardState.serviceConnectedDisabilities.length > 0) {
      md += `## Current Service-Connected Conditions\n\n`;
      wizardState.serviceConnectedDisabilities.forEach(c => {
        md += `### ${c.name}\n`;
        md += `- **Rating:** ${c.currentRating}%\n`;
        md += `- **Type:** ${c.serviceConnectionType}\n`;
        if (c.description) md += `- **Description:** ${c.description}\n`;
        md += `\n`;
      });
    }

    if (wizardState.candidateConditions.length > 0) {
      md += `## Planned/Current Claims\n\n`;
      wizardState.candidateConditions.forEach(c => {
        md += `### ${c.name}\n`;
        md += `- **Type:** ${c.serviceConnectionType}\n`;
        md += `- **Status:** ${c.status}\n`;

        if (c.primaryConditionIds.length > 0) {
          const primary = allConditions.find(x => x.id === c.primaryConditionIds[0]);
          if (primary) md += `- **Secondary to:** ${primary.name}\n`;
        }

        if (c.aiTheory) {
          md += `\n#### Theory of Entitlement\n\n`;
          md += `${c.aiTheory.primaryTheory}\n\n`;
          if (c.aiTheory.nexusRationale) {
            md += `**Medical Nexus:** ${c.aiTheory.nexusRationale.medicalBasis}\n\n`;
          }
          if (c.aiTheory.recommendedEvidence && c.aiTheory.recommendedEvidence.length > 0) {
            md += `**Recommended Evidence:**\n`;
            c.aiTheory.recommendedEvidence.forEach(ev => {
              md += `- ${ev.description} (Priority: ${ev.priority})\n`;
            });
            md += `\n`;
          }
        }
        md += `\n`;
      });
    }

    md += `\n---\n\n`;
    md += `**DISCLAIMER:** This is not legal advice. This strategy is generated using AI analysis and should be reviewed with a VSO, attorney, or qualified professional before filing.\n`;

    return md;
  };

  const handleSaveScenario = () => {
    if (!scenarioName) return;

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('wizard-scenarios') || '[]');
    saved.push({
      name: scenarioName,
      timestamp: new Date().toISOString(),
      state: wizardState,
    });
    localStorage.setItem('wizard-scenarios', JSON.stringify(saved));

    setShowSaveModal(false);
    setScenarioName('');
    alert(`Scenario "${scenarioName}" saved successfully!`);
  };

  return (
    <div className="space-y-8">
      {/* Professional Recommendation */}
      {professionalRec.recommend && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
          <div className="flex items-start">
            <span className="text-yellow-600 text-3xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold text-lg text-yellow-900 mb-2">
                Consider Professional Assistance
              </h3>
              <p className="text-yellow-800 mb-3">
                Based on your claim complexity, we recommend consulting with a Veterans Service Officer (VSO)
                or VA-accredited attorney:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {professionalRec.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-3">
                VSOs provide free assistance. Accredited attorneys work on contingency (max 33.33% of back pay).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <div className="text-4xl font-bold text-green-700 mb-2">
            {wizardState.serviceConnectedDisabilities.length}
          </div>
          <div className="text-sm text-green-900 font-semibold">Service-Connected</div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <div className="text-4xl font-bold text-blue-700 mb-2">
            {wizardState.candidateConditions.length}
          </div>
          <div className="text-sm text-blue-900 font-semibold">Planned/Current</div>
        </div>
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="text-4xl font-bold text-red-700 mb-2">
            {wizardState.deniedConditions.length}
          </div>
          <div className="text-sm text-red-900 font-semibold">Denied</div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
          <div className="text-4xl font-bold text-purple-700 mb-2">
            {conditionsWithTheories.length}
          </div>
          <div className="text-sm text-purple-900 font-semibold">With AI Theories</div>
        </div>
      </div>

      {/* Complexity Indicator */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Claim Complexity</h3>
            <p className="text-sm text-gray-600">Based on number of conditions, denials, and secondary chains</p>
          </div>
          <div className={`px-6 py-3 rounded-full font-bold text-lg ${
            wizardState.complexity === 'simple'
              ? 'bg-green-200 text-green-800'
              : wizardState.complexity === 'medium'
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-red-200 text-red-800'
          }`}>
            {wizardState.complexity.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Condition List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">All Conditions</h2>

        {allConditions.map((condition) => (
          <ConditionReviewCard key={condition.id} condition={condition} allConditions={allConditions} />
        ))}
      </div>

      {/* Export Section */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Your Claim Strategy</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">📄 Markdown Export</h3>
            <p className="text-sm text-gray-600">
              Text-based format that's easy to edit and share. Great for copying into emails or notes.
            </p>
            <button
              onClick={() => handleExport('markdown')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Download Markdown (.md)
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">📑 PDF Export</h3>
            <p className="text-sm text-gray-600">
              Professional format perfect for printing or submitting with your claim packet.
            </p>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              Download PDF (Coming Soon)
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <span>💾</span>
            Save Scenario for Later
          </button>
        </div>
      </div>

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Scenario</h3>
            <p className="text-gray-600 mb-4">
              Give this scenario a name so you can load it later to compare different strategies.
            </p>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., Sleep Apnea + Secondaries"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveScenario}
                disabled={!scenarioName}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold"
              >
                Cancel
              </button>
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
          <div className="text-sm text-green-600 font-bold">
            ✓ Review Complete
          </div>
        </div>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
        <h4 className="font-bold text-yellow-900 mb-2">⚖️ Important Disclaimer</h4>
        <p className="text-sm text-yellow-800">
          This claim strategy is generated using AI analysis and is intended as educational guidance only.
          It is NOT legal advice. Always consult with a Veterans Service Officer (VSO), VA-accredited attorney,
          or other qualified professional before filing claims. VetsReady is not responsible for claim outcomes.
        </p>
      </div>
    </div>
  );
};

// Condition Review Card Component
interface ConditionReviewCardProps {
  condition: Disability;
  allConditions: Disability[];
}

const ConditionReviewCard: React.FC<ConditionReviewCardProps> = ({ condition, allConditions }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = () => {
    if (condition.isServiceConnected) {
      return <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
        SERVICE-CONNECTED {condition.currentRating}%
      </span>;
    }
    if (condition.status === 'denied') {
      return <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold">DENIED</span>;
    }
    return <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">
      {condition.status.toUpperCase()}
    </span>;
  };

  const primaryConditions = condition.primaryConditionIds
    .map(id => allConditions.find(c => c.id === id))
    .filter(Boolean) as Disability[];

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{condition.name}</h3>
              {getStatusBadge()}
            </div>
            <div className="text-sm text-gray-600">
              {condition.serviceConnectionType} • {condition.aiTheory ? 'Has AI Theory' : 'No theory generated'}
            </div>
          </div>
          <div className="text-2xl text-gray-400">
            {expanded ? '▼' : '▶'}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-300 p-6 bg-gray-50 space-y-4">
          {primaryConditions.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">🔗 Secondary To:</h4>
              {primaryConditions.map(pc => (
                <div key={pc.id} className="bg-green-100 px-3 py-2 rounded inline-block mr-2">
                  {pc.name} ({pc.currentRating}%)
                </div>
              ))}
            </div>
          )}

          {condition.aiTheory && (
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">🤖 AI-Generated Theory of Entitlement</h4>

              <div className="space-y-3">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-1">Primary Theory:</h5>
                  <p className="text-gray-700 text-sm">{condition.aiTheory.primaryTheory}</p>
                </div>

                {condition.aiTheory.nexusRationale && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1">Medical Nexus:</h5>
                    <p className="text-gray-700 text-sm">{condition.aiTheory.nexusRationale.medicalBasis}</p>
                  </div>
                )}

                {condition.aiTheory.recommendedEvidence && condition.aiTheory.recommendedEvidence.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Recommended Evidence:</h5>
                    <ul className="space-y-1">
                      {condition.aiTheory.recommendedEvidence.map((ev, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            ev.priority === 'critical' ? 'bg-red-200 text-red-800' :
                            ev.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {ev.priority}
                          </span>
                          <span>{ev.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {condition.aiTheory.strengthAssessment && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">Strength:</span>
                    <span className={`px-3 py-1 rounded font-bold text-sm ${
                      condition.aiTheory.strengthAssessment === 'strong' ? 'bg-green-200 text-green-800' :
                      condition.aiTheory.strengthAssessment === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {condition.aiTheory.strengthAssessment.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!condition.aiTheory && (
            <div className="text-sm text-gray-500 italic">
              No AI theory generated for this condition. Run the Theory Builder step to generate.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
