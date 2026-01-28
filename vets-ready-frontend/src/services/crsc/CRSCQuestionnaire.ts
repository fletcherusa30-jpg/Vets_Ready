import {
  CRSCProfileData,
  CRSCQuestionSection,
  CRSCQuestion,
  ConditionCombatProfile
} from '../../types/crscTypes';

const retirementOptions: CRSCQuestion['options'] = [
  { value: '20-year', label: '20-year active duty' },
  { value: 'reserve_guard', label: 'Reserve/Guard (age 60)' },
  { value: 'chapter_61', label: 'Medical retirement (Chapter 61)' },
  { value: 'tera', label: 'TERA (early retirement)' },
  { value: 'tdrl', label: 'Temporary Disability Retirement List (TDRL)' },
  { value: 'pdrl', label: 'Permanent Disability Retirement List (PDRL)' }
];

export function buildCRSCQuestionnaire(conditionNames: string[]): CRSCQuestionSection[] {
  return [
    {
      id: 'retirement-status',
      title: 'Retirement Status',
      questions: [
        {
          id: 'retirementType',
          prompt: 'What type of military retirement do you have?',
          type: 'single-select',
          options: retirementOptions,
          helperText: 'Matches DFAS CRSC eligibility categories'
        }
      ]
    },
    {
      id: 'va-disability',
      title: 'VA Disability Information',
      questions: [
        {
          id: 'hasVaComp',
          prompt: 'Do you currently receive VA disability compensation?',
          type: 'boolean'
        },
        {
          id: 'vaRating',
          prompt: 'What is your total VA disability rating?',
          type: 'number'
        },
        {
          id: 'vaWaiver',
          prompt: 'Does your VA compensation reduce your retired pay (VA waiver amount)?',
          type: 'number',
          helperText: 'Enter the dollar amount waived from retired pay'
        }
      ]
    },
    {
      id: 'combat-flags',
      title: 'Combat-Related Events',
      questions: conditionNames.map((name, idx) => ({
        id: `condition-${idx}`,
        prompt: `Was ${name} caused by any of the following?`,
        type: 'multiselect',
        options: [
          { value: 'armed_conflict', label: 'Armed conflict' },
          { value: 'hazardous_service', label: 'Hazardous service (airborne, diving, demolition, flight)' },
          { value: 'simulated_war', label: 'Simulated war (live-fire, field training)' },
          { value: 'instrumentality_of_war', label: 'Instrumentality of war (military vehicles, weapons, equipment)' },
          { value: 'purple_heart', label: 'Awarded Purple Heart' },
          { value: 'not_combat_related', label: 'Not combat-related' }
        ]
      }))
    },
    {
      id: 'documentation',
      title: 'Documentation Availability',
      questions: [
        {
          id: 'documentationAvailable',
          prompt: 'Do you have any of the following documents?',
          type: 'multiselect',
          options: [
            { value: 'lod', label: 'Line of Duty reports' },
            { value: 'aar', label: 'After-Action Reports' },
            { value: 'award_citations', label: 'Award citations' },
            { value: 'deployment_orders', label: 'Deployment orders' },
            { value: 'str_injury', label: 'STR entries showing injury' },
            { value: 'va_rating_decision', label: 'VA rating decision' },
            { value: 'dd214', label: 'DD214 / DD215' }
          ]
        }
      ]
    }
  ];
}

export function mergeCRSCResponsesIntoProfile(
  profile: { crscData?: CRSCProfileData },
  responses: Partial<CRSCProfileData>
): CRSCProfileData {
  const merged: CRSCProfileData = {
    ...profile.crscData,
    ...responses
  };
  return merged;
}

export function applyCombatFlags(
  conditions: ConditionCombatProfile[],
  flagsPerCondition?: Record<string, any>
): ConditionCombatProfile[] {
  if (!flagsPerCondition) return conditions;
  return conditions.map(condition => ({
    ...condition,
    combatFlags: flagsPerCondition[condition.id] || condition.combatFlags || {}
  }));
}
