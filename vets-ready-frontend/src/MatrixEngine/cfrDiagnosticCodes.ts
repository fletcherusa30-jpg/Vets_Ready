/**
 * CFR DIAGNOSTIC CODE HELPER
 *
 * Functions to work with VA CFR (Code of Federal Regulations) diagnostic codes.
 * Provides lookup, search, and recommendation capabilities.
 *
 * CFR Part 38 contains the Schedule for Rating Disabilities used by the VA.
 */

export interface CFRDiagnosticCode {
  code: string;
  bodySystem: string;
  condition: string;
  description: string;
  ratingCriteria: RatingCriterion[];
  commonSecondaries?: string[];
  relatedCodes?: string[];
}

export interface RatingCriterion {
  percentage: number;
  criteria: string;
}

/**
 * CFR Body Systems
 */
export const CFR_BODY_SYSTEMS = {
  MUSCULOSKELETAL: 'Musculoskeletal System',
  MENTAL: 'Mental Disorders',
  NEUROLOGICAL: 'Neurological Conditions and Convulsive Disorders',
  RESPIRATORY: 'Respiratory System',
  CARDIOVASCULAR: 'Cardiovascular System',
  DIGESTIVE: 'Digestive System',
  GENITOURINARY: 'Genitourinary System',
  GYNECOLOGICAL: 'Gynecological Conditions and Disorders of the Breast',
  HEMIC_LYMPHATIC: 'Hemic and Lymphatic Systems',
  SKIN: 'Skin',
  ENDOCRINE: 'Endocrine System',
  EAR: 'Ear',
  EYE: 'Eye',
  DENTAL_ORAL: 'Dental and Oral Conditions',
} as const;

/**
 * Sample CFR diagnostic codes database
 * (In production, this would be a comprehensive database)
 */
