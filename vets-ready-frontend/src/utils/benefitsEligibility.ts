import { VeteranProfile } from '../contexts/VeteranProfileContext';

export interface BenefitEligibility {
  name: string;
  eligible: boolean;
  description: string;
  estimatedMonthlyAmount?: number;
  requirements: string[];
  nextSteps: string[];
  category: 'compensation' | 'housing' | 'education' | 'healthcare' | 'other';
}

// 2024 VA Payment Rates
const VA_PAYMENT_RATES: { [key: number]: { alone: number; withSpouse: number; perChild: number } } = {
  10: { alone: 171.23, withSpouse: 171.23, perChild: 0 },
  20: { alone: 338.49, withSpouse: 338.49, perChild: 0 },
  30: { alone: 524.31, withSpouse: 573.56, perChild: 27.24 },
  40: { alone: 755.28, withSpouse: 829.19, perChild: 38.18 },
  50: { alone: 1075.16, withSpouse: 1171.81, perChild: 54.03 },
  60: { alone: 1361.88, withSpouse: 1478.75, perChild: 68.05 },
  70: { alone: 1716.28, withSpouse: 1861.23, perChild: 85.88 },
  80: { alone: 1995.01, withSpouse: 2161.15, perChild: 99.25 },
  90: { alone: 2241.91, withSpouse: 2428.01, perChild: 111.74 },
  100: { alone: 3737.85, withSpouse: 3946.25, perChild: 121.97 }
};

const SMC_RATES = {
  K: 134.29, // Aid & Attendance (SMC-K)
  L: 4762.96, // Loss of use of one limb
  L_half: 5627.08, // Loss of use of both feet or hands
  M: 6228.20, // Loss of use of both feet or hands + other
  N: 6829.32, // Higher level
  O: 8711.50, // Highest level
  R1: 3951.03, // Housebound (with 100% rating)
};

export const calculateDisabilityCompensation = (profile: VeteranProfile): number => {
  const rating = profile.vaDisabilityRating;
  if (rating === 0) return 0;

  const roundedRating = Math.round(rating / 10) * 10;
  const rates = VA_PAYMENT_RATES[roundedRating] || VA_PAYMENT_RATES[100];

  let baseAmount = profile.hasSpouse ? rates.withSpouse : rates.alone;
  baseAmount += profile.numberOfChildren * rates.perChild;

  return baseAmount;
};

export const checkSMCEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    profile.vaDisabilityRating >= 30 && (
      profile.hasAidAndAttendanceNeeds ||
      profile.isHousebound ||
      profile.hasLossOfUseOfLimb ||
      profile.hasBlindness
    );

  let estimatedAmount = 0;
  const requirements: string[] = [];

  if (profile.hasAidAndAttendanceNeeds) {
    estimatedAmount = SMC_RATES.K;
    requirements.push('Requires aid and attendance for daily living activities');
  }

  if (profile.isHousebound && profile.vaDisabilityRating === 100) {
    estimatedAmount = Math.max(estimatedAmount, SMC_RATES.R1 - VA_PAYMENT_RATES[100].alone);
    requirements.push('Permanently housebound with 100% disability rating');
  }

  if (profile.hasLossOfUseOfLimb) {
    estimatedAmount = Math.max(estimatedAmount, SMC_RATES.L);
    requirements.push('Anatomical loss or loss of use of one or more limbs');
  }

  if (profile.hasBlindness) {
    estimatedAmount = Math.max(estimatedAmount, SMC_RATES.L);
    requirements.push('Blindness in both eyes or loss of use of one eye');
  }

  return {
    name: 'Special Monthly Compensation (SMC)',
    eligible,
    description: 'Additional tax-free compensation for veterans with specific severe disabilities or who require aid and attendance',
    estimatedMonthlyAmount: estimatedAmount,
    requirements: eligible ? requirements : [
      'Must have VA disability rating of 30% or higher',
      'Must meet one of: Aid & Attendance needs, Housebound, Loss of limb, Blindness'
    ],
    nextSteps: eligible ? [
      'File VA Form 21-2680 (Examination for Housebound Status)',
      'File VA Form 21-0779 (Request for Nursing Home Information)',
      'Submit medical evidence of qualifying condition',
      'Contact VA to add SMC to existing disability claim'
    ] : [
      'Obtain medical evaluation for qualifying conditions',
      'Consult with VA or VSO about potential eligibility'
    ],
    category: 'compensation'
  };
};

