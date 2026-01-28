/**
 * VETSREADY PRICING & SUBSCRIPTION SYSTEM
 *
 * Manages subscription tiers, feature access, and billing logic.
 *
 * PRICING MODEL:
 * - Free Tier: $0/year (onboarding, basic tools, trust-building)
 * - Premium Tier: $50/year or $5/month (all advanced features)
 *
 * INTEGRATIONS:
 * - Digital Twin (subscription status)
 * - Feature gating across all modules
 * - Revenue stream tracking
 */

import { DigitalTwin } from './types/DigitalTwin';

/**
 * Subscription tiers
 */
export type SubscriptionTier = 'free' | 'premium';

/**
 * Billing cycles
 */
export type BillingCycle = 'monthly' | 'annual';

/**
 * Feature categories
 */
export type FeatureCategory =
  | 'claims-evidence'
  | 'documents-intelligence'
  | 'benefits-opportunities'
  | 'life-tools'
  | 'ui-personalization';

/**
 * Pricing configuration
 */
export const PRICING = {
  premium: {
    annual: {
      price: 50,
      currency: 'USD',
      period: 'year',
      savings: 10, // vs monthly
    },
    monthly: {
      price: 5,
      currency: 'USD',
      period: 'month',
      annualEquivalent: 60,
    },
  },
} as const;

/**
 * Free tier features
 */
export const FREE_FEATURES = {
  // Onboarding & Trust Building
  'veteran-basics-wizard': true,
  'dd214-upload': true,
  'dd214-extraction': true,
  'rating-letter-upload': true,
  'rating-letter-extraction': true,
  'profile-completeness-meter': true,

  // Basic Tools
  'disability-calculator-basic': true,
  'cfr-diagnostic-lookup': true,
  'secondary-condition-finder-basic': true,
  'local-resources-basic': true,
  'military-discount-finder-basic': true,
  'document-vault-limited': true, // Max 10 documents

  // Basic Intelligence
  'basic-mission-packs': true,
  'basic-ai-navigator': true, // Q&A only
  'basic-opportunity-radar': true,

  // Core Navigation
  'dashboard': true,
  'wizard': true,
} as const;

/**
 * Premium tier features
 */
export const PREMIUM_FEATURES = {
  // Claims & Evidence (saves time, provides intelligence, replaces human)
  'claims-assistant-full': true,
  'appeals-assistant': true,
  'evidence-packet-generator': true,
  'lay-statement-builder-full': true,
  'buddy-statement-builder': true,
  'spouse-statement-builder': true,
  'stressor-statement-builder': true,
  'functional-impact-builder': true,
  'secondary-condition-finder-advanced': true,
  'cfr-diagnostic-engine': true,
  'condition-timeline-builder': true,

  // Documents & Intelligence (automation, unlimited storage)
  'document-vault-unlimited': true,
  'document-intelligence-layer': true,
  'global-integrity-engine-full': true,
  'cross-module-sync-engine': true,
  'predictive-needs-engine': true,
  'life-event-watcher': true,

  // Benefits & Opportunities (comprehensive intelligence)
  'opportunity-radar-full': true,
  'state-benefits-engine-full': true,
  'federal-benefits-engine-full': true,
  'housing-eligibility-engine': true,
  'gi-bill-eligibility-engine': true,
  'employment-skill-translator': true,
  'resume-builder': true,
  'clearance-navigator': true,
  'local-intelligence-engine': true,
  'military-discount-engine-full': true,
  'discount-verification-network': true,

  // Life Tools (workflow automation)
  'mission-packs-full-library': true,
  'readiness-index-full': true,
  'life-situation-mode': true,
  'daily-weekly-briefing': true,
  'smart-search': true,
  'quick-actions-bar': true,
  'ai-navigator-full': true, // Full workflows

  // UI/UX Personalization
  'branch-backgrounds': true,
  'high-contrast-mode': true,
  'veteran-identity-sync': true,
} as const;

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  digitalTwin: DigitalTwin,
  feature: keyof typeof FREE_FEATURES | keyof typeof PREMIUM_FEATURES
): boolean {
  // Check if it's a free feature
  if (feature in FREE_FEATURES) {
    return true;
  }

  // Check if user has premium subscription
  if (digitalTwin.subscriptionTier === 'premium') {
    const billingStatus = digitalTwin.billingStatus;

    // Check if subscription is active
    if (billingStatus?.isActive) {
      // Check if not expired
      if (digitalTwin.subscriptionEndDate) {
        const endDate = new Date(digitalTwin.subscriptionEndDate);
        if (endDate < new Date()) {
          return false; // Expired
        }
      }
      return true;
    }
  }

  return false;
}

/**
 * Get user's subscription status
 */
