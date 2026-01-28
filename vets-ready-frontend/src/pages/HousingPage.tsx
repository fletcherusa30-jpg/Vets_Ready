/**
 * Housing Hub Page
 * VA Home Loan and SAH/SHA/TRA grants
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { checkVALoanEligibility, calculateVALoan, getFundingFeePercent, VA_LOAN_BENEFITS, getVALoanTips } from '../MatrixEngine/housing/vaLoanMapper';
import { checkGrantEligibility, HOUSING_GRANTS, getModificationExamples } from '../MatrixEngine/housing/sahShaTraMapper';

const HousingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loan' | 'grants' | 'calculator'>('loan');
  const [homePrice, setHomePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(6.5);

  const loanEligibility = checkVALoanEligibility({
    daysOfService: 1095,
    honorableDischarge: true,
  });

  const fundingFee = getFundingFeePercent(true, (downPayment / homePrice) * 100, 50);
  const loanCalc = calculateVALoan(homePrice, downPayment, interestRate, fundingFee);
  const grantEligibility = checkGrantEligibility({
    disabilities: ['Loss of leg'],
    disabilityRating: 100,
    ownsHome: true,
    livesWithFamily: false,
  });

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Housing Hub</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            VA Home Loans, special housing grants, and homeownership resources
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
            {[
              { id: 'loan', label: 'VA Home Loan' },
              { id: 'grants', label: 'SAH/SHA Grants' },
              { id: 'calculator', label: 'Loan Calculator' },
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

          {activeTab === 'loan' && (
            <div>
              <div style={{ background: loanEligibility.eligible ? '#dcfce7' : '#fef2f2', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: loanEligibility.eligible ? '#166534' : '#991b1b' }}>
                  {loanEligibility.eligible ? '✓ You\'re Eligible for VA Home Loan' : 'VA Loan Eligibility'}
                </h2>
                <ul style={{ paddingLeft: '24px' }}>
                  {loanEligibility.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{reason}</li>
                  ))}
                </ul>
                <div style={{ marginTop: '16px' }}>
                  <strong>Your Entitlement:</strong> ${loanEligibility.entitlementAmount.toLocaleString()}
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>VA Loan Benefits</h3>
              <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {VA_LOAN_BENEFITS.map((benefit, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>{benefit.name}</h4>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>{benefit.description}</p>
                    <div style={{ color: '#10b981', fontWeight: '500' }}>{benefit.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Next Steps</h3>
                <ol style={{ paddingLeft: '24px' }}>
                  {loanEligibility.nextSteps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', lineHeight: '1.6' }}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'grants' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Special Adapted Housing Grants
              </h2>
              {HOUSING_GRANTS.map((grant) => (
                <div key={grant.id} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    {grant.name} ({grant.acronym})
                  </h3>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginBottom: '16px' }}>
                    Up to ${grant.maxAmount.toLocaleString()}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Eligibility:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                      {grant.eligibilityRequirements.map((req, idx) => (
                        <li key={idx} style={{ color: '#475569', marginBottom: '4px' }}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Allowed Uses:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                      {grant.allowedUses.map((use, idx) => (
                        <li key={idx} style={{ color: '#475569', marginBottom: '4px' }}>{use}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#fef3c7', borderRadius: '6px' }}>
                    Can use up to {grant.id === 'sah' ? '3' : '6'} times
                  </div>
                </div>
              ))}

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Example Modifications</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Modification</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Cost Range</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>SAH</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>SHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getModificationExamples().map((mod, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>{mod.modification}</td>
                        <td style={{ padding: '12px' }}>{mod.cost}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{mod.sahCovered ? '✓' : '—'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{mod.shaCovered ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>VA Loan Calculator</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Loan Details</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Home Price</label>
                    <input type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Down Payment</label>
                    <input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Interest Rate (%)</label>
                    <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }} />
                  </div>
                </div>
                <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '12px', border: '2px solid #2563eb' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1e40af' }}>Your Payment</h3>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Monthly Payment</div>
                    <div style={{ fontSize: '42px', fontWeight: '700', color: '#2563eb' }}>
                      ${loanCalc.monthlyPayment.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Loan Amount:</span>
                      <strong>${loanCalc.loanAmount.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Funding Fee:</span>
                      <strong>${loanCalc.totalFundingFee.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Total Interest:</span>
                      <strong>${loanCalc.totalInterest.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bfdbfe' }}>
                      <span>Total Cost:</span>
                      <span>${loanCalc.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default HousingPage;