export const CFR_CODES: CFRDiagnosticCode[] = [
  // Mental Disorders
  {
    code: '9411',
    bodySystem: CFR_BODY_SYSTEMS.MENTAL,
    condition: 'Post Traumatic Stress Disorder (PTSD)',
    description: 'Disorder resulting from exposure to traumatic events during military service',
    ratingCriteria: [
      { percentage: 0, criteria: 'Occupational and social impairment due to mild or transient symptoms' },
      { percentage: 10, criteria: 'Occupational and social impairment due to mild or transient symptoms which decrease work efficiency and ability to perform occupational tasks only during periods of significant stress' },
      { percentage: 30, criteria: 'Occupational and social impairment with occasional decrease in work efficiency and intermittent periods of inability to perform occupational tasks' },
      { percentage: 50, criteria: 'Occupational and social impairment with reduced reliability and productivity' },
      { percentage: 70, criteria: 'Occupational and social impairment with deficiencies in most areas' },
      { percentage: 100, criteria: 'Total occupational and social impairment' },
    ],
    commonSecondaries: ['Sleep Apnea', 'Migraines', 'IBS', 'Tinnitus'],
    relatedCodes: ['9434', '9435'],
  },
  {
    code: '9434',
    bodySystem: CFR_BODY_SYSTEMS.MENTAL,
    condition: 'Major Depressive Disorder',
    description: 'Persistent feelings of sadness and loss of interest',
    ratingCriteria: [
      { percentage: 0, criteria: 'Occupational and social impairment due to mild or transient symptoms' },
      { percentage: 10, criteria: 'Occupational and social impairment due to mild or transient symptoms which decrease work efficiency' },
      { percentage: 30, criteria: 'Occupational and social impairment with occasional decrease in work efficiency' },
      { percentage: 50, criteria: 'Occupational and social impairment with reduced reliability and productivity' },
      { percentage: 70, criteria: 'Occupational and social impairment with deficiencies in most areas' },
      { percentage: 100, criteria: 'Total occupational and social impairment' },
    ],
    commonSecondaries: ['Sleep Disturbance', 'Chronic Pain'],
    relatedCodes: ['9411', '9435'],
  },
  {
    code: '9435',
    bodySystem: CFR_BODY_SYSTEMS.MENTAL,
    condition: 'Generalized Anxiety Disorder',
    description: 'Excessive anxiety and worry about various events or activities',
    ratingCriteria: [
      { percentage: 0, criteria: 'Occupational and social impairment due to mild or transient symptoms' },
      { percentage: 10, criteria: 'Occupational and social impairment due to mild or transient symptoms' },
      { percentage: 30, criteria: 'Occupational and social impairment with occasional decrease in work efficiency' },
      { percentage: 50, criteria: 'Occupational and social impairment with reduced reliability and productivity' },
      { percentage: 70, criteria: 'Occupational and social impairment with deficiencies in most areas' },
      { percentage: 100, criteria: 'Total occupational and social impairment' },
    ],
    commonSecondaries: ['IBS', 'Migraines'],
    relatedCodes: ['9411', '9434'],
  },

  // Musculoskeletal
  {
    code: '5003',
    bodySystem: CFR_BODY_SYSTEMS.MUSCULOSKELETAL,
    condition: 'Degenerative Arthritis',
    description: 'Established by X-ray findings',
    ratingCriteria: [
      { percentage: 10, criteria: 'Degenerative arthritis established by X-ray findings will be rated on the basis of limitation of motion' },
      { percentage: 20, criteria: 'With marked limitation of motion' },
    ],
    commonSecondaries: ['Chronic Pain', 'Limited Range of Motion'],
    relatedCodes: ['5010', '5013'],
  },
  {
    code: '5237',
    bodySystem: CFR_BODY_SYSTEMS.MUSCULOSKELETAL,
    condition: 'Lumbosacral or Cervical Strain',
    description: 'Back or neck strain',
    ratingCriteria: [
      { percentage: 10, criteria: 'With or without symptoms such as pain (whether or not it radiates)' },
      { percentage: 20, criteria: 'With muscle spasm, guarding, or localized tenderness not resulting in abnormal gait or abnormal spinal contour' },
      { percentage: 40, criteria: 'With muscle spasm or guarding severe enough to result in an abnormal gait or abnormal spinal contour' },
      { percentage: 50, criteria: 'Unfavorable ankylosis of the entire spine' },
      { percentage: 100, criteria: 'Unfavorable ankylosis of the entire thoracolumbar spine' },
    ],
    commonSecondaries: ['Radiculopathy', 'Sciatica', 'Sleep Disturbance'],
    relatedCodes: ['5242', '5243'],
  },
  {
    code: '5257',
    bodySystem: CFR_BODY_SYSTEMS.MUSCULOSKELETAL,
    condition: 'Knee, Other Impairment',
    description: 'Various knee conditions not otherwise specified',
    ratingCriteria: [
      { percentage: 10, criteria: 'Slight limitation of flexion or extension' },
      { percentage: 20, criteria: 'Moderate limitation of flexion or extension' },
      { percentage: 30, criteria: 'Severe limitation of flexion or extension' },
    ],
    commonSecondaries: ['Hip Condition', 'Ankle Condition', 'Back Strain'],
    relatedCodes: ['5256', '5258'],
  },

  // Respiratory
  {
    code: '6847',
    bodySystem: CFR_BODY_SYSTEMS.RESPIRATORY,
    condition: 'Sleep Apnea Syndrome',
    description: 'Breathing repeatedly stops and starts during sleep',
    ratingCriteria: [
      { percentage: 0, criteria: 'Asymptomatic but with documented sleep disorder breathing' },
      { percentage: 30, criteria: 'Chronic daytime hypersomnolence' },
      { percentage: 50, criteria: 'Requires use of breathing assistance device such as CPAP machine' },
      { percentage: 100, criteria: 'Chronic respiratory failure with carbon dioxide retention or cor pulmonale, or; requires tracheostomy' },
    ],
    commonSecondaries: ['Hypertension', 'Heart Disease', 'Depression'],
    relatedCodes: ['6600', '6604'],
  },
  {
    code: '6602',
    bodySystem: CFR_BODY_SYSTEMS.RESPIRATORY,
    condition: 'Asthma, Bronchial',
    description: 'Chronic inflammatory disease of the airways',
    ratingCriteria: [
      { percentage: 10, criteria: 'FEV-1 of 71- to 80-percent predicted, or; FEV-1/FVC of 71 to 80 percent, or; intermittent inhalational or oral bronchodilator therapy' },
      { percentage: 30, criteria: 'FEV-1 of 56- to 70-percent predicted, or; FEV-1/FVC of 56 to 70 percent, or; daily inhalational or oral bronchodilator therapy or; inhalational anti-inflammatory medication' },
      { percentage: 60, criteria: 'FEV-1 of 40- to 55-percent predicted, or; FEV-1/FVC of 40 to 55 percent, or; at least monthly visits to a physician for required care of exacerbations, or; intermittent (at least three per year) courses of systemic (oral or parenteral) corticosteroids' },
      { percentage: 100, criteria: 'FEV-1 less than 40-percent predicted, or; FEV-1/FVC less than 40 percent, or; more than one attack per week with episodes of respiratory failure, or; requires daily use of systemic (oral or parenteral) high dose corticosteroids or immuno-suppressive medications' },
    ],
    commonSecondaries: ['Sinusitis', 'GERD'],
    relatedCodes: ['6600', '6604'],
  },

  // Ear
  {
    code: '6260',
    bodySystem: CFR_BODY_SYSTEMS.EAR,
    condition: 'Tinnitus',
    description: 'Recurrent tinnitus (ringing in the ears)',
    ratingCriteria: [
      { percentage: 10, criteria: 'Recurrent tinnitus' },
    ],
    commonSecondaries: ['Hearing Loss', 'Sleep Disturbance', 'Depression'],
    relatedCodes: ['6100', '6200'],
  },

  // Digestive
  {
    code: '7319',
    bodySystem: CFR_BODY_SYSTEMS.DIGESTIVE,
    condition: 'Irritable Bowel Syndrome (IBS)',
    description: 'Functional bowel disorder with abdominal pain and altered bowel habits',
    ratingCriteria: [
      { percentage: 0, criteria: 'Mild; disturbances of bowel function with occasional episodes of abdominal distress' },
      { percentage: 10, criteria: 'Moderate; frequent episodes of bowel disturbance with abdominal distress' },
      { percentage: 30, criteria: 'Severe; diarrhea, or alternating diarrhea and constipation, with more or less constant abdominal distress' },
    ],
    commonSecondaries: ['Anxiety', 'Depression', 'GERD'],
    relatedCodes: ['7327', '7346'],
  },

  // Skin
  {
    code: '7806',
    bodySystem: CFR_BODY_SYSTEMS.SKIN,
    condition: 'Dermatitis or Eczema',
    description: 'Inflammatory skin conditions',
    ratingCriteria: [
      { percentage: 0, criteria: 'No more than topical therapy required during the past 12-month period' },
      { percentage: 10, criteria: 'Requires topical therapy plus the intermittent use of systemic therapy such as immunosuppressive or immunomodulating medication' },
      { percentage: 30, criteria: 'Requires systemic therapy such as immunosuppressive or immunomodulating medication for a total duration of six weeks or more, but not constantly, during the past 12-month period' },
      { percentage: 60, criteria: 'Requires constant or near-constant systemic therapy such as immunosuppressive or immunomodulating medication' },
    ],
    commonSecondaries: ['Scarring', 'Infection'],
    relatedCodes: ['7800', '7805'],
  },

  // Cardiovascular
  {
    code: '7101',
    bodySystem: CFR_BODY_SYSTEMS.CARDIOVASCULAR,
    condition: 'Hypertensive Vascular Disease (Hypertension)',
    description: 'High blood pressure',
    ratingCriteria: [
      { percentage: 10, criteria: 'Diastolic pressure predominantly 100 or more' },
      { percentage: 20, criteria: 'Diastolic pressure predominantly 110 or more, or; systolic pressure predominantly 200 or more' },
      { percentage: 40, criteria: 'Diastolic pressure predominantly 130 or more' },
      { percentage: 60, criteria: 'Diastolic pressure predominantly 130 or more, with a history of diastolic pressure predominantly 140 or more, or; systolic pressure predominantly 230 or more' },
    ],
    commonSecondaries: ['Heart Disease', 'Kidney Disease', 'Sleep Apnea'],
    relatedCodes: ['7000', '7005'],
  },
];

