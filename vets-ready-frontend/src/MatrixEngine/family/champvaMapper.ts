/**
 * CHAMPVA Mapper
 * CHAMPVA eligibility and benefits for family members
 */

export interface CHAMPVAEligibility {
  eligible: boolean;
  eligibilityType?: 'Spouse' | 'Child' | 'Surviving Spouse';
  reasons: string[];
  benefits: string[];
  nextSteps: string[];
  costSharing: {
    outpatientDeductible: number;
    inpatientDeductible: number;
    costSharePercentage: number;
    catastrophicCap: number;
  };
}

export function checkCHAMPVAEligibility(profile: {
  isSpouse: boolean;
  isChild: boolean;
  isSurvivingSpouse: boolean;
  veteranDisabilityRating?: number;
  veteran100PercentPT?: boolean;
  veteranDiedFromServiceConnected?: boolean;
  childAge?: number;
  childDisabled?: boolean;
  remarried?: boolean;
}): CHAMPVAEligibility {
  const reasons: string[] = [];
  let eligible = false;
  let eligibilityType: 'Spouse' | 'Child' | 'Surviving Spouse' | undefined;

  // Spouse of 100% P&T veteran
  if (profile.isSpouse && profile.veteran100PercentPT && !profile.remarried) {
    eligible = true;
    eligibilityType = 'Spouse';
    reasons.push('Spouse of veteran rated 100% Permanent & Total');
    reasons.push('Not eligible for TRICARE');
  }

  // Surviving spouse
  if (profile.isSurvivingSpouse && !profile.remarried) {
    if (profile.veteranDiedFromServiceConnected) {
      eligible = true;
      eligibilityType = 'Surviving Spouse';
      reasons.push('Surviving spouse - veteran died from service-connected condition');
    } else if (profile.veteran100PercentPT) {
      eligible = true;
      eligibilityType = 'Surviving Spouse';
      reasons.push('Surviving spouse - veteran was rated 100% P&T at time of death');
    }
  }

  // Child
  if (profile.isChild) {
    if (profile.childAge && profile.childAge < 18) {
      eligible = true;
      eligibilityType = 'Child';
      reasons.push('Child under 18');
    } else if (profile.childAge && profile.childAge < 23 && profile.childAge >= 18) {
      eligible = true;
      eligibilityType = 'Child';
      reasons.push('Child age 18-23 enrolled in school full-time');
    } else if (profile.childDisabled) {
      eligible = true;
      eligibilityType = 'Child';
      reasons.push('Child permanently disabled before age 18');
    }
  }

  const benefits = eligible ? [
    'Medical care (inpatient and outpatient)',
    'Mental health services',
    'Prescriptions',
    'Durable medical equipment',
    'Ambulance service',
    'Hospice',
  ] : [];

  const nextSteps = eligible ? [
    'Apply online at VA.gov or mail VA Form 10-10d',
    'Provide marriage certificate or birth certificate',
    'Provide veteran\'s DD-214 and disability rating letter',
    'Allow 6-8 weeks for processing',
    'Once approved, find CHAMPVA-authorized provider',
  ] : [
    'Verify veteran\'s 100% P&T rating',
    'Check if you have other health insurance (CHAMPVA is secondary)',
    'Contact VA at 1-800-733-8387 for eligibility questions',
  ];

  return {
    eligible,
    eligibilityType,
    reasons,
    benefits,
    nextSteps,
    costSharing: {
      outpatientDeductible: 50,
      inpatientDeductible: 0,
      costSharePercentage: 25,
      catastrophicCap: 3000,
    },
  };
}

export function getCHAMPVATips(): string[] {
  return [
    'CHAMPVA is secondary to all other health insurance',
    'No enrollment fee or monthly premium',
    'Covers family members, not the veteran',
    'Can use any provider who accepts CHAMPVA',
    'Medicare-eligible at 65 must enroll in Part B to keep CHAMPVA',
    '$50 outpatient deductible per year',
    '25% cost-share after deductible',
    '$3,000 catastrophic cap per year',
    'Pharmacy benefits through Meds by Mail',
    'Can add dental/vision through private insurance',
  ];
}
