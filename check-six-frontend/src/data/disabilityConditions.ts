// Comprehensive VA Disability Conditions Database
// Organized by body system for easy searching and autocomplete

export interface DisabilityCondition {
  id: string;
  name: string;
  category: string;
  commonRatings: number[];
  keywords: string[];
  description: string;
  relatedConditions?: string[];
}

export const DISABILITY_CONDITIONS: DisabilityCondition[] = [
  // Musculoskeletal System
  {
    id: 'knee-strain',
    name: 'Knee Strain',
    category: 'Musculoskeletal',
    commonRatings: [0, 10, 20, 30, 40, 50],
    keywords: ['knee', 'leg', 'joint', 'pain', 'meniscus', 'ligament', 'acl', 'mcl'],
    description: 'Injury or strain to the knee joint',
    relatedConditions: ['Arthritis of Knee', 'Limited Range of Motion']
  },
  {
    id: 'back-strain',
    name: 'Back Strain/Sprain',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 40, 50, 60, 100],
    keywords: ['back', 'spine', 'lumbar', 'thoracic', 'cervical', 'disc', 'herniated', 'sciatica'],
    description: 'Injury to the muscles, ligaments, or discs of the back',
    relatedConditions: ['Sciatica', 'Radiculopathy', 'Degenerative Disc Disease']
  },
  {
    id: 'shoulder-strain',
    name: 'Shoulder Injury',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 30, 40, 50],
    keywords: ['shoulder', 'rotator cuff', 'arm', 'joint', 'dislocation', 'separation'],
    description: 'Injury to the shoulder joint or rotator cuff',
    relatedConditions: ['Limited Range of Motion', 'Frozen Shoulder']
  },
  {
    id: 'ankle-strain',
    name: 'Ankle Injury/Sprain',
    category: 'Musculoskeletal',
    commonRatings: [0, 10, 20, 30],
    keywords: ['ankle', 'foot', 'sprain', 'fracture', 'achilles'],
    description: 'Injury to the ankle joint or surrounding tissues',
    relatedConditions: ['Plantar Fasciitis', 'Flat Feet']
  },
  {
    id: 'hip-strain',
    name: 'Hip Injury',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 30, 40, 50, 60],
    keywords: ['hip', 'pelvis', 'joint', 'arthritis', 'replacement'],
    description: 'Injury or arthritis of the hip joint',
    relatedConditions: ['Arthritis', 'Limited Range of Motion']
  },
  {
    id: 'plantar-fasciitis',
    name: 'Plantar Fasciitis',
    category: 'Musculoskeletal',
    commonRatings: [0, 10, 20, 30],
    keywords: ['foot', 'heel', 'pain', 'plantar', 'fascia'],
    description: 'Inflammation of the plantar fascia',
    relatedConditions: ['Flat Feet', 'Heel Spurs']
  },
  {
    id: 'flat-feet',
    name: 'Flat Feet (Pes Planus)',
    category: 'Musculoskeletal',
    commonRatings: [0, 10, 20, 30, 50],
    keywords: ['foot', 'feet', 'arch', 'flat', 'pes planus'],
    description: 'Fallen arches causing foot pain',
    relatedConditions: ['Plantar Fasciitis', 'Ankle Pain']
  },
  {
    id: 'arthritis',
    name: 'Arthritis (Degenerative)',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 30, 40, 50],
    keywords: ['arthritis', 'joint', 'pain', 'degenerative', 'osteoarthritis'],
    description: 'Degenerative joint disease',
    relatedConditions: ['Limited Range of Motion', 'Joint Pain']
  },
  {
    id: 'carpal-tunnel',
    name: 'Carpal Tunnel Syndrome',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 30, 40],
    keywords: ['wrist', 'hand', 'carpal', 'tunnel', 'nerve', 'numbness', 'tingling'],
    description: 'Compression of the median nerve in the wrist',
    relatedConditions: ['Peripheral Neuropathy', 'Hand Pain']
  },
  {
    id: 'neck-strain',
    name: 'Neck Strain/Cervical Spine Injury',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 30, 40, 50],
    keywords: ['neck', 'cervical', 'spine', 'whiplash', 'pain'],
    description: 'Injury to the cervical spine or neck muscles',
    relatedConditions: ['Headaches', 'Radiculopathy']
  },

  // Mental Health
  {
    id: 'ptsd',
    name: 'Post-Traumatic Stress Disorder (PTSD)',
    category: 'Mental Health',
    commonRatings: [10, 30, 50, 70, 100],
    keywords: ['ptsd', 'trauma', 'stress', 'anxiety', 'depression', 'nightmares', 'flashbacks', 'combat'],
    description: 'Mental health condition triggered by traumatic events',
    relatedConditions: ['Depression', 'Anxiety', 'Insomnia', 'Substance Abuse']
  },
  {
    id: 'depression',
    name: 'Major Depressive Disorder',
    category: 'Mental Health',
    commonRatings: [10, 30, 50, 70, 100],
    keywords: ['depression', 'sad', 'mood', 'mental', 'psychiatric'],
    description: 'Persistent feelings of sadness and loss of interest',
    relatedConditions: ['PTSD', 'Anxiety', 'Insomnia']
  },
  {
    id: 'anxiety',
    name: 'Anxiety Disorder',
    category: 'Mental Health',
    commonRatings: [10, 30, 50, 70],
    keywords: ['anxiety', 'panic', 'worry', 'fear', 'mental'],
    description: 'Excessive worry and anxiety',
    relatedConditions: ['PTSD', 'Depression', 'Panic Disorder']
  },
  {
    id: 'tbi',
    name: 'Traumatic Brain Injury (TBI)',
    category: 'Neurological',
    commonRatings: [0, 10, 40, 70, 100],
    keywords: ['tbi', 'brain', 'head', 'concussion', 'traumatic', 'injury', 'cognitive'],
    description: 'Injury to the brain from external force',
    relatedConditions: ['Headaches', 'Memory Loss', 'Cognitive Impairment', 'PTSD']
  },
  {
    id: 'bipolar',
    name: 'Bipolar Disorder',
    category: 'Mental Health',
    commonRatings: [30, 50, 70, 100],
    keywords: ['bipolar', 'manic', 'mood', 'mania', 'depression'],
    description: 'Mood disorder with alternating manic and depressive episodes',
    relatedConditions: ['Depression', 'Anxiety']
  },

  // Respiratory System
  {
    id: 'sleep-apnea',
    name: 'Obstructive Sleep Apnea',
    category: 'Respiratory',
    commonRatings: [0, 30, 50, 100],
    keywords: ['sleep', 'apnea', 'breathing', 'cpap', 'snoring', 'osa'],
    description: 'Breathing repeatedly stops during sleep',
    relatedConditions: ['Hypertension', 'Heart Disease', 'GERD']
  },
  {
    id: 'asthma',
    name: 'Asthma',
    category: 'Respiratory',
    commonRatings: [10, 30, 60, 100],
    keywords: ['asthma', 'breathing', 'wheeze', 'inhaler', 'respiratory'],
    description: 'Chronic inflammatory disease of airways',
    relatedConditions: ['COPD', 'Bronchitis']
  },
  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    category: 'Respiratory',
    commonRatings: [10, 30, 60, 100],
    keywords: ['copd', 'breathing', 'lung', 'chronic', 'emphysema', 'bronchitis'],
    description: 'Progressive lung disease causing breathing difficulties',
    relatedConditions: ['Asthma', 'Bronchitis']
  },
  {
    id: 'sinusitis',
    name: 'Chronic Sinusitis',
    category: 'Respiratory',
    commonRatings: [0, 10, 30, 50],
    keywords: ['sinus', 'sinusitis', 'nose', 'congestion', 'infection'],
    description: 'Chronic inflammation of the sinuses',
    relatedConditions: ['Rhinitis', 'Allergies']
  },

  // Cardiovascular System
  {
    id: 'hypertension',
    name: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    commonRatings: [0, 10, 20, 40, 60],
    keywords: ['hypertension', 'blood', 'pressure', 'heart', 'cardiovascular', 'bp'],
    description: 'Persistently elevated blood pressure',
    relatedConditions: ['Heart Disease', 'Stroke', 'Kidney Disease']
  },
  {
    id: 'heart-disease',
    name: 'Ischemic Heart Disease',
    category: 'Cardiovascular',
    commonRatings: [10, 30, 60, 100],
    keywords: ['heart', 'cardiac', 'coronary', 'ischemic', 'angina'],
    description: 'Reduced blood supply to the heart',
    relatedConditions: ['Hypertension', 'Atherosclerosis']
  },
  {
    id: 'arrhythmia',
    name: 'Cardiac Arrhythmia',
    category: 'Cardiovascular',
    commonRatings: [10, 30, 60, 100],
    keywords: ['heart', 'arrhythmia', 'irregular', 'heartbeat', 'afib'],
    description: 'Irregular heartbeat',
    relatedConditions: ['Heart Disease', 'Hypertension']
  },

  // Digestive System
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    category: 'Digestive',
    commonRatings: [10, 30, 60],
    keywords: ['gerd', 'reflux', 'heartburn', 'acid', 'stomach', 'esophagus'],
    description: 'Chronic acid reflux',
    relatedConditions: ['Hiatal Hernia', 'Esophagitis']
  },
  {
    id: 'ibs',
    name: 'Irritable Bowel Syndrome (IBS)',
    category: 'Digestive',
    commonRatings: [0, 10, 30],
    keywords: ['ibs', 'bowel', 'irritable', 'stomach', 'digestive', 'diarrhea', 'constipation'],
    description: 'Chronic digestive disorder',
    relatedConditions: ['GERD', 'Anxiety']
  },
  {
    id: 'hemorrhoids',
    name: 'Hemorrhoids',
    category: 'Digestive',
    commonRatings: [0, 10, 20],
    keywords: ['hemorrhoids', 'rectal', 'anal', 'bleeding'],
    description: 'Swollen veins in the rectum or anus',
    relatedConditions: ['IBS', 'Constipation']
  },

  // Endocrine/Metabolic
  {
    id: 'diabetes',
    name: 'Diabetes Mellitus Type 2',
    category: 'Endocrine',
    commonRatings: [10, 20, 40, 60, 100],
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'diabetic'],
    description: 'Metabolic disorder affecting blood sugar regulation',
    relatedConditions: ['Peripheral Neuropathy', 'Kidney Disease', 'Heart Disease']
  },
  {
    id: 'thyroid',
    name: 'Thyroid Disorder (Hypothyroidism)',
    category: 'Endocrine',
    commonRatings: [10, 30, 60, 100],
    keywords: ['thyroid', 'hypothyroid', 'hyperthyroid', 'endocrine'],
    description: 'Dysfunction of the thyroid gland',
    relatedConditions: ['Fatigue', 'Weight Changes']
  },

  // Skin Conditions
  {
    id: 'skin-scars',
    name: 'Scars (Disfiguring)',
    category: 'Skin',
    commonRatings: [0, 10, 20, 30, 40, 50],
    keywords: ['scar', 'scarring', 'burn', 'disfiguring', 'skin'],
    description: 'Visible scars from injuries or burns',
    relatedConditions: ['Burn Injury', 'Keloid']
  },
  {
    id: 'eczema',
    name: 'Eczema/Atopic Dermatitis',
    category: 'Skin',
    commonRatings: [0, 10, 30, 60],
    keywords: ['eczema', 'dermatitis', 'skin', 'rash', 'itching'],
    description: 'Chronic inflammatory skin condition',
    relatedConditions: ['Allergies', 'Psoriasis']
  },
  {
    id: 'psoriasis',
    name: 'Psoriasis',
    category: 'Skin',
    commonRatings: [0, 10, 30, 60],
    keywords: ['psoriasis', 'skin', 'rash', 'scaly', 'plaque'],
    description: 'Autoimmune condition causing skin inflammation',
    relatedConditions: ['Eczema', 'Arthritis']
  },

  // Ear/Hearing
  {
    id: 'tinnitus',
    name: 'Tinnitus (Ringing in Ears)',
    category: 'Auditory',
    commonRatings: [10],
    keywords: ['tinnitus', 'ringing', 'ears', 'hearing', 'noise'],
    description: 'Persistent ringing or buzzing in the ears',
    relatedConditions: ['Hearing Loss', 'TBI']
  },
  {
    id: 'hearing-loss',
    name: 'Hearing Loss',
    category: 'Auditory',
    commonRatings: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    keywords: ['hearing', 'loss', 'deaf', 'ears', 'auditory'],
    description: 'Partial or complete loss of hearing',
    relatedConditions: ['Tinnitus', 'Meniere\'s Disease']
  },
  {
    id: 'menieres',
    name: 'Meniere\'s Disease',
    category: 'Auditory',
    commonRatings: [30, 60, 100],
    keywords: ['meniere', 'vertigo', 'dizziness', 'ear', 'balance'],
    description: 'Inner ear disorder causing vertigo and hearing loss',
    relatedConditions: ['Tinnitus', 'Hearing Loss', 'Vertigo']
  },

  // Neurological
  {
    id: 'migraines',
    name: 'Migraine Headaches',
    category: 'Neurological',
    commonRatings: [0, 10, 30, 50],
    keywords: ['migraine', 'headache', 'head', 'pain', 'neurological'],
    description: 'Severe recurring headaches',
    relatedConditions: ['TBI', 'Neck Strain', 'Vision Problems']
  },
  {
    id: 'peripheral-neuropathy',
    name: 'Peripheral Neuropathy',
    category: 'Neurological',
    commonRatings: [10, 20, 30, 40],
    keywords: ['neuropathy', 'nerve', 'numbness', 'tingling', 'peripheral'],
    description: 'Nerve damage causing pain, numbness, or weakness',
    relatedConditions: ['Diabetes', 'Back Injury', 'Carpal Tunnel']
  },
  {
    id: 'radiculopathy',
    name: 'Radiculopathy',
    category: 'Neurological',
    commonRatings: [10, 20, 30, 40, 60],
    keywords: ['radiculopathy', 'nerve', 'pinched', 'sciatica', 'spine'],
    description: 'Pinched nerve in the spine',
    relatedConditions: ['Back Strain', 'Sciatica', 'Neck Strain']
  },
  {
    id: 'paralysis',
    name: 'Paralysis',
    category: 'Neurological',
    commonRatings: [40, 50, 60, 70, 80, 90, 100],
    keywords: ['paralysis', 'paralyzed', 'limb', 'quadriplegic', 'paraplegic'],
    description: 'Loss of muscle function',
    relatedConditions: ['TBI', 'Spinal Cord Injury']
  },

  // Urological/Renal
  {
    id: 'kidney-disease',
    name: 'Chronic Kidney Disease',
    category: 'Urological',
    commonRatings: [10, 30, 60, 80, 100],
    keywords: ['kidney', 'renal', 'urinary', 'dialysis'],
    description: 'Progressive loss of kidney function',
    relatedConditions: ['Diabetes', 'Hypertension']
  },
  {
    id: 'erectile-dysfunction',
    name: 'Erectile Dysfunction',
    category: 'Urological',
    commonRatings: [0, 10, 20],
    keywords: ['erectile', 'dysfunction', 'impotence', 'sexual'],
    description: 'Inability to achieve or maintain an erection',
    relatedConditions: ['PTSD', 'Diabetes', 'Hypertension']
  },

  // Vision
  {
    id: 'vision-loss',
    name: 'Vision Loss/Impairment',
    category: 'Vision',
    commonRatings: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    keywords: ['vision', 'eye', 'sight', 'blind', 'visual'],
    description: 'Partial or complete loss of vision',
    relatedConditions: ['TBI', 'Diabetes']
  },
  {
    id: 'cataracts',
    name: 'Cataracts',
    category: 'Vision',
    commonRatings: [10, 30],
    keywords: ['cataract', 'eye', 'vision', 'cloudy'],
    description: 'Clouding of the eye lens',
    relatedConditions: ['Vision Loss', 'Diabetes']
  },

  // Other Common Conditions
  {
    id: 'burn-injury',
    name: 'Burn Injury',
    category: 'Skin',
    commonRatings: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    keywords: ['burn', 'fire', 'thermal', 'chemical', 'scar'],
    description: 'Injury from heat, chemicals, or radiation',
    relatedConditions: ['Scars', 'PTSD']
  },
  {
    id: 'amputation',
    name: 'Amputation',
    category: 'Musculoskeletal',
    commonRatings: [40, 50, 60, 70, 80, 90, 100],
    keywords: ['amputation', 'amputee', 'limb', 'loss', 'prosthetic'],
    description: 'Loss of a limb or body part',
    relatedConditions: ['Phantom Limb Pain', 'PTSD']
  },
  {
    id: 'cancer',
    name: 'Cancer',
    category: 'Oncology',
    commonRatings: [100],
    keywords: ['cancer', 'tumor', 'malignant', 'oncology', 'chemotherapy'],
    description: 'Malignant growth or tumor',
    relatedConditions: ['Varies by type']
  },
  {
    id: 'gulf-war-syndrome',
    name: 'Gulf War Syndrome',
    category: 'Multiple Systems',
    commonRatings: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    keywords: ['gulf war', 'syndrome', 'chronic', 'multi-symptom', 'fatigue'],
    description: 'Chronic multi-symptom illness affecting Gulf War veterans',
    relatedConditions: ['Chronic Fatigue', 'IBS', 'Fibromyalgia']
  },
  {
    id: 'fibromyalgia',
    name: 'Fibromyalgia',
    category: 'Musculoskeletal',
    commonRatings: [10, 20, 40],
    keywords: ['fibromyalgia', 'pain', 'chronic', 'fatigue', 'widespread'],
    description: 'Chronic widespread musculoskeletal pain',
    relatedConditions: ['Chronic Fatigue', 'IBS', 'Depression']
  },
  {
    id: 'chronic-fatigue',
    name: 'Chronic Fatigue Syndrome',
    category: 'Multiple Systems',
    commonRatings: [10, 20, 40, 60, 100],
    keywords: ['fatigue', 'chronic', 'tired', 'exhaustion', 'cfs'],
    description: 'Persistent, unexplained fatigue',
    relatedConditions: ['Fibromyalgia', 'Depression', 'Gulf War Syndrome']
  }
];

// Search function for autocomplete
export function searchConditions(query: string): DisabilityCondition[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();

  return DISABILITY_CONDITIONS.filter(condition =>
    condition.name.toLowerCase().includes(lowerQuery) ||
    condition.keywords.some(keyword => keyword.includes(lowerQuery)) ||
    condition.category.toLowerCase().includes(lowerQuery)
  ).sort((a, b) => {
    // Prioritize exact matches in name
    const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery);
    const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery);
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    return 0;
  }).slice(0, 10); // Limit to 10 results
}

// Get condition by ID
export function getConditionById(id: string): DisabilityCondition | undefined {
  return DISABILITY_CONDITIONS.find(c => c.id === id);
}

// Get all conditions by category
export function getConditionsByCategory(category: string): DisabilityCondition[] {
  return DISABILITY_CONDITIONS.filter(c => c.category === category);
}

// Get all categories
export function getAllCategories(): string[] {
  return Array.from(new Set(DISABILITY_CONDITIONS.map(c => c.category))).sort();
}
