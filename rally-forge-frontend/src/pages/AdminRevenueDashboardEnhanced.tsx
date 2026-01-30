/**
 * ADMIN REVENUE DASHBOARD - ENHANCED
 *
 * Comprehensive professional dashboard for monitoring and managing all revenue streams.
 * Features 9 specialized panels with military-themed UI.
 *
 * PANELS:
 * 1. Header Strip - 6 key metrics
 * 2. Revenue Streams Overview - Complete stream table
 * 3. Revenue Over Time Chart - Time-series visualization
 * 4. Opportunity Pipeline - Stage tracking
 * 5. Enterprise Leads - 11-stage pipeline
 * 6. Partner Performance - Click/conversion metrics
 * 7. Alerts & Suggestions - ARDE integration
 * 8. Logs & Audit Trail - System actions
 * 9. Quick Actions - Admin controls
 */

import React, { useEffect, useState } from 'react';
import ARDE from '../services/AutomaticRevenueDesignEngine';
import type { RevenueOpportunity, RevenuePerformanceMetrics } from '../services/AutomaticRevenueDesignEngine';

// ==================== TYPES ====================

interface RevenueStream {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Paused' | 'Experimental';
  revenue30Days: number;
  revenueYTD: number;
  trend: 'Up' | 'Down' | 'Flat';
  conversionRate: number;
  lastUpdated: Date;
}

interface EnterpriseLead {
  id: string;
  organizationName: string;
  type: 'State VA' | 'VSO' | 'Nonprofit' | 'University' | 'Employer' | 'Agency';
  region: string;
  stage: string;
  estimatedValue: number;
  probability: number;
  lastActivity: Date;
  nextStep: string;
  source: 'Auto-Detected' | 'Referral' | 'Manual';
  assignedOwner?: string;
}

interface Partner {
  id: string;
  name: string;
  category: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  status: 'Active' | 'Paused' | 'Pending';
}

interface Alert {
  id: string;
  type: 'opportunity' | 'performance' | 'system';
  severity: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  action: string;
  timestamp: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  actor: string; // 'System' | 'User:{name}'
  action: string;
  target: string;
  result: 'Success' | 'Failed' | 'Pending';
  details?: string;
}

// ==================== MILITARY THEME ====================

const MILITARY_THEME = {
  colors: {
    background: '#0A1F1A',
    surface: '#1A2F27',
    surfaceLight: '#2A3F37',
    primary: '#1B4332',
    secondary: '#2D6A4F',
    accent: '#40916C',
    success: '#52B788',
    warning: '#F77F00',
    danger: '#D62828',
    text: '#E8F5E9',
    textSecondary: '#A5D6A7',
    border: '#2D5A47',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
};

// ==================== UTILITY FUNCTIONS ====================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getTrendIcon = (trend: 'Up' | 'Down' | 'Flat'): string => {
  switch (trend) {
    case 'Up': return '↑';
    case 'Down': return '↓';
    case 'Flat': return '→';
  }
};

const getTrendColor = (trend: 'Up' | 'Down' | 'Flat'): string => {
  switch (trend) {
    case 'Up': return MILITARY_THEME.colors.success;
    case 'Down': return MILITARY_THEME.colors.danger;
    case 'Flat': return MILITARY_THEME.colors.textSecondary;
  }
};

// ==================== MAIN COMPONENT ====================

