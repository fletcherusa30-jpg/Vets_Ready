/**
 * ENTERPRISE LEAD MANAGEMENT UI
 *
 * Manage enterprise licensing opportunities with 11-stage pipeline
 * Military-themed professional design
 */

import React, { useState, useEffect } from 'react';
import './EnterpriseLeads.css';

interface EnterpriseLead {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  estimated_veterans: number;
  license_tier: string;
  stage: string;
  stage_index: number;
  last_contact: string;
  next_followup: string;
  notes: string;
  created_at: string;
}

const PIPELINE_STAGES = [
  { index: 1, name: 'Discovery', color: '#2196F3' },
  { index: 2, name: 'Initial Contact', color: '#03A9F4' },
  { index: 3, name: 'Needs Assessment', color: '#00BCD4' },
  { index: 4, name: 'Demo Scheduled', color: '#009688' },
  { index: 5, name: 'Demo Completed', color: '#4CAF50' },
  { index: 6, name: 'Proposal Sent', color: '#8BC34A' },
  { index: 7, name: 'Negotiation', color: '#CDDC39' },
  { index: 8, name: 'Verbal Commit', color: '#FFEB3B' },
  { index: 9, name: 'Contract Sent', color: '#FFC107' },
  { index: 10, name: 'Contract Signed', color: '#FF9800' },
  { index: 11, name: 'Onboarding', color: '#FF5722' }
];

const EnterpriseLeads: React.FC = () => {
  const [leads, setLeads] = useState<EnterpriseLead[]>([]);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [selectedLead, setSelectedLead] = useState<EnterpriseLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/revenue/enterprise-leads');
      const data = await response.json();
      setLeads(data.leads || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLoading(false);
    }
  };

  const getLeadsByStage = (stageIndex: number) => {
    return leads.filter(lead => lead.stage_index === stageIndex);
  };

  const updateLeadStage = async (leadId: string, newStageIndex: number) => {
    try {
      const response = await fetch(`/api/revenue/enterprise-leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage_index: newStageIndex })
      });

      if (response.ok) {
        await fetchLeads();
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getTotalValue = () => {
    return leads.reduce((sum, lead) => {
      const value = lead.estimated_veterans * 50; // $50 per veteran estimate
      return sum + value;
    }, 0);
  };

  const getStageMetrics = () => {
    return PIPELINE_STAGES.map(stage => ({
      ...stage,
      count: getLeadsByStage(stage.index).length,
      value: getLeadsByStage(stage.index).reduce((sum, lead) =>
        sum + (lead.estimated_veterans * 50), 0
      )
    }));
  };

  if (loading) {
    return (
      <div className="enterprise-leads">
        <div className="loading">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="enterprise-leads">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>🏢 Enterprise Lead Pipeline</h1>
          <p className="subtitle">11-Stage Sales Pipeline Management</p>
        </div>
        <div className="header-right">
          <div className="summary-stat">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{leads.length}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Pipeline Value</span>
            <span className="stat-value">${getTotalValue().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="pipeline-overview">
        {getStageMetrics().map(stage => (
          <div
            key={stage.index}
            className={`stage-card ${selectedStage === stage.index ? 'selected' : ''}`}
            style={{ borderTopColor: stage.color }}
            onClick={() => setSelectedStage(selectedStage === stage.index ? null : stage.index)}
          >
            <div className="stage-header">
              <span className="stage-number">{stage.index}</span>
              <span className="stage-name">{stage.name}</span>
            </div>
            <div className="stage-metrics">
              <div className="metric">
                <span className="metric-value">{stage.count}</span>
                <span className="metric-label">Leads</span>
              </div>
              <div className="metric">
                <span className="metric-value">${(stage.value / 1000).toFixed(0)}K</span>
                <span className="metric-label">Value</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="leads-section">
        <h2>
          {selectedStage
            ? `${PIPELINE_STAGES.find(s => s.index === selectedStage)?.name} Leads`
            : 'All Leads'}
        </h2>

        {(selectedStage ? getLeadsByStage(selectedStage) : leads).length === 0 ? (
          <div className="no-leads">
            No leads in this stage
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Industry</th>
                <th>Veterans</th>
                <th>Tier</th>
                <th>Stage</th>
                <th>Last Contact</th>
                <th>Next Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(selectedStage ? getLeadsByStage(selectedStage) : leads).map(lead => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
                  <td className="company-name">{lead.company_name}</td>
                  <td>
                    <div className="contact-info">
                      <div>{lead.contact_name}</div>
                      <div className="contact-email">{lead.contact_email}</div>
                    </div>
                  </td>
                  <td>{lead.industry}</td>
                  <td className="veterans-count">{lead.estimated_veterans.toLocaleString()}</td>
                  <td>
                    <span className={`tier-badge tier-${lead.license_tier.toLowerCase()}`}>
                      {lead.license_tier}
                    </span>
                  </td>
                  <td>
                    <span
                      className="stage-badge"
                      style={{
                        backgroundColor: PIPELINE_STAGES.find(s => s.index === lead.stage_index)?.color
                      }}
                    >
                      {lead.stage}
                    </span>
                  </td>
                  <td>{formatDate(lead.last_contact)}</td>
                  <td className={new Date(lead.next_followup) < new Date() ? 'overdue' : ''}>
                    {formatDate(lead.next_followup)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {lead.stage_index > 1 && (
                        <button
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLeadStage(lead.id, lead.stage_index - 1);
                          }}
                          title="Move back"
                        >
                          ←
                        </button>
                      )}
                      {lead.stage_index < 11 && (
                        <button
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLeadStage(lead.id, lead.stage_index + 1);
                          }}
                          title="Advance"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLead.company_name}</h2>
              <button className="close-btn" onClick={() => setSelectedLead(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {selectedLead.contact_name}</p>
                <p><strong>Email:</strong> {selectedLead.contact_email}</p>
                <p><strong>Phone:</strong> {selectedLead.contact_phone}</p>
              </div>

              <div className="detail-section">
                <h3>Company Details</h3>
                <p><strong>Industry:</strong> {selectedLead.industry}</p>
                <p><strong>Estimated Veterans:</strong> {selectedLead.estimated_veterans.toLocaleString()}</p>
                <p><strong>License Tier:</strong> {selectedLead.license_tier}</p>
                <p><strong>Est. Value:</strong> ${(selectedLead.estimated_veterans * 50).toLocaleString()}</p>
              </div>

              <div className="detail-section">
                <h3>Pipeline Status</h3>
                <p><strong>Current Stage:</strong> {selectedLead.stage}</p>
                <p><strong>Last Contact:</strong> {formatDate(selectedLead.last_contact)}</p>
                <p><strong>Next Follow-up:</strong> {formatDate(selectedLead.next_followup)}</p>
                <p><strong>Created:</strong> {formatDate(selectedLead.created_at)}</p>
              </div>

              <div className="detail-section">
                <h3>Notes</h3>
                <p>{selectedLead.notes || 'No notes available'}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSelectedLead(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseLeads;
