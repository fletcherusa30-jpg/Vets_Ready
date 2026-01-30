/**
 * SCANNER DIAGNOSTIC PAGE
 *
 * This page provides comprehensive diagnostic information about all scanners.
 * Use this to troubleshoot scanner issues and verify proper configuration.
 */

import React, { useState, useEffect } from 'react';
import {
  getScannerHealth,
  runScannerDiagnostics,
  listScannerJobs,
  ScannerJob,
  ScannerDiagnostic,
  runBOMScanner,
  runForensicScanner,
  runProjectScanner,
  getScannerStatus,
} from '../services/scannerAPI';

export const ScannerDiagnosticsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<ScannerDiagnostic | null>(null);
  const [jobs, setJobs] = useState<ScannerJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthData, jobsData] = await Promise.all([
        getScannerHealth(),
        listScannerJobs(),
      ]);
      setHealth(healthData);
      setJobs(jobsData.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await runScannerDiagnostics();
      setDiagnostics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagnostics failed');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async (type: 'bom' | 'forensic' | 'project') => {
    try {
      let response;
      switch (type) {
        case 'bom':
          response = await runBOMScanner();
          break;
        case 'forensic':
          response = await runForensicScanner();
          break;
        case 'project':
          response = await runProjectScanner();
          break;
      }
      alert(`Scanner started: ${response.job_id}`);
      loadData();
    } catch (err) {
      alert(`Failed to start scanner: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner Diagnostics</h1>
          <p className="text-gray-600">
            Troubleshoot scanner issues and verify proper configuration
          </p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Scanner Service Health</h2>
          {health ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 font-medium">Status</div>
                <div className="text-2xl font-bold text-green-900">{health.status}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700 font-medium">Active Jobs</div>
                <div className="text-2xl font-bold text-blue-900">{health.active_jobs}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-700 font-medium">Total Jobs</div>
                <div className="text-2xl font-bold text-purple-900">{health.total_jobs}</div>
              </div>
              <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 font-medium">Project Root</div>
                <div className="text-lg font-mono text-gray-900">{health.project_root}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Exists: {health.project_root_exists ? '✅ Yes' : '❌ No'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading health status...</p>
          )}
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Health Status
          </button>
        </div>

        {/* Diagnostic Tools */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Run Diagnostics</h2>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Running Diagnostics...' : 'Run Full Diagnostic Check'}
          </button>

          {diagnostics && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-2">Diagnostic Results</h3>

              {/* Folder Checks */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">📁 Folder Checks</h4>
                <div className="space-y-1">
                  {diagnostics.folders_checked.map((folder) => (
                    <div key={folder} className="flex items-center gap-2">
                      <span className="text-2xl">
                        {diagnostics.folders_exist[folder] ? '✅' : '❌'}
                      </span>
                      <span className="font-mono text-sm">{folder}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {diagnostics.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-red-700 mb-2">❌ Errors ({diagnostics.errors.length})</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.errors.map((err, i) => (
                      <li key={i} className="text-red-700 text-sm">{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {diagnostics.warnings.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">⚠️ Warnings ({diagnostics.warnings.length})</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.warnings.map((warn, i) => (
                      <li key={i} className="text-yellow-700 text-sm">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Files Found */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">Files in Upload Directory</div>
                <div className="text-2xl font-bold text-gray-900">{diagnostics.files_found}</div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Scanner Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Scanner Controls</h2>
          <p className="text-gray-600 mb-4">
            Manually trigger scanners to verify they're working properly
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => startScanner('bom')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              🔍 Run BOM Scanner
            </button>
            <button
              onClick={() => startScanner('forensic')}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              🔬 Run Forensic Scanner
            </button>
            <button
              onClick={() => startScanner('project')}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              📊 Run Project Scanner
            </button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Scanner Jobs</h2>
          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.slice(0, 10).map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{job.type.toUpperCase()}</span>
                      <span className="text-gray-500 text-sm ml-2">{job.id}</span>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>Progress: {job.progress}%</div>
                    <div>Created: {new Date(job.created_at).toLocaleString()}</div>
                  </div>
                  {job.message && (
                    <div className="mt-2 text-sm text-gray-700">{job.message}</div>
                  )}
                  {job.error && (
                    <div className="mt-2 text-sm text-red-700">Error: {job.error}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No scanner jobs found</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <strong>Error:</strong> {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || colors.pending}`}>
      {status}
    </span>
  );
};
