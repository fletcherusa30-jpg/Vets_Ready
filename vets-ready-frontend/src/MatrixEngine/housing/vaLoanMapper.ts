/**
 * VA Loan Mapper
 * Provides VA home loan guidance and calculations
 */

export interface VALoanBenefit {
  name: string;
  description: string;
  value: string;
}

export interface VALoanEligibility {
  eligible: boolean;
  entitlementAmount: number;
  reasons: string[];
  requirements: string[];
  nextSteps: string[];
}

export function checkVALoanEligibility(profile: {
  daysOfService: number;
  honorableDischarge: boolean;
  activeDuty?: boolean;
  reserveGuard?: boolean;
  survivingSpouse?: boolean;
}): VALoanEligibility {
  const reasons: string[] = [];
  const requirements: string[] = [];
  let eligible = false;
  let entitlement = 0;

  // Active duty
  if (profile.activeDuty && profile.daysOfService >= 90) {
    eligible = true;
    entitlement = 36000;
    reasons.push('Currently serving on active duty for 90+ days');
  }

  // Veterans
  if (profile.honorableDischarge) {
    if (profile.daysOfService >= 90) {
      eligible = true;
      entitlement = 36000;
      reasons.push('Served 90+ days on active duty with honorable discharge');
    } else if (profile.daysOfService >= 181 && profile.reserveGuard) {
      eligible = true;
      entitlement = 36000;
      reasons.push('Served 6+ years in reserves/guard');
    }
  }

  if (profile.survivingSpouse) {
    eligible = true;
    entitlement = 36000;
    reasons.push('Surviving spouse of servicemember who died in service or from service-connected disability');
  }

  if (!eligible) {
    requirements.push('90+ days active duty service OR 6+ years reserves/guard');
    requirements.push('Honorable discharge (or currently serving)');
  }

  const nextSteps = eligible ? [
    'Get Certificate of Eligibility (COE) at VA.gov or through lender',
    'Check your credit score (620+ recommended)',
    'Get pre-approved with VA-approved lender',
    'Find a home within VA loan limits',
    'Make offer and complete VA appraisal',
  ] : [
    'Verify your service dates and discharge status',
    'Request DD-214 if you don\'t have it',
    'Contact VA at 1-877-827-3702 for eligibility questions',
  ];

  return {
    eligible,
    entitlementAmount: entitlement,
    reasons,
    requirements,
    nextSteps,
  };
}

export function calculateVALoan(
  homePrice: number,
  downPayment: number,
  interestRate: number,
  fundingFeePercent: number
): {
  loanAmount: number;
  monthlyPayment: number;
  totalFundingFee: number;
  totalInterest: number;
  totalCost: number;
} {
  const fundingFee = homePrice * (fundingFeePercent / 100);
  const loanAmount = homePrice - downPayment + fundingFee;

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360; // 30 years

  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalInterest = (monthlyPayment * numPayments) - loanAmount;
  const totalCost = downPayment + (monthlyPayment * numPayments);

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalFundingFee: Math.round(fundingFee),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
  };
}

export function getFundingFeePercent(
  firstTime: boolean,
  downPaymentPercent: number,
  disabilityRating?: number
): number {
  // Disabled veterans exempt
  if (disabilityRating && disabilityRating >= 10) return 0;

  // No down payment
  if (downPaymentPercent < 5) {
    return firstTime ? 2.15 : 3.3;
  }

  // 5-9% down
  if (downPaymentPercent < 10) {
    return firstTime ? 1.5 : 1.5;
  }

  // 10%+ down
  return firstTime ? 1.25 : 1.25;
}

export const VA_LOAN_BENEFITS: VALoanBenefit[] = [
  {
    name: 'No Down Payment Required',
    description: 'Can finance 100% of home value (up to loan limits)',
    value: 'Save $10,000-$50,000+',
  },
  {
    name: 'No Private Mortgage Insurance (PMI)',
    description: 'Conventional loans require PMI with <20% down',
    value: 'Save $50-300/month',
  },
  {
    name: 'Competitive Interest Rates',
    description: 'Typically 0.25-0.5% lower than conventional',
    value: 'Save $10,000-30,000 over life of loan',
  },
  {
    name: 'No Prepayment Penalty',
    description: 'Pay off early without fees',
    value: 'Flexibility to refinance or pay down',
  },
  {
    name: 'Easier Qualification',
    description: 'More lenient credit and debt-to-income requirements',
    value: 'Can qualify with 580-620 credit score',
  },
  {
    name: 'Assumable Loan',
    description: 'Buyer can assume your low rate when selling',
    value: 'Increases home value in high-rate environment',
  },
];

export function getVALoanTips(): string[] {
  return [
    'Funding fee can be rolled into loan (don\'t need cash)',
    'Disabled veterans (10%+) exempt from funding fee',
    'Can use VA loan multiple times (entitlement restores when sold)',
    'VA appraisal ensures home meets minimum standards',
    'Can use for primary residence only (not investment property)',
    'Can buy multi-unit property if you live in one unit',
    'Seller can pay closing costs',
    'Refinance options: VA IRRRL (streamline) saves time and money',
    'No maximum home price, but loan limits affect down payment',
    'Shop multiple VA-approved lenders for best rate',
  ];
}
