/**
 * Claims Page Intelligence Integration
 * Shows automation workflows, document tracking, and claim progression
 */

import React, { useState } from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import { useIntelligence } from '../../contexts/IntelligenceContext';

export const ClaimsIntelligencePanel: React.FC = () => {
  const { profile } = useVeteranProfile();
  const { executeWorkflow, getWorkflows, loading, error, clearError } = useIntelligence();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  React.useEffect(() => {
    const available = getWorkflows();
    setWorkflows(available);
  }, [getWorkflows]);

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      setExecuting(true);
      await executeWorkflow(workflowId, profile);
      alert('Workflow initiated successfully!');
      setSelectedWorkflow(null);
    } catch (err) {
      console.error('Workflow execution error:', err);
    } finally {
      setExecuting(false);
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

      {/* Automated Workflows */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Automation Workflows</h3>
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{workflow.description}</p>

                  {/* Workflow Steps */}
                  {workflow.steps && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Process Steps:</p>
                      <div className="space-y-1">
                        {workflow.steps.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-center leading-5 font-bold">
                              {idx + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automation Type */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workflow.automated && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                        🚀 Automated
                      </span>
                    )}
                    {workflow.requiresApproval && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        ✓ Requires Review
                      </span>
                    )}
                    {!workflow.automated && !workflow.requiresApproval && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                        ✍️ Manual Steps
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteWorkflow(workflow.id)}
                  disabled={executing || loading}
                  className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {executing ? 'Starting...' : 'Start'}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedWorkflow === workflow.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {workflow.outputs && (
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm mb-2">Generated Outputs:</h5>
                      <ul className="space-y-1">
                        {workflow.outputs.map((output: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">
                            • {output}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {workflow.requirements && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <h5 className="font-semibold text-blue-900 text-sm mb-2">Requirements:</h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {workflow.requirements.map((req: string, i: number) => (
                          <li key={i}>• {req}</li>
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

      {/* Evidence Tracking */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Document Tracking</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {profile.conditions?.map((condition: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div>
                  <p className="font-medium text-gray-900">{condition.name}</p>
                  <p className="text-xs text-gray-600">
                    Rating: {condition.rating}% | Code: {condition.diagnosticCode || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    condition.hasAllDocuments
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {condition.hasAllDocuments ? '✓ Complete' : '⚠️ Gaps'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claim Timeline */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Claim Timeline & Milestones</h3>
        <div className="space-y-3">
          {[
            { status: 'completed', name: 'Profile Created', date: 'Jan 28, 2026' },
            { status: 'completed', name: 'Documents Gathered', date: 'In Progress' },
            { status: 'pending', name: 'VA Submission', date: 'Next' },
            { status: 'pending', name: 'VA Review', date: 'Est. 3-6 months' },
            { status: 'pending', name: 'Decision Received', date: 'TBD' }
          ].map((milestone, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                milestone.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {milestone.status === 'completed' ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{milestone.name}</p>
                <p className="text-xs text-gray-600">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-semibold mt-3">Processing your claims data...</p>
        </div>
      )}
    </div>
  );
};

export default ClaimsIntelligencePanel;
