import {
  ConditionCombatProfile,
  CRSCComputationInput,
  CRSCComputationResult,
  VACompensationTableEntry
} from '../../types/crscTypes';

const DEFAULT_VA_TABLE: VACompensationTableEntry[] = [
  { percentage: 10, baseAmount: 171.23 },
  { percentage: 20, baseAmount: 338.49 },
  { percentage: 30, baseAmount: 524.31 },
  { percentage: 40, baseAmount: 755.28 },
  { percentage: 50, baseAmount: 1075.16 },
  { percentage: 60, baseAmount: 1361.88 },
  { percentage: 70, baseAmount: 1729.86 },
  { percentage: 80, baseAmount: 2007.14 },
  { percentage: 90, baseAmount: 2253.39 },
  { percentage: 100, baseAmount: 3697.92 }
];

function isCombatRelated(condition: ConditionCombatProfile): boolean {
  const flags = condition.combatFlags || {};
  return (
    !!flags.armedConflict ||
    !!flags.hazardousService ||
    !!flags.simulatedWar ||
    !!flags.instrumentalityOfWar ||
    !!flags.purpleHeart
  ) && !flags.notCombatRelated;
}

function combineRatingsVA(ratings: number[]): number {
  // VA math: combine in descending order, rounding to nearest 10
  const sorted = [...ratings].sort((a, b) => b - a);
  let combined = 0;

  for (const rating of sorted) {
    const remainder = 100 - combined;
    combined += (remainder * rating) / 100;
  }

  const rounded = Math.round(combined / 10) * 10;
  return Math.min(rounded, 100);
}

function lookupVACompAmount(percentage: number, table?: VACompensationTableEntry[]): number {
  const source = table && table.length > 0 ? table : DEFAULT_VA_TABLE;
  const sorted = [...source].sort((a, b) => a.percentage - b.percentage);
  const match = [...sorted].reverse().find(row => percentage >= row.percentage);
  return match ? match.baseAmount : 0;
}

export function calculateCRSC(input: CRSCComputationInput): CRSCComputationResult {
  const rationale: string[] = [];

  const combatConditions = input.conditions
    .map(condition => ({ ...condition, isCombatRelated: isCombatRelated(condition) }))
    .filter(condition => condition.isCombatRelated);

  if (combatConditions.length === 0) {
    return {
      combatRelatedPercentage: 0,
      combatRelatedConditions: [],
      crscEligibleAmount: 0,
      retiredPayOffset: 0,
      crscFinalPayment: 0,
      rationale: ['No combat-related conditions identified. CRSC not payable.']
    };
  }

  const combatRatings = combatConditions.map(c => c.rating);
  const combatRelatedPercentage = combineRatingsVA(combatRatings);
  rationale.push(`Combined combat-related rating: ${combatRelatedPercentage}%.`);

  const combatRelatedVACompAmount = lookupVACompAmount(
    combatRelatedPercentage,
    input.vaCompensationTable
  );

  rationale.push(
    `VA compensation at ${combatRelatedPercentage}% (veteran alone table): $${combatRelatedVACompAmount.toFixed(2)}.`
  );

  const retiredPayOffset = Math.min(input.retiredPayAmount, input.vaWaiverAmount);
  rationale.push(`Retired pay offset (capped by waiver): $${retiredPayOffset.toFixed(2)}.`);

  const crscEligibleAmount = combatRelatedVACompAmount;
  const crscFinalPayment = Math.min(input.vaWaiverAmount, crscEligibleAmount);

  rationale.push(
    `CRSC payable is the lesser of VA waiver ($${input.vaWaiverAmount.toFixed(2)}) and combat-related VA comp ($${crscEligibleAmount.toFixed(2)}).`
  );

  return {
    combatRelatedPercentage,
    combatRelatedConditions: combatConditions,
    crscEligibleAmount,
    retiredPayOffset,
    crscFinalPayment,
    rationale
  };
}

export const CRSCUtils = {
  isCombatRelated,
  combineRatingsVA,
  lookupVACompAmount
};
