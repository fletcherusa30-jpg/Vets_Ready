import React from 'react';

interface Props {
  crscPayment: number;
  before: { monthlyIncomeNominal: number; readinessScore: number };
  after: { monthlyIncomeNominal: number; readinessScore: number };
}

export const CrscSimulationSummary: React.FC<Props> = ({ crscPayment, before, after }) => {
  return (
    <div className="p-4 border rounded bg-blue-50">
      <p className="text-sm text-blue-900 font-semibold">Estimated CRSC (tax-free): ${crscPayment.toFixed(2)}/mo</p>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
        <div>
          <p className="font-semibold">Monthly Income</p>
          <p>Before: ${before.monthlyIncomeNominal.toFixed(2)}</p>
          <p>After: ${after.monthlyIncomeNominal.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-semibold">Readiness Score</p>
          <p>Before: {before.readinessScore}</p>
          <p>After: {after.readinessScore}</p>
        </div>
      </div>
      <p className="text-xs text-blue-700 mt-2">Simulation only. Actual approval and payment are determined by your service branch.</p>
    </div>
  );
};
