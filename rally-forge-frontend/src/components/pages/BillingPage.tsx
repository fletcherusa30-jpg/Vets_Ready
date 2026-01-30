/**
 * BILLING & SUBSCRIPTION MANAGEMENT PAGE
 *
 * Allows veterans to:
 * - View current subscription status
 * - Compare FREE vs PREMIUM plans
 * - Upgrade to premium
 * - Change billing cycle
 * - Manage payment methods
 * - View billing history
 * - Cancel subscription
 */

import React, { useState } from 'react';
import { DigitalTwin } from '../MatrixEngine/types/DigitalTwin';
import {
  getSubscriptionStatus,
  calculateAnnualSavings,
  PRICING,
  FREE_FEATURES,
  PREMIUM_FEATURES
} from '../MatrixEngine/pricingSystem';
import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
  PaymentMethod
} from '../MatrixEngine/billingIntegration';
import { PremiumBadge } from '../MatrixEngine/featureGating';

interface BillingPageProps {
  digitalTwin: DigitalTwin;
  onDigitalTwinUpdate: (updated: DigitalTwin) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  digitalTwin,
  onDigitalTwinUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'payment' | 'history'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const subscriptionStatus = getSubscriptionStatus(digitalTwin);
  const annualSavings = calculateAnnualSavings();

