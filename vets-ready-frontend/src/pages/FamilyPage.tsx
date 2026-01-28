/**
 * Family Hub Page
 * CHAMPVA, DEA, and family benefits
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { checkCHAMPVAEligibility, getCHAMPVATips } from '../MatrixEngine/family/champvaMapper';
import { checkDEAEligibility, compareDEAtoOtherBenefits, getDEATips } from '../MatrixEngine/family/deaMapper';

const FamilyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'champva' | 'dea'>('champva');

  const champvaEligibility = checkCHAMPVAEligibility({
    isSpouse: true,
    isChild: false,
    isSurvivingSpouse: false,
    veteran100PercentPT: true,
    remarried: false,
  });

  const deaEligibility = checkDEAEligibility({
    isSpouse: false,
    isChild: true,
    childAge: 20,
    veteran100PercentPT: true,
  });

  const champvaTips = getCHAMPVATips();
  const deaTips = getDEATips();
  const comparison = compareDEAtoOtherBenefits();

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Family Hub</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Benefits for spouses, children, and dependents of veterans
          </p>

          <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
            {[
              { id: 'champva', label: 'CHAMPVA Healthcare' },
              { id: 'dea', label: 'DEA Education Benefits' },
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

          {activeTab === 'champva' && (
            <div>
              <div style={{
                background: champvaEligibility.eligible ? '#dcfce7' : '#fef2f2',
                padding: '24px', borderRadius: '12px', marginBottom: '24px',
                border: `2px solid ${champvaEligibility.eligible ? '#10b981' : '#ef4444'}`,
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                  {champvaEligibility.eligible ? '✓ CHAMPVA Eligible' : 'CHAMPVA Eligibility'}
                </h2>
                {champvaEligibility.eligibilityType && (
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>
                    Eligible as: {champvaEligibility.eligibilityType}
                  </div>
                )}
                <ul style={{ paddingLeft: '24px' }}>
                  {champvaEligibility.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.6' }}>{reason}</li>
                  ))}
                </ul>
              </div>

              {champvaEligibility.eligible && (
                <>
                  <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Benefits Covered</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {champvaEligibility.benefits.map((benefit, idx) => (
                        <div key={idx} style={{
                          padding: '12px', background: '#f8fafc', borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}>
                          ✓ {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Cost Sharing</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Outpatient Deductible</div>
                        <div style={{ fontSize: '24px', fontWeight: '700' }}>
                          ${champvaEligibility.costSharing.outpatientDeductible}/year
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Inpatient Deductible</div>
                        <div style={{ fontSize: '24px', fontWeight: '700' }}>
                          ${champvaEligibility.costSharing.inpatientDeductible}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Cost Share</div>
                        <div style={{ fontSize: '24px', fontWeight: '700' }}>
                          {champvaEligibility.costSharing.costSharePercentage}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Catastrophic Cap</div>
                        <div style={{ fontSize: '24px', fontWeight: '700' }}>
                          ${champvaEligibility.costSharing.catastrophicCap.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Next Steps</h3>
                <ol style={{ paddingLeft: '24px' }}>
                  {champvaEligibility.nextSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>CHAMPVA Tips</h3>
                {champvaTips.map((tip, idx) => (
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

          {activeTab === 'dea' && (
            <div>
              <div style={{
                background: deaEligibility.eligible ? '#dcfce7' : '#fef2f2',
                padding: '24px', borderRadius: '12px', marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                  {deaEligibility.eligible ? '✓ DEA Eligible' : 'DEA Eligibility'}
                </h2>
                <ul style={{ paddingLeft: '24px' }}>
                  {deaEligibility.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{reason}</li>
                  ))}
                </ul>
                {deaEligibility.eligible && (
                  <div style={{ marginTop: '16px', padding: '16px', background: '#eff6ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>Monthly Payment</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#2563eb' }}>
                      ${deaEligibility.monthlyPayment.toLocaleString()}/month
                    </div>
                    <div style={{ marginTop: '8px', color: '#64748b' }}>
                      For up to {deaEligibility.monthsAvailable} months
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Compare Education Benefits</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Benefit</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Monthly Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{row.benefit}</td>
                        <td style={{ padding: '12px' }}>{row.monthlyAmount}</td>
                        <td style={{ padding: '12px' }}>{row.duration}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{row.eligibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>DEA Tips</h3>
                {deaTips.slice(0, 5).map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px', background: '#f8fafc', borderRadius: '6px',
                    borderLeft: '4px solid #8b5cf6', marginBottom: '12px',
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

export default FamilyPage;
