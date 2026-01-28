/**
 * Evidence Builder Page
 * Guided lay statement creation, buddy statements, and evidence tracking
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { generateLayStatement, getLayStatementTemplate, validateLayStatement, getLayStatementTips } from '../MatrixEngine/evidence/layStatementBuilder';

const EvidenceBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'tracker'>('builder');
  const [condition, setCondition] = useState('');
  const [inServiceEvent, setInServiceEvent] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  const [functionalImpact, setFunctionalImpact] = useState('');

  const template = getLayStatementTemplate();
  const tips = getLayStatementTips();

  const handleGenerate = () => {
    const data = {
      veteranName: 'John Smith',
      condition: condition || 'PTSD',
      dateOfStatement: new Date().toISOString().split('T')[0],
      inServiceEvent: {
        date: '2018-03-15',
        location: 'Afghanistan',
        description: inServiceEvent || 'Combat patrol in Kandahar province',
      },
      currentSymptoms: [
        currentSymptoms || 'Nightmares and flashbacks',
        'Hypervigilance',
        'Difficulty sleeping',
        'Avoidance of crowds',
      ],
      functionalImpact: functionalImpact || 'Difficulty maintaining employment, strained relationships',
      continuityOfSymptoms: 'Symptoms began during deployment and have continued since separation',
      signature: '',
    };

    const statement = generateLayStatement(data);
    const validation = validateLayStatement(statement);

    if (validation.isValid) {
      alert('✅ Statement generated!\n\n' + statement.slice(0, 500) + '...\n\n(Full statement would download as PDF)');
    } else {
      alert('⚠️ Statement generated with warnings:\n' + validation.warnings.join('\n'));
    }
  };

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Evidence Builder</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Build strong evidence for your VA claims with guided statement builders and templates
          </p>

          <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
            {[
              { id: 'builder', label: 'Lay Statement Builder' },
              { id: 'templates', label: 'Statement Templates' },
              { id: 'tracker', label: 'Evidence Tracker' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                padding: '12px 24px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '16px', cursor: 'pointer',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'builder' && (
            <div>
              <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Guided Lay Statement Builder</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  Answer the questions below and we'll generate a professional lay statement for your VA claim.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    What condition is this statement for?
                  </label>
                  <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)}
                    placeholder="e.g., PTSD, Tinnitus, Left knee strain"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Describe the in-service event or injury
                  </label>
                  <textarea value={inServiceEvent} onChange={(e) => setInServiceEvent(e.target.value)}
                    placeholder="When and where did this happen? Be specific about dates, locations, and what occurred."
                    rows={4}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    What are your current symptoms?
                  </label>
                  <textarea value={currentSymptoms} onChange={(e) => setCurrentSymptoms(e.target.value)}
                    placeholder="List your symptoms. Be specific and factual. How often do they occur?"
                    rows={4}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    How do these symptoms affect your daily life?
                  </label>
                  <textarea value={functionalImpact} onChange={(e) => setFunctionalImpact(e.target.value)}
                    placeholder="Work, relationships, hobbies, sleep, etc. Be specific about limitations."
                    rows={4}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                </div>

                <button onClick={handleGenerate} style={{
                  padding: '14px 32px', background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '16px',
                }}>
                  Generate Statement
                </button>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>💡 Lay Statement Tips</h3>
                {tips.slice(0, 8).map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px', background: '#f8fafc', borderRadius: '6px',
                    borderLeft: '4px solid #2563eb', marginBottom: '12px',
                  }}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Statement Templates</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[
                  {
                    title: 'Lay Statement (Veteran)',
                    description: 'Your personal account of in-service events and current symptoms',
                    sections: 6,
                    difficulty: 'Easy',
                  },
                  {
                    title: 'Buddy Statement',
                    description: 'Statement from fellow service member who witnessed events',
                    sections: 5,
                    difficulty: 'Easy',
                  },
                  {
                    title: 'Spouse/Family Statement',
                    description: 'How family members observe your symptoms and limitations',
                    sections: 4,
                    difficulty: 'Easy',
                  },
                  {
                    title: 'Employment Impact Statement',
                    description: 'How your condition affects your ability to work',
                    sections: 5,
                    difficulty: 'Medium',
                  },
                  {
                    title: 'Continuity of Symptoms',
                    description: 'Timeline showing symptoms from service to present',
                    sections: 3,
                    difficulty: 'Medium',
                  },
                  {
                    title: 'Nexus Letter Request',
                    description: 'Template for requesting nexus opinion from doctor',
                    sections: 4,
                    difficulty: 'Advanced',
                  },
                ].map((template, idx) => (
                  <div key={idx} style={{
                    padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{template.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                      {template.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        {template.sections} sections
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: template.difficulty === 'Easy' ? '#dcfce7' : template.difficulty === 'Medium' ? '#fef3c7' : '#fef2f2',
                        color: template.difficulty === 'Easy' ? '#166534' : template.difficulty === 'Medium' ? '#92400e' : '#991b1b',
                        borderRadius: '12px', fontSize: '13px', fontWeight: '500',
                      }}>
                        {template.difficulty}
                      </span>
                    </div>
                    <button style={{
                      marginTop: '16px', width: '100%', padding: '10px', background: '#eff6ff',
                      color: '#2563eb', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer',
                    }}>
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <div>
              <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Evidence Tracker</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  Track all evidence for your claims in one place
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Condition</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Evidence Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Strength</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { condition: 'PTSD', type: 'Lay Statement', status: 'Complete', strength: 85 },
                      { condition: 'PTSD', type: 'Buddy Statement', status: 'In Progress', strength: 60 },
                      { condition: 'PTSD', type: 'Medical Records', status: 'Complete', strength: 90 },
                      { condition: 'Tinnitus', type: 'Lay Statement', status: 'Not Started', strength: 0 },
                      { condition: 'Left Knee', type: 'Service Records', status: 'Complete', strength: 95 },
                    ].map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{item.condition}</td>
                        <td style={{ padding: '12px' }}>{item.type}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '13px',
                            background: item.status === 'Complete' ? '#dcfce7' : item.status === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                            color: item.status === 'Complete' ? '#166534' : item.status === 'In Progress' ? '#92400e' : '#64748b',
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${item.strength}%`, height: '100%',
                                background: item.strength >= 80 ? '#10b981' : item.strength >= 60 ? '#f59e0b' : '#64748b',
                              }} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.strength}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button style={{
                            padding: '6px 16px', background: '#eff6ff', color: '#2563eb',
                            border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer',
                          }}>
                            {item.status === 'Complete' ? 'Review' : item.status === 'In Progress' ? 'Continue' : 'Start'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #3b82f6' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>💡 Evidence Strength Tips</div>
                <ul style={{ paddingLeft: '24px', margin: 0, color: '#1e40af' }}>
                  <li>Aim for 80%+ strength on critical evidence pieces</li>
                  <li>Multiple types of evidence (lay, medical, service) strengthen claims</li>
                  <li>Continuity of symptoms from service to present is crucial</li>
                  <li>Specific dates, locations, and events are stronger than general statements</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default EvidenceBuilderPage;