export const checkDEAEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    (profile.vaDisabilityRating === 100 && profile.hasDependentsInSchool) ||
    (profile.isMedicallyRetired && profile.hasDependentsInSchool);

  return {
    name: 'Dependents\' Educational Assistance (DEA / Chapter 35)',
    eligible,
    description: 'Education and training benefits for dependents of veterans who are permanently and totally disabled or died from service-connected conditions',
    estimatedMonthlyAmount: eligible ? 1298 : 0, // 2024 rate
    requirements: eligible ? [
      '100% permanent and total disability rating',
      'Dependent child or spouse enrolled in approved education program'
    ] : [
      'Veteran must have 100% permanent and total disability rating',
      'OR veteran died from service-connected condition',
      'Dependent must be enrolled in approved educational program'
    ],
    nextSteps: eligible ? [
      'Apply using VA Form 22-5490',
      'Verify dependent eligibility',
      'Choose approved education program',
      'Submit application through VA.gov or with VSO'
    ] : [
      'Check if rating is permanent and total (P&T)',
      'Identify eligible dependents',
      'Research approved education programs'
    ],
    category: 'education'
  };
};

export const checkAidAndAttendanceEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    profile.vaDisabilityRating >= 30 &&
    profile.hasAidAndAttendanceNeeds;

  return {
    name: 'Aid and Attendance Benefit',
    eligible,
    description: 'Additional monthly benefit for veterans who require assistance with daily living activities',
    estimatedMonthlyAmount: eligible ? SMC_RATES.K : 0,
    requirements: eligible ? [
      'VA disability rating of 30% or higher',
      'Requires daily assistance with activities of daily living (bathing, dressing, eating)',
      'Medical evidence documenting need for aid and attendance'
    ] : [
      'Must have VA disability rating of 30% or higher',
      'Must require regular aid and attendance of another person',
      'Must be bedridden, blind, or need assistance with daily activities'
    ],
    nextSteps: eligible ? [
      'File VA Form 21-2680 (Examination for Housebound Status or Permanent Need for Aid and Attendance)',
      'Obtain physician statement documenting need for daily assistance',
      'Submit medical evidence with VA claim',
      'Contact VA at 1-800-827-1000 to initiate claim'
    ] : [
      'Get medical evaluation documenting daily living assistance needs',
      'Consult with VA or VSO about qualifying conditions'
    ],
    category: 'compensation'
  };
};

export const checkSAHEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    profile.needsSpecialAdaptedHousing &&
    (profile.hasLossOfUseOfLimb || profile.hasBlindness);

  const grantAmount = 101754; // 2024 SAH grant max

  return {
    name: 'Specially Adapted Housing (SAH) Grant',
    eligible,
    description: 'Grant to help veterans with certain service-connected disabilities buy, build, or modify a home to meet their needs',
    estimatedMonthlyAmount: 0, // One-time grant
    requirements: eligible ? [
      'Service-connected loss or loss of use of both lower extremities',
      'OR blindness in both eyes with 5/200 visual acuity or less',
      'OR loss or loss of use of one lower extremity with other qualifying disabilities',
      `Up to $${grantAmount.toLocaleString()} grant (2024)`
    ] : [
      'Must have qualifying service-connected disability',
      'Loss of use of both legs',
      'OR blindness in both eyes',
      'OR loss of use of one leg plus other severe disabilities'
    ],
    nextSteps: eligible ? [
      'File VA Form 26-4555 (Application for Specially Adapted Housing)',
      'Obtain medical documentation of disability',
      'Work with VA-approved architect/contractor',
      'Submit home modification plans to VA for approval',
      'Contact VA SAH program: 1-877-827-3702'
    ] : [
      'Get medical evaluation documenting qualifying conditions',
      'Research SAH program requirements at VA.gov'
    ],
    category: 'housing'
  };
};

export const checkSHAEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    profile.needsSpecialAdaptedHousing &&
    profile.vaDisabilityRating >= 50;

  const grantAmount = 20387; // 2024 SHA grant max

  return {
    name: 'Special Home Adaptation (SHA) Grant',
    eligible,
    description: 'Grant to help veterans adapt a home for wheelchair accessibility or other mobility needs',
    estimatedMonthlyAmount: 0, // One-time grant
    requirements: eligible ? [
      'Service-connected disability rated at 50% or higher',
      'Blindness in both eyes with specific visual acuity',
      'OR loss or loss of use of both hands',
      `Up to $${grantAmount.toLocaleString()} grant (2024)`
    ] : [
      'Must have VA disability rating of 50% or higher',
      'Blindness in both eyes OR loss of use of both hands',
      'Need for home adaptations due to disability'
    ],
    nextSteps: eligible ? [
      'File VA Form 26-4555 (Application for Special Home Adaptation)',
      'Obtain medical documentation',
      'Identify specific home modifications needed',
      'Submit modification plans to VA',
      'Contact VA SAH program: 1-877-827-3702'
    ] : [
      'Get medical evaluation for qualifying conditions',
      'Research SHA program at VA.gov'
    ],
    category: 'housing'
  };
};

