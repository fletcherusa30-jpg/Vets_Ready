/**
 * DEA (Dependents' Educational Assistance) Mapper
 * Educational benefits for dependents of disabled veterans
 */

export interface DEAEligibility {
  eligible: boolean;
  relationship: 'Spouse' | 'Child' | 'Both';
  monthlyPayment: number;
  monthsAvailable: number;
  ageRestrictions?: string;
  timeRestrictions?: string;
  reasons: string[];
  nextSteps: string[];
}

export function checkDEAEligibility(profile: {
  isSpouse: boolean;
  isChild: boolean;
  childAge?: number;
  veteran100PercentPT?: boolean;
  veteranDiedFromServiceConnected?: boolean;
  veteranMIA?: boolean;
  veteranPOW?: boolean;
  spouseMarriageDate?: Date;
  veteranEffectiveDate?: Date;
}): DEAEligibility {
  const reasons: string[] = [];
  let eligible = false;
  let relationship: 'Spouse' | 'Child' | 'Both' | undefined;

  // Check veteran's status
  const veteranQualifies =
    profile.veteran100PercentPT ||
    profile.veteranDiedFromServiceConnected ||
    profile.veteranMIA ||
    profile.veteranPOW;

  if (!veteranQualifies) {
    return {
      eligible: false,
      relationship: 'Both',
      monthlyPayment: 0,
      monthsAvailable: 0,
      reasons: ['Veteran must be rated 100% P&T, died from service-connected condition, or be MIA/POW'],
      nextSteps: ['Verify veteran\'s disability rating and status'],
    };
  }

  // Spouse eligibility
  let spouseEligible = false;
  if (profile.isSpouse && veteranQualifies) {
    spouseEligible = true;
    reasons.push('Spouse of qualifying veteran');

    // Check marriage date vs effective date (must be married before or within certain timeframe)
    if (profile.spouseMarriageDate && profile.veteranEffectiveDate) {
      const marriageTime = profile.spouseMarriageDate.getTime();
      const effectiveTime = profile.veteranEffectiveDate.getTime();
      const tenYearsInMs = 10 * 365 * 24 * 60 * 60 * 1000;

      if (marriageTime < effectiveTime + tenYearsInMs) {
        reasons.push('Married within eligibility timeframe');
      }
    }
  }

  // Child eligibility
  let childEligible = false;
  if (profile.isChild && veteranQualifies) {
    if (profile.childAge && profile.childAge >= 18 && profile.childAge <= 26) {
      childEligible = true;
      reasons.push('Child between ages 18-26');
    }
  }

  eligible = spouseEligible || childEligible;

  if (spouseEligible && childEligible) {
    relationship = 'Both';
  } else if (spouseEligible) {
    relationship = 'Spouse';
  } else if (childEligible) {
    relationship = 'Child';
  }

  const nextSteps = eligible ? [
    'Apply at VA.gov using VA Form 22-5490',
    'Provide marriage certificate or birth certificate',
    'Provide veteran\'s disability rating letter',
    'Submit to school certifying official',
    'Receive $1,298/month for up to 45 months',
  ] : [
    'Verify veteran\'s 100% P&T status',
    'Check age requirements (18-26 for children)',
    'Contact VA Education at 1-888-442-4551',
  ];

  return {
    eligible,
    relationship: relationship || 'Both',
    monthlyPayment: 1298,
    monthsAvailable: 45,
    ageRestrictions: 'Children: 18-26 years old',
    timeRestrictions: 'Spouses: 10 years from effective date or remarriage',
    reasons,
    nextSteps,
  };
}

export function compareDEAtoOtherBenefits(): {
  benefit: string;
  monthlyAmount: string;
  duration: string;
  eligibility: string;
  transferable: string;
}[] {
  return [
    {
      benefit: 'DEA (Chapter 35)',
      monthlyAmount: '$1,298',
      duration: '45 months',
      eligibility: 'Dependents of 100% P&T or deceased',
      transferable: 'N/A (for dependents)',
    },
    {
      benefit: 'Post-9/11 GI Bill (Transferred)',
      monthlyAmount: 'Tuition + BAH',
      duration: '36 months',
      eligibility: 'Veteran transferred benefits',
      transferable: 'Yes (before separation)',
    },
    {
      benefit: 'Fry Scholarship',
      monthlyAmount: 'Full Post-9/11 benefits',
      duration: '36 months',
      eligibility: 'Child of servicemember who died in line of duty',
      transferable: 'N/A (for children only)',
    },
  ];
}

export function getDEATips(): string[] {
  return [
    'DEA provides 45 months vs 36 for GI Bill',
    'Lower monthly payment than Post-9/11 GI Bill',
    'No housing allowance (flat $1,298/month)',
    'Can use for degree, certificate, apprenticeship, or licensing',
    'Spouses have 10 years from effective date',
    'Children must use between ages 18-26',
    'Can use while in high school (age 18+)',
    'Cannot combine with other VA education benefits',
    'May be able to use Fry Scholarship instead if eligible',
    'Tutorial assistance available for certain subjects',
  ];
}