export function getSubscriptionStatus(digitalTwin: DigitalTwin): {
  tier: SubscriptionTier;
  isActive: boolean;
  daysRemaining?: number;
  isPremium: boolean;
  billingCycle?: BillingCycle;
  nextBillingDate?: string;
  nextBillingAmount?: number;
} {
  const tier = digitalTwin.subscriptionTier || 'free';
  const isPremium = tier === 'premium';
  const billingStatus = digitalTwin.billingStatus;
  const isActive = billingStatus?.isActive || false;

  let daysRemaining: number | undefined;
  if (digitalTwin.subscriptionEndDate) {
    const endDate = new Date(digitalTwin.subscriptionEndDate);
    const now = new Date();
    daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  let nextBillingAmount: number | undefined;
  if (isPremium && digitalTwin.billingCycle) {
    nextBillingAmount = digitalTwin.billingCycle === 'annual'
      ? PRICING.premium.annual.price
      : PRICING.premium.monthly.price;
  }

  return {
    tier,
    isActive,
    daysRemaining,
    isPremium,
    billingCycle: digitalTwin.billingCycle,
    nextBillingDate: billingStatus?.renewalDate,
    nextBillingAmount,
  };
}

/**
 * Calculate annual savings for monthly vs annual billing
 */
export function calculateAnnualSavings(): number {
  return PRICING.premium.monthly.annualEquivalent - PRICING.premium.annual.price;
}

/**
 * Upgrade user to premium
 */
export function upgradeToPremium(
  digitalTwin: DigitalTwin,
  billingCycle: BillingCycle
): DigitalTwin {
  const now = new Date();
  let subscriptionEndDate: Date;

  if (billingCycle === 'annual') {
    subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
  } else {
    subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
  }

  return {
    ...digitalTwin,
    subscriptionTier: 'premium',
    billingCycle,
    subscriptionStartDate: new Date().toISOString(),
    subscriptionEndDate: subscriptionEndDate.toISOString(),
    billingStatus: {
      isActive: true,
      renewalDate: subscriptionEndDate.toISOString(),
      lastPaymentDate: new Date().toISOString(),
      lastPaymentAmount: billingCycle === 'annual'
        ? PRICING.premium.annual.price
        : PRICING.premium.monthly.price,
      failedPaymentAttempts: 0,
    },
  };
}

/**
 * Downgrade user to free
 */
export function downgradeToFree(digitalTwin: DigitalTwin): DigitalTwin {
  return {
    ...digitalTwin,
    subscriptionTier: 'free',
    billingCycle: undefined,
    subscriptionEndDate: undefined,
    billingStatus: {
      isActive: false,
      canceledAt: new Date().toISOString(),
    },
  };
}

/**
 * Get features locked behind premium
 */
export function getLockedFeatures(digitalTwin: DigitalTwin): string[] {
  if (digitalTwin.subscriptionTier === 'premium') {
    return [];
  }

  return Object.keys(PREMIUM_FEATURES);
}

/**
 * Get upgrade incentive message
 */
export function getUpgradeIncentive(feature: string): {
  title: string;
  message: string;
  benefits: string[];
} {
  const featureMessages: Record<string, { title: string; message: string; benefits: string[] }> = {
    'claims-assistant-full': {
      title: 'Unlock Full Claims Assistant',
      message: 'Get step-by-step guidance through your entire claim process',
      benefits: [
        'Automated evidence packet generation',
        'CFR code recommendations',
        'Timeline builder',
        'GIE validation',
      ],
    },
    'evidence-packet-generator': {
      title: 'Generate Evidence Packets Automatically',
      message: 'Save hours organizing your claim evidence',
      benefits: [
        'One-click packet generation',
        'Automatic document categorization',
        'Missing evidence detection',
        'Professional formatting',
      ],
    },
    'lay-statement-builder-full': {
      title: 'Unlock Full Statement Builder',
      message: 'Create compelling lay statements with AI assistance',
      benefits: [
        'Multiple statement types',
        'AI-powered writing assistance',
        'Template library',
        'Export to PDF',
      ],
    },
    'mission-packs-full-library': {
      title: 'Access Full Mission Pack Library',
      message: 'Get guided action plans for every stage of your journey',
      benefits: [
        '50+ expert-designed mission packs',
        'Step-by-step workflows',
        'Progress tracking',
        'Personalized recommendations',
      ],
    },
    'ai-navigator-full': {
      title: 'Unlock AI Navigator Workflows',
      message: 'Let AI automate complex tasks and research',
      benefits: [
        'Full workflow automation',
        'Document summarization',
        'Evidence analysis',
        'Benefit research',
      ],
    },
  };

  return featureMessages[feature] || {
    title: 'Upgrade to Premium',
    message: 'Unlock all advanced features for $50/year',
    benefits: [
      'Full claims & evidence tools',
      'Unlimited document storage',
      'Complete benefit intelligence',
      'AI workflow automation',
    ],
  };
}

/**
 * Check if trial period is available
 */
export function isTrialAvailable(digitalTwin: DigitalTwin): boolean {
  // Check if user has never had premium
  return !digitalTwin.subscriptionStartDate;
}

/**
 * Start trial period (7 days)
 */
export function startTrial(digitalTwin: DigitalTwin): DigitalTwin {
  const now = new Date();
  const trialEndDate = new Date(now.setDate(now.getDate() + 7));

  return {
    ...digitalTwin,
    subscriptionTier: 'premium',
    billingCycle: 'annual', // Default to annual
    subscriptionStartDate: new Date().toISOString(),
    subscriptionEndDate: trialEndDate.toISOString(),
    billingStatus: {
      isActive: true,
      renewalDate: trialEndDate.toISOString(),
      failedPaymentAttempts: 0,
    },
  };
}

/**
 * Get feature access summary
 */
export function getFeatureAccessSummary(digitalTwin: DigitalTwin): {
  tier: SubscriptionTier;
  totalFeatures: number;
  accessibleFeatures: number;
  lockedFeatures: number;
  percentageAccess: number;
} {
  const tier = digitalTwin.subscriptionTier || 'free';
  const isPremium = tier === 'premium' && digitalTwin.billingStatus?.isActive;

  const totalFeatures = Object.keys(FREE_FEATURES).length + Object.keys(PREMIUM_FEATURES).length;
  const accessibleFeatures = isPremium
    ? totalFeatures
    : Object.keys(FREE_FEATURES).length;
  const lockedFeatures = totalFeatures - accessibleFeatures;
  const percentageAccess = Math.round((accessibleFeatures / totalFeatures) * 100);

  return {
    tier,
    totalFeatures,
    accessibleFeatures,
    lockedFeatures,
    percentageAccess,
  };
}
