/**
 * Claim Tracker Component
 * Track status of VA disability claims with timeline and explanations
 */

import React, { useState } from 'react';

export type ClaimStatus =
  | 'not-filed'
  | 'gathering-evidence'
  | 'submitted'
  | 'initial-review'
  | 'evidence-gathering'
  | 'review-of-evidence'
  | 'preparation-for-decision'
  | 'pending-decision-approval'
  | 'preparation-for-notification'
  | 'completed'
  | 'denied'
  | 'appealed';

export interface Claim {
  id: string;
  conditionName: string;
  claimType: 'original' | 'supplemental' | 'appeal' | 'increase';
  status: ClaimStatus;
  filedDate?: string;
  lastUpdate?: string;
  estimatedCompletionDate?: string;
  claimNumber?: string;
  notes: string;
  statusHistory: {
    status: ClaimStatus;
    date: string;
    notes?: string;
  }[];
}

export const ClaimTracker: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    conditionName: '',
    claimType: 'original' as Claim['claimType'],
    status: 'not-filed' as ClaimStatus,
    filedDate: '',
    claimNumber: '',
    notes: '',
  });

  const handleAddClaim = () => {
    if (!newClaim.conditionName) return;

    const claim: Claim = {
      id: Date.now().toString(),
      conditionName: newClaim.conditionName,
      claimType: newClaim.claimType,
      status: newClaim.status,
      filedDate: newClaim.filedDate || undefined,
      claimNumber: newClaim.claimNumber || undefined,
      notes: newClaim.notes,
      statusHistory: [{
        status: newClaim.status,
        date: new Date().toISOString(),
        notes: 'Claim added to tracker',
      }],
    };

    setClaims([...claims, claim]);
    setNewClaim({
      conditionName: '',
      claimType: 'original',
      status: 'not-filed',
      filedDate: '',
      claimNumber: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const handleUpdateStatus = (id: string, newStatus: ClaimStatus, notes?: string) => {
    setClaims(claims.map(claim => {
      if (claim.id === id) {
        return {
          ...claim,
          status: newStatus,
          lastUpdate: new Date().toISOString(),
          statusHistory: [
            ...claim.statusHistory,
            {
              status: newStatus,
              date: new Date().toISOString(),
              notes,
            },
          ],
        };
      }
      return claim;
    }));
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter(c => c.id !== id));
  };

  const getStatusInfo = (status: ClaimStatus) => {
    const statusInfo: Record<ClaimStatus, { label: string; color: string; icon: string; explanation: string }> = {
      'not-filed': {
        label: 'Not Yet Filed',
        color: 'gray',
        icon: '📋',
        explanation: 'Claim has not been submitted to VA yet. Gather your evidence before filing.',
      },
      'gathering-evidence': {
        label: 'Gathering Evidence',
        color: 'yellow',
        icon: '📚',
        explanation: 'Collecting medical records, nexus opinions, and supporting documentation.',
      },
      'submitted': {
        label: 'Submitted',
        color: 'blue',
        icon: '📤',
        explanation: 'Claim has been submitted to VA and awaiting initial review.',
      },
      'initial-review': {
        label: 'Initial Review',
        color: 'blue',
        icon: '👀',
        explanation: 'VA is conducting initial review to determine what evidence is needed.',
      },
      'evidence-gathering': {
        label: 'Evidence Gathering',
        color: 'blue',
        icon: '🔍',
        explanation: 'VA is requesting medical records or scheduling C&P exams.',
      },
      'review-of-evidence': {
        label: 'Review of Evidence',
        color: 'indigo',
        icon: '⚖️',
        explanation: 'VA rater is reviewing all evidence to make a decision.',
      },
      'preparation-for-decision': {
        label: 'Preparation for Decision',
        color: 'purple',
        icon: '📝',
        explanation: 'VA has completed review and is preparing the decision letter.',
      },
      'pending-decision-approval': {
        label: 'Pending Decision Approval',
        color: 'purple',
        icon: '✅',
        explanation: 'Decision is awaiting supervisor approval before being finalized.',
      },
      'preparation-for-notification': {
        label: 'Preparation for Notification',
        color: 'purple',
        icon: '📬',
        explanation: 'Decision has been approved and notification letter is being prepared.',
      },
      'completed': {
        label: 'Completed',
        color: 'green',
        icon: '🎉',
        explanation: 'Decision has been issued. Check your decision letter for results.',
      },
      'denied': {
        label: 'Denied',
        color: 'red',
        icon: '❌',
        explanation: 'Claim was denied. You have options: Supplemental Claim, Higher-Level Review, or Board Appeal.',
      },
      'appealed': {
        label: 'Under Appeal',
        color: 'orange',
        icon: '⚖️',
        explanation: 'Claim decision is being appealed through AMA process.',
      },
    };

    return statusInfo[status];
  };

  const getProgressPercentage = (status: ClaimStatus): number => {
    const statusOrder: ClaimStatus[] = [
      'not-filed',
      'gathering-evidence',
      'submitted',
      'initial-review',
      'evidence-gathering',
      'review-of-evidence',
      'preparation-for-decision',
      'pending-decision-approval',
      'preparation-for-notification',
      'completed',
    ];

    const index = statusOrder.indexOf(status);
    if (status === 'denied' || status === 'appealed') return 100;
    return ((index + 1) / statusOrder.length) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Claim Tracker</h1>
        <p className="text-purple-100">
          Monitor the status of all your VA disability claims in one place
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
        <h3 className="font-bold text-lg text-purple-900 mb-2">📊 How to Track Claims</h3>
        <ul className="list-disc list-inside text-purple-800 space-y-1 text-sm">
          <li>Add each claim you've filed (or plan to file) to track its progress</li>
          <li>Update the status as your claim moves through the VA process</li>
          <li>Check VA.gov or call 1-800-827-1000 for official status updates</li>
          <li>Average processing time is 100-150 days, but can vary significantly</li>
          <li>You can track claims on VA.gov or through the VA mobile app</li>
        </ul>
      </div>

      {/* Add Claim Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Claims ({claims.length})</h2>
          <p className="text-gray-600">Track all submitted and planned claims</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Claim
        </button>
      </div>

      {/* Claims List */}
      {claims.length > 0 ? (
        <div className="space-y-6">
          {claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteClaim}
              getStatusInfo={getStatusInfo}
              getProgressPercentage={getProgressPercentage}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Claims Being Tracked</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your VA disability claims to monitor their progress
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold"
          >
            Add Your First Claim
          </button>
        </div>
      )}

      {/* Add Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Claim to Tracker</h3>
              <button
                onClick={() => setShowAddModal(false)}
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
                  value={newClaim.conditionName}
                  onChange={(e) => setNewClaim({...newClaim, conditionName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., PTSD, Lower Back Pain"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Claim Type
                </label>
                <select
                  value={newClaim.claimType}
                  onChange={(e) => setNewClaim({...newClaim, claimType: e.target.value as Claim['claimType']})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="original">Original Claim</option>
                  <option value="supplemental">Supplemental Claim</option>
                  <option value="increase">Increase (Higher Rating)</option>
                  <option value="appeal">Appeal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Status
                </label>
                <select
                  value={newClaim.status}
                  onChange={(e) => setNewClaim({...newClaim, status: e.target.value as ClaimStatus})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="not-filed">Not Yet Filed</option>
                  <option value="gathering-evidence">Gathering Evidence</option>
                  <option value="submitted">Submitted</option>
                  <option value="initial-review">Initial Review</option>
                  <option value="evidence-gathering">Evidence Gathering</option>
                  <option value="review-of-evidence">Review of Evidence</option>
                  <option value="preparation-for-decision">Preparation for Decision</option>
                  <option value="completed">Completed</option>
                  <option value="denied">Denied</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filed Date
                  </label>
                  <input
                    type="date"
                    value={newClaim.filedDate}
                    onChange={(e) => setNewClaim({...newClaim, filedDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Claim Number
                  </label>
                  <input
                    type="text"
                    value={newClaim.claimNumber}
                    onChange={(e) => setNewClaim({...newClaim, claimNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newClaim.notes}
                  onChange={(e) => setNewClaim({...newClaim, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any additional notes about this claim..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddClaim}
                  disabled={!newClaim.conditionName}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Add Claim
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Claim Card Component
interface ClaimCardProps {
  claim: Claim;
  onUpdateStatus: (id: string, status: ClaimStatus, notes?: string) => void;
  onDelete: (id: string) => void;
  getStatusInfo: (status: ClaimStatus) => { label: string; color: string; icon: string; explanation: string };
  getProgressPercentage: (status: ClaimStatus) => number;
}

const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  onUpdateStatus,
  onDelete,
  getStatusInfo,
  getProgressPercentage,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState(claim.status);
  const [statusNotes, setStatusNotes] = useState('');

  const statusInfo = getStatusInfo(claim.status);
  const progress = getProgressPercentage(claim.status);

  const handleUpdate = () => {
    onUpdateStatus(claim.id, newStatus, statusNotes);
    setStatusNotes('');
    setShowUpdateModal(false);
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${
      statusInfo.color === 'green' ? 'border-green-400' :
      statusInfo.color === 'red' ? 'border-red-400' :
      'border-gray-300'
    }`}>
      <div className="p-6 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{claim.conditionName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                statusInfo.color === 'green' ? 'bg-green-200 text-green-800' :
                statusInfo.color === 'red' ? 'bg-red-200 text-red-800' :
                statusInfo.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                statusInfo.color === 'purple' ? 'bg-purple-200 text-purple-800' :
                statusInfo.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {claim.claimType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{statusInfo.icon}</span>
              <span className="font-semibold text-gray-900">{statusInfo.label}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{statusInfo.explanation}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    statusInfo.color === 'green' ? 'bg-green-500' :
                    statusInfo.color === 'red' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {claim.filedDate && (
              <p className="text-sm text-gray-600">
                <strong>Filed:</strong> {new Date(claim.filedDate).toLocaleDateString()}
              </p>
            )}
            {claim.claimNumber && (
              <p className="text-sm text-gray-600">
                <strong>Claim #:</strong> {claim.claimNumber}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Update Status
            </button>
            <button
              onClick={() => onDelete(claim.id)}
              className="text-red-600 hover:text-red-800 font-bold text-xl px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Timeline */}
        {claim.statusHistory.length > 1 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              {expanded ? '▼ Hide Timeline' : '▶ Show Timeline'} ({claim.statusHistory.length} updates)
            </button>

            {expanded && (
              <div className="mt-4 pl-4 border-l-2 border-gray-300 space-y-3">
                {[...claim.statusHistory].reverse().map((history, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{getStatusInfo(history.status).label}</div>
                      <div className="text-gray-600">{new Date(history.date).toLocaleString()}</div>
                      {history.notes && <div className="text-gray-700 mt-1">{history.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Update Claim Status</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="not-filed">Not Yet Filed</option>
                  <option value="gathering-evidence">Gathering Evidence</option>
                  <option value="submitted">Submitted</option>
                  <option value="initial-review">Initial Review</option>
                  <option value="evidence-gathering">Evidence Gathering</option>
                  <option value="review-of-evidence">Review of Evidence</option>
                  <option value="preparation-for-decision">Preparation for Decision</option>
                  <option value="pending-decision-approval">Pending Decision Approval</option>
                  <option value="preparation-for-notification">Preparation for Notification</option>
                  <option value="completed">Completed</option>
                  <option value="denied">Denied</option>
                  <option value="appealed">Under Appeal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Any notes about this update..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
