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
      // Estimate potential CRSC if eligible
      if (
        (profile.isMedicallyRetired || (profile.isRetired && profile.yearsOfService >= 20)) &&
        profile.vaDisabilityRating >= 10 &&
        profile.hasCombatService
      ) {
        // Rough CRSC estimate (typically 60-80% of VA rating)
        const crscEstimate = Math.floor(calculateDisabilityCompensation(profile) * 0.7);
        benefits.push({
          name: 'CRSC (Potential)',
          amount: crscEstimate
        });
        monthlyTotal += crscEstimate;
      }
    }

    // Step 5: Dependent benefits
    if (step >= 5) {
      let dependentAdd = 0;

      // Spouse benefit (if 30% or higher)
      if (profile.hasSpouse && profile.vaDisabilityRating >= 30) {
        if (profile.vaDisabilityRating >= 100) {
          dependentAdd += 177.61;
        } else if (profile.vaDisabilityRating >= 70) {
          dependentAdd += 138.71;
        } else if (profile.vaDisabilityRating >= 50) {
          dependentAdd += 116.38;
        } else if (profile.vaDisabilityRating >= 30) {
          dependentAdd += 95.64;
        }
      }

      // Child benefits
      if (profile.numberOfChildren && profile.vaDisabilityRating >= 30) {
        const childRate = profile.vaDisabilityRating >= 100 ? 95.64 :
                         profile.vaDisabilityRating >= 70 ? 70.41 :
                         profile.vaDisabilityRating >= 50 ? 58.63 :
                         49.16;
        dependentAdd += childRate * profile.numberOfChildren;
      }

      if (dependentAdd > 0) {
        benefits.push({
          name: 'Dependent Benefits',
          amount: dependentAdd
        });
        monthlyTotal += dependentAdd;
      }
    }

    // GI Bill benefits (if applicable and not fully used)
    if (step >= 1 && profile.yearsOfService >= 3) {
      benefits.push({
        name: 'GI Bill (Available)',
        amount: 0 // Just show as available, not monthly
      });
    }

    return { monthlyTotal, benefits };
  };

  const { monthlyTotal, benefits } = calculateCurrentBenefits();

  // Don't show if no benefits yet
  if (monthlyTotal === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-500 rounded-xl p-6 shadow-lg mb-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="text-5xl">💰</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Your Estimated Monthly Benefits
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-green-700">
              ${monthlyTotal.toFixed(0)}
            </span>
            <span className="text-lg text-green-600">/month</span>
          </div>

          {/* Benefits Breakdown */}
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg px-4 py-2">
                <span className="text-sm font-semibold text-green-900">
                  {benefit.name}
                </span>
                <span className="text-sm font-bold text-green-700">
                  {benefit.amount > 0 ? `$${benefit.amount.toFixed(0)}` : '✓ Eligible'}
                </span>
              </div>
            ))}
          </div>

          {/* Motivational Message */}
          <div className="mt-4 pt-4 border-t border-green-300">
            <p className="text-sm text-green-800">
              <strong>Keep going!</strong> Complete your profile to unlock {step < 6 ? 'more benefits' : 'all available benefits'}.
            </p>
          </div>

          {/* Annual Projection */}
          {monthlyTotal > 0 && (
            <div className="mt-3 bg-green-600 text-white rounded-lg px-4 py-2 text-center">
              <div className="text-xs uppercase tracking-wide font-semibold mb-1">Annual Value</div>
              <div className="text-2xl font-black">
                ${(monthlyTotal * 12).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
