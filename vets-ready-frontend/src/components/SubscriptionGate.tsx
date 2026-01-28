/**
 * Subscription Tier Gate Component
 *
 * Restricts access to features based on user's subscription tier
 * Usage:
 *   <SubscriptionGate requiredTier="PRO">
 *     <PremiumFeature />
 *   </SubscriptionGate>
 */

import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Lock, Crown, Star } from 'lucide-react';

interface SubscriptionGateProps {
  requiredTier: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

type SubscriptionTier = 'FREE' | 'PRO' | 'FAMILY' | 'LIFETIME';

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  PRO: 1,
  FAMILY: 2,
  LIFETIME: 3,
};

const TIER_NAMES: Record<SubscriptionTier, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  FAMILY: 'Family',
  LIFETIME: 'Lifetime',
};

const TIER_ICONS: Record<SubscriptionTier, typeof Lock | typeof Crown | typeof Star> = {
  FREE: Lock,
  PRO: Crown,
  FAMILY: Star,
  LIFETIME: Lock,
};

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  requiredTier,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userTier = subscription?.tier || 'FREE';
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const Icon = TIER_ICONS[requiredTier] || Lock;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
          <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {TIER_NAMES[requiredTier]} Feature
      </h3>

      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        This premium feature is available to {TIER_NAMES[requiredTier]} subscribers.
        Upgrade your plan to unlock advanced tools and capabilities.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          View Pricing Plans
        </Link>

        <Link
          to="/features"
          className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-colors"
        >
          Learn More
        </Link>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        As a veteran, you deserve the best tools.
        <br />
        Upgrade for less than $2/month with our annual Pro plan.
      </p>
    </div>
  );
};

/**
 * Hook to check feature access programmatically
 */
export const useFeatureAccess = (requiredTier: SubscriptionTier): boolean => {
  const { subscription } = useSubscription();
  const userTier = (subscription?.tier || 'FREE') as SubscriptionTier;
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
};

/**
 * Inline badge component to show tier requirements
 */
export const TierBadge: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  const Icon = TIER_ICONS[tier];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
      <Icon className="h-3 w-3" />
      {TIER_NAMES[tier]}
    </span>
  );
};
