/**
 * STR ANALYSIS RESULTS PAGE
 *
 * Shows comprehensive analysis of uploaded Service Treatment Records.
 * Displays claim opportunities, timelines, evidence, and recommended actions.
 */

import React, { useState } from 'react';
import {
  STRDocument,
  ClaimOpportunity,
  getSTRProcessingSummary,
  buildSTRTimeline,
  TimelineEvent
} from '../MatrixEngine/strIntelligenceEngine';
import { DigitalTwin } from '../MatrixEngine/types/DigitalTwin';

interface STRAnalysisPageProps {
  strDoc: STRDocument;
  digitalTwin: DigitalTwin;
  onStartClaim: (opportunity: ClaimOpportunity) => void;
}

export const STRAnalysisPage: React.FC<STRAnalysisPageProps> = ({
  strDoc,
  digitalTwin,
  onStartClaim,
}) => {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'timeline' | 'entries' | 'summary'>('opportunities');

  const summary = getSTRProcessingSummary(strDoc);
  const timeline = buildSTRTimeline(strDoc);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">STR Analysis Results</h1>
              <p className="text-gray-700">{strDoc.fileName}</p>
              {strDoc.dateRange && (
                <p className="text-sm text-gray-600 mt-1">
                  Service Period: {new Date(strDoc.dateRange.start).toLocaleDateString()} - {new Date(strDoc.dateRange.end).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Analysis Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Medical Entries Found</div>
            <div className="text-3xl font-bold text-blue-600">{summary.totalEntries}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Claim Opportunities</div>
            <div className="text-3xl font-bold text-green-600">{summary.totalClaimOpportunities}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600">High Confidence Claims</div>
            <div className="text-3xl font-bold text-purple-600">{summary.highConfidenceOpportunities}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="text-sm text-gray-600">Body Systems Affected</div>
            <div className="text-3xl font-bold text-orange-600">{summary.bodySystemsAffected.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'opportunities', label: 'Claim Opportunities', count: summary.totalClaimOpportunities },
                { id: 'timeline', label: 'Medical Timeline', count: timeline.length },
                { id: 'entries', label: 'All Entries', count: summary.totalEntries },
                { id: 'summary', label: 'Summary' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'opportunities' && (
              <ClaimOpportunitiesTab
                opportunities={strDoc.claimOpportunities}
                onStartClaim={onStartClaim}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineTab timeline={timeline} />
            )}

            {activeTab === 'entries' && (
              <MedicalEntriesTab entries={strDoc.extractedEntries} />
            )}

            {activeTab === 'summary' && (
              <SummaryTab summary={summary} strDoc={strDoc} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Claim Opportunities Tab
 */
const ClaimOpportunitiesTab: React.FC<{
  opportunities: ClaimOpportunity[];
  onStartClaim: (opportunity: ClaimOpportunity) => void;
}> = ({ opportunities, onStartClaim }) => {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">No claim opportunities detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map(opportunity => (
        <div
          key={opportunity.id}
          className={`bg-gray-50 rounded-lg p-6 border-2 ${
            opportunity.confidence === 'high'
              ? 'border-green-300'
              : opportunity.confidence === 'medium'
              ? 'border-yellow-300'
              : 'border-gray-300'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{opportunity.condition}</h3>
                {opportunity.confidence === 'high' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    High Confidence
                  </span>
                )}
                {opportunity.alreadyClaimed && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    Already Claimed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>📂 {opportunity.bodySystem}</span>
                <span>🎯 {opportunity.opportunityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                {opportunity.cfrCode && <span>📋 CFR {opportunity.cfrCode}</span>}
              </div>
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded p-3">
              <div className="text-sm text-gray-600">Supporting Entries</div>
              <div className="text-2xl font-bold text-gray-900">{opportunity.supportingEntries.length}</div>
            </div>
            {opportunity.chronicityPattern.hasPattern && (
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">Chronicity Pattern</div>
                <div className="text-sm font-bold text-green-700">{opportunity.chronicityPattern.frequency}</div>
              </div>
            )}
            {opportunity.firstSymptomDate && (
              <div className="bg-white rounded p-3">
                <div className="text-sm text-gray-600">First Symptom</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(opportunity.firstSymptomDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-bold text-gray-900 mb-2">📦 Recommended Mission Pack:</h4>
            <p className="text-gray-700 mb-3">{opportunity.recommendedMissionPack}</p>

            <h4 className="font-bold text-gray-900 mb-2">📝 Suggested Lay Statements:</h4>
            <ul className="space-y-1 mb-3">
              {opportunity.suggestedLayStatements.map((statement, idx) => (
                <li key={idx} className="text-sm text-gray-700">• {statement}</li>
              ))}
            </ul>

            <h4 className="font-bold text-gray-900 mb-2">📄 Required Evidence:</h4>
            <ul className="space-y-1">
              {opportunity.requiredEvidence.map((evidence, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {evidence}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          {!opportunity.alreadyClaimed && (
            <button
              onClick={() => onStartClaim(opportunity)}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Claim for {opportunity.condition}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Timeline Tab
 */
const TimelineTab: React.FC<{ timeline: TimelineEvent[] }> = ({ timeline }) => {
  return (
    <div className="space-y-3">
      {timeline.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex-shrink-0 w-32 text-sm text-gray-600">
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${
              event.type === 'diagnosis' ? 'bg-red-500' :
              event.type === 'injury' ? 'bg-orange-500' :
              event.type === 'symptom' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{event.description}</div>
            <div className="text-sm text-gray-600 capitalize">{event.type.replace('_', ' ')}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Medical Entries Tab
 */
const MedicalEntriesTab: React.FC<{ entries: any[] }> = ({ entries }) => {
  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-bold text-gray-900">{new Date(entry.date).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600 capitalize">{entry.entryType.replace('_', ' ')}</div>
            </div>
            <div className="text-sm text-gray-500">Page {entry.page}</div>
          </div>
          {entry.chiefComplaint && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Chief Complaint: </span>
              <span className="text-gray-900">{entry.chiefComplaint}</span>
            </div>
          )}
          {entry.diagnosis && entry.diagnosis.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Diagnosis: </span>
              <span className="text-gray-900">{entry.diagnosis.join(', ')}</span>
            </div>
          )}
          {entry.symptoms && entry.symptoms.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Symptoms: </span>
              <span className="text-gray-900">{entry.symptoms.join(', ')}</span>
            </div>
          )}
          <div className="text-sm text-gray-600 bg-white rounded p-2 mt-2">
            {entry.rawText}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Summary Tab
 */
const SummaryTab: React.FC<{ summary: any; strDoc: STRDocument }> = ({ summary, strDoc }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Document Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">File Name</div>
            <div className="font-semibold text-gray-900">{strDoc.fileName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Page Count</div>
            <div className="font-semibold text-gray-900">{strDoc.pageCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Uploaded</div>
            <div className="font-semibold text-gray-900">{new Date(strDoc.uploadDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Processed</div>
            <div className="font-semibold text-gray-900">
              {strDoc.processedDate ? new Date(strDoc.processedDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Body Systems Affected</h3>
        <div className="flex flex-wrap gap-2">
          {summary.bodySystemsAffected.map((system: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {system}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Conditions Identified</h3>
        <div className="grid grid-cols-2 gap-2">
          {summary.uniqueConditions.map((condition: string, idx: number) => (
            <div key={idx} className="text-gray-700">• {condition}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
