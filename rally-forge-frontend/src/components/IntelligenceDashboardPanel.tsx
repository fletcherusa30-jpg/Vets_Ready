/**
 * Intelligence Dashboard Panel
 * Displays insights, predictions, and recommendations in the main dashboard
 */

import React from 'react';
import { useIntelligence, useInsights, usePredictions, useRecommendations } from '../../contexts/IntelligenceContext';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';

export const IntelligenceDashboardPanel: React.FC = () => {
  const { profile } = useVeteranProfile();
  const { loading, error, clearError } = useIntelligence();
  const { insights } = useInsights(profile.id || '');
  const { predictions } = usePredictions(profile.id || '');
  const { recommendations } = useRecommendations(profile.id || '');

  if (!profile.id) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-semibold">Complete your profile to see personalized insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-red-600 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-900 font-semibold">Intelligence Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-blue-900 font-semibold mt-3">Analyzing your profile...</p>
          <p className="text-blue-700 text-sm mt-1">Finding personalized benefits and opportunities</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Key Insights */}
          {insights.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.slice(0, 4).map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-l-4 border-blue-500 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                            {Math.round(insight.confidence)}% confidence
                          </span>
                          {insight.priority && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '🟢'} {insight.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {insights.length > 4 && (
                <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all {insights.length} insights →
                </button>
              )}
            </div>
          )}

          {/* Top Predictions */}
          {predictions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Benefit Predictions</h3>
              <div className="space-y-3">
                {predictions.slice(0, 3).map((pred, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{pred.type}</h4>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        pred.confidence >= 80 ? 'bg-green-100 text-green-800' :
                        pred.confidence >= 60 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.round(pred.confidence)}%
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{pred.explanation}</p>
                    {pred.nextSteps && pred.nextSteps.length > 0 && (
                      <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        <strong>Next step:</strong> {pred.nextSteps[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">✓ Recommended Actions</h3>
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 text-lg flex-shrink-0">✓</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{rec.action}</p>
                      {rec.impact && (
                        <p className="text-green-700 text-xs mt-1">
                          <strong>Impact:</strong> {rec.impact.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {insights.length === 0 && predictions.length === 0 && recommendations.length === 0 && (
            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-gray-900 font-semibold">No intelligence data available</p>
              <p className="text-gray-600 text-sm mt-1">Complete more of your profile to get personalized insights</p>
            </div>
          )}
        </>
      )}

      {/* Info Footer */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <strong>ℹ️ About Intelligence Platform:</strong> This data is automatically generated from your profile using advanced analysis. All information is analyzed locally and based only on data you've provided. <a href="/intelligence-help" className="underline hover:no-underline">Learn more</a>
      </div>
    </div>
  );
};

export default IntelligenceDashboardPanel;
