/**
 * SAH/SHA/TRA Mapper
 * Special Adapted Housing grants for disabled veterans
 */

export interface HousingGrant {
  id: string;
  name: string;
  acronym: string;
  maxAmount: number;
  eligibilityRequirements: string[];
  allowedUses: string[];
  limitations: string[];
  canUseMultipleTimes: boolean;
}

export const HOUSING_GRANTS: HousingGrant[] = [
  {
    id: 'sah',
    name: 'Specially Adapted Housing Grant',
    acronym: 'SAH',
    maxAmount: 109986,
    eligibilityRequirements: [
      'Loss or loss of use of both legs',
      'Loss or loss of use of both arms',
      'Blindness in both eyes with 5/200 visual acuity or less',
      'Loss or loss of use of one leg + residuals of organic disease/injury',
      'Loss or loss of use of lower extremities + severe burn injury',
    ],
    allowedUses: [
      'Build specially adapted home',
      'Modify existing home',
      'Pay off existing mortgage on adapted home',
    ],
    limitations: [
      'Can use up to 3 times',
      'Must be for primary residence',
      'Must occupy home',
    ],
    canUseMultipleTimes: true,
  },
  {
    id: 'sha',
    name: 'Special Housing Adaptation Grant',
    acronym: 'SHA',
    maxAmount: 22036,
    eligibilityRequirements: [
      'Blindness in both eyes with 20/200 visual acuity or less',
      'Loss or loss of use of both hands',
      'Severe burn injuries',
      'Severe respiratory injuries',
    ],
    allowedUses: [
      'Adapt existing home',
      'Adapt home family member lives in',
      'Make home wheelchair accessible',
    ],
    limitations: [
      'Can use up to 6 times',
      'Must live in adapted home',
    ],
    canUseMultipleTimes: true,
  },
  {
    id: 'tra',
    name: 'Temporary Residence Adaptation Grant',
    acronym: 'TRA',
    maxAmount: 43995,
    eligibilityRequirements: [
      'Eligible for SAH grant',
      'Living temporarily in family member\'s home',
    ],
    allowedUses: [
      'Adapt family member\'s home',
      'Adapt temporary residence',
    ],
    limitations: [
      'Must be living temporarily with family',
      'Cannot use for own home (use SAH instead)',
    ],
    canUseMultipleTimes: true,
  },
];

export function checkGrantEligibility(profile: {
  disabilities: string[];
  disabilityRating: number;
  ownsHome: boolean;
  livesWithFamily: boolean;
}): {
  eligible: boolean;
  grants: HousingGrant[];
  recommendations: string[];
} {
  const eligibleGrants: HousingGrant[] = [];
  const recommendations: string[] = [];

  // Check each grant type
  HOUSING_GRANTS.forEach(grant => {
    // Simplified eligibility check - in production would be more detailed
    if (profile.disabilityRating >= 50) {
      eligibleGrants.push(grant);
    }
  });

  if (eligibleGrants.length > 0) {
    recommendations.push('Apply at VA.gov or call 1-877-827-3702');
    recommendations.push('Grants can cover ramps, widened doorways, roll-in showers, etc.');
    recommendations.push('Work with VA-approved contractor or architect');
    recommendations.push('Can combine with VA Home Loan');
  }

  return {
    eligible: eligibleGrants.length > 0,
    grants: eligibleGrants,
    recommendations,
  };
}

export function getModificationExamples(): {
  modification: string;
  cost: string;
  sahCovered: boolean;
  shaCovered: boolean;
}[] {
  return [
    {
      modification: 'Wheelchair ramp',
      cost: '$2,000-$5,000',
      sahCovered: true,
      shaCovered: true,
    },
    {
      modification: 'Widened doorways',
      cost: '$1,000-$3,000',
      sahCovered: true,
      shaCovered: true,
    },
    {
      modification: 'Roll-in shower',
      cost: '$5,000-$10,000',
      sahCovered: true,
      shaCovered: true,
    },
    {
      modification: 'Lowered countertops',
      cost: '$2,000-$6,000',
      sahCovered: true,
      shaCovered: true,
    },
    {
      modification: 'Elevator/lift',
      cost: '$15,000-$30,000',
      sahCovered: true,
      shaCovered: false,
    },
  ];
}