  const handleUpgrade = async (billingCycle: 'monthly' | 'annual') => {
    setIsProcessing(true);

    try {
      // Mock payment method (replace with actual payment form)
      const paymentMethod: PaymentMethod = {
        id: 'pm_test_123',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      };

      const { digitalTwin: updated } = await createSubscription(
        digitalTwin,
        billingCycle,
        paymentMethod
      );

      onDigitalTwinUpdate(updated);
      alert('Successfully upgraded to Premium!');
    } catch (error) {
      alert(`Upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeCycle = async (newCycle: 'monthly' | 'annual') => {
    setIsProcessing(true);

    try {
      const paymentMethod: PaymentMethod = {
        id: 'pm_test_123',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      };

      const { digitalTwin: updated } = await updateSubscription(
        digitalTwin,
        newCycle,
        paymentMethod
      );

      onDigitalTwinUpdate(updated);
      alert(`Billing cycle changed to ${newCycle}`);
    } catch (error) {
      alert(`Change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (immediate: boolean) => {
    setIsProcessing(true);

    try {
      const { digitalTwin: updated } = await cancelSubscription(digitalTwin, immediate);
      onDigitalTwinUpdate(updated);
      setShowCancelConfirm(false);
      alert(immediate ? 'Subscription canceled immediately' : 'Subscription will cancel at end of billing period');
    } catch (error) {
      alert(`Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-700 mt-2">Manage your rallyforge subscription and payment methods</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'plans', label: 'Plans & Pricing' },
                { id: 'payment', label: 'Payment Methods' },
                { id: 'history', label: 'Billing History' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                digitalTwin={digitalTwin}
                subscriptionStatus={subscriptionStatus}
                onChangeCycle={handleChangeCycle}
                onCancel={() => setShowCancelConfirm(true)}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'plans' && (
              <PlansTab
                digitalTwin={digitalTwin}
                subscriptionStatus={subscriptionStatus}
                annualSavings={annualSavings}
                onUpgrade={handleUpgrade}
                isProcessing={isProcessing}
              />
            )}

            {activeTab === 'payment' && (
              <PaymentMethodsTab digitalTwin={digitalTwin} />
            )}

            {activeTab === 'history' && (
              <BillingHistoryTab digitalTwin={digitalTwin} />
            )}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <CancelConfirmModal
            onConfirm={handleCancel}
            onClose={() => setShowCancelConfirm(false)}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Overview Tab
 */
const OverviewTab: React.FC<{
  digitalTwin: DigitalTwin;
  subscriptionStatus: any;
  onChangeCycle: (cycle: 'monthly' | 'annual') => void;
  onCancel: () => void;
  isProcessing: boolean;
}> = ({ digitalTwin, subscriptionStatus, onChangeCycle, onCancel, isProcessing }) => {
  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {subscriptionStatus.isPremium ? 'Premium Plan' : 'Free Plan'}
            </h2>
            {subscriptionStatus.isPremium && (
              <p className="text-gray-700 mt-1">
                Billed {subscriptionStatus.billingCycle === 'annual' ? 'annually' : 'monthly'}
              </p>
            )}
          </div>
          {subscriptionStatus.isPremium && <PremiumBadge size="large" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {subscriptionStatus.isPremium ? (
            <>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 font-medium">Next Billing Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {subscriptionStatus.nextBillingDate
                    ? new Date(subscriptionStatus.nextBillingDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 font-medium">Next Payment</p>
                <p className="text-lg font-bold text-gray-900">
                  ${subscriptionStatus.nextBillingAmount || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 font-medium">Days Remaining</p>
                <p className="text-lg font-bold text-gray-900">
                  {subscriptionStatus.daysRemaining || 0}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg p-4 col-span-3 shadow-sm border border-gray-200">
              <p className="text-gray-800">
                You're currently on the <strong>Free Plan</strong>. Upgrade to Premium to unlock all advanced features!
              </p>
            </div>
          )}
        </div>

        {subscriptionStatus.isPremium && (
          <div className="flex gap-3">
            {subscriptionStatus.billingCycle === 'monthly' && (
              <button
                onClick={() => onChangeCycle('annual')}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Switch to Annual (Save ${calculateAnnualSavings()}/year)
              </button>
            )}
            {subscriptionStatus.billingCycle === 'annual' && (
              <button
                onClick={() => onChangeCycle('monthly')}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Switch to Monthly
              </button>
            )}
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Feature Access Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Feature Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Available Features</p>
            <p className="text-3xl font-bold text-green-700">
              {subscriptionStatus.isPremium
                ? Object.keys(FREE_FEATURES).length + Object.keys(PREMIUM_FEATURES).length
                : Object.keys(FREE_FEATURES).length}
            </p>
          </div>
          {!subscriptionStatus.isPremium && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium">Locked Features</p>
              <p className="text-3xl font-bold text-yellow-700">
                {Object.keys(PREMIUM_FEATURES).length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Plans Tab
 */
const PlansTab: React.FC<{
  digitalTwin: DigitalTwin;
  subscriptionStatus: any;
  annualSavings: number;
  onUpgrade: (cycle: 'monthly' | 'annual') => void;
  isProcessing: boolean;
}> = ({ digitalTwin, subscriptionStatus, annualSavings, onUpgrade, isProcessing }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="border-2 border-gray-300 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-600">/year</span>
          </div>
          <p className="text-gray-600 mb-6">Perfect for getting started and exploring rallyforge</p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Veteran Basics Wizard</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">DD-214 & Rating Letter Upload</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Basic Disability Calculator</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Basic Mission Packs</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Limited Document Vault (10 docs)</span>
            </li>
            <li className="text-sm text-gray-500">+ 8 more features</li>
          </ul>

          {!subscriptionStatus.isPremium && (
            <button disabled className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold">
              Current Plan
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute -top-3 right-6">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
              BEST VALUE
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>

          <div className="mb-2">
            <span className="text-4xl font-bold text-blue-600">$50</span>
            <span className="text-gray-600">/year</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            or $5/month (${annualSavings} more per year)
          </p>
          <p className="text-gray-700 mb-6">Full access to all advanced features and tools</p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700"><strong>All Free features</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Evidence Packet Generator</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">All Statement Builders</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Unlimited Document Storage</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Full AI Navigator & Workflows</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Complete Mission Pack Library</span>
            </li>
            <li className="text-sm text-blue-600 font-medium">+ 35 more premium features</li>
          </ul>

          {subscriptionStatus.isPremium ? (
            <button disabled className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
              Current Plan ✓
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => onUpgrade('annual')}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Upgrade - $50/year (Save ${annualSavings})
              </button>
              <button
                onClick={() => onUpgrade('monthly')}
                disabled={isProcessing}
                className="w-full py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Upgrade - $5/month
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Payment Methods Tab
 */
const PaymentMethodsTab: React.FC<{ digitalTwin: DigitalTwin }> = ({ digitalTwin }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h3>
        <p className="text-gray-600 mb-6">Manage your payment methods for rallyforge Premium</p>
      </div>

      {/* Placeholder for payment methods */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p className="text-gray-600 mb-4">No payment methods on file</p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add Payment Method
        </button>
      </div>
    </div>
  );
};

/**
 * Billing History Tab
 */
const BillingHistoryTab: React.FC<{ digitalTwin: DigitalTwin }> = ({ digitalTwin }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Billing History</h3>
        <p className="text-gray-600 mb-6">View your payment history and download receipts</p>
      </div>

      {/* Placeholder for billing history */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">No billing history available</p>
      </div>
    </div>
  );
};

/**
 * Cancel Confirmation Modal
 */
const CancelConfirmModal: React.FC<{
  onConfirm: (immediate: boolean) => void;
  onClose: () => void;
  isProcessing: boolean;
}> = ({ onConfirm, onClose, isProcessing }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Premium Subscription</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel your Premium subscription? You'll lose access to all advanced features.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm(false)}
            disabled={isProcessing}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            Cancel at End of Billing Period
          </button>
          <button
            onClick={() => onConfirm(true)}
            disabled={isProcessing}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Cancel Immediately (Prorated Refund)
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Keep Premium
          </button>
        </div>
      </div>
    </div>
  );
};

