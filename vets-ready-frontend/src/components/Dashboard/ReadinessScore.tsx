import React from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';

export const ReadinessScore: React.FC = () => {
  const { profile } = useVeteranProfile();

  // Calculate readiness score based on profile completeness
  const calculateScore = (): number => {
    let score = 0;
    let maxScore = 0;

    // Personal Information (20 points)
    maxScore += 20;
    if (profile.firstName && profile.lastName) score += 10;
    if (profile.dateOfBirth) score += 10;

    // Service Information (30 points)
    maxScore += 30;
    if (profile.branch) score += 10;
    if (profile.serviceStartDate && profile.serviceEndDate) score += 10;
    if (profile.rank) score += 5;
    if (profile.characterOfDischarge) score += 5;

    // Disability Information (25 points)
    maxScore += 25;
    if (profile.vaDisabilityRating > 0) score += 15;
    if (profile.serviceConnectedConditions && profile.serviceConnectedConditions.length > 0) score += 10;

    // Additional Information (25 points)
    maxScore += 25;
    if (profile.state) score += 5;
    if (profile.numberOfDependents >= 0 || profile.isMarried) score += 5;
    if (profile.retirementStatus) score += 5;
    if (profile.hasCombatService !== undefined) score += 5;
    if (profile.deployments && profile.deployments.length > 0) score += 5;

    return Math.round((score / maxScore) * 100);
  };

  const score = calculateScore();

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#48bb78'; // Green
    if (score >= 50) return '#ed8936'; // Orange
    return '#e53e3e'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="readiness-score">
      <div className="score-header">
        <h3 className="score-title">Veteran Readiness Score</h3>
        <p className="score-subtitle">Profile completeness for optimal benefits discovery</p>
      </div>

      <div className="score-display">
        <svg className="score-circle" viewBox="0 0 200 200">
          <circle
            className="score-bg"
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="20"
          />
          <circle
            className="score-progress"
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="20"
            strokeDasharray={`${(score / 100) * 534} 534`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dy=".3em"
            className="score-number"
            fill="var(--text-primary)"
          >
            {score}%
          </text>
        </svg>
        <div className="score-label" style={{ color: getScoreColor(score) }}>
          {getScoreLabel(score)}
        </div>
      </div>

      <div className="score-tips">
        <p className="tips-text">
          {score >= 80 && '🎉 Great! Your profile is comprehensive. Keep it updated to maximize benefits.'}
          {score >= 50 && score < 80 && '📝 Add more details to improve accuracy and discover additional benefits.'}
          {score < 50 && '⚠️ Complete your profile to unlock personalized benefits recommendations.'}
        </p>
      </div>

      <style>{`
        .readiness-score {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .score-header {
          margin-bottom: 1.5rem;
        }

        .score-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .score-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .score-circle {
          width: 160px;
          height: 160px;
          margin-bottom: 1rem;
        }

        .score-progress {
          transition: stroke-dasharray 1s ease-out;
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 1rem;
          font-weight: 600;
        }

        .score-tips {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 1rem;
        }

        .tips-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
