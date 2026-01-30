import React from 'react';
import { VeteranProfile } from '../contexts/VeteranProfileContext';
import { getTotalMonthlyBenefits, calculateDisabilityCompensation } from '../utils/benefitsEligibility';

interface BenefitsCounterProps {
  profile: VeteranProfile;
  step: number;
}

export const BenefitsCounter: React.FC<BenefitsCounterProps> = ({ profile, step }) => {
  // Calculate current benefits based on completed steps
  const calculateCurrentBenefits = () => {
    let monthlyTotal = 0;
    const benefits: Array<{ name: string; amount: number }> = [];

    // Step 2: Disability compensation (if VA rating entered)
    if (step >= 2 && profile.vaDisabilityRating > 0) {
      const disabilityComp = calculateDisabilityCompensation(profile);
      if (disabilityComp > 0) {
        monthlyTotal += disabilityComp;
        benefits.push({
          name: 'VA Disability',
          amount: disabilityComp
        });
      }
    }

    // Step 3: Check for potential CRSC/CRDP (retirement entered)
    if (step >= 3 && (profile.isRetired || profile.isMedicallyRetired)) {
      // Calculate CRSC based on actual disability rating and current year rates
      if (profile.vaDisabilityRating > 0) {
        const estimatedCRSC = calculateDisabilityCompensation(profile);
        monthlyTotal += estimatedCRSC;
        benefits.push({
          name: 'Combat Related Special Comp',
          amount: estimatedCRSC
        });
      }
    }

    // Step 4: Dependent benefits
    if (step >= 4 && profile.dependents && profile.dependents.length > 0) {
      const dependentBonus = profile.dependents.length * 75;
      monthlyTotal += dependentBonus;
      benefits.push({
        name: `Dependent Benefits (${profile.dependents.length})`,
        amount: dependentBonus
      });
    }

    return { monthlyTotal, benefits };
  };

  const { monthlyTotal, benefits } = calculateCurrentBenefits();

  // Don't show if no benefits
  if (monthlyTotal === 0) {
    return null;
  }

  const annualTotal = monthlyTotal * 12;

  return (
    <div className="benefits-counter bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-600 rounded-lg p-6 mb-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-600 font-semibold">
            Estimated Monthly Benefits
          </h3>
          <p className="text-4xl font-bold text-green-700 mt-2">
            ${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ≈ ${annualTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })} annually
          </p>
        </div>
        <div className="text-5xl">💰</div>
      </div>

      {/* Benefits Breakdown */}
      {benefits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs uppercase tracking-wide text-gray-600 font-semibold mb-3">
            Benefits Breakdown
          </p>
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{benefit.name}</span>
                <span className="font-semibold text-green-700">
                  ${benefit.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          ✓ These are estimates based on information you've provided. Official amounts will be determined after VA review.
        </p>
      </div>
    </div>
  );
};

export default BenefitsCounter;
