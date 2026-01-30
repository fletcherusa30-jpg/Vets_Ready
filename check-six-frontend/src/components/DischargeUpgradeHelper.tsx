/**
 * DischargeUpgradeHelper.tsx
 * Educational tool for veterans seeking discharge upgrade guidance
 *
 * EDUCATIONAL ONLY - Does NOT provide legal advice
 */

import React, { useState } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import {
  analyzeDischargeUpgrade,
  generateDischargeUpgradeWorksheet,
  DischargeUpgradeAnalysis
} from '../services/DischargeUpgradeEngine';

export const DischargeUpgradeHelper: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const [narrativeResponses, setNarrativeResponses] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'overview' | 'details' | 'factors' | 'evidence' | 'narrative'>('overview');

  const analysis: DischargeUpgradeAnalysis = analyzeDischargeUpgrade(profile);

  const handleDownloadWorksheet = () => {
    const worksheet = generateDischargeUpgradeWorksheet(profile, analysis, narrativeResponses);
    const blob = new Blob([worksheet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'discharge-upgrade-worksheet.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="discharge-upgrade-helper">
      {/* Header */}
      <div className="duh-header">
        <h2>🎖️ Discharge Upgrade Helper</h2>
        <p className="duh-subtitle">
          Educational guidance for veterans seeking to upgrade their discharge characterization
        </p>
        <div className="duh-disclaimer">
          <strong>⚠️ Educational Tool Only</strong> — This tool provides information and organization assistance.
          It does NOT provide legal advice, representation, or guarantees about outcomes.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="duh-nav">
        <button
          className={`duh-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📋 Overview
        </button>
        <button
          className={`duh-nav-btn ${activeSection === 'details' ? 'active' : ''}`}
          onClick={() => setActiveSection('details')}
        >
          📄 Your Discharge
        </button>
        <button
          className={`duh-nav-btn ${activeSection === 'factors' ? 'active' : ''}`}
          onClick={() => setActiveSection('factors')}
        >
          🏥 Liberal Consideration
        </button>
        <button
          className={`duh-nav-btn ${activeSection === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveSection('evidence')}
        >
          📦 Evidence
        </button>
        <button
          className={`duh-nav-btn ${activeSection === 'narrative' ? 'active' : ''}`}
          onClick={() => setActiveSection('narrative')}
        >
          ✍️ Your Statement
        </button>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="duh-section">
          <h3>Understanding Discharge Upgrades</h3>
          <p>
            A discharge upgrade changes the characterization of your military discharge. This can restore
            benefits, improve employment opportunities, and recognize your service more fairly.
          </p>

          <div className="pathway-cards">
            {analysis.boardPathways.map(pathway => (
              <div key={pathway.id} className="pathway-card">
                <h4>{pathway.fullName} ({pathway.name})</h4>
                <p className="pathway-description">{pathway.description}</p>
                <div className="pathway-details">
                  <p><strong>Eligibility:</strong> {pathway.eligibility}</p>
                  <p><strong>Time Window:</strong> {pathway.timeWindow}</p>
                  <p><strong>Process:</strong> {pathway.process}</p>
                </div>
                <div className="pathway-considerations">
                  <strong>Key Points:</strong>
                  <ul>
                    {pathway.considerations.map((consideration, i) => (
                      <li key={i}>{consideration}</li>
                    ))}
                  </ul>
                </div>
                <a href={pathway.officialUrl} target="_blank" rel="noopener noreferrer" className="pathway-link">
                  Learn More →
                </a>
              </div>
            ))}
          </div>

          <div className="timeline-info">
            <h4>⏱️ Timeline (Educational Estimate)</h4>
            <p>{analysis.timeline}</p>
          </div>
        </div>
      )}

      {/* Discharge Details Section */}
      {activeSection === 'details' && (
        <div className="duh-section">
          <h3>Your Discharge Details</h3>
          <p className="section-intro">
            Provide information about your discharge. This helps identify relevant factors and pathways.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="character-of-discharge">Character of Discharge</label>
              <select
                id="character-of-discharge"
                value={profile.characterOfDischarge || ''}
                onChange={(e) => updateProfile({ characterOfDischarge: e.target.value as any })}
                className="duh-select"
              >
                <option value="">Select...</option>
                <option value="Honorable">Honorable</option>
                <option value="General Under Honorable Conditions">General Under Honorable Conditions</option>
                <option value="Other Than Honorable">Other Than Honorable</option>
                <option value="Bad Conduct">Bad Conduct</option>
                <option value="Dishonorable">Dishonorable</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="separation-code">Separation Code (from DD214)</label>
              <input
                type="text"
                id="separation-code"
                value={profile.separationCode || ''}
                onChange={(e) => updateProfile({ separationCode: e.target.value })}
                className="duh-input"
                placeholder="e.g., JKV, JNC"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="narrative-reason">Narrative Reason for Separation</label>
              <input
                type="text"
                id="narrative-reason"
                value={profile.narrativeReasonForSeparation || ''}
                onChange={(e) => updateProfile({ narrativeReasonForSeparation: e.target.value })}
                className="duh-input"
                placeholder="e.g., Misconduct - Drug Abuse"
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="misconduct-basis">Basis of Misconduct (if applicable)</label>
              <textarea
                id="misconduct-basis"
                value={profile.misconductBasis || ''}
                onChange={(e) => updateProfile({ misconductBasis: e.target.value })}
                className="duh-textarea"
                placeholder="Brief description of what led to the discharge"
                rows={3}
              />
            </div>
          </div>

          <div className="prior-attempts">
            <h4>Prior Upgrade Attempts</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profile.hasPriorUpgradeAttempts || false}
                onChange={(e) => updateProfile({ hasPriorUpgradeAttempts: e.target.checked })}
              />
              <span>I have applied for a discharge upgrade before</span>
            </label>

            {profile.hasPriorUpgradeAttempts && (
              <div className="form-field">
                <label htmlFor="prior-details">Details (which board, when, outcome)</label>
                <textarea
                  id="prior-details"
                  value={profile.priorUpgradeAttemptsDetails || ''}
                  onChange={(e) => updateProfile({ priorUpgradeAttemptsDetails: e.target.value })}
                  className="duh-textarea"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liberal Consideration Factors */}
      {activeSection === 'factors' && (
        <div className="duh-section">
          <h3>Liberal Consideration Factors</h3>
          <p className="section-intro">
            DoD guidance requires boards to give "liberal consideration" to discharge upgrade requests
            when mental health conditions may have contributed to misconduct.
          </p>

          <div className="mental-health-screening">
            <h4>Mental Health History</h4>
            <div className="checkbox-list">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.hasPTSD || false}
                  onChange={(e) => updateProfile({ hasPTSD: e.target.checked, hasMentalHealthHistory: e.target.checked || profile.hasTBI || profile.hasMST || profile.hasOtherMentalHealth || false })}
                />
                <span>PTSD (Post-Traumatic Stress Disorder)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.hasTBI || false}
                  onChange={(e) => updateProfile({ hasTBI: e.target.checked, hasMentalHealthHistory: e.target.checked || profile.hasPTSD || profile.hasMST || profile.hasOtherMentalHealth || false })}
                />
                <span>TBI (Traumatic Brain Injury)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.hasMST || false}
                  onChange={(e) => updateProfile({ hasMST: e.target.checked, hasMentalHealthHistory: e.target.checked || profile.hasPTSD || profile.hasTBI || profile.hasOtherMentalHealth || false })}
                />
                <span>MST (Military Sexual Trauma / Sexual Harassment or Assault)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.hasOtherMentalHealth || false}
                  onChange={(e) => updateProfile({ hasOtherMentalHealth: e.target.checked, hasMentalHealthHistory: e.target.checked || profile.hasPTSD || profile.hasTBI || profile.hasMST || false })}
                />
                <span>Other Service-Connected Mental Health Conditions</span>
              </label>
            </div>

            {profile.hasMentalHealthHistory && (
              <div className="form-field">
                <label htmlFor="mental-health-details">Details about mental health conditions</label>
                <textarea
                  id="mental-health-details"
                  value={profile.mentalHealthDetails || ''}
                  onChange={(e) => updateProfile({ mentalHealthDetails: e.target.value })}
                  className="duh-textarea"
                  placeholder="When did symptoms begin? How did they affect you during service?"
                  rows={4}
                />
              </div>
            )}
          </div>

          <div className="post-service-treatment">
            <h4>Post-Service Treatment</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profile.hasPostServiceTreatment || false}
                onChange={(e) => updateProfile({ hasPostServiceTreatment: e.target.checked })}
              />
              <span>I have received mental health treatment after discharge</span>
            </label>

            {profile.hasPostServiceTreatment && (
              <div className="form-field">
                <label htmlFor="treatment-details">Treatment details</label>
                <textarea
                  id="treatment-details"
                  value={profile.postServiceTreatmentDetails || ''}
                  onChange={(e) => updateProfile({ postServiceTreatmentDetails: e.target.value })}
                  className="duh-textarea"
                  placeholder="Where did you receive treatment? For what conditions? VA or private?"
                  rows={4}
                />
              </div>
            )}
          </div>

          <div className="liberal-flags">
            <h4>Your Liberal Consideration Flags</h4>
            {analysis.liberalConsiderationFlags.map((flag, index) => (
              <div key={index} className={`flag-card ${flag.detected ? 'detected' : 'not-detected'}`}>
                <div className="flag-header">
                  <span className="flag-icon">{flag.detected ? '✓' : '○'}</span>
                  <h5>{flag.factor}</h5>
                </div>
                <p className="flag-explanation">{flag.explanation}</p>
                {flag.detected && (
                  <div className="flag-guidance">
                    <strong>DoD Guidance:</strong> {flag.doDGuidance}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Checklist */}
      {activeSection === 'evidence' && (
        <div className="duh-section">
          <h3>Evidence Checklist</h3>
          <p className="section-intro">
            Gather these documents to support your discharge upgrade application. Priority indicates importance.
          </p>

          <div className="evidence-categories">
            {['Military Records', 'Medical Evidence', 'Supporting Statements', 'Rehabilitation Evidence', 'Prior Applications'].map(category => {
              const items = analysis.evidenceChecklist.filter(e => e.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="evidence-category">
                  <h4>{category}</h4>
                  <div className="evidence-items">
                    {items.map((item, index) => (
                      <div key={index} className={`evidence-item priority-${item.priority.replace(/ /g, '-')}`}>
                        <div className="evidence-header">
                          <span className="priority-badge">{item.priority}</span>
                          <h5>{item.item}</h5>
                        </div>
                        <p className="evidence-description">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative Builder */}
      {activeSection === 'narrative' && (
        <div className="duh-section">
          <h3>Draft Your Personal Statement</h3>
          <p className="section-intro">
            Your personal statement is critical. Use these prompts to organize your thoughts.
            This is a draft workspace — you can edit and refine before submitting to the board.
          </p>

          <div className="narrative-prompts">
            {analysis.narrativePrompts.map((prompt, index) => (
              <div key={index} className="narrative-section">
                <h4>{prompt.section}</h4>
                <p className="narrative-prompt"><strong>Prompt:</strong> {prompt.prompt}</p>
                <p className="narrative-guidance"><strong>Guidance:</strong> {prompt.guidance}</p>
                <div className="narrative-examples">
                  <strong>Consider including:</strong>
                  <ul>
                    {prompt.examplePoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <textarea
                  value={narrativeResponses[prompt.section] || ''}
                  onChange={(e) => setNarrativeResponses({
                    ...narrativeResponses,
                    [prompt.section]: e.target.value
                  })}
                  className="narrative-textarea"
                  placeholder="Write your response here..."
                  rows={8}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Worksheet */}
      <div className="duh-footer">
        <button onClick={handleDownloadWorksheet} className="download-worksheet-btn">
          📥 Download Discharge Upgrade Worksheet
        </button>
        <p className="footer-disclaimer">
          Worksheet includes all your information, evidence checklist, and narrative draft.
          Review and edit before submitting to any board.
        </p>
      </div>

      {/* Legal Disclaimer */}
      <div className="duh-legal-disclaimer">
        <h4>⚖️ Important Legal Disclaimer</h4>
        <p>rallyforge provides <strong>educational information only</strong>. We do NOT:</p>
        <ul>
          <li>Tell you which board to file with or when to file</li>
          <li>Provide legal advice or strategy</li>
          <li>Guarantee or predict outcomes</li>
          <li>Represent you before discharge review boards</li>
        </ul>
        <p>
          For legal representation, contact a veterans law attorney or accredited Veterans Service Organization (VSO).
          Find accredited representatives at{' '}
          <a href="https://www.va.gov/ogc/apps/accreditation/" target="_blank" rel="noopener noreferrer">
            VA.gov/ogc/apps/accreditation
          </a>
        </p>
      </div>

      <style>{`
        .discharge-upgrade-helper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .duh-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .duh-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .duh-subtitle {
          margin: 0 0 1rem 0;
          opacity: 0.95;
        }

        .duh-disclaimer {
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #ffd700;
        }

        .duh-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e2e8f0;
          overflow-x: auto;
        }

        .duh-nav-btn {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
          font-size: 0.95rem;
        }

        .duh-nav-btn:hover {
          background: #f7fafc;
        }

        .duh-nav-btn.active {
          border-bottom-color: #667eea;
          color: #667eea;
          font-weight: 600;
        }

        .duh-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .duh-section h3 {
          margin-top: 0;
          color: #2d3748;
        }

        .section-intro {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .pathway-cards {
          display: grid;
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .pathway-card {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .pathway-card h4 {
          margin-top: 0;
          color: #2d3748;
        }

        .pathway-description {
          color: #4a5568;
          margin-bottom: 1rem;
        }

        .pathway-details p {
          margin: 0.5rem 0;
          font-size: 0.95rem;
          color: #2d3748;
        }

        .pathway-considerations {
          margin: 1rem 0;
        }

        .pathway-considerations ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #4a5568;
        }

        .pathway-considerations li {
          margin: 0.25rem 0;
        }

        .pathway-link {
          display: inline-block;
          margin-top: 1rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .pathway-link:hover {
          text-decoration: underline;
        }

        .timeline-info {
          background: #ebf8ff;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #3182ce;
          margin-top: 2rem;
        }

        .timeline-info h4 {
          margin-top: 0;
          color: #2c5282;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .duh-input,
        .duh-select,
        .duh-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }

        .duh-textarea {
          resize: vertical;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          margin: 0.5rem 0;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: #f7fafc;
        }

        .checkbox-label input[type="checkbox"] {
          margin-top: 0.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }

        .checkbox-list {
          margin: 1rem 0;
        }

        .liberal-flags {
          margin-top: 2rem;
        }

        .flag-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .flag-card.detected {
          border-color: #48bb78;
          background: #f0fff4;
        }

        .flag-card.not-detected {
          opacity: 0.6;
        }

        .flag-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .flag-icon {
          font-size: 1.5rem;
          color: #48bb78;
        }

        .flag-card.not-detected .flag-icon {
          color: #cbd5e0;
        }

        .flag-header h5 {
          margin: 0;
          color: #2d3748;
        }

        .flag-explanation {
          margin: 0.5rem 0;
          color: #4a5568;
        }

        .flag-guidance {
          background: rgba(72, 187, 120, 0.1);
          padding: 0.75rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #2d3748;
        }

        .evidence-categories {
          margin: 2rem 0;
        }

        .evidence-category {
          margin-bottom: 2rem;
        }

        .evidence-category h4 {
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .evidence-items {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .evidence-item {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #cbd5e0;
        }

        .evidence-item.priority-required {
          border-left-color: #e53e3e;
        }

        .evidence-item.priority-highly-recommended {
          border-left-color: #ed8936;
        }

        .evidence-item.priority-helpful {
          border-left-color: #48bb78;
        }

        .evidence-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .priority-badge {
          background: #e2e8f0;
          color: #4a5568;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .evidence-item.priority-required .priority-badge {
          background: #fed7d7;
          color: #c53030;
        }

        .evidence-item.priority-highly-recommended .priority-badge {
          background: #feebc8;
          color: #c05621;
        }

        .evidence-item.priority-helpful .priority-badge {
          background: #c6f6d5;
          color: #22543d;
        }

        .evidence-header h5 {
          margin: 0;
          color: #2d3748;
        }

        .evidence-description {
          margin: 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .narrative-prompts {
          margin: 2rem 0;
        }

        .narrative-section {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .narrative-section h4 {
          margin-top: 0;
          color: #2d3748;
        }

        .narrative-prompt,
        .narrative-guidance {
          margin: 0.5rem 0;
          color: #4a5568;
        }

        .narrative-examples {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
        }

        .narrative-examples ul {
          margin: 0.5rem 0 0;
          padding-left: 1.5rem;
          color: #718096;
        }

        .narrative-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #cbd5e0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }

        .narrative-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .duh-footer {
          background: #f7fafc;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 2rem;
        }

        .download-worksheet-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .download-worksheet-btn:hover {
          background: #5a67d8;
        }

        .footer-disclaimer {
          margin: 1rem 0 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .duh-legal-disclaimer {
          background: #fffaf0;
          border: 2px solid #ed8936;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .duh-legal-disclaimer h4 {
          margin-top: 0;
          color: #c05621;
        }

        .duh-legal-disclaimer ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          color: #744210;
        }

        .duh-legal-disclaimer a {
          color: #c05621;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .duh-nav {
            overflow-x: scroll;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .evidence-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DischargeUpgradeHelper;

