/**
 * SCANNER HEALTH DASHBOARD
 *
 * Real-time monitoring of scanner system health
 * Shows status, metrics, errors, and self-healing actions
 */

import React, { useState, useEffect } from 'react';
import './ScannerHealthDashboard.css';

interface ScannerStatus {
  type: string;
  name: string;
  status: 'healthy' | 'degraded' | 'error';
  lastScan: string | null;
  lastResult: 'success' | 'failed' | null;
  lastError: string | null;
  fileCount: number;
  successRate: number;
  avgConfidence: number;
}

interface ScanJob {
  job_id: string;
  scanner_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

interface HealthMetrics {
  status: 'healthy' | 'degraded';
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  running_jobs: number;
  pending_jobs: number;
  success_rate: number;
  uptime: string;
}

const ScannerHealthDashboard: React.FC = () => {
  const [scanners, setScanners] = useState<ScannerStatus[]>([]);
  const [recentJobs, setRecentJobs] = useState<ScanJob[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchScannerHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchScannerHealth, 30000); // 30s refresh
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchScannerHealth = async () => {
    try {
      const response = await fetch('/api/scan/health');
      const data = await response.json();

      setHealthMetrics(data);

      // Build scanner status from health data
      const scannerStatuses: ScannerStatus[] = [
        {
          type: 'dd214',
          name: 'DD-214 Scanner',
          status: data.last_scans?.dd214?.status || 'healthy',
          lastScan: data.last_scans?.dd214?.timestamp || null,
          lastResult: data.last_scans?.dd214?.result || null,
          lastError: data.last_scans?.dd214?.error || null,
          fileCount: data.last_scans?.dd214?.file_count || 0,
          successRate: data.last_scans?.dd214?.success_rate || 0,
          avgConfidence: data.last_scans?.dd214?.avg_confidence || 0
        },
        {
          type: 'str',
          name: 'STR Scanner',
          status: data.last_scans?.str?.status || 'healthy',
          lastScan: data.last_scans?.str?.timestamp || null,
          lastResult: data.last_scans?.str?.result || null,
          lastError: data.last_scans?.str?.error || null,
          fileCount: data.last_scans?.str?.file_count || 0,
          successRate: data.last_scans?.str?.success_rate || 0,
          avgConfidence: data.last_scans?.str?.avg_confidence || 0
        },
        {
          type: 'rating',
          name: 'Rating Decision Scanner',
          status: data.last_scans?.rating?.status || 'healthy',
          lastScan: data.last_scans?.rating?.timestamp || null,
          lastResult: data.last_scans?.rating?.result || null,
          lastError: data.last_scans?.rating?.error || null,
          fileCount: data.last_scans?.rating?.file_count || 0,
          successRate: data.last_scans?.rating?.success_rate || 0,
          avgConfidence: data.last_scans?.rating?.avg_confidence || 0
        },
        {
          type: 'project',
          name: 'Project Scanner',
          status: data.last_scans?.project?.status || 'healthy',
          lastScan: data.last_scans?.project?.timestamp || null,
          lastResult: data.last_scans?.project?.result || null,
          lastError: data.last_scans?.project?.error || null,
          fileCount: data.last_scans?.project?.file_count || 0,
          successRate: data.last_scans?.project?.success_rate || 0,
          avgConfidence: data.last_scans?.project?.avg_confidence || 0
        }
      ];

      setScanners(scannerStatuses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch scanner health:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'degraded':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchScannerHealth();
  };

  if (loading) {
    return (
      <div className="scanner-health-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading scanner health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-health-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🔍 Scanner Health Dashboard</h1>
          <p className="subtitle">Real-time monitoring of document scanner system</p>
        </div>
        <div className="header-right">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
        </div>
      </div>

      {/* Overall System Health */}
      {healthMetrics && (
        <div className="system-health-card">
          <h2>System Health</h2>
          <div className="health-grid">
            <div className="health-metric">
              <div className="metric-icon" style={{ color: getStatusColor(healthMetrics.status) }}>
                {getStatusIcon(healthMetrics.status)}
              </div>
              <div className="metric-details">
                <span className="metric-label">Status</span>
                <span className="metric-value" style={{ color: getStatusColor(healthMetrics.status) }}>
                  {healthMetrics.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-details">
                <span className="metric-label">Total Jobs</span>
                <span className="metric-value">{healthMetrics.total_jobs}</span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">✅</div>
              <div className="metric-details">
                <span className="metric-label">Completed</span>
                <span className="metric-value">{healthMetrics.completed_jobs}</span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">❌</div>
              <div className="metric-details">
                <span className="metric-label">Failed</span>
                <span className="metric-value">{healthMetrics.failed_jobs}</span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">⏳</div>
              <div className="metric-details">
                <span className="metric-label">Running</span>
                <span className="metric-value">{healthMetrics.running_jobs}</span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">📈</div>
              <div className="metric-details">
                <span className="metric-label">Success Rate</span>
                <span className="metric-value success-rate">
                  {(healthMetrics.success_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">⏱️</div>
              <div className="metric-details">
                <span className="metric-label">Uptime</span>
                <span className="metric-value">{healthMetrics.uptime}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Scanner Status Cards */}
      <div className="scanners-grid">
        {scanners.map((scanner) => (
          <div key={scanner.type} className="scanner-card">
            <div className="scanner-header">
              <h3>{scanner.name}</h3>
              <div
                className="status-badge"
                style={{ backgroundColor: getStatusColor(scanner.status) }}
              >
                {getStatusIcon(scanner.status)} {scanner.status.toUpperCase()}
              </div>
            </div>

            <div className="scanner-metrics">
              <div className="metric-row">
                <span className="metric-label">Last Scan:</span>
                <span className="metric-value">{formatTimestamp(scanner.lastScan)}</span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Last Result:</span>
                <span className={`metric-value result-${scanner.lastResult}`}>
                  {scanner.lastResult ? scanner.lastResult.toUpperCase() : 'N/A'}
                </span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Files Processed:</span>
                <span className="metric-value">{scanner.fileCount}</span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Success Rate:</span>
                <span className="metric-value">
                  {(scanner.successRate * 100).toFixed(1)}%
                </span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Avg Confidence:</span>
                <span className="metric-value confidence">
                  {(scanner.avgConfidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {scanner.lastError && (
              <div className="error-box">
                <strong>Last Error:</strong>
                <p>{scanner.lastError}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity Log */}
      <div className="activity-log-card">
        <h2>Recent Scan Activity</h2>
        <div className="activity-log">
          {recentJobs.length === 0 ? (
            <p className="no-activity">No recent scan activity</p>
          ) : (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Scanner Type</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.job_id}>
                    <td className="job-id">{job.job_id.substring(0, 8)}...</td>
                    <td>{job.scanner_type.toUpperCase()}</td>
                    <td>
                      <span className={`status-badge status-${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{formatTimestamp(job.started_at)}</td>
                    <td>{formatTimestamp(job.completed_at)}</td>
                    <td className="error-cell">{job.error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Self-Healing Actions (Future) */}
      <div className="self-healing-card">
        <h2>🔧 Self-Healing Actions</h2>
        <p className="coming-soon">Auto-repair actions will appear here</p>
      </div>
    </div>
  );
};

export default ScannerHealthDashboard;
