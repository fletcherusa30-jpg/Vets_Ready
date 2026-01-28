/**
 * CRSC → Retirement cross-engine data contract (version 1).
 * Treats CRSC as tax-free income that restores waived retired pay.
 */

export interface CRSCToRetirementContract {
  crscFinalPayment: number; // monthly tax-free CRSC payment
  combatRelatedPercentage: number; // combined combat-related rating
  retiredPayOffset: number; // VA waiver amount (monthly)
  crscEligibleAmount: number; // combat-related VA comp amount (monthly)
  crscRationale: string[];
  evidenceStrength: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  version?: 'v1';
}
