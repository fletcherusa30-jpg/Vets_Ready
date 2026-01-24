/**
 * API service for subscription management
 * Handles all subscription-related API calls
 */

import { api } from './api';

export interface VeteranSubscription {
  id: string;
  user_id: string;
  tier: 'FREE' | 'PRO' | 'FAMILY' | 'LIFETIME';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
}

export interface SubscriptionPricingPlan {
  tier: string;
  name: string;
  price_yearly: number;
  price_display: string;
  features: string[];
  recommended?: boolean;
}

export const subscriptionService = {
  /**
   * Get all veteran pricing tiers
   */
  async getVeteranPricing(): Promise<SubscriptionPricingPlan[]> {
    const response = await api.get('/api/subscriptions/pricing/veteran');
    return response.data;
  },

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<VeteranSubscription> {
    const response = await api.get('/api/subscriptions/');
    return response.data;
  },

  /**
   * Create a new subscription
   */
  async createSubscription(tier: string): Promise<VeteranSubscription> {
    const response = await api.post('/api/subscriptions/', { tier });
    return response.data;
  },

  /**
   * Upgrade/downgrade subscription
   */
  async updateSubscription(
    subscriptionId: string,
    newTier: string
  ): Promise<VeteranSubscription> {
    const response = await api.patch(`/api/subscriptions/${subscriptionId}`, {
      tier: newTier,
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await api.delete(`/api/subscriptions/${subscriptionId}`);
  },

  /**
   * Get Stripe pricing configuration
   */
  async getStripePricingConfig(): Promise<any> {
    const response = await api.get('/pricing/config');
    return response.data;
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(data: {
    price_id: string;
    success_url: string;
    cancel_url: string;
    customer_email: string;
    metadata?: any;
  }): Promise<{ checkout_url: string; session_id: string }> {
    const response = await api.post('/create-checkout-session', data);
    return response.data;
  },
};