/**
 * Search CFR codes by condition name
 */
export function searchCFRCodes(query: string): CFRDiagnosticCode[] {
  const lowerQuery = query.toLowerCase();
  return CFR_CODES.filter(code =>
    code.condition.toLowerCase().includes(lowerQuery) ||
    code.description.toLowerCase().includes(lowerQuery) ||
    code.code.includes(lowerQuery)
  );
}

/**
 * Get CFR code by exact code number
 */
export function getCFRCode(code: string): CFRDiagnosticCode | undefined {
  return CFR_CODES.find(c => c.code === code);
}

/**
 * Get CFR codes by body system
 */
export function getCFRCodesByBodySystem(bodySystem: string): CFRDiagnosticCode[] {
  return CFR_CODES.filter(code => code.bodySystem === bodySystem);
}

/**
 * Get recommended diagnostic code for a condition
 */
export function getRecommendedCFRCode(conditionName: string): CFRDiagnosticCode | undefined {
  const results = searchCFRCodes(conditionName);
  return results.length > 0 ? results[0] : undefined;
}

/**
 * Get rating percentage for specific symptoms
 */
export function getRatingForSymptoms(
  code: string,
  symptomDescription: string
): number | null {
  const cfrCode = getCFRCode(code);
  if (!cfrCode) return null;

  // In a real implementation, this would use AI/NLP to match symptoms to criteria
  // For now, return the middle rating as an example
  const criteria = cfrCode.ratingCriteria;
  if (criteria.length === 0) return null;

  return criteria[Math.floor(criteria.length / 2)].percentage;
}

