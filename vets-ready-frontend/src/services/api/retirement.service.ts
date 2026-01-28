/**
 * Retirement Planning API Service
 */

import api from '../../lib/api';

export interface RetirementEligibilityRequest {
  years_of_service: number;
  rank: string;
  branch: string;
}

export interface PensionCalculationRequest {
  base_pay: number;
  years_of_service: number;
  disability_rating?: number;
}

export interface BudgetCalculationRequest {
  monthly_income: number;
  expenses: Record<string, number>;
}

export interface RetirementEligibilityResponse {
  eligible: boolean;
  years_remaining?: number;
  estimated_pension?: number;
  message: string;
}

export interface PensionCalculationResponse {
  monthly_pension: number;
  annual_pension: number;
  disability_pay: number;
  total_monthly: number;
  total_annual: number;
  breakdown: {
    base_pension: number;
    disability_compensation: number;
  };
}

export interface BudgetResponse {
  total_income: number;
  total_expenses: number;
  net_monthly: number;
  savings_rate: number;
  budget_status: 'surplus' | 'balanced' | 'deficit';
  recommendations: string[];
}

export interface EnhancedRetirementRequest {
  branch: string;
  payGrade: string;
  yearsOfService: number;
  retirementSystem: 'HIGH_3' | 'BRS';
  disabilityRating: number;
  hasSpouse: boolean;
  numChildren: number;
  tspBalance: number;
  tspMonthlyContribution: number;
  tspAnnualReturn: number;
  enrollInSBP: boolean;
  stateOfResidence: string;
  tricareType: 'select' | 'prime' | 'forLife';
  isFamilyCoverage: boolean;
}

export interface EnhancedRetirementResponse {
  monthlyPension: number;
  monthlyDisability: number;
  monthlySBPCost: number;
  monthlyTricareCost: number;
  monthlyTSPWithdrawal: number;
  totalMonthlyGross: number;
  totalMonthlyNet: number;
  annualPension: number;
  annualDisability: number;
  annualTSP: number;
  annualGross: number;
  annualNet: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  crdpEligible: boolean;
  crdpAmount: number;
  colaProjections: Array<{year: number; amount: number}>;
  tspGrowth: Array<{year: number; balance: number}>;
}

class RetirementService {
  /**
   * Check retirement eligibility
   */
  async checkEligibility(data: RetirementEligibilityRequest): Promise<RetirementEligibilityResponse> {
    const response = await api.post<RetirementEligibilityResponse>('/api/retirement/eligibility', data);
    return response.data;
  }

  /**
   * Calculate monthly pension
   */
  async calculatePension(data: PensionCalculationRequest): Promise<PensionCalculationResponse> {
    const response = await api.post<PensionCalculationResponse>('/api/retirement/pension', data);
    return response.data;
  }

  /**
   * Calculate budget
   */
  async calculateBudget(data: BudgetCalculationRequest): Promise<BudgetResponse> {
    const response = await api.post<BudgetResponse>('/api/retirement/budget', data);
    return response.data;
  }

  /**
   * Enhanced retirement calculation with all features
   */
  async calculateEnhancedRetirement(data: EnhancedRetirementRequest): Promise<EnhancedRetirementResponse> {
    const response = await api.post<EnhancedRetirementResponse>('/api/retirement/enhanced', data);
    return response.data;
  }
}

export const retirementService = new RetirementService();
export default retirementService;
