/**
 * useSubscription Hook
 *
 * Manages user subscription state and provides subscription utilities
 */

import { useState, useEffect } from 'react';
import { subscriptionService, VeteranSubscription } from '../services/subscriptionService';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<VeteranSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
      setError(null);
    } catch (err: any) {
      // If no subscription exists, default to FREE
      if (err.response?.status === 404) {
        setSubscription({
          id: 'free',
          user_id: user?.id || '',
          tier: 'FREE',
          status: 'ACTIVE',
          start_date: new Date().toISOString(),
          auto_renew: false,
        });
      } else {
        setError(err.message || 'Failed to fetch subscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeSubscription = async (newTier: string) => {
    try {
      if (subscription && subscription.id !== 'free') {
        const updated = await subscriptionService.updateSubscription(
          subscription.id,
          newTier
        );
        setSubscription(updated);
      } else {
        const created = await subscriptionService.createSubscription(newTier);
        setSubscription(created);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade subscription');
      return false;
    }
  };

  const cancelSubscription = async () => {
    try {
      if (subscription && subscription.id !== 'free') {
        await subscriptionService.cancelSubscription(subscription.id);
        await fetchSubscription(); // Refresh to get updated status
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
      return false;
    }
  };

  const hasFeatureAccess = (requiredTier: string): boolean => {
    const TIER_HIERARCHY = {
      FREE: 0,
      PRO: 1,
      FAMILY: 2,
      LIFETIME: 3,
    };

    const userTier = subscription?.tier || 'FREE';
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  };

  const isPremium = subscription?.tier !== 'FREE';
  const isActive = subscription?.status === 'ACTIVE';

  return {
    subscription,
    isLoading,
    error,
    isPremium,
    isActive,
    hasFeatureAccess,
    upgradeSubscription,
    cancelSubscription,
    refreshSubscription: fetchSubscription,
  };
};