/**
 * Get all possible ratings for a CFR code
 */
export function getPossibleRatings(code: string): number[] {
  const cfrCode = getCFRCode(code);
  if (!cfrCode) return [];

  return cfrCode.ratingCriteria.map(c => c.percentage).sort((a, b) => a - b);
}

/**
 * Get common secondary conditions for a CFR code
 */
export function getCommonSecondaries(code: string): string[] {
  const cfrCode = getCFRCode(code);
  return cfrCode?.commonSecondaries || [];
}

/**
 * Get related CFR codes
 */
export function getRelatedCodes(code: string): CFRDiagnosticCode[] {
  const cfrCode = getCFRCode(code);
  if (!cfrCode?.relatedCodes) return [];

  return cfrCode.relatedCodes
    .map(relatedCode => getCFRCode(relatedCode))
    .filter((code): code is CFRDiagnosticCode => code !== undefined);
}

/**
 * Suggest CFR codes based on symptoms and body system
 */
export function suggestCFRCodes(
  symptoms: string[],
  bodySystem?: string
): CFRDiagnosticCode[] {
  let candidates = bodySystem
    ? getCFRCodesByBodySystem(bodySystem)
    : CFR_CODES;

  // Score each code based on symptom matches
  const scored = candidates.map(code => {
    let score = 0;
    symptoms.forEach(symptom => {
      const symptomLower = symptom.toLowerCase();
      if (code.condition.toLowerCase().includes(symptomLower)) score += 3;
      if (code.description.toLowerCase().includes(symptomLower)) score += 2;
      code.ratingCriteria.forEach(criteria => {
        if (criteria.criteria.toLowerCase().includes(symptomLower)) score += 1;
      });
    });
    return { code, score };
  });

  // Sort by score and return top matches
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.code);
}

/**
 * Format CFR code for display
 */
export function formatCFRCode(code: CFRDiagnosticCode): string {
  return `${code.code} - ${code.condition}`;
}

/**
 * Get all body systems
 */
export function getAllBodySystems(): string[] {
  return Object.values(CFR_BODY_SYSTEMS);
}

/**
 * Validate CFR code exists
 */
export function isValidCFRCode(code: string): boolean {
  return CFR_CODES.some(c => c.code === code);
}