export const AdminRevenueDashboard: React.FC = () => {
  // State
  const [metrics, setMetrics] = useState<RevenuePerformanceMetrics | null>(null);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [enterpriseLeads, setEnterpriseLeads] = useState<EnterpriseLead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Header Metrics
  const [revenueYTD, setRevenueYTD] = useState(0);
  const [revenue30Days, setRevenue30Days] = useState(0);
  const [activeStreams, setActiveStreams] = useState(0);
  const [pendingOpportunities, setPendingOpportunities] = useState(0);
  const [enterpriseLeadCount, setEnterpriseLeadCount] = useState(0);
  const [avgConversionRate, setAvgConversionRate] = useState(0);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load ARDE metrics
      const ardeMetrics = ARDE.getMetrics();
      setMetrics(ardeMetrics);

      // Load revenue streams
      const response = await fetch('/api/revenue/streams');
      const streamsData: RevenueStream[] = await response.json();
      setRevenueStreams(streamsData);

      // Load opportunities
      const oppsResponse = await fetch('/api/revenue/opportunities');
      const oppsData: RevenueOpportunity[] = await oppsResponse.json();
      setOpportunities(oppsData);

      // Load enterprise leads
      const leadsResponse = await fetch('/api/revenue/enterprise-leads');
      const leadsData: EnterpriseLead[] = await leadsResponse.json();
      setEnterpriseLeads(leadsData);

      // Load partners
      const partnersResponse = await fetch('/api/revenue/partners');
      const partnersData: Partner[] = await partnersResponse.json();
      setPartners(partnersData);

      // Load alerts
      const alertsResponse = await fetch('/api/revenue/alerts');
      const alertsData: Alert[] = await alertsResponse.json();
      setAlerts(alertsData);

      // Load logs
      const logsResponse = await fetch('/api/revenue/logs?limit=50');
      const logsData: LogEntry[] = await logsResponse.json();
      setLogs(logsData);

      // Calculate header metrics
      calculateHeaderMetrics(streamsData, oppsData, leadsData);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setIsLoading(false);
    }
  };

  const calculateHeaderMetrics = (
    streams: RevenueStream[],
    opps: RevenueOpportunity[],
    leads: EnterpriseLead[]
  ) => {
    const ytd = streams.reduce((sum, s) => sum + s.revenueYTD, 0);
    const thirtyDay = streams.reduce((sum, s) => sum + s.revenue30Days, 0);
    const active = streams.filter(s => s.status === 'Active').length;
    const pending = opps.filter(o => o.status === 'pending').length;
    const avgConv = streams.length > 0
      ? streams.reduce((sum, s) => sum + (s.conversionRate || 0), 0) / streams.length
      : 0;

    setRevenueYTD(ytd);
    setRevenue30Days(thirtyDay);
    setActiveStreams(active);
    setPendingOpportunities(pending);
    setEnterpriseLeadCount(leads.length);
    setAvgConversionRate(avgConv);
  };

  // ==================== HEADER STRIP ====================

  const renderHeaderStrip = () => (
    <div style={styles.headerStrip}>
      <MetricCard
        title="Total Revenue (YTD)"
        value={formatCurrency(revenueYTD)}
        trend="Up"
        color={MILITARY_THEME.colors.success}
        onClick={() => setDateRange('ytd')}
      />
      <MetricCard
        title="Revenue (Last 30 Days)"
        value={formatCurrency(revenue30Days)}
        trend="Up"
        color={MILITARY_THEME.colors.accent}
        onClick={() => setDateRange('30d')}
      />
      <MetricCard
        title="Active Revenue Streams"
        value={activeStreams.toString()}
        color={MILITARY_THEME.colors.primary}
        onClick={() => setSelectedPanel('streams')}
      />
      <MetricCard
        title="Pending Opportunities"
        value={pendingOpportunities.toString()}
        color={MILITARY_THEME.colors.warning}
        onClick={() => setSelectedPanel('pipeline')}
      />
      <MetricCard
        title="Enterprise Leads"
        value={enterpriseLeadCount.toString()}
        color={MILITARY_THEME.colors.secondary}
        onClick={() => setSelectedPanel('enterprise')}
      />
      <MetricCard
        title="Avg Conversion Rate"
        value={formatPercent(avgConversionRate)}
        trend={avgConversionRate > 0.05 ? 'Up' : 'Flat'}
        color={avgConversionRate > 0.05 ? MILITARY_THEME.colors.success : MILITARY_THEME.colors.textSecondary}
      />
    </div>
  );

  // ==================== REVENUE STREAMS OVERVIEW ====================

  const renderRevenueStreams = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Revenue Streams Overview</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Stream Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last 30 Days</th>
              <th style={styles.th}>YTD Revenue</th>
              <th style={styles.th}>Trend</th>
              <th style={styles.th}>Conversion Rate</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {revenueStreams.map(stream => (
              <tr key={stream.id} style={styles.tableRow}>
                <td style={styles.td}><strong>{stream.name}</strong></td>
                <td style={styles.td}>{stream.type}</td>
                <td style={styles.td}>
                  <StatusBadge status={stream.status} />
                </td>
                <td style={styles.td}>{formatCurrency(stream.revenue30Days)}</td>
                <td style={styles.td}>{formatCurrency(stream.revenueYTD)}</td>
                <td style={styles.td}>
                  <span style={{ color: getTrendColor(stream.trend) }}>
                    {getTrendIcon(stream.trend)} {stream.trend}
                  </span>
                </td>
                <td style={styles.td}>{formatPercent(stream.conversionRate)}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton}>View</button>
                  <button style={styles.actionButton}>Configure</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==================== OPPORTUNITY PIPELINE ====================

  const renderOpportunityPipeline = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Opportunity Pipeline</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Opportunity</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Stage</th>
              <th style={styles.th}>Est. Value</th>
              <th style={styles.th}>Probability</th>
              <th style={styles.th}>Next Action</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map(opp => (
              <tr key={opp.id} style={styles.tableRow}>
                <td style={styles.td}><strong>{opp.name}</strong></td>
                <td style={styles.td}>{opp.category}</td>
                <td style={styles.td}>{opp.sourceModule}</td>
                <td style={styles.td}>
                  <StatusBadge status={opp.status} />
                </td>
                <td style={styles.td}>{formatCurrency(opp.estimatedMonthlyRevenue)}</td>
                <td style={styles.td}>{formatPercent(opp.confidence)}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==================== ENTERPRISE LEADS ====================

  const renderEnterpriseLeads = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Enterprise Leads</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Organization</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Region</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Stage</th>
              <th style={styles.th}>Est. Value</th>
              <th style={styles.th}>Probability</th>
              <th style={styles.th}>Last Activity</th>
              <th style={styles.th}>Next Step</th>
            </tr>
          </thead>
          <tbody>
            {enterpriseLeads.map(lead => (
              <tr key={lead.id} style={styles.tableRow}>
                <td style={styles.td}><strong>{lead.organizationName}</strong></td>
                <td style={styles.td}>{lead.type}</td>
                <td style={styles.td}>{lead.region}</td>
                <td style={styles.td}>{lead.source}</td>
                <td style={styles.td}>{lead.stage}</td>
                <td style={styles.td}>{formatCurrency(lead.estimatedValue)}</td>
                <td style={styles.td}>{lead.probability}%</td>
                <td style={styles.td}>{formatDate(lead.lastActivity)}</td>
                <td style={styles.td}>{lead.nextStep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==================== PARTNER PERFORMANCE ====================

  const renderPartnerPerformance = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Partner Performance</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Partner Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Clicks</th>
              <th style={styles.th}>Conversions</th>
              <th style={styles.th}>Revenue</th>
              <th style={styles.th}>Conversion Rate</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(partner => (
              <tr key={partner.id} style={styles.tableRow}>
                <td style={styles.td}><strong>{partner.name}</strong></td>
                <td style={styles.td}>{partner.category}</td>
                <td style={styles.td}>{partner.clicks.toLocaleString()}</td>
                <td style={styles.td}>{partner.conversions.toLocaleString()}</td>
                <td style={styles.td}>{formatCurrency(partner.revenue)}</td>
                <td style={styles.td}>{formatPercent(partner.conversionRate)}</td>
                <td style={styles.td}>
                  <StatusBadge status={partner.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==================== ALERTS & SUGGESTIONS ====================

  const renderAlerts = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Alerts & Suggestions (ARDE)</h2>
      <div style={styles.alertsContainer}>
        {alerts.map(alert => (
          <div key={alert.id} style={{
            ...styles.alertCard,
            borderLeftColor: alert.severity === 'high' ? MILITARY_THEME.colors.danger :
                              alert.severity === 'medium' ? MILITARY_THEME.colors.warning :
                              MILITARY_THEME.colors.accent
          }}>
            <div style={styles.alertHeader}>
              <span style={styles.alertType}>{alert.type.toUpperCase()}</span>
              <span style={styles.alertTime}>{formatDate(alert.timestamp)}</span>
            </div>
            <p style={styles.alertDescription}>{alert.description}</p>
            <p style={styles.alertImpact}><strong>Impact:</strong> {alert.impact}</p>
            <p style={styles.alertAction}><strong>Recommended:</strong> {alert.action}</p>
            <div style={styles.alertActions}>
              <button style={styles.acceptButton}>Accept</button>
              <button style={styles.dismissButton}>Dismiss</button>
              <button style={styles.snoozeButton}>Snooze</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== LOGS & AUDIT TRAIL ====================

  const renderLogs = () => (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Logs & Audit Trail</h2>
      <div style={styles.logsContainer}>
        {logs.map(log => (
          <div key={log.id} style={styles.logEntry}>
            <div style={styles.logTimestamp}>{formatDate(log.timestamp)}</div>
            <div style={styles.logContent}>
              <span style={styles.logActor}>{log.actor}</span>
              <span style={styles.logSeparator}>→</span>
              <span style={styles.logAction}>{log.action}</span>
              <span style={styles.logSeparator}>→</span>
              <span style={styles.logTarget}>{log.target}</span>
              <span style={{
                ...styles.logResult,
                color: log.result === 'Success' ? MILITARY_THEME.colors.success :
                       log.result === 'Failed' ? MILITARY_THEME.colors.danger :
                       MILITARY_THEME.colors.warning
              }}>
                [{log.result}]
              </span>
            </div>
            {log.details && <div style={styles.logDetails}>{log.details}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading Revenue Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={{ color: MILITARY_THEME.colors.gold }}>⭐</span>
          {' '}Revenue Command Center{' '}
          <span style={{ color: MILITARY_THEME.colors.gold }}>⭐</span>
        </h1>
        <div style={styles.dateRangeSelector}>
          <button
            style={dateRange === '7d' ? styles.dateButtonActive : styles.dateButton}
            onClick={() => setDateRange('7d')}
          >
            7 Days
          </button>
          <button
            style={dateRange === '30d' ? styles.dateButtonActive : styles.dateButton}
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </button>
          <button
            style={dateRange === 'ytd' ? styles.dateButtonActive : styles.dateButton}
            onClick={() => setDateRange('ytd')}
          >
            Year to Date
          </button>
        </div>
      </header>

      {renderHeaderStrip()}

      <div style={styles.mainContent}>
        {renderRevenueStreams()}
        {renderOpportunityPipeline()}
        {renderEnterpriseLeads()}
        {renderPartnerPerformance()}
        {renderAlerts()}
        {renderLogs()}
      </div>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'Up' | 'Down' | 'Flat';
  color: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, color, onClick }) => (
  <div
    style={{
      ...styles.metricCard,
      borderTopColor: color,
      cursor: onClick ? 'pointer' : 'default'
    }}
    onClick={onClick}
  >
    <div style={styles.metricTitle}>{title}</div>
    <div style={{ ...styles.metricValue, color }}>
      {value}
      {trend && (
        <span style={{ marginLeft: '8px', fontSize: '24px', color: getTrendColor(trend) }}>
          {getTrendIcon(trend)}
        </span>
      )}
    </div>
  </div>
);

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return MILITARY_THEME.colors.success;
      case 'paused': return MILITARY_THEME.colors.warning;
      case 'pending': return MILITARY_THEME.colors.warning;
      case 'experimental': return MILITARY_THEME.colors.accent;
      default: return MILITARY_THEME.colors.textSecondary;
    }
  };

  return (
    <span style={{
      ...styles.statusBadge,
      backgroundColor: getStatusColor(status),
    }}>
      {status}
    </span>
  );
};

// ==================== STYLES ====================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: MILITARY_THEME.colors.background,
    color: MILITARY_THEME.colors.text,
    padding: MILITARY_THEME.spacing.lg,
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
    color: MILITARY_THEME.colors.textSecondary
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MILITARY_THEME.spacing.xl,
    padding: MILITARY_THEME.spacing.lg,
    backgroundColor: MILITARY_THEME.colors.surface,
    borderRadius: MILITARY_THEME.borderRadius,
    boxShadow: MILITARY_THEME.boxShadow,
    borderLeft: `4px solid ${MILITARY_THEME.colors.gold}`
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: 0,
    color: MILITARY_THEME.colors.text,
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  dateRangeSelector: {
    display: 'flex',
    gap: MILITARY_THEME.spacing.sm
  },
  dateButton: {
    padding: `${MILITARY_THEME.spacing.sm} ${MILITARY_THEME.spacing.md}`,
    backgroundColor: MILITARY_THEME.colors.surfaceLight,
    color: MILITARY_THEME.colors.text,
    border: `1px solid ${MILITARY_THEME.colors.border}`,
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  dateButtonActive: {
    padding: `${MILITARY_THEME.spacing.sm} ${MILITARY_THEME.spacing.md}`,
    backgroundColor: MILITARY_THEME.colors.accent,
    color: MILITARY_THEME.colors.text,
    border: `1px solid ${MILITARY_THEME.colors.accent}`,
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  headerStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: MILITARY_THEME.spacing.md,
    marginBottom: MILITARY_THEME.spacing.xl
  },
  metricCard: {
    backgroundColor: MILITARY_THEME.colors.surface,
    padding: MILITARY_THEME.spacing.lg,
    borderRadius: MILITARY_THEME.borderRadius,
    boxShadow: MILITARY_THEME.boxShadow,
    borderTop: '4px solid transparent',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  metricTitle: {
    fontSize: '14px',
    color: MILITARY_THEME.colors.textSecondary,
    marginBottom: MILITARY_THEME.spacing.sm,
    fontWeight: '500'
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: MILITARY_THEME.spacing.xl
  },
  panel: {
    backgroundColor: MILITARY_THEME.colors.surface,
    padding: MILITARY_THEME.spacing.lg,
    borderRadius: MILITARY_THEME.borderRadius,
    boxShadow: MILITARY_THEME.boxShadow,
    borderLeft: `4px solid ${MILITARY_THEME.colors.accent}`
  },
  panelTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: MILITARY_THEME.spacing.lg,
    color: MILITARY_THEME.colors.text,
    borderBottom: `2px solid ${MILITARY_THEME.colors.border}`,
    paddingBottom: MILITARY_THEME.spacing.sm
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeaderRow: {
    backgroundColor: MILITARY_THEME.colors.surfaceLight
  },
  th: {
    padding: MILITARY_THEME.spacing.md,
    textAlign: 'left' as const,
    fontWeight: 'bold',
    color: MILITARY_THEME.colors.text,
    borderBottom: `2px solid ${MILITARY_THEME.colors.border}`,
    fontSize: '14px'
  },
  tableRow: {
    borderBottom: `1px solid ${MILITARY_THEME.colors.border}`,
    transition: 'background-color 0.2s'
  },
  td: {
    padding: MILITARY_THEME.spacing.md,
    fontSize: '14px',
    color: MILITARY_THEME.colors.text
  },
  actionButton: {
    padding: `${MILITARY_THEME.spacing.xs} ${MILITARY_THEME.spacing.sm}`,
    backgroundColor: MILITARY_THEME.colors.accent,
    color: MILITARY_THEME.colors.text,
    border: 'none',
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: MILITARY_THEME.spacing.xs,
    transition: 'background-color 0.2s'
  },
  statusBadge: {
    padding: `${MILITARY_THEME.spacing.xs} ${MILITARY_THEME.spacing.sm}`,
    borderRadius: MILITARY_THEME.borderRadius,
    fontSize: '12px',
    fontWeight: 'bold',
    color: MILITARY_THEME.colors.text,
    textTransform: 'uppercase' as const
  },
  alertsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: MILITARY_THEME.spacing.md
  },
  alertCard: {
    backgroundColor: MILITARY_THEME.colors.surfaceLight,
    padding: MILITARY_THEME.spacing.md,
    borderRadius: MILITARY_THEME.borderRadius,
    borderLeft: '4px solid transparent'
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: MILITARY_THEME.spacing.sm
  },
  alertType: {
    fontWeight: 'bold',
    color: MILITARY_THEME.colors.warning,
    fontSize: '12px'
  },
  alertTime: {
    fontSize: '12px',
    color: MILITARY_THEME.colors.textSecondary
  },
  alertDescription: {
    margin: `${MILITARY_THEME.spacing.sm} 0`,
    fontSize: '14px'
  },
  alertImpact: {
    margin: `${MILITARY_THEME.spacing.xs} 0`,
    fontSize: '13px',
    color: MILITARY_THEME.colors.textSecondary
  },
  alertAction: {
    margin: `${MILITARY_THEME.spacing.xs} 0`,
    fontSize: '13px',
    color: MILITARY_THEME.colors.accent
  },
  alertActions: {
    display: 'flex',
    gap: MILITARY_THEME.spacing.sm,
    marginTop: MILITARY_THEME.spacing.md
  },
  acceptButton: {
    padding: `${MILITARY_THEME.spacing.xs} ${MILITARY_THEME.spacing.md}`,
    backgroundColor: MILITARY_THEME.colors.success,
    color: MILITARY_THEME.colors.text,
    border: 'none',
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '12px'
  },
  dismissButton: {
    padding: `${MILITARY_THEME.spacing.xs} ${MILITARY_THEME.spacing.md}`,
    backgroundColor: MILITARY_THEME.colors.danger,
    color: MILITARY_THEME.colors.text,
    border: 'none',
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '12px'
  },
  snoozeButton: {
    padding: `${MILITARY_THEME.spacing.xs} ${MILITARY_THEME.spacing.md}`,
    backgroundColor: MILITARY_THEME.colors.surfaceLight,
    color: MILITARY_THEME.colors.text,
    border: `1px solid ${MILITARY_THEME.colors.border}`,
    borderRadius: MILITARY_THEME.borderRadius,
    cursor: 'pointer',
    fontSize: '12px'
  },
  logsContainer: {
    maxHeight: '400px',
    overflowY: 'auto' as const
  },
  logEntry: {
    padding: MILITARY_THEME.spacing.md,
    borderBottom: `1px solid ${MILITARY_THEME.colors.border}`,
    fontSize: '13px'
  },
  logTimestamp: {
    fontSize: '11px',
    color: MILITARY_THEME.colors.textSecondary,
    marginBottom: MILITARY_THEME.spacing.xs
  },
  logContent: {
    display: 'flex',
    gap: MILITARY_THEME.spacing.sm,
    flexWrap: 'wrap' as const,
    alignItems: 'center'
  },
  logActor: {
    fontWeight: 'bold',
    color: MILITARY_THEME.colors.accent
  },
  logSeparator: {
    color: MILITARY_THEME.colors.textSecondary
  },
  logAction: {
    color: MILITARY_THEME.colors.text
  },
  logTarget: {
    fontStyle: 'italic' as const,
    color: MILITARY_THEME.colors.textSecondary
  },
  logResult: {
    fontWeight: 'bold'
  },
  logDetails: {
    marginTop: MILITARY_THEME.spacing.xs,
    fontSize: '12px',
    color: MILITARY_THEME.colors.textSecondary,
    fontStyle: 'italic' as const
  }
};

export default AdminRevenueDashboard;
