import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import {
  getAllBenefitsEligibility,
  getEligibleBenefits,
  getTotalMonthlyBenefits,
  calculateDisabilityCompensation,
  BenefitEligibility
} from '../utils/benefitsEligibility';

export const BenefitsDashboard: React.FC = () => {
  const { profile, isProfileComplete } = useVeteranProfile();
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitEligibility | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  if (!isProfileComplete()) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <span className="text-5xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 text-2xl mb-2">Complete Your Profile First</h3>
              <p className="text-yellow-800 mb-4">
                To see your personalized benefits dashboard, please complete your veteran profile first.
              </p>
              <Link
                to="/profile"
                className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow-md transition-all"
              >
                Complete Profile Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allBenefits = getAllBenefitsEligibility(profile);
  const eligibleBenefits = getEligibleBenefits(profile);
  const totalMonthlyBenefits = getTotalMonthlyBenefits(profile);
  const baseDisabilityComp = calculateDisabilityCompensation(profile);
  const displayedBenefits = showAllBenefits ? allBenefits : eligibleBenefits;

  return (
    <div className="space-y-6">
      {/* Header with Profile Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Benefits Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Welcome back, {profile.firstName} {profile.lastName}
            </p>
          </div>
          <Link
            to="/profile"
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all"
          >
            Update Profile
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">VA Disability Rating</p>
            <p className="text-3xl font-black">{profile.vaDisabilityRating}%</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Base Compensation</p>
            <p className="text-3xl font-black">${baseDisabilityComp.toFixed(0)}</p>
            <p className="text-xs text-blue-100">per month</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Additional Benefits</p>
            <p className="text-3xl font-black">${(totalMonthlyBenefits - baseDisabilityComp).toFixed(0)}</p>
            <p className="text-xs text-blue-100">per month</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
            <p className="text-sm text-blue-100 mb-1">Total Monthly</p>
            <p className="text-3xl font-black">${totalMonthlyBenefits.toFixed(0)}</p>
            <p className="text-xs text-blue-100">estimated</p>
          </div>
        </div>
      </div>

      {/* Eligible Benefits Count */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              You Qualify for {eligibleBenefits.length} Additional Benefit{eligibleBenefits.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-gray-600">Based on your current profile information</p>
          </div>
          <button
            onClick={() => setShowAllBenefits(!showAllBenefits)}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAllBenefits ? 'Show Eligible Only' : 'Show All Benefits'}
          </button>
        </div>

        {eligibleBenefits.length === 0 && !showAllBenefits && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
            <p className="text-blue-900">
              Based on your current profile, you don't qualify for additional benefits beyond base disability compensation.
              Update your profile if your situation has changed.
            </p>
          </div>
        )}
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedBenefits.map((benefit, index) => (
          <div
            key={index}
            className={`rounded-xl shadow-lg p-6 cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-2xl ${
              benefit.eligible
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500'
                : 'bg-white border-2 border-gray-200'
            }`}
            onClick={() => setSelectedBenefit(benefit)}
          >
            {/* Category Badge */}
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                benefit.category === 'compensation' ? 'bg-blue-200 text-blue-900' :
                benefit.category === 'housing' ? 'bg-purple-200 text-purple-900' :
                benefit.category === 'education' ? 'bg-yellow-200 text-yellow-900' :
                benefit.category === 'healthcare' ? 'bg-red-200 text-red-900' :
                'bg-gray-200 text-gray-900'
              }`}>
                {benefit.category.toUpperCase()}
              </span>
              {benefit.eligible && (
                <span className="text-3xl">✓</span>
              )}
            </div>

            {/* Benefit Name */}
            <h3 className="font-bold text-xl text-gray-900 mb-2">{benefit.name}</h3>

            {/* Amount */}
            {benefit.estimatedMonthlyAmount !== undefined && benefit.estimatedMonthlyAmount > 0 && (
              <div className={`text-3xl font-black mb-3 ${benefit.eligible ? 'text-green-700' : 'text-gray-400'}`}>
                ${benefit.estimatedMonthlyAmount.toFixed(0)}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">{benefit.description}</p>

            {/* Status */}
            <div className={`px-4 py-2 rounded-lg text-center font-bold ${
              benefit.eligible
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {benefit.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </div>

            {/* Click for Details */}
            <p className="text-xs text-gray-500 text-center mt-3">Click for details →</p>
          </div>
        ))}
      </div>

      {/* Benefit Details Modal */}
      {selectedBenefit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBenefit(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-8 ${selectedBenefit.eligible ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${
                    selectedBenefit.category === 'compensation' ? 'bg-blue-200 text-blue-900' :
                    selectedBenefit.category === 'housing' ? 'bg-purple-200 text-purple-900' :
                    selectedBenefit.category === 'education' ? 'bg-yellow-200 text-yellow-900' :
                    selectedBenefit.category === 'healthcare' ? 'bg-red-200 text-red-900' :
                    'bg-gray-200 text-gray-900'
                  }`}>
                    {selectedBenefit.category.toUpperCase()}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedBenefit.name}</h2>
                  {selectedBenefit.estimatedMonthlyAmount !== undefined && selectedBenefit.estimatedMonthlyAmount > 0 && (
                    <p className={`text-4xl font-black ${selectedBenefit.eligible ? 'text-green-700' : 'text-gray-400'}`}>
                      ${selectedBenefit.estimatedMonthlyAmount.toFixed(2)}/month
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="text-3xl text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className={`px-6 py-3 rounded-lg mb-6 text-center font-bold ${
                selectedBenefit.eligible
                  ? 'bg-green-600 text-white'
                  : 'bg-red-100 text-red-900 border-2 border-red-500'
              }`}>
                {selectedBenefit.eligible ? '✓ YOU QUALIFY FOR THIS BENEFIT' : '✗ YOU DO NOT CURRENTLY QUALIFY'}
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">About This Benefit</h3>
                <p className="text-gray-700">{selectedBenefit.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  {selectedBenefit.eligible ? 'You Meet These Requirements:' : 'Requirements:'}
                </h3>
                <ul className="space-y-2">
                  {selectedBenefit.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`text-xl ${selectedBenefit.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedBenefit.eligible ? '✓' : '○'}
                      </span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  {selectedBenefit.eligible ? 'How to Apply:' : 'How to Qualify:'}
                </h3>
                <ol className="space-y-3">
                  {selectedBenefit.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                {selectedBenefit.eligible && (
                  <a
                    href="https://www.va.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-lg shadow-md transition-all"
                  >
                    Apply on VA.gov →
                  </a>
                )}
                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Resources */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://www.va.gov/vso"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-all"
          >
            <h3 className="font-bold text-blue-900 mb-2">🎖️ Find a VSO</h3>
            <p className="text-sm text-gray-600">Get free help from accredited Veterans Service Organizations</p>
          </a>
          <a
            href="tel:1-800-827-1000"
            className="p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all"
          >
            <h3 className="font-bold text-green-900 mb-2">📞 Call VA</h3>
            <p className="text-sm text-gray-600">1-800-827-1000 (Mon-Fri 8am-9pm ET)</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BenefitsDashboard;
