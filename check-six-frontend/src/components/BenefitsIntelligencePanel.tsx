/**
 * Benefits Page Intelligence Integration
 * Shows eligibility predictions and evidence gap analysis
 */

import React, { useState } from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import { useIntelligence } from '../../contexts/IntelligenceContext';

export const BenefitsIntelligencePanel: React.FC = () => {
  const { profile } = useVeteranProfile();
  const { predictEligibility, analyzeEvidenceGaps, loading, error, clearError } = useIntelligence();
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [evidenceGaps, setEvidenceGaps] = useState<any>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile.id) {
      loadIntelligence();
    }
  }, [profile.id]);

  const loadIntelligence = async () => {
    try {
      const [eligibility, gaps] = await Promise.all([
        predictEligibility(profile),
        analyzeEvidenceGaps(profile)
      ]);
      setEligibilityData(eligibility);
      setEvidenceGaps(gaps);
    } catch (err) {
      console.error('Failed to load intelligence:', err);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Eligibility Predictions */}
      {eligibilityData && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Benefit Eligibility Analysis</h3>
          <div className="space-y-3">
            {eligibilityData.predictions?.map((pred: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                onClick={() => setExpandedBenefit(expandedBenefit === pred.type ? null : pred.type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pred.type}</h4>
                    <p className="text-gray-600 text-sm mt-1">{pred.description}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      pred.eligible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pred.eligible ? '✓ Eligible' : 'Not eligible'}
                    </div>
                    {pred.estimatedValue && (
                      <p className="text-green-700 font-bold text-lg mt-1">
                        ${pred.estimatedValue}/mo
                      </p>
                    )}
                  </div>
                </div>

                {expandedBenefit === pred.type && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {pred.requirements && (
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm mb-2">Requirements Met:</h5>
                        <ul className="space-y-1">
                          {pred.requirements.map((req: any, i: number) => (
                            <li key={i} className="text-sm text-gray-700">
                              {req.met ? '✓' : '✗'} {req.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pred.nextSteps && (
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm mb-2">Recommended Next Steps:</h5>
                        <ol className="space-y-1">
                          {pred.nextSteps.map((step: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700">
                              {i + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {pred.blockers && pred.blockers.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <h5 className="font-semibold text-yellow-900 text-sm mb-1">Potential Blockers:</h5>
                        <ul className="text-xs text-yellow-800 space-y-1">
                          {pred.blockers.map((blocker: string, i: number) => (
                            <li key={i}>• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Gap Analysis */}
      {evidenceGaps && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Evidence Gap Analysis</h3>

          {evidenceGaps.gaps?.length > 0 ? (
            <div className="space-y-3">
              {evidenceGaps.gaps.map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className={`border-l-4 rounded-r-lg p-4 ${
                    gap.severity === 'critical'
                      ? 'border-l-red-500 bg-red-50'
                      : gap.severity === 'major'
                      ? 'border-l-yellow-500 bg-yellow-50'
                      : gap.severity === 'moderate'
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-gray-500 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {gap.severity === 'critical' ? '🔴' : gap.severity === 'major' ? '🟠' : gap.severity === 'moderate' ? '🔵' : '⚪'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{gap.description}</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        <strong>Severity:</strong> {gap.severity}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Impact:</strong> {gap.impact}
                      </p>
                      {gap.suggestedDocuments && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-700">Suggested Documents:</p>
                          <ul className="text-xs text-gray-600 mt-1 space-y-1">
                            {gap.suggestedDocuments.map((doc: string, i: number) => (
                              <li key={i}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-900 font-semibold">✓ No Critical Evidence Gaps</p>
              <p className="text-green-700 text-sm mt-1">Your documentation appears complete for benefits analysis</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-semibold mt-3">Analyzing your benefits eligibility...</p>
        </div>
      )}
    </div>
  );
};

export default BenefitsIntelligencePanel;
