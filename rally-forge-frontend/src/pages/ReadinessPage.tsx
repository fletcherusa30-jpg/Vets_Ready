/**
 * Readiness Index Page
 * Life readiness dashboard with category scoring and recommendations
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { calculateReadinessIndex, getReadinessLabel } from '../MatrixEngine/readiness/lifeReadinessIndex';

const ReadinessPage: React.FC = () => {
  // Mock profile data
  const mockProfile = {
    hasDDForm214: true,
    hasRatingDecision: true,
    combinedRating: 70,
    hasJob: false,
    hasResume: false,
    usingGIBill: false,
    hasHousingPlan: true,
    usingVALoan: false,
    hasHealthInsurance: true,
    hasVSO: true,
    hasVetFriends: false,
  };

  const readinessIndex = calculateReadinessIndex(mockProfile);
  const label = getReadinessLabel(readinessIndex.overallScore);

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Life Readiness Index</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Your comprehensive readiness score across all aspects of veteran life
          </p>

          {/* Overall Score */}
          <div style={{ background: '#fff', padding: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '96px', fontWeight: '700', color: '#2563eb', marginBottom: '16px' }}>
              {readinessIndex.overallScore}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px' }}>
              Overall Life Readiness Score
            </div>
            <div style={{ width: '100%', maxWidth: '600px', height: '24px', background: '#e2e8f0', borderRadius: '12px', margin: '0 auto', overflow: 'hidden' }}>
              <div style={{
                width: `${readinessIndex.overallScore}%`, height: '100%',
                background: readinessIndex.overallScore >= 70 ? '#10b981' : readinessIndex.overallScore >= 50 ? '#f59e0b' : '#ef4444',
                borderRadius: '12px', transition: 'width 0.5s',
              }} />
            </div>
          </div>

          {/* Category Scores */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Category Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {readinessIndex.categories.map((category, idx) => (
                <div key={idx} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{category.category}</h3>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                      {category.score}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${category.score}%`, height: '100%',
                      background: category.score >= 70 ? '#10b981' : category.score >= 50 ? '#f59e0b' : '#ef4444',
                      borderRadius: '6px',
                    }} />
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    Weight: {category.weight}%
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Factors:</div>
                    {category.factors.map((factor, fidx) => (
                      <div key={fidx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: '1px solid #f1f5f9',
                      }}>
                        <span style={{ fontSize: '14px' }}>{factor.name}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                          background: factor.status === 'Complete' ? '#dcfce7' : factor.status === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                          color: factor.status === 'Complete' ? '#166534' : factor.status === 'In Progress' ? '#92400e' : '#64748b',
                        }}>
                          {factor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Priorities */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>🎯 Top Priorities</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {readinessIndex.topPriorities.map((priority, idx) => (
                <div key={idx} style={{
                  padding: '20px', background: '#fef3c7', borderRadius: '8px',
                  borderLeft: '4px solid #f59e0b',
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {idx + 1}. {priority}
                  </div>
                  <button style={{
                    marginTop: '8px', padding: '8px 16px', background: '#f59e0b', color: '#fff',
                    border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontWeight: '500',
                  }}>
                    Take Action
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>⚡ Quick Wins</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {readinessIndex.quickWins.map((win, idx) => (
                <div key={idx} style={{
                  padding: '16px', background: '#dcfce7', borderRadius: '8px',
                  border: '1px solid #10b981',
                }}>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#166534', marginBottom: '8px' }}>
                    ✓ {win}
                  </div>
                  <div style={{ fontSize: '13px', color: '#166534' }}>
                    Est. time: 10-30 min
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>💪 Your Strengths</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {readinessIndex.strengths.map((strength, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px', background: '#eff6ff', borderRadius: '6px',
                  border: '1px solid #3b82f6', color: '#1e40af', fontSize: '14px',
                }}>
                  ✓ {strength}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default ReadinessPage;
