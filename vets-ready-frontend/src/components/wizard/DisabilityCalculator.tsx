/**
 * Disability Calculator Component
 *
 * Purpose: Real-time VA disability rating calculator with bilateral factor
 *
 * Features:
 * - Add/edit/remove disabilities
 * - True VA combined ratings math
 * - Bilateral factor calculation
 * - Step-by-step breakdown
 * - Next milestone calculator
 * - Monthly compensation estimator
 * - CFR diagnostic code integration
 * - Auto-populate from DD-214 and rating letter
 *
 * Integration Points:
 * - Digital Twin (store combined rating, disabilities)
 * - Opportunity Radar (trigger benefits at rating thresholds)
 * - Mission Packs (unlock housing/family missions)
 * - Evidence Builder (link disabilities to evidence requirements)
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  calculateCombinedRating,
  addDisability,
  removeDisability,
  updateDisabilityPercentage,
  estimateMonthlyCompensation,
  type Disability,
  type DisabilityCalculationResult,
} from '../../MatrixEngine/disabilityCalculator';
import { findSecondaryConditions } from '../../MatrixEngine/secondaryConditionFinder';
import CFRSearchDropdown from '../CFRSearchDropdown';

interface DisabilityCalculatorProps {
  initialDisabilities?: Disability[];
  onCalculationChange?: (result: DisabilityCalculationResult) => void;
}

export const DisabilityCalculator: React.FC<DisabilityCalculatorProps> = ({
  initialDisabilities = [],
  onCalculationChange,
}) => {
  const [disabilities, setDisabilities] = useState<Disability[]>(initialDisabilities);
  const [calculation, setCalculation] = useState<DisabilityCalculationResult | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [hasDependents, setHasDependents] = useState(false);

  // New disability form state
  const [newDisability, setNewDisability] = useState<Partial<Disability>>({
    conditionName: '',
    diagnosticCode: '',
    percentage: 0,
    bodyPart: '',
    side: 'n/a',
    effectiveDate: '',
    isServiceConnected: true,
    isPermanentAndTotal: false,
    source: 'manual',
  });

  // Calculate whenever disabilities change
  useEffect(() => {
    if (disabilities.length > 0) {
      const result = calculateCombinedRating(disabilities);
      setCalculation(result);
      onCalculationChange?.(result);
    } else {
      setCalculation(null);
    }
  }, [disabilities, onCalculationChange]);

  const handleAddDisability = () => {
    if (!newDisability.conditionName || newDisability.percentage === undefined) {
      return;
    }

    const disability: Disability = {
      id: `disability-${Date.now()}`,
      conditionName: newDisability.conditionName,
      diagnosticCode: newDisability.diagnosticCode || '',
      percentage: newDisability.percentage,
      bodyPart: newDisability.bodyPart || '',
      side: newDisability.side || 'n/a',
      effectiveDate: newDisability.effectiveDate || new Date().toISOString().split('T')[0],
      isServiceConnected: newDisability.isServiceConnected ?? true,
      isPermanentAndTotal: newDisability.isPermanentAndTotal ?? false,
      source: newDisability.source || 'manual',
    };

    const result = addDisability(disabilities, disability);
    setDisabilities(result.disabilities);

    // Reset form
    setNewDisability({
      conditionName: '',
      diagnosticCode: '',
      percentage: 0,
      bodyPart: '',
      side: 'n/a',
      effectiveDate: '',
      isServiceConnected: true,
      isPermanentAndTotal: false,
      source: 'manual',
    });
    setShowAddForm(false);
  };

  const handleRemoveDisability = (id: string) => {
    const result = removeDisability(disabilities, id);
    setDisabilities(result.disabilities);
  };

  const handleUpdatePercentage = (id: string, newPercentage: number) => {
    const result = updateDisabilityPercentage(disabilities, id, newPercentage);
    setDisabilities(result.disabilities);
  };

  const handleCFRSelection = (code: string, name: string) => {
    setNewDisability({
      ...newDisability,
      conditionName: name,
      diagnosticCode: code,
    });
  };

  const getSecondaryMatches = (diagnosticCode: string) => {
    if (!diagnosticCode) return [];
    return findSecondaryConditions(diagnosticCode);
  };

  const compensationEstimate = calculation
    ? estimateMonthlyCompensation(calculation.roundedRating, hasDependents)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            VA Disability Calculator
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            Calculate your combined VA disability rating using true VA math
          </p>
        </div>
        {calculation && (
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">
              {calculation.roundedRating}%
            </div>
            <div className="text-sm text-slate-600">Combined Rating</div>
          </div>
        )}
      </div>

      {/* Current Disabilities List */}
      {disabilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Service-Connected Disabilities</h4>
          {disabilities
            .filter((d) => d.source !== 'bilateral-factor')
            .map((disability) => {
              const secondaryMatches = getSecondaryMatches(disability.diagnosticCode || '');
              return (
                <div
                  key={disability.id}
                  className="bg-white border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-slate-800">
                          {disability.conditionName}
                        </h5>
                        {disability.diagnosticCode && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {disability.diagnosticCode}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mt-1 flex items-center gap-4">
                        {disability.bodyPart && (
                          <span>📍 {disability.bodyPart}</span>
                        )}
                        {disability.side !== 'n/a' && (
                          <span>↔️ {disability.side}</span>
                        )}
                        {disability.effectiveDate && (
                          <span>📅 {disability.effectiveDate}</span>
                        )}
                      </div>
                      {secondaryMatches.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
                            <AlertCircle className="w-3 h-3" />
                            {secondaryMatches.length} possible secondary condition
                            {secondaryMatches.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-blue-600">
                            {secondaryMatches
                              .slice(0, 2)
                              .map((m) => m.secondaryCondition.name)
                              .join(', ')}
                            {secondaryMatches.length > 2 && ` +${secondaryMatches.length - 2} more`}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={disability.percentage}
                        onChange={(e) =>
                          handleUpdatePercentage(disability.id, Number(e.target.value))
                        }
                        className="px-3 py-1 border border-slate-300 rounded font-semibold text-slate-700"
                      >
                        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                          <option key={pct} value={pct}>
                            {pct}%
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveDisability(disability.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Disability Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-slate-700">Add New Disability</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Condition Name <span className="text-red-500">*</span>
              </label>
              <CFRSearchDropdown
                onChange={(code, condition) => {
                  setNewDisability({
                    ...newDisability,
                    conditionName: condition.conditionName,
                    diagnosticCode: code,
                  });
                }}
                placeholder="Search or type condition name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rating Percentage <span className="text-red-500">*</span>
              </label>
              <select
                value={newDisability.percentage}
                onChange={(e) =>
                  setNewDisability({ ...newDisability, percentage: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                  <option key={pct} value={pct}>
                    {pct}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Body Part</label>
              <input
                type="text"
                value={newDisability.bodyPart}
                onChange={(e) =>
                  setNewDisability({ ...newDisability, bodyPart: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g., knee, shoulder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Side</label>
              <select
                value={newDisability.side}
                onChange={(e) =>
                  setNewDisability({
                    ...newDisability,
                    side: e.target.value as 'left' | 'right' | 'bilateral' | 'n/a',
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="n/a">Not applicable</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="bilateral">Bilateral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Effective Date
              </label>
              <input
                type="date"
                value={newDisability.effectiveDate}
                onChange={(e) =>
                  setNewDisability({ ...newDisability, effectiveDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddDisability}
              disabled={!newDisability.conditionName || newDisability.percentage === undefined}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Add Disability
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg font-semibold hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Disability
        </button>
      )}

      {/* Calculation Results */}
      {calculation && (
        <div className="space-y-4">
          {/* Bilateral Factor Notice */}
          {calculation.bilateralFactorApplied && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-800">Bilateral Factor Applied</div>
                <div className="text-sm text-blue-700 mt-1">
                  You have bilateral disabilities (both sides of body affected). VA adds{' '}
                  {calculation.bilateralFactorPercentage}% bilateral factor to your combined
                  rating.
                </div>
              </div>
            </div>
          )}

          {/* Compensation Estimate */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-green-700 font-medium">
                  Estimated Monthly Compensation
                </div>
                <div className="text-3xl font-bold text-green-800">
                  ${compensationEstimate.toFixed(2)}
                </div>
                <div className="text-xs text-green-600 mt-1">2024 VA rates</div>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
            </div>
            <label className="flex items-center gap-2 text-sm text-green-700">
              <input
                type="checkbox"
                checked={hasDependents}
                onChange={(e) => setHasDependents(e.target.checked)}
                className="rounded"
              />
              I have dependents (spouse, children, or parents)
            </label>
          </div>

          {/* Step-by-Step Calculation */}
          <div className="border border-slate-200 rounded-lg">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-700">
                Step-by-Step Calculation ({calculation.steps.length} steps)
              </span>
              {showSteps ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {showSteps && (
              <div className="border-t border-slate-200">
                  <div className="p-4 space-y-2">
                    {calculation.steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="text-sm bg-slate-50 rounded p-3 font-mono"
                      >
                        <div className="font-semibold text-slate-700 mb-1">
                          Step {step.stepNumber}: {step.description}
                        </div>
                        <div className="text-slate-600">
                          {step.currentCombined}% + {step.newDisability}% × (100 -{' '}
                          {step.currentCombined})% ÷ 100 = {step.additionalRating.toFixed(1)}%
                        </div>
                        <div className="text-blue-600 font-semibold mt-1">
                          New Combined: {step.newCombined.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                    <div className="text-sm bg-blue-100 rounded p-3 font-semibold text-blue-800">
                      Final: {calculation.combinedRating.toFixed(1)}% rounds to{' '}
                      {calculation.roundedRating}%
                    </div>
                  </div>
              </div>
            )}
          </div>

          {/* Next Milestone */}
          {calculation.nextMilestone && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-purple-800">
                    Next Milestone: {calculation.nextMilestone.targetRating}%
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    You need {calculation.nextMilestone.pointsNeeded.toFixed(1)} more points to
                    reach {calculation.nextMilestone.targetRating}%
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    <div className="font-medium mb-1">Suggestions:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {calculation.nextMilestone.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisabilityCalculator;
