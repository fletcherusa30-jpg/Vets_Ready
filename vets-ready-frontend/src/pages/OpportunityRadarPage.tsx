import React, { useMemo } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { ContentShell } from '../components/Layout/ContentShell';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import {
  scanBenefits,
  getTopOpportunities,
  type BenefitMatch,
} from '../MatrixEngine/opportunityRadar/benefitScanner';

export function OpportunityRadarPage() {
  const { profile } = useVeteranProfile();

  // Scan benefits based on profile
  const allMatches = useMemo(() => {
    const combinedRating = profile.serviceConnectedConditions?.reduce(
      (sum, cond) => sum + cond.rating,
      0
    ) || 0;

    return scanBenefits({
      branch: profile.branch,
      dischargeType: profile.dischargeType,
      serviceConnectedRating: combinedRating,
      enlistmentDate: profile.enlistmentDate,
      dischargeDate: profile.dischargeDate,
      post911Service: profile.enlistmentDate
        ? new Date(profile.enlistmentDate) > new Date('2001-09-10')
        : false,
      hasEmploymentNeeds: true, // Would come from profile preferences
      hasEducationGoals: true,
      hasHousingNeeds: true,
    });
  }, [profile]);

  const top5Opportunities = useMemo(() => {
    return getTopOpportunities(allMatches, 5);
  }, [allMatches]);

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="medium" padding="large">
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            🎯 Opportunity Radar
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>
            Your Top 5 Opportunities This Week
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
            Based on your profile, we've identified these relevant benefits and programs
          </p>
        </div>

        {/* Top 5 Opportunities */}
        {top5Opportunities.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '2px dashed #D1D5DB',
          }}>
            <p style={{ fontSize: '1.125rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              🔍 Scanning for Opportunities
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
              Complete your profile to see personalized opportunities
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {top5Opportunities.map((match, index) => (
              <OpportunityCard
                key={match.benefit.id}
                match={match}
                rank={index + 1}
              />
            ))}
          </div>
        )}

        {/* All Opportunities */}
        {allMatches.length > 5 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem',
            }}>
              Additional Opportunities ({allMatches.length - 5})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allMatches.slice(5).map((match) => (
                <OpportunityCard
                  key={match.benefit.id}
                  match={match}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Educational Disclaimer */}
        <div style={{
          marginTop: '3rem',
          padding: '1rem',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#92400E',
        }}>
          <strong>📚 Educational Tool:</strong> Opportunity Radar suggests benefits you may be eligible for
          based on your profile. Always verify eligibility at VA.gov or with a VSO before applying.
        </div>
      </ContentShell>
    </AppLayout>
  );
}

function OpportunityCard({ match, rank, compact }: {
  match: BenefitMatch;
  rank?: number;
  compact?: boolean;
}) {
  const { benefit, relevanceScore, eligibilityStatus, reasoning, actionItems } = match;

  const statusColor = {
    'Eligible': '#16A34A',
    'Likely Eligible': '#3B82F6',
    'Maybe Eligible': '#EA580C',
    'Not Eligible': '#DC2626',
  }[eligibilityStatus];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: compact ? '1.25rem' : '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          {rank && (
            <div style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              borderRadius: '50%',
              textAlign: 'center',
              lineHeight: '32px',
              fontWeight: 700,
              marginRight: '1rem',
              fontSize: '1.125rem',
            }}>
              {rank}
            </div>
          )}
          <h3 style={{
            display: 'inline',
            fontSize: compact ? '1rem' : '1.25rem',
            fontWeight: 600,
            color: '#111827',
          }}>
            {benefit.name}
          </h3>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
        }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: statusColor,
            color: '#FFFFFF',
            borderRadius: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {eligibilityStatus}
          </span>
          <div style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            textAlign: 'right',
          }}>
            {relevanceScore}% match
          </div>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem', lineHeight: 1.6 }}>
          {benefit.description}
        </p>
      )}

      {/* Why This Applies */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '6px',
        padding: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E40AF', marginBottom: '0.25rem' }}>
          💡 WHY THIS APPLIES TO YOU:
        </div>
        <div style={{ fontSize: '0.875rem', color: '#1E3A8A' }}>
          {reasoning}
        </div>
      </div>

      {/* Action Items */}
      {!compact && actionItems && actionItems.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
            NEXT STEPS:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
            {actionItems.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #E5E7EB',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
          {benefit.category.toUpperCase()} • {benefit.type}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {benefit.website && (
            <a
              href={benefit.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.875rem',
                color: '#3B82F6',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Learn More →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
