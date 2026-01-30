import { describe, it, expect } from 'vitest';
import { calculateCRSC, CRSCUtils } from '../CRSCRatingCalculator';
import { ConditionCombatProfile } from '../../../types/crscTypes';

describe('CRSC Rating Calculator', () => {
  const baseConditions: ConditionCombatProfile[] = [
    {
      id: 'knee',
      name: 'Right Knee',
      rating: 30,
      combatFlags: { armedConflict: true }
    },
    {
      id: 'tinnitus',
      name: 'Tinnitus',
      rating: 10,
      combatFlags: { hazardousService: true }
    },
    {
      id: 'sleep',
      name: 'Sleep Apnea',
      rating: 50,
      combatFlags: { notCombatRelated: true }
    }
  ];

  it('combines only combat-related ratings with VA math and caps to waiver', () => {
    const result = calculateCRSC({
      conditions: baseConditions,
      retirementType: '20-year',
      retiredPayAmount: 2500,
      vaCompensationAmount: 3697.92,
      vaWaiverAmount: 1200
    });

    expect(result.combatRelatedPercentage).toBe(40); // 30 + (70*10%) = 37 -> rounds to 40
    expect(result.crscEligibleAmount).toBeGreaterThan(0);
    expect(result.crscFinalPayment).toBeLessThanOrEqual(1200);
  });

  it('returns zero when no combat-related conditions are flagged', () => {
    const nonCombat = baseConditions.map(c => ({ ...c, combatFlags: { notCombatRelated: true } }));
    const result = calculateCRSC({
      conditions: nonCombat,
      retirementType: '20-year',
      retiredPayAmount: 2000,
      vaCompensationAmount: 2000,
      vaWaiverAmount: 500
    });
    expect(result.combatRelatedPercentage).toBe(0);
    expect(result.crscFinalPayment).toBe(0);
  });
});

describe('VA math utility', () => {
  it('combines ratings in descending order and rounds to nearest 10', () => {
    const pct = CRSCUtils.combineRatingsVA([50, 30, 10]);
    expect(pct).toBe(70);
  });
});
