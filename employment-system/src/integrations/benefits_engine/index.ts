/**
 * Benefits Engine Integration
 * Connects employment system to rallyforge benefits calculations
 */

export interface BenefitsData {
  vaDisabilityRating: number;
  monthlyCompensation: number;
  giBillEligible: boolean;
  giBillMonthsRemaining: number;
  vrEligible: boolean;
  champVAEligible: boolean;
  dependents: number;
}

export interface EducationBenefits {
  giBillType: 'Post-9/11' | 'Montgomery' | 'None';
  monthsRemaining: number;
  housingAllowance: number;
  bookStipend: number;
  tutionCoverage: number;
}

/**
 * Fetch veteran benefits data
 */
export async function fetchBenefitsData(veteranId: string): Promise<BenefitsData | null> {
  try {
    // In production, call rallyforge benefits API
    // For now, return mock data
    return {
      vaDisabilityRating: 70,
      monthlyCompensation: 1755.35,
      giBillEligible: true,
      giBillMonthsRemaining: 24,
      vrEligible: true,
      champVAEligible: true,
      dependents: 2
    };
  } catch (error) {
    console.error(`Error fetching benefits for veteran ${veteranId}:`, error);
    return null;
  }
}

/**
 * Get education benefits information
 */
export async function getEducationBenefits(veteranId: string): Promise<EducationBenefits | null> {
  try {
    const benefits = await fetchBenefitsData(veteranId);

    if (!benefits || !benefits.giBillEligible) {
      return {
        giBillType: 'None',
        monthsRemaining: 0,
        housingAllowance: 0,
        bookStipend: 0,
        tutionCoverage: 0
      };
    }

    return {
      giBillType: 'Post-9/11',
      monthsRemaining: benefits.giBillMonthsRemaining,
      housingAllowance: 2200, // Varies by location
      bookStipend: 1000,
      tutionCoverage: 100 // Percentage
    };
  } catch (error) {
    console.error(`Error fetching education benefits:`, error);
    return null;
  }
}

/**
 * Calculate total available education funding
 */
export async function calculateEducationFunding(veteranId: string): Promise<number> {
  const benefits = await getEducationBenefits(veteranId);

  if (!benefits || benefits.giBillType === 'None') {
    return 0;
  }

  // Rough calculation: months remaining * (avg tuition + housing + books)
  const monthlyBenefit = 3000 + benefits.housingAllowance + (benefits.bookStipend / 12);
  return monthlyBenefit * benefits.monthsRemaining;
}

/**
 * Check if veteran is eligible for Vocational Rehabilitation
 */
export async function checkVReligibility(veteranId: string): Promise<boolean> {
  const benefits = await fetchBenefitsData(veteranId);
  return benefits?.vrEligible || false;
}

/**
 * Get financial assistance recommendations
 */
export interface FinancialAssistance {
  program: string;
  amount: number;
  eligibility: string;
  howToApply: string;
}

export async function getFinancialAssistanceRecommendations(
  veteranId: string
): Promise<FinancialAssistance[]> {
  const benefits = await fetchBenefitsData(veteranId);
  const recommendations: FinancialAssistance[] = [];

  if (benefits?.giBillEligible) {
    recommendations.push({
      program: 'Post-9/11 GI Bill',
      amount: await calculateEducationFunding(veteranId),
      eligibility: 'Active after 9/11/2001 with 90+ days of service',
      howToApply: 'Apply through VA Form 22-1990 at va.gov'
    });
  }

  if (benefits?.vrEligible) {
    recommendations.push({
      program: 'Vocational Rehabilitation (VR&E)',
      amount: 0, // Covers full cost
      eligibility: '10%+ VA disability rating with employment barrier',
      howToApply: 'Apply through VA Form 28-1900 at va.gov'
    });
  }

  if (benefits && benefits.vaDisabilityRating >= 30) {
    recommendations.push({
      program: 'VET TEC',
      amount: 25000,
      eligibility: 'GI Bill eligibility + interest in high-tech training',
      howToApply: 'Apply through VA Form 22-0994'
    });
  }

  return recommendations;
}

