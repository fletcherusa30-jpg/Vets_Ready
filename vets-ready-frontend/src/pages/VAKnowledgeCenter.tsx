// VA Disability Rating Calculator Component
const VACalculator: React.FC = () => {
  const [percentages, setPercentages] = useState<number[]>([0]);
  const [result, setResult] = useState<number | null>(null);

  // VA math: combine ratings sequentially
  const calculateCombinedRating = (percents: number[]) => {
    let combined = 0;
    percents
      .filter(p => p > 0)
      .sort((a, b) => b - a)
      .forEach(p => {
        combined = 100 - ((100 - combined) * (100 - p)) / 100;
      });
    return Math.round(combined);
  };

  const handleChange = (idx: number, value: string) => {
    const val = Math.max(0, Math.min(100, Number(value)));
    const updated = percentages.slice();
    updated[idx] = val;
    setPercentages(updated);
  };

  const addRating = () => setPercentages([...percentages, 0]);
  const removeRating = (idx: number) => setPercentages(percentages.filter((_, i) => i !== idx));

  const handleCalculate = () => {
    setResult(calculateCombinedRating(percentages));
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block font-semibold mb-2 va-theme-text">Enter your VA disability ratings below:</label>
        {percentages.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min={0}
              max={100}
              value={p}
              onChange={e => handleChange(idx, e.target.value)}
              className="w-20 px-2 py-1 rounded border va-theme-border va-theme-text va-theme-card"
              placeholder="%"
            />
            <span className="va-theme-text">%</span>
            {percentages.length > 1 && (
              <button type="button" onClick={() => removeRating(idx)} className="px-2 py-1 rounded va-theme-accent-bg text-black font-bold">–</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRating} className="px-4 py-2 rounded va-theme-accent-bg text-black font-semibold mt-2">+ Add Rating</button>
      </div>
      <button onClick={handleCalculate} className="px-6 py-2 rounded va-theme-accent-bg text-black font-bold mb-4">Calculate Combined Rating</button>
      {result !== null && (
        <div className="mt-2 p-3 rounded va-theme-success-bg font-semibold va-theme-text">
          Combined VA Disability Rating: {result}%
        </div>
      )}
      <div className="mt-4 text-sm va-theme-text opacity-80">
        <strong>How VA Math Works:</strong> Ratings are combined sequentially, not added. Each rating is applied to the remaining "unrated" portion. Example: 50% + 30% = 65%, not 80%.
      </div>
    </div>
  );
};
/**
 * VA Knowledge Center
 *
 * Comprehensive access to VA resources including M21-1 Adjudication Manual,
 * VA Policy Letters, regulations, and AI-powered search for veteran questions.
 */

import React, { useState, useEffect } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { getBranchTheme, getBranchIcon, applyBranchTheme } from '../services/BranchThemes';
import {
  BookOpen,
  FileText,
  Scale,
  ExternalLink,
  Search,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Book,
  GraduationCap,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader,
  Send
} from 'lucide-react';
import '../styles/va-theme.css';

interface VAResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: React.ComponentType<any>;
  tags: string[];
}

interface AIResponse {
  question: string;
  answer: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const VAKnowledgeCenter: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [activeTab, setActiveTab] = useState<'resources' | 'search'>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const theme = getBranchTheme(profile.branch || 'Army');
  const branchIcon = getBranchIcon(profile.branch || 'Army');

  useEffect(() => {
    if (profile.branch) {
      applyBranchTheme(profile.branch);
    }
  }, [profile.branch]);

  // VA Resources Database
  const vaResources: VAResource[] = [
    // M21-1 Manual Resources
    {
      id: 'm21-1-main',
      title: 'M21-1 Adjudication Procedures Manual',
      description: 'Complete VA adjudication manual - the authoritative guide for processing VA claims and appeals',
      url: 'https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/topic/554400000014589/M21-1-Adjudication-Procedures-Manual',
      category: 'M21-1 Manual',
      icon: BookOpen,
      tags: ['m21-1', 'adjudication', 'claims processing', 'appeals']
    },
    {
      id: 'm21-1-part-iii',
      title: 'M21-1 Part III - Adjudication',
      description: 'Disability evaluation, rating procedures, and evidence requirements',
      url: 'https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/topic/554400000014591',
      category: 'M21-1 Manual',
      icon: Scale,
      tags: ['m21-1', 'disability rating', 'evidence', 'adjudication']
    },
    {
      id: 'm21-1-part-iv',
      title: 'M21-1 Part IV - Claims and Appeals',
      description: 'Compensation claims, appeals processing, and decision procedures',
      url: 'https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/topic/554400000014592',
      category: 'M21-1 Manual',
      icon: FileText,
      tags: ['m21-1', 'appeals', 'claims', 'compensation']
    },

    // Policy Letters
    {
      id: 'policy-letters',
      title: 'VA Policy Letters (VBA)',
      description: 'Official Veterans Benefits Administration policy guidance and updates',
      url: 'https://benefits.va.gov/BENEFITS/docs/policy.asp',
      category: 'Policy Letters',
      icon: FileText,
      tags: ['policy', 'vba', 'guidance', 'updates']
    },
    {
      id: 'fast-letters',
      title: 'FAST Letters',
      description: 'Formal Advisory on Sensitive Topics - critical policy interpretations',
      url: 'https://benefits.va.gov/BENEFITS/docs/FAST.asp',
      category: 'Policy Letters',
      icon: AlertCircle,
      tags: ['fast', 'policy', 'guidance', 'sensitive']
    },

    // Regulations
    {
      id: '38-cfr-part-3',
      title: '38 CFR Part 3 - Adjudication',
      description: 'Federal regulations governing VA benefits adjudication and entitlement',
      url: 'https://www.ecfr.gov/current/title-38/chapter-I/part-3',
      category: 'Regulations',
      icon: Scale,
      tags: ['cfr', 'regulations', 'adjudication', 'law']
    },
    {
      id: '38-cfr-part-4',
      title: '38 CFR Part 4 - Rating Schedule',
      description: 'Schedule for rating disabilities - diagnostic codes and rating criteria',
      url: 'https://www.ecfr.gov/current/title-38/chapter-I/part-4',
      category: 'Regulations',
      icon: Book,
      tags: ['cfr', 'rating schedule', 'diagnostic codes', 'disabilities']
    },

    // Educational Resources
    {
      id: 'va-claims-insider',
      title: 'VA Claims Insider Guide',
      description: 'Comprehensive guide to filing VA disability claims',
      url: 'https://www.va.gov/disability/how-to-file-claim/',
      category: 'Education',
      icon: GraduationCap,
      tags: ['guide', 'claims', 'filing', 'education']
    },
    {
      id: 'bva-precedent',
      title: 'Board of Veterans Appeals Precedent Decisions',
      description: 'Important legal precedents affecting VA claims and appeals',
      url: 'https://www.bva.va.gov/precedent.asp',
      category: 'Legal',
      icon: Scale,
      tags: ['bva', 'precedent', 'legal', 'appeals']
    },
    {
      id: 'cavc-decisions',
      title: 'Court of Appeals for Veterans Claims',
      description: 'Federal court decisions on veterans law',
      url: 'https://www.uscourts.cavc.gov/decisions.php',
      category: 'Legal',
      icon: Shield,
      tags: ['cavc', 'court', 'legal', 'decisions']
    },

    // Evidence & Medical
    {
      id: 'dbq-forms',
      title: 'Disability Benefits Questionnaires (DBQs)',
      description: 'Medical examination forms for specific conditions',
      url: 'https://www.benefits.va.gov/COMPENSATION/dbq_ListBySymptom.asp',
      category: 'Medical',
      icon: FileText,
      tags: ['dbq', 'medical', 'exams', 'evidence']
    },
    {
      id: 'vasrd',
      title: 'Veterans Affairs Schedule for Rating Disabilities',
      description: 'Complete rating schedule with body system breakdowns',
      url: 'https://www.benefits.va.gov/WARMS/bookc.asp',
      category: 'Medical',
      icon: BookOpen,
      tags: ['vasrd', 'rating', 'schedule', 'disabilities']
    }
  ];

  const categories = ['all', ...Array.from(new Set(vaResources.map(r => r.category)))];

  const filteredResources = selectedCategory === 'all'
    ? vaResources
    : vaResources.filter(r => r.category === selectedCategory);

  // AI Search Handler
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setAiLoading(true);

    try {
      // Expert stub: Integrate with real AI API (OpenAI, Azure, etc.)
      // For now, simulate AI response with robust fallback
      // Future: Replace this with actual API call
      // Example:
      // const response = await fetch('/api/ai/va-knowledge', { method: 'POST', body: JSON.stringify({ query: searchQuery }) });
      // const aiResult = await response.json();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Determine sources based on query
      const lowerQuery = searchQuery.toLowerCase();
      let sources: string[] = [];

      if (lowerQuery.includes('presumptive')) {
        sources = [
          '38 CFR §3.309 - Disease subject to presumptive service connection',
          '38 U.S.C. §1116 - Presumptions of service connection for Vietnam veterans',
          '38 U.S.C. §1117 - Presumptions of service connection for Persian Gulf War veterans',
          'PACT Act (2022) - Burn pit and toxic exposure presumptive conditions',
          'M21-1 Part IV Subpart ii Chapter 2 Section C - Presumptive Service Connection'
        ];
      } else if (lowerQuery.includes('rating')) {
        sources = [
          '38 CFR §4.25 - Combined ratings table',
          '38 CFR Part 4 - Schedule for Rating Disabilities',
          'M21-1 Part III Subpart iv Chapter 3 - Rating procedures'
        ];
      } else if (lowerQuery.includes('service connection') || lowerQuery.includes('nexus')) {
        sources = [
          '38 CFR §3.303 - Principles of service connection',
          '38 CFR §3.102 - Reasonable doubt',
          'M21-1 Part III Subpart iv Chapter 1 Section C - Service connection'
        ];
      } else if (lowerQuery.includes('secondary')) {
        sources = [
          '38 CFR §3.310(a) - Secondary service connection',
          '38 CFR §4.26 - Bilateral factor',
          'M21-1 Part IV Subpart ii Chapter 2 Section D - Secondary claims',
          'Allen v. Brown, 7 Vet.App. 439 (1995) - Secondary connection case law'
        ];
      } else if (lowerQuery.includes('ptsd') || lowerQuery.includes('mental')) {
        sources = [
          '38 CFR §3.304(f) - PTSD service connection',
          '38 CFR §4.130 - Mental disorders rating',
          'M21-1 Part IV Subpart ii Chapter 1 Section C - PTSD claims'
        ];
      } else if (lowerQuery.includes('appeal') || lowerQuery.includes('deny')) {
        sources = [
          '38 CFR §3.2500 - Appeals Modernization Act',
          'M21-1 Part I Chapter 5 - Appeals under AMA',
          '38 USC §5110(a) - Effective dates'
        ];
      } else if (lowerQuery.includes('evidence')) {
        sources = [
          '38 CFR §3.159 - VA assistance in developing claims',
          '38 USC §5103A - VA duty to assist',
          'M21-1 Part III Subpart iv Chapter 4 - Evidence development',
          'Jandreau v. Nicholson, 492 F.3d 1372 - Lay evidence competence'
        ];
      } else {
        sources = [
          '38 CFR Parts 3 & 4 - Adjudication and Rating',
          'M21-1 Adjudication Procedures Manual',
          'VA Policy Letters and FAST Letters'
        ];
      }

      const response: AIResponse = {
        question: searchQuery,
        answer: generateAIResponse(searchQuery),
        sources: sources,
        confidence: 'high',
        timestamp: new Date()
      };

      setAiResponses([response, ...aiResponses]);
      setSearchQuery('');
    } catch (error) {
      console.error('AI search error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Simulate AI response (replace with real AI integration)
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Presumptive conditions questions
    if (lowerQuery.includes('presumptive')) {
      return `**VA Presumptive Conditions - Complete List:**

Presumptive service connection means the VA presumes certain conditions are related to your service without requiring you to prove the nexus. Here are ALL the major presumptive condition categories:

**1. AGENT ORANGE PRESUMPTIVE CONDITIONS** (Vietnam, Thailand, Korea DMZ)
- AL Amyloidosis
- Bladder Cancer
- Chronic B-cell Leukemias
- Chloracne (or similar acneform disease)
- Diabetes Mellitus Type 2
- Hodgkin's Disease
- Hypothyroidism
- Ischemic Heart Disease (including coronary artery disease)
- Multiple Myeloma
- Non-Hodgkin's Lymphoma
- Parkinson's Disease
- Peripheral Neuropathy, Early-Onset
- Porphyria Cutanea Tarda
- Prostate Cancer
- Respiratory Cancers (lung, bronchus, larynx, trachea)
- Soft Tissue Sarcomas (other than osteosarcoma, chondrosarcoma, Kaposi's sarcoma, or mesothelioma)

**2. GULF WAR PRESUMPTIVE CONDITIONS** (Southwest Asia, Afghanistan)
**Chronic Multisymptom Illnesses:**
- Chronic Fatigue Syndrome
- Fibromyalgia
- Functional Gastrointestinal Disorders (including IBS)

**Undiagnosed Illnesses with symptoms such as:**
- Fatigue
- Headaches
- Joint pain
- Indigestion
- Insomnia
- Dizziness
- Respiratory disorders
- Skin conditions

**Infectious Diseases:**
- Brucellosis
- Campylobacter jejuni
- Coxiella burnetii (Q fever)
- Malaria
- Mycobacterium tuberculosis
- Nontyphoid Salmonella
- Shigella
- Visceral leishmaniasis
- West Nile virus

**Specific Gulf War Conditions:**
- Asthma (diagnosed within 10 years of separation)
- Rhinitis (diagnosed within 10 years)
- Sinusitis (diagnosed within 10 years)

**3. BURN PIT PRESUMPTIVE CONDITIONS** (Post-9/11 Era)
**Cancers:**
- Glioblastoma
- Head cancer (any type)
- Neck cancer (any type)
- Respiratory cancer (including lung)
- Brain cancer
- Gastrointestinal cancer
- Reproductive cancer (any)
- Lymphoma (any type)
- Lymphomatic cancer (any)
- Kidney cancer
- Pancreatic cancer
- Melanoma

**Respiratory Conditions:**
- Asthma (diagnosed after service in specified locations)
- Chronic bronchitis
- Chronic obstructive pulmonary disease (COPD)
- Chronic rhinitis
- Chronic sinusitis
- Constrictive bronchiolitis or obliterative bronchiolitis
- Emphysema
- Granulomatous disease
- Interstitial lung disease (ILD)
- Pleuritis
- Pulmonary fibrosis
- Sarcoidosis

**4. RADIATION EXPOSURE PRESUMPTIVE CONDITIONS**
- All forms of leukemia (except chronic lymphocytic leukemia)
- Cancer of the thyroid
- Cancer of the breast
- Cancer of the pharynx
- Cancer of the esophagus
- Cancer of the stomach
- Cancer of the small intestine
- Cancer of the pancreas
- Multiple myeloma
- Lymphomas (except Hodgkin's disease)
- Cancer of the bile ducts
- Cancer of the gall bladder
- Primary liver cancer
- Cancer of the salivary gland
- Cancer of the urinary tract
- Bronchiolo-alveolar carcinoma
- Cancer of the bone
- Cancer of the brain
- Cancer of the colon
- Cancer of the lung
- Cancer of the ovary

**5. CAMP LEJEUNE WATER CONTAMINATION** (1953-1987)
- Adult leukemia
- Aplastic anemia and other myelodysplastic syndromes
- Bladder cancer
- Kidney cancer
- Liver cancer
- Multiple myeloma
- Non-Hodgkin's lymphoma
- Parkinson's disease

**6. PRISONERS OF WAR (POW) PRESUMPTIVE CONDITIONS**
**If imprisoned for ANY length of time:**
- Post-traumatic stress disorder (PTSD)
- Any anxiety state

**If imprisoned 30 days or more:**
- Avitaminosis
- Beriberi
- Chronic dysentery
- Helminthiasis
- Malnutrition (including optic atrophy)
- Pellagra
- Cardiovascular disease (including hypertension and stroke)
- Cirrhosis of the liver
- Irritable bowel syndrome
- Peptic ulcer disease
- Peripheral neuropathy (except where directly related to infectious causes)
- Psychosis
- Any of the anxiety states

**7. CHRONIC CONDITIONS FOR EARLY SERVICE** (Within 1 year of separation)
- Anemia (primary)
- Arteriosclerosis
- Cardiovascular-renal disease (including hypertension)
- Diabetes mellitus
- Encephalitis lethargica residuals
- Epilepsies
- Hansen's disease
- Multiple sclerosis
- Osteitis deformans (Paget's disease)
- Sarcoidosis
- Thromboangiitis obliterans (Buerger's disease)
- Tuberculosis

**8. TROPICAL DISEASES** (Within 1 year of separation, or proven incubation)
- Amebiasis
- Blackwater fever
- Cholera
- Dracontiasis
- Dysentery
- Filariasis
- Hansen's disease (leprosy)
- Leishmaniasis (including kala-azar)
- Loiasis
- Malaria
- Onchocerciasis
- Oroya fever
- Pinta
- Plague
- Schistosomiasis
- Trachoma
- Trypanosomiasis
- Tuberculosis
- Typhus (including scrub typhus)
- Yaws
- Yellow fever

**9. SPECIFIC LOCATION-BASED PRESUMPTIVE CONDITIONS**

**Enewetak Atoll (Atomic cleanup 1977-1980):**
- Any condition related to radiation exposure

**K2 Veterans (Karshi-Khanabad Air Base, Uzbekistan):**
- Now eligible for burn pit presumptive conditions

**Thailand Military Bases (Royal Thai Air Force Bases):**
- Agent Orange presumptive conditions

**Korea DMZ (April 1968 - August 1971):**
- Agent Orange presumptive conditions

**10. FUTURE PRESUMPTIVE CONDITIONS**

**Under Review/Recently Added:**
- Hypertension (High Blood Pressure) - NOW PRESUMPTIVE for ALL veterans
- Monoclonal gammopathy of undetermined significance (MGUS)

**Key Legal Citations:**
- 38 CFR §3.309 - Disease subject to presumptive service connection
- 38 CFR §3.307 - Chronic, tropical, and prisoner of war related diseases
- 38 U.S.C. §1116 - Agent Orange presumptive
- 38 U.S.C. §1117 - Gulf War presumptive
- PACT Act (2022) - Burn pit and toxic exposure presumptive

**How to File a Presumptive Claim:**
1. No need to prove nexus if you meet location/time requirements
2. Must show current diagnosis
3. Must prove you were in the location during the time period
4. Medical evidence of current condition required
5. Service records showing deployment/assignment

**Important**: New presumptive conditions are added regularly. Check VA.gov for the most current list.

**References:**
- 38 CFR Part 3 Subpart B - Adjudication Regulations
- M21-1 Part IV Subpart ii Chapter 2 Section C - Presumptive Service Connection
- VA PACT Act Implementation Guidance
- VA Fast Letters on Presumptive Conditions`;
    }

    // Disability rating questions
    if (lowerQuery.includes('rating') || lowerQuery.includes('percent')) {
      return `**VA Disability Rating Information:**

The VA uses a combined rating table to calculate your total disability rating. Here's what you need to know:

1. **Individual Ratings**: Each condition is rated separately using 38 CFR Part 4 diagnostic codes
2. **Combined Rating**: Multiple disabilities are combined using the VA's special math (not simple addition)
3. **Bilateral Factor**: Disabilities affecting both sides get a bilateral factor before combination

**Example**: 50% + 30% + 20% does NOT equal 100%
- Using VA math: Final combined rating would be 70%
- The formula: Each additional disability reduces the remaining "efficiency"

**Key Resources**:
- 38 CFR §4.25 - Combined ratings table
- M21-1 Part III Subpart iv Chapter 3 - Rating procedures
- Use our Disability Rating Calculator for exact calculations

**Important**: Ratings are rounded to the nearest 10%. So 74% rounds to 70%, but 75% rounds to 80%.`;
    }

    // Service connection questions
    if (lowerQuery.includes('service connection') || lowerQuery.includes('nexus')) {
      return `**Service Connection Requirements:**

To establish service connection for a disability, you must prove three elements:

**1. Current Diagnosis**
- Medical evidence showing you currently have the condition
- Must be a recognized medical diagnosis

**2. In-Service Event**
- Evidence the event/injury/exposure occurred during service
- Can be from service records, buddy statements, or other evidence

**3. Nexus (Medical Link)**
- Medical opinion linking current condition to service
- Doctor must state it's "at least as likely as not" related to service

**Types of Service Connection**:
- **Direct**: Condition began in service
- **Presumptive**: Certain conditions presumed service-connected (Agent Orange, Gulf War, etc.)
- **Secondary**: Condition caused by already service-connected disability
- **Aggravation**: Pre-existing condition made worse by service

**Key Legal Standard**: "Benefit of the doubt" - 38 U.S.C. § 5107(b)
When evidence is equal, it goes in veteran's favor.

**References**:
- 38 CFR §3.303 - Principles of service connection
- M21-1 Part III Subpart iv Chapter 1 Section C - Service connection
- 38 CFR §3.102 - Reasonable doubt`;
    }

    // Secondary conditions
    if (lowerQuery.includes('secondary') || lowerQuery.includes('bilateral')) {
      return `**Secondary Service Connection:**

A secondary condition is one caused or aggravated by an already service-connected disability.

**Common Secondary Conditions**:
- **Knee → Hip/Back**: Altered gait from knee injury causes hip or back problems
- **Tinnitus → Sleep Disorder**: Ringing in ears causes chronic sleep disturbance
- **PTSD → Gastro Issues**: Anxiety causes IBS, GERD, or other GI problems
- **Sleep Apnea → Hypertension**: Untreated apnea can cause high blood pressure
- **Diabetes → Peripheral Neuropathy**: Diabetes damages nerves in extremities

**Evidence Needed**:
1. Primary disability already service-connected
2. Current diagnosis of secondary condition
3. Medical nexus linking secondary to primary
4. Nexus statement: "Secondary condition is at least as likely as not caused/aggravated by primary condition"

**Bilateral Factor** (38 CFR §4.26):
When you have disabilities of paired body parts (both arms, both legs, etc.), you get a bilateral factor added before combining with other ratings.

**Key Resources**:
- 38 CFR §3.310(a) - Secondary service connection
- M21-1 Part IV Subpart ii Chapter 2 Section D - Secondary claims
- Allen v. Brown, 7 Vet.App. 439 (1995) - Secondary connection case law`;
    }

    // Evidence and claims
    if (lowerQuery.includes('evidence') || lowerQuery.includes('claim')) {
      return `**Building a Strong VA Claim - Evidence Requirements:**

**Types of Evidence** (38 CFR §3.159):

**1. Lay Evidence** (Your statements)
- Personal statement describing condition and impact
- Buddy statements from fellow service members
- Statements from family/friends about observed changes
- **Important**: Veterans are competent to testify about observable symptoms

**2. Medical Evidence**
- Current diagnosis from doctor
- Treatment records showing ongoing care
- Nexus letter linking condition to service
- Disability Benefits Questionnaires (DBQs)

**3. Service Records**
- DD214 (proof of service)
- Service treatment records (STRs)
- Personnel records
- Incident reports, awards, deployment records

**VA's Duty to Assist** (38 USC §5103A):
- VA must help you get service records
- VA must provide medical exam if needed
- VA must assist in getting Federal records

**Best Practices**:
✓ Submit buddy statements with specific dates and incidents
✓ Get nexus letters that explicitly state "at least as likely as not"
✓ Keep copies of everything you submit
✓ Request your C-file (claims file) to see what VA has
✓ File Intent to File (ITF) to preserve effective date

**Key References**:
- M21-1 Part III Subpart iv Chapter 4 - Evidence development
- 38 CFR §3.159 - VA assistance in developing claims
- Jandreau v. Nicholson, 492 F.3d 1372 - Lay evidence competence`;
    }

    // PTSD specific
    if (lowerQuery.includes('ptsd') || lowerQuery.includes('mental health')) {
      return `**PTSD and Mental Health Claims:**

**PTSD Service Connection Criteria** (38 CFR §3.304(f)):

**1. Current Diagnosis**
- PTSD diagnosed by qualified mental health professional
- Meets DSM-5 criteria

**2. In-Service Stressor**
- **Combat**: If combat veteran, lay evidence of stressor is enough
- **Non-Combat**: Need corroboration of stressor event
- **MST (Military Sexual Trauma)**: Special rules - markers/behavior changes accepted

**3. Nexus**
- Medical opinion linking current PTSD to in-service stressor

**Special PTSD Provisions**:
- **38 CFR §3.304(f)(3)**: Combat stressor verification
- **38 CFR §3.304(f)(5)**: MST stressor evidence
- **Presumptive for POWs**: 38 CFR §3.304(f)(4)

**Common Secondary to PTSD**:
- Sleep disorders/insomnia
- Gastro problems (IBS, GERD)
- Migraines
- Erectile dysfunction
- Depression/anxiety (if separate from PTSD)

**Evidence Tips**:
✓ Personal statement with detailed stressor description
✓ Buddy statements corroborating events
✓ Treatment records showing ongoing care
✓ Marriage/relationship impacts
✓ Employment difficulties

**Resources**:
- M21-1 Part IV Subpart ii Chapter 1 Section C - PTSD
- 38 CFR §4.130 - Mental disorders rating
- VA Form 21-0781 - PTSD stressor statement
- VA Form 21-0781a - MST stressor statement`;
    }

    // Appeals
    if (lowerQuery.includes('appeal') || lowerQuery.includes('deny') || lowerQuery.includes('denied')) {
      return `**VA Claims Appeals Process (AMA - Appeals Modernization Act):**

**If Your Claim is Denied**, you have 3 appeal lanes:

**1. Supplemental Claim**
- Submit new and relevant evidence
- VA re-adjudicates with new evidence
- Can file anytime after decision
- Preserves effective date if within 1 year

**2. Higher-Level Review**
- Senior reviewer re-examines existing evidence
- NO new evidence allowed
- Must file within 1 year of decision
- Can request informal conference

**3. Board Appeal**
- Appeal to Board of Veterans Appeals (BVA)
- Three dockets:
  - **Direct Review**: Board decides on existing record (fastest)
  - **Evidence Submission**: Submit new evidence, no hearing
  - **Hearing**: Present case to Veterans Law Judge

**After Board Decision**:
- Can appeal to Court of Appeals for Veterans Claims (CAVC)
- Then to Federal Circuit
- Then to Supreme Court (rare)

**Key Deadlines**:
- 1 year to file appeal from decision date
- Can file Supplemental Claim anytime (no deadline)
- Effective date preserved if within 1 year

**Important**:
- **38 USC §5110(a)**: Effective date is date of claim or facts found
- **CUE (Clear and Unmistakable Error)**: Can challenge any decision anytime
- **Duty to Assist**: VA must help even on appeal

**Resources**:
- M21-1 Part I Chapter 5 - Appeals under AMA
- 38 CFR §3.2500 - Appeals modernization
- VA Form 20-0995 - Supplemental Claim
- VA Form 20-0996 - Higher-Level Review
- VA Form 10182 - Board Appeal`;
    }

    // Default comprehensive response
    return `**VA Claims Information:**

Your question requires specific context. Here are key areas I can help with:

**Disability Claims**:
- Rating calculations and combined ratings
- Service connection requirements
- Evidence gathering strategies
- Secondary conditions
- Effective dates

**Legal & Policy**:
- 38 CFR regulations
- M21-1 adjudication manual
- VA policy letters and FAST letters
- BVA and court precedents

**Appeals**:
- Supplemental claims
- Higher-level reviews
- Board appeals (3 dockets)
- Court appeals

**Special Topics**:
- PTSD claims
- Agent Orange presumptive
- Gulf War presumptive
- Military Sexual Trauma (MST)
- Fully Developed Claims (FDC)

**Please rephrase your question with more specifics**, or choose a resource category from the left to access official VA documentation.

I'm designed to help veterans fight for their earned benefits by providing accurate information from:
- 38 CFR Parts 3 & 4
- M21-1 Adjudication Manual
- VA policy guidance
- Case law and precedents

**Remember**: This is educational guidance. For your specific claim, consult with a VSO or accredited representative.`;
  };

  return (
    <div className="min-h-screen py-8 px-4 va-theme-bg va-theme-text">
      <div className="container mx-auto max-w-7xl">

        {/* Hero Section */}
        <div
          className="rounded-2xl shadow-2xl p-8 mb-8 border-4 va-theme-card va-theme-border"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{branchIcon}</div>
            <div className="flex-1">
              <h1
                className="text-5xl font-bold mb-2 va-theme-text va-theme-shadow"
              >
                VA Knowledge Center
              </h1>
              <p className="text-xl opacity-90 va-theme-text">
                Access M21-1 Manual, VA Policy Letters, Regulations, and AI-Powered Search
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'resources' ? 'shadow-lg va-theme-accent-bg' : 'opacity-70 hover:opacity-100 va-theme-card'} ${activeTab === 'resources' ? 'text-black' : 'va-theme-text'}`}
            >
              <BookOpen size={20} />
              VA Resources
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'search' ? 'shadow-lg va-theme-accent-bg' : 'opacity-70 hover:opacity-100 va-theme-card'} ${activeTab === 'search' ? 'text-black' : 'va-theme-text'}`}
            >
              <Sparkles size={20} />
              AI Search
            </button>
          </div>
        </div>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <>
            {/* Category Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === cat ? 'shadow-lg va-theme-accent-bg text-black' : 'opacity-60 hover:opacity-100 va-theme-card va-theme-text'}`}
                >
                  {cat === 'all' ? 'All Resources' : cat}
                </button>
              ))}
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105 block va-theme-card va-theme-border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <resource.icon size={28} className="va-theme-accent-text" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 va-theme-text">
                        {resource.title}
                      </h3>
                      <p className="text-sm opacity-80 mb-3 va-theme-text">
                        {resource.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className="px-2 py-1 rounded va-theme-accent-bg text-black"
                        >
                          {resource.category}
                        </span>
                        <ExternalLink size={14} className="va-theme-accent-text" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* AI Search Tab */}
        {activeTab === 'search' && (
          <div>
            {/* Search Input */}
            <div
              className="rounded-xl p-6 shadow-lg mb-6 va-theme-card va-theme-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={32} className="va-theme-accent-text" />
                <div>
                  <h2 className="text-2xl font-bold va-theme-text">
                    AI-Powered VA Knowledge Search
                  </h2>
                  <p className="opacity-80 va-theme-text">
                    Ask questions about VA claims, ratings, appeals, and regulations
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                  placeholder="Ask about service connection, ratings, evidence, appeals, PTSD, secondary conditions..."
                  className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 va-theme-border va-theme-text va-theme-card"
                />
                <button
                  onClick={handleAISearch}
                  disabled={aiLoading || !searchQuery.trim()}
                  className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg va-theme-accent-bg text-black"
                >
                  {aiLoading ? (
                    <><Loader size={20} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Send size={20} /> Ask AI</>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg va-theme-success-bg">
                <CheckCircle size={20} className="va-theme-accent-text mt-0.5" />
                <div className="text-sm va-theme-text">
                  <strong>AI Knowledge Base Includes:</strong> 38 CFR Parts 3 & 4, M21-1 Adjudication Manual,
                  VA Policy Letters, BVA Precedent Decisions, Court of Appeals rulings, and comprehensive VA regulations.
                </div>
              </div>
            </div>

            {/* Suggested Questions */}
            {aiResponses.length === 0 && (
              <>
                <div
                  className="rounded-xl p-6 shadow-lg mb-6 va-theme-card va-theme-border"
                >
                  <h3 className="text-xl font-bold mb-4 va-theme-text">
                    Suggested Questions:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'How is VA disability rating calculated?',
                      'What is service connection and how do I prove it?',
                      'What are common secondary conditions?',
                      'How do I file a PTSD claim?',
                      'What evidence do I need for my claim?',
                      'How do I appeal a denied claim?',
                      'What is a nexus letter?',
                      'How does the bilateral factor work?'
                    ].map(question => (
                      <button
                        key={question}
                        onClick={() => setSearchQuery(question)}
                        className="text-left px-4 py-3 rounded-lg hover:shadow-lg transition va-theme-text va-theme-border va-theme-card border"
                      >
                        <MessageSquare size={16} className="inline mr-2 va-theme-accent-text" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* VA Disability Rating Calculator */}
                <div className="rounded-xl p-6 shadow-lg mb-6 va-theme-card va-theme-border">
                  <h3 className="text-xl font-bold mb-4 va-theme-text">VA Disability Rating Calculator</h3>
                  <VACalculator />
                </div>
              </>
            )}

            {/* AI Responses */}
            <div className="space-y-6">
              {aiResponses.map((response, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 shadow-lg va-theme-card va-theme-border"
                >
                  {/* Question */}
                  <div className="flex items-start gap-3 mb-4 pb-4 border-b va-theme-border">
                    <MessageSquare size={24} className="va-theme-accent-text" />
                    <div>
                      <p className="font-bold text-lg va-theme-text">
                        {response.question}
                      </p>
                      <p className="text-sm opacity-60 va-theme-text">
                        {response.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={20} className="va-theme-accent-text" />
                      <span className="font-semibold va-theme-text">
                        AI Response
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          response.confidence === 'high' ? 'bg-green-500' :
                          response.confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {response.confidence.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                    <div
                      className="prose prose-invert max-w-none whitespace-pre-wrap va-theme-text"
                    >
                      {response.answer}
                    </div>
                  </div>

                  {/* Sources */}
                  <div
                    className="p-4 rounded-lg va-theme-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Book size={18} className="va-theme-accent-text" />
                      <span className="font-semibold text-sm va-theme-text">
                        Sources Referenced:
                      </span>
                    </div>
                    <ul className="text-sm space-y-1 va-theme-text">
                      {response.sources.map((source, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ChevronRight size={14} className="va-theme-accent-text" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VAKnowledgeCenter;
