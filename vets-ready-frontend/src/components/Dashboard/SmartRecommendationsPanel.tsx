import React from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  path: string;
  priority: 'high' | 'medium' | 'low';
}

export const SmartRecommendationsPanel: React.FC = () => {
  const { profile } = useVeteranProfile();
  const navigate = useNavigate();

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Discharge Upgrade Recommendation
    if (profile.characterOfDischarge && profile.characterOfDischarge !== 'Honorable') {
      recommendations.push({
        id: 'discharge-upgrade',
        icon: '🎖️',
        title: 'Discharge Upgrade Helper',
        description: 'You may be eligible to upgrade your discharge characterization. This could restore benefits and improve opportunities.',
        action: 'Learn about discharge upgrades',
        path: '/dashboard?tab=discharge-upgrade',
        priority: 'high'
      });
    }

    // CRSC Recommendation
    if (profile.retirementStatus === 'medical retiree' &&
        profile.yearsOfService < 20 &&
        !profile.receivesDoDRetirementPay) {
      recommendations.push({
        id: 'crsc',
        icon: '💰',
        title: 'CRSC Eligibility',
        description: 'As a medical retiree with <20 years, you may qualify for Combat-Related Special Compensation if your disability is combat-related.',
        action: 'Explore CRSC eligibility',
        path: '/dashboard?tab=retirement',
        priority: 'high'
      });
    }

    // SAH/SHA Recommendation
    if (profile.vaDisabilityRating >= 50 &&
        (profile.hasLossOfUseOfLimb || profile.hasBlindness || profile.needsSpecialAdaptedHousing)) {
      recommendations.push({
        id: 'sah-sha',
        icon: '🏠',
        title: 'Housing Grants (SAH/SHA)',
        description: 'You may qualify for Specially Adapted Housing grants based on your disability rating and mobility needs.',
        action: 'View housing benefits',
        path: '/dashboard?tab=housing',
        priority: 'high'
      });
    }

    // Property Tax Exemption
    if (profile.state && profile.vaDisabilityRating >= 10) {
      recommendations.push({
        id: 'property-tax',
        icon: '🏡',
        title: 'State Property Tax Relief',
        description: `${profile.state} may offer property tax exemptions for disabled veterans. Check your state-specific benefits.`,
        action: 'View state benefits',
        path: '/dashboard?tab=benefits',
        priority: 'medium'
      });
    }

    // Appeals Recommendation
    if (profile.serviceConnectedConditions &&
        profile.serviceConnectedConditions.some(c => c.rating < 50)) {
      recommendations.push({
        id: 'appeals',
        icon: '⚠️',
        title: 'Review Low Ratings',
        description: 'Some of your conditions may be rated lower than warranted. The Appeals Wizard can help identify potential issues.',
        action: 'Review rating decisions',
        path: '/dashboard?tab=appeals',
        priority: 'medium'
      });
    }

    // TDIU Recommendation
    if (profile.vaDisabilityRating >= 60 &&
        profile.vaDisabilityRating < 100 &&
        !profile.isTDIU) {
      recommendations.push({
        id: 'tdiu',
        icon: '💼',
        title: 'TDIU (Unemployability)',
        description: 'If your service-connected disabilities prevent you from working, you may qualify for TDIU benefits at the 100% rate.',
        action: 'Learn about TDIU',
        path: '/dashboard?tab=benefits',
        priority: 'medium'
      });
    }

    // Dependent Benefits
    if (profile.numberOfChildren > 0 && profile.vaDisabilityRating >= 30) {
      recommendations.push({
        id: 'dependent-education',
        icon: '🎓',
        title: 'DEA Chapter 35',
        description: 'Your dependents may qualify for education benefits through the DEA (Chapter 35) program.',
        action: 'View education benefits',
        path: '/dashboard?tab=benefits',
        priority: 'low'
      });
    }

    // Combat-Related
    if (profile.hasCombatService && profile.serviceConnectedConditions &&
        profile.serviceConnectedConditions.length > 0) {
      recommendations.push({
        id: 'presumptive',
        icon: '🔍',
        title: 'Presumptive Conditions',
        description: 'Your combat service may make you eligible for presumptive service connection for certain conditions.',
        action: 'Check secondary conditions',
        path: '/dashboard?tab=disabilities',
        priority: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
  };

  const recommendations = generateRecommendations();

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#e53e3e';
      case 'medium': return '#ed8936';
      case 'low': return '#48bb78';
      default: return '#718096';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="smart-recommendations">
        <div className="recommendations-header">
          <h3 className="recommendations-title">💡 Smart Recommendations</h3>
          <p className="recommendations-subtitle">Personalized suggestions based on your profile</p>
        </div>
        <div className="no-recommendations">
          <p>🎯 Complete your profile to receive personalized recommendations</p>
        </div>

        <style>{`
          .smart-recommendations {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
          }

          .recommendations-header {
            margin-bottom: 1rem;
          }

          .recommendations-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.5rem 0;
          }

          .recommendations-subtitle {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin: 0;
          }

          .no-recommendations {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
          }

          .no-recommendations p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <h3 className="recommendations-title">💡 Smart Recommendations</h3>
        <p className="recommendations-subtitle">
          {recommendations.length} personalized suggestion{recommendations.length > 1 ? 's' : ''} for you
        </p>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <div className="rec-icon">{rec.icon}</div>
            <div className="rec-content">
              <div className="rec-header">
                <h4 className="rec-title">{rec.title}</h4>
                <span
                  className="rec-priority"
                  style={{ color: getPriorityColor(rec.priority) }}
                >
                  {rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⭐' : '📌'}
                </span>
              </div>
              <p className="rec-description">{rec.description}</p>
              <button
                onClick={() => navigate(rec.path)}
                className="rec-action"
              >
                {rec.action} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .smart-recommendations {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .recommendations-header {
          margin-bottom: 1.5rem;
        }

        .recommendations-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .recommendations-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-card {
          display: flex;
          gap: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .recommendation-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .rec-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .rec-content {
          flex: 1;
        }

        .rec-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .rec-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .rec-priority {
          font-size: 1.25rem;
        }

        .rec-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .rec-action {
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .rec-action:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};
