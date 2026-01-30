import React, { useMemo } from 'react';
import { useVeteranProfile } from '../../../../src/contexts/VeteranProfileContext';
import { runCrscApprovalScenario } from '../../../services/crsc/CrscScenarioEngine';
import { RetirementPlanInput } from '../../../../retirement/types';
import { CrscSimulationSummary } from './CrscSimulationSummary';
import { CrscIncomeDeltaCard } from './CrscIncomeDeltaCard';
import { CrscReadinessDeltaGauge } from './CrscReadinessDeltaGauge';

interface Props {
  plan: RetirementPlanInput;
  crscResult: { crscFinalPayment: number; combatRelatedPercentage: number; crscEligibleAmount: number; retiredPayOffset: number; rationale: string[] };
}

export const CrscSimulationPanel: React.FC<Props> = ({ plan, crscResult }) => {
  const { profile } = useVeteranProfile();

  const scenario = useMemo(() => {
    return runCrscApprovalScenario(plan, crscResult as any, 'MEDIUM');
  }, [plan, crscResult]);

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">What if my CRSC is approved?</h3>
          <p className="text-sm text-gray-600">Simulation only. Does not change your plan.</p>
        </div>
        <button className="px-4 py-2 text-sm bg-gray-100 rounded" disabled>
          Apply to My Plan (confirm first)
        </button>
      </div>

      <CrscSimulationSummary
        crscPayment={crscResult.crscFinalPayment}
        before={scenario.before.summary}
        after={scenario.after.summary}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CrscIncomeDeltaCard
          before={scenario.before.summary.monthlyIncomeNominal}
          after={scenario.after.summary.monthlyIncomeNominal}
          crscPayment={crscResult.crscFinalPayment}
        />
        <CrscReadinessDeltaGauge
          before={scenario.before.summary.readinessScore}
          after={scenario.after.summary.readinessScore}
        />
        <div className="p-4 border rounded">
          <p className="text-sm text-gray-700 font-semibold">Years Covered (est)</p>
          <p className="text-2xl font-bold text-gray-900">+ Impact with CRSC</p>
          <p className="text-xs text-gray-500">This is an estimate; detailed projection requires full budget.</p>
        </div>
      </div>
    </div>
  );
};
