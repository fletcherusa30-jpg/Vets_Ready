/**
 * AI Service for rallyforge
 * Handles OpenAI integration for theory generation and secondary suggestions
 */

import { Disability, AiSuggestion, AiEntitlementTheory } from '../types/wizard.types';

// Configuration
const AI_API_ENDPOINT = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/ai';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_AI !== 'false'; // Default to mock

/**
 * Generate secondary condition suggestions based on primary condition
 */
export async function generateSecondarySuggestions(
  primaryCondition: Disability
): Promise<AiSuggestion[]> {
  if (USE_MOCK_DATA) {
    return getMockSecondarySuggestions(primaryCondition.name);
  }

  try {
    const response = await fetch(`${AI_API_ENDPOINT}/secondary-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conditionName: primaryCondition.name,
        rating: primaryCondition.currentRating,
        symptoms: primaryCondition.symptoms,
        serviceConnectionType: primaryCondition.serviceConnectionType,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.suggestions as AiSuggestion[];
  } catch (error) {
    console.error('Error generating secondary suggestions:', error);
    // Fallback to mock data
    return getMockSecondarySuggestions(primaryCondition.name);
  }
}

/**
 * Generate theory of entitlement for a condition
 */
export async function generateTheory(
  condition: Disability,
  primaryConditions: Disability[]
): Promise<AiEntitlementTheory> {
  if (USE_MOCK_DATA) {
    return getMockTheory(condition, primaryConditions);
  }

  try {
    const response = await fetch(`${AI_API_ENDPOINT}/generate-theory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        condition,
        primaryConditions,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.theory as AiEntitlementTheory;
  } catch (error) {
    console.error('Error generating theory:', error);
    // Fallback to mock data
    return getMockTheory(condition, primaryConditions);
  }
}

/**
 * Analyze claim strategy and provide recommendations
 */
export async function analyzeClaimStrategy(
  serviceConnected: Disability[],
  candidates: Disability[],
  denied: Disability[]
): Promise<{
  complexity: 'simple' | 'medium' | 'complex';
  recommendations: string[];
  estimatedRating: number;
  suggestProfessional: boolean;
}> {
  const totalConditions = serviceConnected.length + candidates.length + denied.length;
  const hasDenials = denied.length > 0;
  const hasSecondaryChains = candidates.some(c => c.primaryConditionIds.length > 0);

  // Calculate complexity
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  if (totalConditions > 5 || hasDenials || hasSecondaryChains) {
    complexity = 'medium';
  }
  if (totalConditions > 10 || denied.length > 2) {
    complexity = 'complex';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (hasDenials) {
    recommendations.push('Consider filing supplemental claims for denied conditions with new evidence');
  }
  if (hasSecondaryChains) {
    recommendations.push('Ensure strong medical nexus opinions for secondary conditions');
  }
  if (candidates.length > 5) {
    recommendations.push('Consider staggering claims to manage medical appointments');
  }

  // Estimate combined rating
  const currentRating = serviceConnected.reduce((sum, c) => sum + (c.currentRating || 0), 0);
  const potentialNew = candidates.length * 30; // Conservative estimate
  const estimatedRating = Math.min(100, currentRating + potentialNew);

  return {
    complexity,
    recommendations,
    estimatedRating,
    suggestProfessional: complexity === 'complex' || denied.length > 1,
  };
}

// ============================================================================
// MOCK DATA FUNCTIONS
// ============================================================================

function getMockSecondarySuggestions(conditionName: string): AiSuggestion[] {
  const lowerName = conditionName.toLowerCase();
  const suggestions: AiSuggestion[] = [];

  // PTSD/Mental Health
  if (lowerName.includes('ptsd') || lowerName.includes('stress') || lowerName.includes('anxiety')) {
    suggestions.push({
      conditionName: 'Sleep Apnea',
      commonality: 'very-common',
      medicalBasis: 'PTSD often causes sleep disturbances, hyperarousal, and nightmares, which can contribute to or worsen obstructive sleep apnea. Studies show veterans with PTSD have significantly higher rates of sleep apnea (up to 70%).',
      vaPatterns: 'Frequently granted as secondary to PTSD. Strong medical literature support. VA recognizes this relationship in M21-1 guidance.',
      confidence: 0.85,
    });
    suggestions.push({
      conditionName: 'Major Depressive Disorder',
      commonality: 'very-common',
      medicalBasis: 'PTSD and depression are highly comorbid conditions (co-occur in 50-70% of cases). The persistent stress, intrusive thoughts, and avoidance behaviors of PTSD often lead to or exacerbate depressive symptoms.',
      vaPatterns: 'Commonly granted as secondary to PTSD with supporting psychiatric evidence. Well-established medical relationship.',
      confidence: 0.90,
    });
    suggestions.push({
      conditionName: 'Gastroesophageal Reflux Disease (GERD)',
      commonality: 'common',
      medicalBasis: 'Chronic stress from PTSD increases stomach acid production and affects digestive function. Anxiety and hypervigilance may also worsen GERD symptoms. Some PTSD medications can also contribute.',
      vaPatterns: 'Increasingly recognized secondary condition. Requires medical nexus opinion linking PTSD to GERD.',
      confidence: 0.65,
    });
    suggestions.push({
      conditionName: 'Erectile Dysfunction',
      commonality: 'common',
      medicalBasis: 'PTSD medications (especially SSRIs) commonly cause sexual dysfunction. Additionally, chronic stress and depression associated with PTSD contribute to ED.',
      vaPatterns: 'Granted as secondary to PTSD or PTSD medications. Medical nexus opinion should address medication side effects.',
      confidence: 0.70,
    });
  }

  // Knee/Joint conditions
  if (lowerName.includes('knee') || lowerName.includes('leg')) {
    suggestions.push({
      conditionName: 'Lower Back Pain (Lumbar Strain)',
      commonality: 'very-common',
      medicalBasis: 'Knee injuries cause altered gait mechanics and compensatory strain on the lower back. This is a well-established orthopedic relationship called "kinetic chain dysfunction."',
      vaPatterns: 'Frequently granted with evidence of altered gait or biomechanical dysfunction. Gait analysis or orthopedic exam helpful.',
      confidence: 0.80,
    });
    suggestions.push({
      conditionName: 'Hip Pain/Arthritis (Same Side)',
      commonality: 'common',
      medicalBasis: 'Knee injuries cause compensatory stress on the hip joint of the same leg, leading to arthritis or bursitis over time. Biomechanical studies confirm this relationship.',
      vaPatterns: 'Commonly granted with orthopedic exam showing altered gait mechanics and hip degeneration.',
      confidence: 0.75,
    });
    suggestions.push({
      conditionName: 'Opposite Knee Pain',
      commonality: 'common',
      medicalBasis: 'Favoring one knee places excessive stress on the opposite knee, accelerating degeneration. This is known as "compensatory overload."',
      vaPatterns: 'Recognized relationship. Requires medical opinion documenting favoring of primary knee and overload of opposite knee.',
      confidence: 0.70,
    });
  }

  // Back conditions
  if (lowerName.includes('back') || lowerName.includes('spine') || lowerName.includes('lumbar')) {
    suggestions.push({
      conditionName: 'Radiculopathy (Nerve Pain)',
      commonality: 'very-common',
      medicalBasis: 'Spinal conditions often cause nerve compression, leading to radicular pain, numbness, tingling, or weakness in the extremities. MRI and EMG studies can confirm nerve involvement.',
      vaPatterns: 'Granted when MRI shows nerve root compression and EMG confirms radiculopathy. Often rated separately from back condition.',
      confidence: 0.85,
    });
    suggestions.push({
      conditionName: 'Sleep Disturbance/Insomnia',
      commonality: 'common',
      medicalBasis: 'Chronic pain from spinal conditions frequently disrupts sleep quality, leading to insomnia or other sleep disorders. Pain-related sleep disruption is well-documented.',
      vaPatterns: 'Secondary claims for sleep issues due to chronic pain are increasingly recognized by VA.',
      confidence: 0.70,
    });
    suggestions.push({
      conditionName: 'Hip Pain (Bilateral)',
      commonality: 'common',
      medicalBasis: 'Spinal conditions alter posture and gait, placing abnormal stress on hip joints. This can lead to hip arthritis or bursitis.',
      vaPatterns: 'Granted with evidence of altered gait and biomechanical studies.',
      confidence: 0.68,
    });
  }

  // Tinnitus/Hearing
  if (lowerName.includes('tinnitus') || lowerName.includes('hearing')) {
    suggestions.push({
      conditionName: 'Migraine Headaches',
      commonality: 'common',
      medicalBasis: 'Constant tinnitus can trigger or worsen migraines due to auditory overstimulation and stress. Studies show higher migraine rates in tinnitus sufferers.',
      vaPatterns: 'Recognized relationship. Requires medical nexus linking tinnitus to migraine onset or worsening.',
      confidence: 0.60,
    });
    suggestions.push({
      conditionName: 'Sleep Disturbance',
      commonality: 'common',
      medicalBasis: 'Tinnitus interferes with sleep onset and maintenance. The constant ringing makes it difficult to fall asleep and stay asleep.',
      vaPatterns: 'Granted with medical evidence linking tinnitus to sleep disruption.',
      confidence: 0.65,
    });
  }

  // Shoulder conditions
  if (lowerName.includes('shoulder')) {
    suggestions.push({
      conditionName: 'Cervical Spine Strain',
      commonality: 'common',
      medicalBasis: 'Shoulder injuries alter arm mechanics, placing compensatory strain on neck muscles and cervical spine.',
      vaPatterns: 'Granted with orthopedic evidence of altered mechanics.',
      confidence: 0.70,
    });
  }

  // Diabetes
  if (lowerName.includes('diabetes')) {
    suggestions.push({
      conditionName: 'Peripheral Neuropathy',
      commonality: 'very-common',
      medicalBasis: 'Diabetes commonly causes nerve damage (diabetic neuropathy), leading to numbness, tingling, and pain in extremities.',
      vaPatterns: 'Automatically secondary to diabetes. Well-established medical relationship.',
      confidence: 0.95,
    });
    suggestions.push({
      conditionName: 'Erectile Dysfunction',
      commonality: 'very-common',
      medicalBasis: 'Diabetes damages blood vessels and nerves controlling erections.',
      vaPatterns: 'Commonly granted as secondary to diabetes.',
      confidence: 0.90,
    });
  }

  return suggestions;
}

function getMockTheory(
  condition: Disability,
  primaryConditions: Disability[]
): AiEntitlementTheory {
  const isPrimary = condition.serviceConnectionType === 'direct';
  const primaryCondition = condition.primaryConditionIds.length > 0
    ? primaryConditions.find(c => c.id === condition.primaryConditionIds[0])
    : null;

  if (isPrimary) {
    // Direct service connection theory
    return {
      primaryTheory: `Direct service connection for ${condition.name} is established through evidence of in-service incurrence or aggravation. Under 38 CFR § 3.303, you must prove: (1) a current disability, (2) in-service incurrence or aggravation of that disability, and (3) a medical nexus (connection) between the two. This is the most straightforward path to service connection when the condition began during active duty.`,

      alternativeTheories: [
        `Presumptive service connection: If you served in a qualifying location/time period (Agent Orange, Gulf War, PACT Act), ${condition.name} may be presumed service-connected without proving direct causation.`,
        `Aggravation theory: If ${condition.name} existed before service, you can prove it was permanently worsened beyond its natural progression due to military service.`,
      ],

      nexusRationale: {
        medicalBasis: `${condition.name} has established diagnostic criteria in the medical literature. A competent medical professional can establish the nexus between service and the current disability through: (1) review of service medical records documenting in-service treatment or diagnosis, (2) post-service medical records showing continuity of symptoms, (3) medical opinion using the "at least as likely as not" standard (>50% probability) that the condition is related to service.`,
        legalBasis: '38 CFR § 3.303 - Direct Service Connection requires three elements: (1) Current disability (diagnosed by competent medical authority), (2) In-service incurrence or aggravation (evidence the condition began or worsened during service), (3) Nexus (medical opinion linking the current disability to the in-service event/exposure).',
      },

      policyReferences: [
        {
          source: '38 CFR § 3.303',
          citation: 'Direct Service Connection',
          relevance: 'Establishes the three-element framework for proving direct service connection. This is the foundational regulation for all direct SC claims.',
        },
        {
          source: '38 CFR § 3.102',
          citation: 'Reasonable Doubt Doctrine',
          relevance: 'When evidence is in approximate balance, the benefit of the doubt goes to the veteran. This is critical when nexus evidence is borderline.',
        },
        {
          source: 'M21-1, Part III, Subpart iv, Chapter 4',
          citation: 'Developing Claims for Service Connection',
          relevance: 'Provides VA adjudicator guidance on evidence needed to establish service connection. Understanding this helps you provide the right evidence.',
        },
        {
          source: '38 CFR § 4.1-4.31',
          citation: 'Rating Schedule General Policy',
          relevance: 'Once service connection is established, these regulations govern how your disability will be rated.',
        },
      ],

      recommendedEvidence: [
        {
          type: 'medical',
          description: `Current diagnosis of ${condition.name} from a qualified medical professional`,
          priority: 'critical',
          whereToObtain: 'VA examination (C&P exam) or private medical provider (ensure provider is qualified for this condition)',
        },
        {
          type: 'medical',
          description: `Medical nexus opinion linking current ${condition.name} to in-service event/exposure`,
          priority: 'critical',
          whereToObtain: 'Independent Medical Exam (IME), Disability Benefits Questionnaire (DBQ), or nexus letter from treating physician',
        },
        {
          type: 'service-records',
          description: 'Service medical records documenting in-service treatment or diagnosis',
          priority: 'high',
          whereToObtain: 'Request from National Personnel Records Center (NPRC) via eVetRecs or VA Form 180',
        },
        {
          type: 'service-records',
          description: 'Service personnel records showing job duties, deployments, exposures relevant to condition',
          priority: 'medium',
          whereToObtain: 'DD-214, deployment orders, unit records via NPRC',
        },
        {
          type: 'lay-statement',
          description: 'Buddy statements from fellow service members who witnessed symptoms or in-service events',
          priority: 'medium',
          whereToObtain: 'VA Form 21-4138 - Statement in Support of Claim (signed by witness)',
        },
        {
          type: 'lay-statement',
          description: 'Personal statement describing in-service onset, symptoms, and impact on daily life',
          priority: 'medium',
          whereToObtain: 'VA Form 21-4138 or personal letter (your testimony is evidence)',
        },
        {
          type: 'medical',
          description: 'Post-service medical records showing continuous treatment or symptom progression',
          priority: 'medium',
          whereToObtain: 'Private medical providers, VA medical center records',
        },
      ],

      strengthAssessment: condition.diagnosedInService ? 'strong' : 'moderate',

      challenges: [
        !condition.diagnosedInService && 'Lack of contemporaneous service medical records documenting in-service diagnosis',
        'May need medical nexus opinion if not diagnosed during service',
        'VA may argue condition developed after service without strong nexus evidence',
        'Need to differentiate service-caused condition from natural aging or non-service factors',
      ].filter(Boolean) as string[],

      opportunities: [
        'Lay testimony is competent evidence for observable symptoms (you can describe what you experienced)',
        'Post-service medical records showing continuous treatment strengthen claim',
        'Buddy statements from service members are powerful corroborating evidence',
        condition.diagnosedInService && 'In-service diagnosis creates strong presumption of service connection',
        'VA must give benefit of the doubt if evidence is in approximate balance (38 CFR § 3.102)',
      ].filter(Boolean) as string[],

      nextSteps: [
        'Obtain current medical diagnosis from qualified provider',
        'Request complete service medical and personnel records from NPRC',
        !condition.diagnosedInService && 'Secure medical nexus opinion using "at least as likely as not" standard',
        'Gather lay statements from service members or family who observed symptoms',
        'Document timeline: when condition started, how it progressed, current symptoms',
        'Review M21-1 guidance for your specific condition to understand VA\'s evaluation process',
        'Consider consulting VSO or VA-accredited attorney if claim is complex',
      ].filter(Boolean) as string[],

      disclaimers: [
        'This is AI-generated educational content based on VA regulations and case law. It is NOT legal advice.',
        'Consult with a Veterans Service Officer (VSO) or VA-accredited attorney before filing to review your specific facts.',
        'Individual claim outcomes vary based on specific evidence, medical opinions, and factual circumstances.',
        'VA regulations and policies change. Always verify current requirements at VA.gov or with accredited representative.',
        'rallyforge is not affiliated with the Department of Veterans Affairs.',
      ],

      generatedAt: new Date().toISOString(),
      modelVersion: 'mock-v1.0',
    };
  } else {
    // Secondary service connection theory
    return {
      primaryTheory: `Secondary service connection for ${condition.name} can be established under 38 CFR § 3.310(a) by proving it was caused or aggravated by the already service-connected condition: ${primaryCondition?.name}. The legal standard is "proximately due to or the result of" the primary condition. This requires competent medical evidence establishing a causal nexus between ${primaryCondition?.name} and ${condition.name}.`,

      alternativeTheories: [
        `Aggravation theory under § 3.310(b): If ${condition.name} existed independently, prove ${primaryCondition?.name} permanently worsened it beyond its natural progression.`,
        `Medication side effect: If ${condition.name} is caused by medications prescribed for ${primaryCondition?.name}, this is also secondary service connection.`,
      ],

      nexusRationale: {
        medicalBasis: `Medical literature supports that ${primaryCondition?.name} can cause or aggravate ${condition.name} through physiological mechanisms. A medical nexus opinion should: (1) explain the medical relationship between the two conditions, (2) review your complete medical history, (3) state it is "at least as likely as not" (>50% probability) that ${condition.name} is caused/aggravated by ${primaryCondition?.name}. The opinion must rule out other causes or explain why service-connection is still appropriate despite other factors.`,
        legalBasis: '38 CFR § 3.310(a) - Secondary service connection: "A disability which is proximately due to or the result of a service-connected disease or injury shall be service connected." This means if your service-connected condition caused another condition, the new condition also gets service connection.',
      },

      policyReferences: [
        {
          source: '38 CFR § 3.310(a)',
          citation: 'Disabilities That Are Proximately Due to, or Aggravated by, Service-Connected Disabilities',
          relevance: 'Legal basis for all secondary service connection claims. The phrase "proximately due to" means direct causation.',
        },
        {
          source: 'Allen v. Brown, 7 Vet. App. 439 (1995)',
          citation: 'VA Must Consider Secondary Service Connection',
          relevance: 'Establishes that VA must consider secondary service connection theories even if veteran doesn\'t explicitly claim it.',
        },
        {
          source: '38 CFR § 3.310(b)',
          citation: 'Aggravation of Non-Service-Connected Disability',
          relevance: 'If ${condition.name} existed before or independent of service, but was aggravated by ${primaryCondition?.name}, it qualifies for secondary connection.',
        },
        {
          source: 'M21-1, Part III, Subpart iv, Chapter 4, Section C',
          citation: 'Developing Secondary Service Connection Claims',
          relevance: 'VA adjudicator guidance on evidence required for secondary claims.',
        },
      ],

      recommendedEvidence: [
        {
          type: 'medical',
          description: `Current diagnosis of ${condition.name}`,
          priority: 'critical',
          whereToObtain: 'VA C&P exam or private medical provider qualified in relevant specialty',
        },
        {
          type: 'medical',
          description: `Medical nexus opinion specifically linking ${condition.name} to ${primaryCondition?.name}`,
          priority: 'critical',
          whereToObtain: 'Independent Medical Exam (IME) or DBQ from specialist familiar with BOTH conditions. Provider should review all medical records.',
        },
        {
          type: 'medical',
          description: `Treatment records showing ${condition.name} developed or worsened after onset of ${primaryCondition?.name}`,
          priority: 'high',
          whereToObtain: 'Private medical records, VA treatment records. Chronological timeline is crucial.',
        },
        {
          type: 'medical',
          description: `Medical records documenting the progression of ${primaryCondition?.name} and its impact on your body`,
          priority: 'high',
          whereToObtain: 'VA compensation exam records, treatment notes showing worsening of primary condition',
        },
        {
          type: 'lay-statement',
          description: `Personal statement describing how ${primaryCondition?.name} led to ${condition.name} in your daily experience`,
          priority: 'medium',
          whereToObtain: 'VA Form 21-4138. Describe specific examples: "My knee pain causes me to limp, which has led to severe lower back pain."',
        },
        {
          type: 'lay-statement',
          description: 'Statements from family/friends who observed how primary condition led to secondary condition',
          priority: 'medium',
          whereToObtain: 'VA Form 21-4138 signed by witness',
        },
        {
          type: 'medical',
          description: 'Medical literature supporting causal relationship (optional but helpful)',
          priority: 'low',
          whereToObtain: 'PubMed, medical journals. Your medical provider may include this in nexus opinion.',
        },
      ],

      strengthAssessment: 'moderate',

      challenges: [
        'Must prove causal relationship, not just correlation or coincidence',
        'May require specialist medical opinion (generalist may not be sufficient)',
        'Need to rule out other causes or explain why secondary connection applies despite other factors',
        'VA may argue ${condition.name} is independent condition unrelated to ${primaryCondition?.name}',
        'Timeline must show ${condition.name} developed after ${primaryCondition?.name}',
      ],

      opportunities: [
        'Well-established medical relationships between certain conditions increase likelihood of approval',
        'VA must consider secondary theories even if you don\'t explicitly claim it (Allen v. Brown)',
        'Lay evidence describing cause-and-effect is powerful (you experience the connection daily)',
        'If medication side effect, this is often easier to prove with pharmacy records',
        'Secondary conditions can create their own secondary chains (cascading disabilities)',
      ],

      nextSteps: [
        `Obtain diagnosis of ${condition.name} if not already diagnosed`,
        `Secure medical nexus opinion from provider familiar with both ${primaryCondition?.name} and ${condition.name}`,
        `Document detailed timeline: when ${primaryCondition?.name} began, when ${condition.name} began, progression of both`,
        'Gather all treatment records showing progression of both conditions',
        'If medications involved, get pharmacy records and medication list',
        'Research medical literature on relationship between these conditions (optional but helpful)',
        'Submit VA Form 21-4138 with personal statement explaining causal connection',
        'Consider requesting VA C&P exam that addresses BOTH conditions and their relationship',
      ],

      disclaimers: [
        'This is AI-generated educational content based on VA regulations and case law. It is NOT legal advice.',
        'Secondary service connection requires competent medical evidence establishing causation.',
        'Each claim is evaluated on its individual merits and specific medical evidence.',
        'Consult with a Veterans Service Officer (VSO) or VA-accredited attorney before filing.',
        'VA regulations and policies change. Always verify current requirements.',
        'rallyforge is not affiliated with the Department of Veterans Affairs.',
      ],

      generatedAt: new Date().toISOString(),
      modelVersion: 'mock-v1.0',

      projectedRating: undefined, // Would be calculated based on condition
    };
  }
}

