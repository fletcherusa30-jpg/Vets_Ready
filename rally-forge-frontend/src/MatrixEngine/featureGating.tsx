/**
 * FEATURE GATING ENGINE
 *
 * Controls access to premium features throughout the application.
 * Provides upgrade prompts and graceful degradation for free tier users.
 *
 * USAGE:
 * - Wrap components with <FeatureGate>
 * - Check access before allowing actions
 * - Show upgrade prompts when needed
 */

import React from 'react';
import { DigitalTwin } from './types/DigitalTwin';
import {
  hasFeatureAccess,
  getUpgradeIncentive,
  FREE_FEATURES,
  PREMIUM_FEATURES,
  getSubscriptionStatus
} from './pricingSystem';

/**
 * Feature gate result
 */
export interface FeatureGateResult {
  hasAccess: boolean;
  reason?: 'premium_required' | 'billing_inactive' | 'expired';
  upgradePrompt?: {
    title: string;
    message: string;
    benefits: string[];
  };
}

/**
 * Check if user has access to a feature
 */
export function checkFeatureAccess(
  digitalTwin: DigitalTwin,
  feature: keyof typeof FREE_FEATURES | keyof typeof PREMIUM_FEATURES
): FeatureGateResult {
  const hasAccess = hasFeatureAccess(digitalTwin, feature);

  if (hasAccess) {
    return { hasAccess: true };
  }

  // Determine reason
  let reason: 'premium_required' | 'billing_inactive' | 'expired' = 'premium_required';

  if (digitalTwin.subscriptionTier === 'premium') {
    const status = getSubscriptionStatus(digitalTwin);
    if (!status.isActive) {
      reason = 'billing_inactive';
    } else if (status.daysRemaining !== undefined && status.daysRemaining < 0) {
      reason = 'expired';
    }
  }

  const upgradePrompt = getUpgradeIncentive(feature);

  return {
    hasAccess: false,
    reason,
    upgradePrompt,
  };
}

/**
 * Require premium access (throws error if not available)
 */
export function requirePremium(
  digitalTwin: DigitalTwin,
  feature: keyof typeof PREMIUM_FEATURES
): void {
  const result = checkFeatureAccess(digitalTwin, feature);
  if (!result.hasAccess) {
    throw new Error(`Premium subscription required for feature: ${feature}`);
  }
}

/**
 * Feature gate component
 */
export interface FeatureGateProps {
  digitalTwin: DigitalTwin;
  feature: keyof typeof FREE_FEATURES | keyof typeof PREMIUM_FEATURES;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  digitalTwin,
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  onUpgradeClick,
}) => {
  const result = checkFeatureAccess(digitalTwin, feature);

  if (result.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt && result.upgradePrompt) {
    return (
      <UpgradePrompt
        title={result.upgradePrompt.title}
        message={result.upgradePrompt.message}
        benefits={result.upgradePrompt.benefits}
        onUpgradeClick={onUpgradeClick}
      />
    );
  }

  return null;
};

/**
 * Upgrade prompt component
 */
interface UpgradePromptProps {
  title: string;
  message: string;
  benefits: string[];
  onUpgradeClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  message,
  benefits,
  onUpgradeClick,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'p-4 text-sm',
    medium: 'p-6',
    large: 'p-8 text-lg',
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg ${sizeClasses[size]}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div className="flex-1">
          {/* Title */}
          <h3 className="text-xl font-bold text-blue-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-blue-700 mb-4">{message}</p>

          {/* Benefits */}
          <ul className="space-y-2 mb-6">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onUpgradeClick || (() => window.location.href = '/billing')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Upgrade to Premium - $50/year
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors border border-blue-300"
            >
              See All Features
            </button>
          </div>

          {/* Savings note */}
          <p className="text-sm text-blue-600 mt-3">
            💰 Save $10 with annual billing (vs $60/year monthly)
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Premium badge component
 */
interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'medium',
  showText = true
}) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold rounded-full ${sizeClasses[size]}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {showText && <span>PREMIUM</span>}
    </span>
  );
};

/**
 * Locked feature overlay
 */
interface LockedFeatureOverlayProps {
  digitalTwin: DigitalTwin;
  feature: keyof typeof PREMIUM_FEATURES;
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}

export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  digitalTwin,
  feature,
  children,
  onUpgradeClick,
}) => {
  const result = checkFeatureAccess(digitalTwin, feature);

  if (result.hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
        {result.upgradePrompt && (
          <div className="max-w-md">
            <UpgradePrompt
              title={result.upgradePrompt.title}
              message={result.upgradePrompt.message}
              benefits={result.upgradePrompt.benefits}
              onUpgradeClick={onUpgradeClick}
              size="small"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Get contextual upgrade message based on user's profile completeness
 */
export function getContextualUpgradeMessage(digitalTwin: DigitalTwin): {
  headline: string;
  message: string;
  primaryCTA: string;
  features: string[];
} {
  // If user has uploaded DD-214 and rating letter
  const hasBasicDocs = digitalTwin.dd214Uploaded && digitalTwin.ratingLetterUploaded;

  // If user has disabilities
  const hasDisabilities = digitalTwin.disabilities && digitalTwin.disabilities.length > 0;

  // If user has high combined rating
  const hasHighRating = digitalTwin.combinedRating && digitalTwin.combinedRating >= 70;

  if (hasBasicDocs && hasDisabilities && hasHighRating) {
    return {
      headline: 'You\'re ready for advanced claims tools!',
      message: 'With your profile complete, unlock AI-powered evidence generation and secondary condition analysis.',
      primaryCTA: 'Unlock Advanced Tools',
      features: [
        'Evidence Packet Generator',
        'Secondary Condition Finder',
        'Timeline Builder',
        'CFR Diagnostic Engine',
      ],
    };
  }

  if (hasBasicDocs && hasDisabilities) {
    return {
      headline: 'Maximize your benefits with premium tools',
      message: 'Get personalized benefit recommendations and automated evidence packets.',
      primaryCTA: 'Unlock Premium Benefits',
      features: [
        'Full Opportunity Radar',
        'State & Federal Benefits Engine',
        'Employment Skill Translator',
        'Housing Eligibility Engine',
      ],
    };
  }

  if (hasBasicDocs) {
    return {
      headline: 'Build your complete veteran profile',
      message: 'Unlock unlimited document storage and intelligent document analysis.',
      primaryCTA: 'Unlock Document Intelligence',
      features: [
        'Unlimited Document Storage',
        'Document Intelligence Layer',
        'Cross-Module Sync',
        'Life Event Watcher',
      ],
    };
  }

  // Default message
  return {
    headline: 'Unlock the full rallyforge experience',
    message: 'Get access to all advanced features for just $50/year.',
    primaryCTA: 'Upgrade to Premium',
    features: [
      'Full Claims & Evidence Tools',
      'Unlimited Document Storage',
      'Complete Benefit Intelligence',
      'AI Workflow Automation',
    ],
  };
}

/**
 * Track feature access attempts (for analytics)
 */
export function trackFeatureAccessAttempt(
  digitalTwin: DigitalTwin,
  feature: string,
  wasGranted: boolean
): void {
  // Log to analytics
  console.log('[Feature Access]', {
    feature,
    tier: digitalTwin.subscriptionTier,
    wasGranted,
    timestamp: new Date().toISOString(),
  });

  // Expert stub: Integrate with analytics service (e.g., Segment, Google Analytics)
  // Robust fallback: Log to console for now
}

