/**
 * PROFILE COMPLETENESS METER COMPONENT
 *
 * Visual display of veteran profile completeness.
 * Shows overall percentage, category breakdown, and next steps.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Circle, ChevronRight } from 'lucide-react';
import {
  calculateProfileCompleteness,
  getCompletenessLevel,
  getSuggestedPacksForGaps,
  type ProfileCompleteness,
} from '../MatrixEngine/profileCompleteness';
import { useDigitalTwin } from '../contexts/DigitalTwinContext';

interface ProfileCompletenessMeterProps {
  variant?: 'card' | 'inline' | 'dashboard';
  onActionClick?: (action: string) => void;
}

export default function ProfileCompletenessMeter({
  variant = 'card',
  onActionClick,
}: ProfileCompletenessMeterProps) {
  const { digitalTwin } = useDigitalTwin();
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);

  useEffect(() => {
    if (digitalTwin) {
      const result = calculateProfileCompleteness(digitalTwin);
      setCompleteness(result);
    }
  }, [digitalTwin]);

  if (!completeness) {
    return null;
  }

  const level = getCompletenessLevel(completeness.overallPercentage);
  const suggestedPacks = getSuggestedPacksForGaps(completeness);

  // Color based on percentage
  const getColorForPercentage = (percentage: number): string => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    if (percentage >= 30) return '#ef4444';
    return '#94a3b8';
  };

  const mainColor = getColorForPercentage(completeness.overallPercentage);

  // Inline variant (compact)
  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          border: `1px solid ${mainColor}40`,
        }}
      >
        {/* Progress Ring */}
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={mainColor}
              strokeWidth="4"
              strokeDasharray={`${completeness.overallPercentage * 1.26} 126`}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '14px',
              fontWeight: 700,
              color: mainColor,
            }}
          >
            {completeness.overallPercentage}%
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f' }}>
            Profile {level.level}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {completeness.nextSteps[0] || 'Looking good!'}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variant (compact with quick actions)
  if (variant === 'dashboard') {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#1e3a5f' }}>
          Profile Completeness
        </h3>

        {/* Overall Progress */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
              {level.level}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: mainColor }}>
              {completeness.overallPercentage}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '12px',
              background: '#f1f5f9',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completeness.overallPercentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
                borderRadius: '6px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>
            {level.message}
          </p>
        </div>

        {/* Next Steps */}
        {completeness.nextSteps.length > 0 && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f', marginBottom: '8px' }}>
              Next Steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completeness.nextSteps.slice(0, 3).map((step, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick?.(step)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#1e3a5f',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <span>{step}</span>
                  <ChevronRight size={16} color="#94a3b8" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card variant (full detail)
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '32px',
      }}
    >
      <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: 700, color: '#1e3a5f' }}>
        Profile Completeness
      </h2>

      {/* Overall Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '24px',
          background: `linear-gradient(135deg, ${mainColor}20 0%, ${mainColor}10 100%)`,
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        {/* Progress Ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={`${mainColor}30`}
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={mainColor}
              strokeWidth="8"
              strokeDasharray={`${completeness.overallPercentage * 3.26} 326`}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 700, color: mainColor }}>
              {completeness.overallPercentage}%
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Complete</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1e3a5f', marginBottom: '8px' }}>
            {level.level}
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
            {level.message}
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
            {completeness.totalEarnedPoints} of {completeness.totalPossiblePoints} points earned
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1e3a5f' }}>
          Categories
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {completeness.categories.map(category => {
            const categoryColor = getColorForPercentage(category.percentage);

            return (
              <div key={category.category}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '20px' }}>{category.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e3a5f' }}>
                      {category.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: categoryColor }}>
                    {category.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${category.percentage}%`,
                      height: '100%',
                      background: categoryColor,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>

                {/* Missing Items */}
                {category.missingItems.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                    Missing: {category.missingItems.slice(0, 2).join(', ')}
                    {category.missingItems.length > 2 && ` +${category.missingItems.length - 2} more`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Gaps */}
      {completeness.criticalGaps.length > 0 && (
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={18} color="#f59e0b" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#78350f' }}>
              Critical Gaps
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {completeness.criticalGaps.map((gap, index) => (
              <li key={index} style={{ fontSize: '13px', color: '#78350f', marginBottom: '4px' }}>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Mission Packs */}
      {suggestedPacks.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#1e3a5f' }}>
            Suggested Mission Packs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestedPacks.map((pack, index) => (
              <button
                key={index}
                onClick={() => onActionClick?.(pack)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1e3a5f',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>{pack}</span>
                <ChevronRight size={18} color="#3b82f6" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
