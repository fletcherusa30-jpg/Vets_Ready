/**
 * Education Hub Page
 * GI Bill benefits, apprenticeships, certifications, and BAH calculator
 */

import React, { useState } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import ContentShell from '../components/Layout/ContentShell';
import { getGIBillRecommendations, calculateGIBillPercentage, getGIBillTips } from '../MatrixEngine/education/giBillSuggestions';
import { searchApprenticeships, getApprenticeshipBenefits } from '../MatrixEngine/education/apprenticeshipFinder';
import { findMatchingCertifications } from '../MatrixEngine/education/licenseCertMapper';
import { calculateBAH, getBAHTips } from '../MatrixEngine/education/bahEstimator';

const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gibill' | 'apprenticeships' | 'certifications' | 'bah'>('gibill');
  const [daysOfService, setDaysOfService] = useState(1095); // 3 years
  const [zipCode, setZipCode] = useState('10001');
  const [mosCode, setMosCode] = useState('25B');

  const giPercentage = calculateGIBillPercentage(daysOfService);
  const recommendations = getGIBillRecommendations({
    daysOfService,
    honorableDischarge: true,
    post911Service: true,
  }, {
    degreeType: '4-year',
    fieldOfStudy: 'Computer Science',
    timeline: 'Full-time',
    location: 'In-person',
    estimatedCost: 30000,
  });

  const apprenticeships = searchApprenticeships({ giBillOnly: true });
  const certifications = findMatchingCertifications(mosCode);
  const bahCalculation = calculateBAH(zipCode, 'Full-time', giPercentage);
  const tips = getGIBillTips();
  const bahTips = getBAHTips();

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Education Hub</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Explore GI Bill benefits, apprenticeships, certifications, and education planning
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>{giPercentage}%</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>GI Bill Eligibility</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>36</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Months Available</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>${bahCalculation.monthlyRate}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Monthly BAH</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
            {[
              { id: 'gibill', label: 'GI Bill' },
              { id: 'apprenticeships', label: 'Apprenticeships' },
              { id: 'certifications', label: 'Certifications' },
              { id: 'bah', label: 'BAH Calculator' },
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

          {activeTab === 'gibill' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Your GI Bill Benefits
              </h2>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  background: '#fff', padding: '24px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{rec.program.name}</h3>
                    <div style={{
                      padding: '8px 16px', background: '#dcfce7', color: '#166534',
                      borderRadius: '6px', fontWeight: '600',
                    }}>
                      {rec.matchScore}% Match
                    </div>
                  </div>
                  <p style={{ color: '#475569', marginBottom: '16px' }}>{rec.program.description}</p>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Why this program:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                      {rec.reasoning.map((reason, i) => (
                        <li key={i} style={{ color: '#475569', marginBottom: '4px' }}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Next Steps:</strong>
                    <ol style={{ marginTop: '8px', paddingLeft: '24px' }}>
                      {rec.actionSteps.map((step, i) => (
                        <li key={i} style={{ color: '#475569', marginBottom: '4px' }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '6px' }}>
                    <strong>Monthly Benefit:</strong> ${rec.monthlyBenefit.toLocaleString()} |
                    <strong> Total Value:</strong> ${rec.totalBenefit.toLocaleString()}
                  </div>
                </div>
              ))}

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>GI Bill Tips</h3>
                {tips.slice(0, 5).map((tip, idx) => (
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

          {activeTab === 'apprenticeships' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                GI Bill-Approved Apprenticeships
              </h2>
              {apprenticeships.map((app) => {
                const benefits = getApprenticeshipBenefits(app, giPercentage);
                return (
                  <div key={app.id} style={{
                    background: '#fff', padding: '24px', borderRadius: '12px',
                    border: '1px solid #e2e8f0', marginBottom: '16px',
                  }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{app.title}</h3>
                    <div style={{ color: '#64748b', marginBottom: '16px' }}>
                      {app.provider} • {app.location} • {app.duration} months
                    </div>
                    <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>{app.description}</p>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
                      padding: '16px', background: '#f8fafc', borderRadius: '8px',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Starting Salary</div>
                        <div style={{ fontSize: '20px', fontWeight: '600' }}>${app.salary.starting.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Journeyman Salary</div>
                        <div style={{ fontSize: '20px', fontWeight: '600' }}>${app.salary.journeyman.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>GI Bill Payment</div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
                          +${benefits.giBillPayment.toLocaleString()}/mo
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Total Monthly Income</div>
                        <div style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb' }}>
                          ${benefits.totalMonthlyIncome.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Recommended Certifications for {mosCode}
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} style={{
                  background: '#fff', padding: '24px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{cert.name}</h3>
                      <div style={{ color: '#64748b' }}>{cert.provider}</div>
                    </div>
                    {cert.giBillCovered && (
                      <div style={{
                        padding: '6px 12px', background: '#dcfce7', color: '#166534',
                        borderRadius: '6px', fontWeight: '500', height: 'fit-content',
                      }}>
                        GI Bill Covered
                      </div>
                    )}
                  </div>
                  <p style={{ marginBottom: '16px' }}>{cert.description}</p>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                    <div><strong>Cost:</strong> ${cert.cost}</div>
                    <div><strong>Duration:</strong> {cert.duration}</div>
                    {cert.renewalPeriod && <div><strong>Renewal:</strong> {cert.renewalPeriod}</div>}
                  </div>
                  <div style={{
                    marginTop: '16px', padding: '12px 16px', background: '#fef3c7',
                    borderRadius: '6px', borderLeft: '4px solid #f59e0b',
                  }}>
                    <strong>Career Impact:</strong> {cert.careerImpact}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bah' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                BAH Calculator
              </h2>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px', fontWeight: '500' }}>School ZIP Code</div>
                  <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '200px' }} />
                </label>
                <div style={{
                  padding: '24px', background: '#eff6ff', borderRadius: '8px',
                  border: '2px solid #2563eb',
                }}>
                  <div style={{ fontSize: '16px', color: '#1e40af', marginBottom: '8px' }}>Your Monthly BAH</div>
                  <div style={{ fontSize: '48px', fontWeight: '700', color: '#2563eb', marginBottom: '16px' }}>
                    ${bahCalculation.monthlyRate.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                    Annual Amount (9 months): ${bahCalculation.annualAmount.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>BAH Tips</h3>
                {bahTips.map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px', background: '#f8fafc', borderRadius: '6px',
                    marginBottom: '12px', lineHeight: '1.6',
                  }}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default EducationPage;
