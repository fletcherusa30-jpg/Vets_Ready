import React, { useState } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { getAllBenefitsEligibility, getTotalMonthlyBenefits, BenefitEligibility } from '../utils/benefitsEligibility';

export const EnhancedBenefitsDashboard: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'available' | 'potential'>('all');
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitEligibility | null>(null);

  const allBenefits = getAllBenefitsEligibility(profile);
  const totalMonthly = getTotalMonthlyBenefits(profile);

  // Categorize benefits
  const activeBenefits = allBenefits.filter(b =>
    b.eligible && b.estimatedMonthlyAmount && b.estimatedMonthlyAmount > 0
  );

  const availableBenefits = allBenefits.filter(b =>
    b.eligible && (!b.estimatedMonthlyAmount || b.estimatedMonthlyAmount === 0)
  );

  const potentialBenefits = allBenefits.filter(b => !b.eligible);

  // Filter benefits based on active filter
  const displayedBenefits =
    activeFilter === 'active' ? activeBenefits :
    activeFilter === 'available' ? availableBenefits :
    activeFilter === 'potential' ? potentialBenefits :
    allBenefits;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Monthly Benefits */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-sm font-semibold mb-1">Total Monthly Benefits</div>
          <div className="text-4xl font-black mb-1">${totalMonthly.toFixed(0)}</div>
          <div className="text-xs text-green-100">Estimated</div>
        </div>

        {/* Active Benefits */}
        <button
          onClick={() => setActiveFilter('active')}
          className={`bg-white rounded-xl p-6 shadow-lg text-left transition-all hover:shadow-xl ${
            activeFilter === 'active' ? 'ring-4 ring-blue-500' : ''
          }`}
        >
          <div className="text-sm font-semibold text-gray-600 mb-1">Active Benefits</div>
          <div className="text-4xl font-black text-green-600 mb-1">{activeBenefits.length}</div>
          <div className="text-xs text-gray-500">Receiving Now</div>
        </button>

        {/* Available Benefits */}
        <button
          onClick={() => setActiveFilter('available')}
          className={`bg-white rounded-xl p-6 shadow-lg text-left transition-all hover:shadow-xl ${
            activeFilter === 'available' ? 'ring-4 ring-blue-500' : ''
          }`}
        >
          <div className="text-sm font-semibold text-gray-600 mb-1">Available Benefits</div>
          <div className="text-4xl font-black text-blue-600 mb-1">{availableBenefits.length}</div>
          <div className="text-xs text-gray-500">Ready to Apply</div>
        </button>

        {/* Potential Benefits */}
        <button
          onClick={() => setActiveFilter('potential')}
          className={`bg-white rounded-xl p-6 shadow-lg text-left transition-all hover:shadow-xl ${
            activeFilter === 'potential' ? 'ring-4 ring-blue-500' : ''
          }`}
        >
          <div className="text-sm font-semibold text-gray-600 mb-1">Potential Benefits</div>
          <div className="text-4xl font-black text-yellow-600 mb-1">{potentialBenefits.length}</div>
          <div className="text-xs text-gray-500">May Qualify Later</div>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Benefits ({allBenefits.length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeFilter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active ({activeBenefits.length})
        </button>
        <button
          onClick={() => setActiveFilter('available')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeFilter === 'available'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available ({availableBenefits.length})
        </button>
        <button
          onClick={() => setActiveFilter('potential')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeFilter === 'potential'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Potential ({potentialBenefits.length})
        </button>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedBenefits.map((benefit, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedBenefit(benefit)}
            className={`rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl ${
              benefit.eligible
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500'
                : 'bg-white border-2 border-gray-200'
            }`}
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
                ? benefit.estimatedMonthlyAmount && benefit.estimatedMonthlyAmount > 0
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {benefit.eligible
                ? benefit.estimatedMonthlyAmount && benefit.estimatedMonthlyAmount > 0
                  ? 'ACTIVE'
                  : 'ELIGIBLE - APPLY NOW'
                : 'NOT ELIGIBLE'}
            </div>

            {/* Action Hint */}
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
                  <h2 className="text-3xl font-black text-gray-900">{selectedBenefit.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedBenefit(null)}
                  className="text-4xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {selectedBenefit.estimatedMonthlyAmount !== undefined && selectedBenefit.estimatedMonthlyAmount > 0 && (
                <div className="text-5xl font-black text-green-700 mb-4">
                  ${selectedBenefit.estimatedMonthlyAmount.toFixed(0)}
                  <span className="text-xl text-gray-600">/month</span>
                </div>
              )}

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
                      <span className={`flex-shrink-0 ${selectedBenefit.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedBenefit.eligible ? '✓' : '•'}
                      </span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Next Steps:</h3>
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
    </div>
  );
};

export default EnhancedBenefitsDashboard;
