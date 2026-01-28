import {
  CRSCAppealStrategy as AppealStrategyOutput,
  CRSCEvidenceMappingResult,
  CRSCComputationResult
} from '../../types/crscTypes';

interface AppealStrategyInput {
  decisionOutcome: 'approved' | 'partially_approved' | 'denied';
  decisionReasons?: string[];
  evidenceMap: CRSCEvidenceMappingResult | null;
  computation: CRSCComputationResult | null;
}

export function buildAppealStrategy(input: AppealStrategyInput): AppealStrategyOutput {
  const keyIssues: string[] = [];
  const evidenceToHighlight: string[] = [];
  const additionalEvidenceToConsider: string[] = [];
  const strategyOutline: string[] = [];

  if (!input.evidenceMap || !input.computation) {
    return {
      appealViability: 'LOW',
      keyIssues: ['We need combat-related flags and evidence links before suggesting an appeal.'],
      evidenceToHighlight: [],
      additionalEvidenceToConsider: ['Add STR, LOD, or award citations tied to each condition.'],
      strategyOutline: [],
      veteranSummary: ['Add combat-related evidence and rerun the evaluation before considering an appeal.']
    };
  }

  // Identify conditions with gaps
  input.evidenceMap.conditions.forEach(cond => {
    if (cond.gaps.length > 0 || cond.combatCategory === 'not_combat_related') {
      keyIssues.push(`${cond.name}: combat status unclear or evidence missing.`);
      additionalEvidenceToConsider.push(`Add documentation for ${cond.name} (STR, LOD, AAR, award).`);
    }
    if (cond.evidence.length > 0) {
      evidenceToHighlight.push(`${cond.name}: ${cond.evidence.length} linked evidence item(s).`);
    }
  });

  if (input.decisionReasons && input.decisionReasons.length > 0) {
    strategyOutline.push('Address each reason from the decision letter with targeted evidence.');
    input.decisionReasons.forEach(reason => strategyOutline.push(`Counter: ${reason}`));
  }

  strategyOutline.push('Clarify the combat category for each condition (armed conflict, hazardous service, etc.).');
  strategyOutline.push('Ensure VA waiver and retired pay amounts are documented to support payment math.');

  const appealViability: AppealStrategyOutput['appealViability'] =
    keyIssues.length === 0 ? 'HIGH' : keyIssues.length <= 2 ? 'MEDIUM' : 'LOW';

  const veteranSummary = [
    'If you disagree with the decision, focus on clearly linking each condition to a combat-related event.',
    'Highlight official records (STR, LOD, AAR, award citations) and clarify the combat category.',
    'Submit additional evidence or statements to address the decision letter reasons.'
  ];

  return {
    appealViability,
    keyIssues,
    evidenceToHighlight,
    additionalEvidenceToConsider,
    strategyOutline,
    veteranSummary
  };
}
