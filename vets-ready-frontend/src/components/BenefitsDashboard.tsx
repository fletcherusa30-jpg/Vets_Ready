/**
 * Benefits Matrix Dashboard Component
 * VetsReady Platform - Educational & Preparatory Tool
 *
 * Personalized benefits discovery dashboard that shows Federal and State
 * benefits based on veteran's service-connected disabilities and profile.
 *
 * ACCESSIBILITY: WCAG 2.1 AA compliant, keyboard navigable, screen reader optimized
 */

import React, { useState, useEffect } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { evaluateBenefits, getBenefitsByCategory, validateVeteranInputs } from '../services/BenefitsEvaluator';
import type { BenefitsEvaluationResult, EvaluatedBenefit, VeteranInputs } from '../types/benefitsTypes';
import { AlertCircle, CheckCircle, ExternalLink, FileText, MapPin, DollarSign, Info } from 'lucide-react';

const BenefitsDashboard: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [evaluation, setEvaluation] = useState<BenefitsEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'federal' | 'state' | 'claimPrep'>('all');

  useEffect(() => {
    evaluateVeteranBenefits();
  }, [profile]);

  /**
   * Evaluate benefits based on veteran profile
   */
  const evaluateVeteranBenefits = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build veteran inputs from profile
      const inputs: VeteranInputs = {
        vaDisabilityRating: profile.vaDisabilityRating || 0,
        isPermanentAndTotal: profile.isPermanentAndTotal || false,
        isTDIU: profile.isTDIU || false,
        hasSMC: profile.hasSMC || false,
        state: profile.state || '',
        serviceConnectedDisabilities: profile.serviceConnectedConditions || [],
        hasDependents: (profile.numberOfDependents || 0) > 0,
        numberOfDependents: profile.numberOfDependents,
        isHomeowner: profile.isHomeowner,
        branchOfService: profile.branch,
        yearsOfService: profile.yearsOfService,
        hasProstheticDevice: profile.hasProstheticDevice,
        requiresAidAndAttendance: profile.hasAidAndAttendanceNeeds,
        hadSGLI: profile.hadSGLI,
        hasSAHGrant: profile.hasSAHGrant || profile.needsSpecialAdaptedHousing,
        requiresCaregiver: profile.requiresCaregiver,
        isPost911: profile.isPost911,
        qualifyingDisabilities: profile.qualifyingDisabilities
      };

      // Validate inputs
      const validation = validateVeteranInputs(inputs);
      if (!validation.valid) {
        setError(`Please complete your profile: ${validation.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Evaluate benefits
      const result = evaluateBenefits(inputs);
      setEvaluation(result);
    } catch (err) {
      console.error('[BenefitsDashboard] Evaluation error:', err);
      setError('An error occurred while evaluating benefits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Evaluating your benefits...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 mr-3" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={evaluateVeteranBenefits}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const federalBenefits = evaluation.matchedBenefits.federal;
  const stateBenefits = evaluation.matchedBenefits.state;
  const claimPrepTools = evaluation.matchedBenefits.claimPrep;

  const federalByCategory = getBenefitsByCategory(federalBenefits);
  const stateByCategory = getBenefitsByCategory(stateBenefits);

  /**
   * Render benefit card
   */
  const renderBenefitCard = (benefit: EvaluatedBenefit) => (
    <div
      key={benefit.benefitId}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          {benefit.name}
        </h3>
        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" aria-label="Qualified" />
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {benefit.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {benefit.description}
      </p>

      {/* Match reason */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4">
        <p className="text-sm text-green-800 dark:text-green-200 flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{benefit.matchReason}</span>
        </p>
      </div>

      {/* Estimated value */}
      {benefit.estimatedValue && (
        <div className="mb-4 flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
          <span className="font-medium">Estimated Value: {benefit.estimatedValue}</span>
        </div>
      )}

      {/* Benefits list */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What You Get:</h4>
        <ul className="space-y-1">
          {benefit.benefits.map((b, idx) => (
            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
              <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action required */}
      {benefit.actionRequired && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Next Step: {benefit.actionRequired}
          </p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        <a
          href={benefit.links.learnMore}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors"
        >
          Learn More
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
        {benefit.links.apply && (
          <a
            href={benefit.links.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium transition-colors"
          >
            Apply Now
            <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );

  /**
   * Render claim prep tool card
   */
  const renderClaimPrepCard = (tool: any) => (
    <div
      key={tool.toolId}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start mb-3">
        <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3 mt-1" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            {tool.category}
          </span>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{tool.description}</p>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Includes:</h4>
        <ul className="space-y-1">
          {tool.includes.map((item: string, idx: number) => (
            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
              <span className="text-purple-600 dark:text-purple-400 mr-2">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Benefits Matrix
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your {profile.vaDisabilityRating}% VA disability rating
            {profile.state && ` in ${profile.state}`}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Federal Benefits</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{federalBenefits.length}</p>
              </div>
              <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400 opacity-20" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">State Benefits</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stateBenefits.length}</p>
              </div>
              <MapPin className="h-12 w-12 text-green-600 dark:text-green-400 opacity-20" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Claim Prep Tools</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{claimPrepTools.length}</p>
              </div>
              <FileText className="h-12 w-12 text-purple-600 dark:text-purple-400 opacity-20" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Benefits
            </button>
            <button
              onClick={() => setSelectedCategory('federal')}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedCategory === 'federal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Federal ({federalBenefits.length})
            </button>
            <button
              onClick={() => setSelectedCategory('state')}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                selectedCategory === 'state'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              State ({stateBenefits.length})
            </button>
            <button
              onClick={() => setSelectedCategory('claimPrep')}
              className={`px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                selectedCategory === 'claimPrep'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Claim Prep ({claimPrepTools.length})
            </button>
          </div>
        </div>

        {/* Federal Benefits */}
        {(selectedCategory === 'all' || selectedCategory === 'federal') && federalBenefits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Federal Benefits</h2>
            {Object.entries(federalByCategory).map(([category, benefits]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{category}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {benefits.map(renderBenefitCard)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State Benefits */}
        {(selectedCategory === 'all' || selectedCategory === 'state') && stateBenefits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {profile.state} State Benefits
            </h2>
            {Object.entries(stateByCategory).map(([category, benefits]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{category}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {benefits.map(renderBenefitCard)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claim Preparation Tools */}
        {(selectedCategory === 'all' || selectedCategory === 'claimPrep') && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Claim Preparation Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {claimPrepTools.map(renderClaimPrepCard)}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Educational Tool - Not Legal Advice
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                {evaluation.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsDashboard;