export const checkHouseboundEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible =
    profile.isHousebound &&
    profile.vaDisabilityRating === 100;

  const additionalAmount = eligible ? (SMC_RATES.R1 - VA_PAYMENT_RATES[100].alone) : 0;

  return {
    name: 'Housebound Allowance',
    eligible,
    description: 'Additional monthly payment for veterans with 100% disability rating who are permanently housebound',
    estimatedMonthlyAmount: additionalAmount,
    requirements: eligible ? [
      '100% VA disability rating',
      'Permanently housebound due to service-connected disability',
      'Cannot leave home without assistance'
    ] : [
      'Must have 100% VA disability rating',
      'Must be substantially confined to home and immediate premises',
      'Confinement must be due to service-connected disability'
    ],
    nextSteps: eligible ? [
      'File VA Form 21-2680 (Examination for Housebound Status)',
      'Obtain physician statement confirming housebound status',
      'Submit medical evidence',
      'Contact VA to add housebound allowance to claim'
    ] : [
      'Obtain 100% VA disability rating first',
      'Get medical documentation of housebound status'
    ],
    category: 'compensation'
  };
};

export const checkCRSCEligibility = (profile: VeteranProfile): BenefitEligibility => {
  // CRSC is primarily for medically retired veterans with <20 years
  // OR military retirees (20+ years) with combat-related disabilities
  const eligible =
    (profile.isMedicallyRetired || (profile.isRetired && profile.yearsOfService >= 20)) &&
    profile.vaDisabilityRating >= 10 &&
    profile.hasCombatService;

  const estimatedAmount = eligible ? calculateDisabilityCompensation(profile) : 0;

  return {
    name: 'Combat-Related Special Compensation (CRSC)',
    eligible,
    description: 'Tax-free DOD benefit for military retirees with combat-related disabilities that offsets the VA waiver',
    estimatedMonthlyAmount: estimatedAmount,
    requirements: eligible ? [
      'Military retired or medically retired status',
      'VA service-connected disability rating of 10% or higher',
      'Disability is combat-related: armed conflict, hostile fire zone, hazardous duty (parachuting, diving, flight ops, EOD), training exercises/field operations, or instrumentality of war'
    ] : [
      'Must be military retired (20+ years) OR medically retired (any years)',
      'Must have VA service-connected disability rating of 10%+',
      'Disability must be combat-related (includes hazardous duty, training accidents, hostile fire zones)'
    ],
    nextSteps: eligible ? [
      'Complete DD Form 2860 (CRSC Application)',
      'Gather combat/deployment documentation (DD-214, orders, after-action reports)',
      'Obtain VA rating decision letter',
      'Gather medical evidence linking disability to combat',
      'Submit to your military branch CRSC office (Air Force, Army, Navy/MC, or CG)',
      'See Benefits > CRSC tab for full application guide'
    ] : [
      'If medically retired with <20 years, you may still qualify - check combat service',
      'Obtain VA disability rating if not yet rated',
      'Determine if disabilities are combat-related'
    ],
    category: 'compensation'
  };
};

export const checkVocRehabEligibility = (profile: VeteranProfile): BenefitEligibility => {
  const eligible = profile.vaDisabilityRating >= 10;

  return {
    name: 'Vocational Rehailitation & Employment (VR&E / Chapter 31)',
    eligible,
    description: 'Help with job training, employment accommodations, resume development, and job seeking skills',
    estimatedMonthlyAmount: 0,
    requirements: eligible ? [
      'VA disability rating of 10% or higher',
      'Service-connected disability that impacts employment',
      'Within 12-year eligibility period (from discharge or rating decision)'
    ] : [
      'Must have VA disability rating of 10% or higher',
      'Disability must create employment barrier',
      'Must be within 12-year eligibility window'
    ],
    nextSteps: eligible ? [
      'Apply using VA Form 28-1900',
      'Complete orientation session with VR&E counselor',
      'Develop individualized rehabilitation plan',
      'Start training or education program'
    ] : [
      'Obtain VA disability rating of at least 10%',
      'Document employment impact of disability'
    ],
    category: 'education'
  };
};

export const getAllBenefitsEligibility = (profile: VeteranProfile): BenefitEligibility[] => {
  return [
    checkSMCEligibility(profile),
    checkDEAEligibility(profile),
    checkAidAndAttendanceEligibility(profile),
    checkSAHEligibility(profile),
    checkSHAEligibility(profile),
    checkHouseboundEligibility(profile),
    checkCRSCEligibility(profile),
    checkVocRehabEligibility(profile)
  ];
};

export const getEligibleBenefits = (profile: VeteranProfile): BenefitEligibility[] => {
  return getAllBenefitsEligibility(profile).filter(benefit => benefit.eligible);
};

export const getTotalMonthlyBenefits = (profile: VeteranProfile): number => {
  const eligibleBenefits = getEligibleBenefits(profile);
  return eligibleBenefits.reduce((total, benefit) => {
    return total + (benefit.estimatedMonthlyAmount || 0);
  }, 0);
};
