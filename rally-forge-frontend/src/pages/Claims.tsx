import React, { useState, useEffect } from 'react';
import { DisabilityProvider } from '../contexts/DisabilityContext';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { Calculator } from '../components/Calculator';
import { AdvancedDisabilityCalculator } from '../components/AdvancedDisabilityCalculator';
import { EffectiveDateCalculator } from '../components/EffectiveDateCalculator';
import { EnhancedEntitlementHelper } from '../components/EnhancedEntitlementHelper';
import { DisabilityWizard } from '../components/DisabilityWizard';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
// ClaimsList removed - replaced with educational Strategy Advisor

// Configure PDF.js worker - use local version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface Disability {
  id: string;
  name: string;
  rating: number;
  effectiveDate?: string;
  description?: string;
}

interface DeniedCondition {
  id: string;
  name: string;
  denialDate?: string;
  denialReason?: string;
  description?: string;
}

interface ConnectionAnalysis {
  deniedCondition: string;
  potentialConnections: {
    serviceConnectedDisability: string;
    connectionType: 'secondary' | 'aggravation' | 'direct' | 'bilateral';
    medicalRationale: string;
    strength: 'strong' | 'moderate' | 'possible';
    researchReferences: string[];
    nextSteps: string[];
  }[];
}

export const Claims: React.FC = () => {
  const { profile } = useVeteranProfile();

  // Service-Connected Disabilities
  const [serviceConnectedDisabilities, setServiceConnectedDisabilities] = useState<Disability[]>([]);
  const [newSCDisability, setNewSCDisability] = useState({ name: '', rating: 0, effectiveDate: '', description: '' });

  // Load data from onboarding profile on mount
  useEffect(() => {
    if (profile.serviceConnectedConditions && profile.serviceConnectedConditions.length > 0) {
      const importedDisabilities: Disability[] = profile.serviceConnectedConditions.map((condition, index) => ({
        id: `onboarding-${index}`,
        name: condition.name,
        rating: condition.rating,
        effectiveDate: condition.effectiveDate,
        description: 'Imported from onboarding'
      }));
      setServiceConnectedDisabilities(importedDisabilities);
      console.log(`✅ Auto-loaded ${importedDisabilities.length} conditions from onboarding`);
    }

    // Check for denied conditions from sessionStorage (populated by onboarding scanner)
    const deniedFromStorage = sessionStorage.getItem('deniedConditions');
    if (deniedFromStorage) {
      try {
        const deniedList = JSON.parse(deniedFromStorage);
        const importedDenied: DeniedCondition[] = deniedList.map((name: string, index: number) => ({
          id: `denied-${index}`,
          name: name,
          denialDate: '',
          denialReason: 'Detected from VA rating decision',
          description: ''
        }));
        setDeniedConditions(importedDenied);
        console.log(`✅ Auto-loaded ${importedDenied.length} denied conditions from onboarding scanner`);
      } catch (error) {
        console.error('Error parsing denied conditions:', error);
      }
    }
  }, [profile.serviceConnectedConditions]);

  // Denied Conditions
  const [deniedConditions, setDeniedConditions] = useState<DeniedCondition[]>([]);
  const [newDeniedCondition, setNewDeniedCondition] = useState({ name: '', denialDate: '', denialReason: '', description: '' });

  // Analysis
  const [analysisResults, setAnalysisResults] = useState<ConnectionAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  // Rating Decision Upload
  const [uploadedRatingDecision, setUploadedRatingDecision] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');

  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [currentDisability, setCurrentDisability] = useState({
    name: '',
    description: '',
    serviceConnection: 'direct',
  });
  const [activeTab, setActiveTab] = useState<'analyzer' | 'wizard' | 'theories' | 'guide' | 'faq' | 'calculator' | 'effective-date' | 'entitlement'>('analyzer');
  const [secondaryAnalysis, setSecondaryAnalysis] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Add Service-Connected Disability
  const addServiceConnectedDisability = () => {
    if (newSCDisability.name && newSCDisability.rating > 0) {
      const disability: Disability = {
        id: Date.now().toString(),
        ...newSCDisability
      };
      setServiceConnectedDisabilities([...serviceConnectedDisabilities, disability]);
      setNewSCDisability({ name: '', rating: 0, effectiveDate: '', description: '' });
    }
  };

  // Remove Service-Connected Disability
  const removeServiceConnectedDisability = (id: string) => {
    setServiceConnectedDisabilities(serviceConnectedDisabilities.filter(d => d.id !== id));
  };

  // Handle Rating Decision Upload
  const handleRatingDecisionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedRatingDecision(file);
    }
  };

  // Remove Rating Decision
  const removeRatingDecision = () => {
    setUploadedRatingDecision(null);
    setScanProgress('');
  };

  // AI Scan Rating Decision Document
  const scanRatingDecision = async () => {
    if (!uploadedRatingDecision) return;

    setIsScanning(true);
    setScanProgress('📄 Reading document...');

    try {
      // Read the file content
      const fileText = await readFileContent(uploadedRatingDecision);

      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress('🔍 Analyzing document structure...');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setScanProgress('🤖 AI extracting disability information...');

      await new Promise(resolve => setTimeout(resolve, 1200));
      setScanProgress('✅ Processing ratings and effective dates...');

      // Parse the document for service-connected disabilities
      const extractedDisabilities = parseServiceConnectedDisabilities(fileText);

      // Parse the document for denied conditions
      const extractedDeniedConditions = parseDeniedConditions(fileText);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Add extracted disabilities to the list
      if (extractedDisabilities.length > 0) {
        setServiceConnectedDisabilities(prev => {
          const existingNames = prev.map(d => d.name.toLowerCase());
          const newDisabilities = extractedDisabilities.filter(
            d => !existingNames.includes(d.name.toLowerCase())
          );
          return [...prev, ...newDisabilities];
        });
      }

      // Add extracted denied conditions to the list
      if (extractedDeniedConditions.length > 0) {
        setDeniedConditions(prev => {
          const existingNames = prev.map(d => d.name.toLowerCase());
          const newConditions = extractedDeniedConditions.filter(
            d => !existingNames.includes(d.name.toLowerCase())
          );
          return [...prev, ...newConditions];
        });
      }

      if (extractedDisabilities.length === 0 && extractedDeniedConditions.length === 0) {
        setScanProgress('⚠️ Could not extract data. Please ensure this is a VA rating decision and try again, or enter manually.');
      } else {
        setScanProgress(`✅ Complete! Found ${extractedDisabilities.length} service-connected disabilities and ${extractedDeniedConditions.length} denied conditions`);
      }

      // Clear progress message after 4 seconds
      setTimeout(() => {
        setScanProgress('');
        setIsScanning(false);
      }, 4000);

    } catch (error) {
      console.error('Error scanning document:', error);
      setScanProgress('❌ Error scanning document. Please enter disabilities manually.');
      setTimeout(() => {
        setScanProgress('');
        setIsScanning(false);
      }, 3000);
    }
  };

  // Read file content (text extraction)
  const readFileContent = async (file: File): Promise<string> => {
    try {
      // Check if it's a PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        return await extractTextFromPDF(file);
      }

      // For text-based files, read as text
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text || '');
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  };

  // Extract text from PDF using PDF.js with SOPHISTICATED OCR FALLBACK
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Check if meaningful content was extracted (look for rating percentages or key VA terms)
      const hasMeaningfulContent = fullText.length > 100 && (
        /\d{1,3}%/.test(fullText) ||
        /service.?connected/i.test(fullText) ||
        /rating/i.test(fullText) ||
        /disability/i.test(fullText)
      );

      // If very little text OR no meaningful VA content detected, use OCR
      if (!hasMeaningfulContent) {
        setScanProgress('🔍 Scanned document detected - Running expert OCR analysis...');

        const worker = await createWorker('eng', 1);
        let ocrText = '';

        // EXPERT PREPROCESSING
        const preprocessImage = (canvas: HTMLCanvasElement, strategy: string): string => {
          const ctx = canvas.getContext('2d')!;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          if (strategy === 'high-contrast') {
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const contrast = 2.5;
              const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
              const enhanced = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
              const threshold = enhanced > 140 ? 255 : 0;
              data[i] = data[i + 1] = data[i + 2] = threshold;
            }
          } else if (strategy === 'adaptive') {
            const blockSize = 15;
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                let sum = 0, count = 0;
                for (let dy = -blockSize; dy <= blockSize; dy++) {
                  for (let dx = -blockSize; dx <= blockSize; dx++) {
                    const ny = y + dy, nx = x + dx;
                    if (ny >= 0 && ny < canvas.height && nx >= 0 && nx < canvas.width) {
                      const nidx = (ny * canvas.width + nx) * 4;
                      sum += 0.299 * data[nidx] + 0.587 * data[nidx + 1] + 0.114 * data[nidx + 2];
                      count++;
                    }
                  }
                }
                const localAvg = sum / count;
                const threshold = gray > localAvg - 10 ? 255 : 0;
                data[idx] = data[idx + 1] = data[idx + 2] = threshold;
              }
            }
          } else if (strategy === 'denoise') {
            const tempData = new Uint8ClampedArray(data);
            for (let y = 1; y < canvas.height - 1; y++) {
              for (let x = 1; x < canvas.width - 1; x++) {
                const idx = (y * canvas.width + x) * 4;
                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dx = -1; dx <= 1; dx++) {
                    const nidx = ((y + dy) * canvas.width + (x + dx)) * 4;
                    neighbors.push(0.299 * tempData[nidx] + 0.587 * tempData[nidx + 1] + 0.114 * tempData[nidx + 2]);
                  }
                }
                neighbors.sort((a, b) => a - b);
                const median = neighbors[4];
                const contrast = 1.8;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                const enhanced = Math.max(0, Math.min(255, factor * (median - 128) + 128));
                const threshold = enhanced > 135 ? 255 : 0;
                data[idx] = data[idx + 1] = data[idx + 2] = threshold;
              }
            }
          }
          ctx.putImageData(imageData, 0, 0);
          return canvas.toDataURL('image/png');
        };

        // 5-STRATEGY SCANNER
        const strategies = [
          { name: 'high-contrast', psm: '1', desc: 'High Contrast' },
          { name: 'adaptive', psm: '3', desc: 'Adaptive' },
          { name: 'denoise', psm: '6', desc: 'Denoise' },
          { name: 'high-contrast', psm: '4', desc: 'Single Column' },
          { name: 'adaptive', psm: '11', desc: 'Sparse Text' }
        ];

        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          setScanProgress(`🔍 Expert OCR - Analyzing page ${i}/${Math.min(pdf.numPages, 10)}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 6.0 });
          const pageResults: any[] = [];

          for (const strategy of strategies) {
            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;

            await worker.setParameters({
              tessedit_pageseg_mode: parseInt(strategy.psm) as any,
              tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/., ()%\'"',
              preserve_interword_spaces: '1',
              tessedit_do_invert: '1'
            });

            const enhanced = preprocessImage(canvas, strategy.name);
            const result = await worker.recognize(enhanced);

            pageResults.push({
              text: result.data.text,
              confidence: result.data.confidence,
              strategy: strategy.desc,
              length: result.data.text.length
            });
          }

          // Intelligent scoring
          pageResults.forEach(r => {
            const wordCount = r.text.split(/\s+/).filter((w: string) => w.length > 2).length;
            r.score = r.confidence * (r.length / 100) * (wordCount / 10);
          });
          pageResults.sort((a, b) => b.score - a.score);

          const winner = pageResults[0];
          ocrText += winner.text + '\n';
        }

        await worker.terminate();
        fullText = ocrText;
        setScanProgress('✅ Expert OCR complete - Analyzing extracted data...');
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  // Parse service-connected disabilities from document text
  const parseServiceConnectedDisabilities = (text: string): Disability[] => {
    const disabilities: Disability[] = [];

    // Common patterns in VA rating decisions
    // Pattern 1: "Condition Name ... XX% ... Effective Date"
    // Pattern 2: "Service Connected: Condition ... Rating: XX%"

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineLower = line.toLowerCase();

      // Skip lines that contain combined/overall rating keywords
      if (lineLower.includes('combined') ||
          lineLower.includes('overall') ||
          lineLower.includes('total') ||
          lineLower.includes('final rating') ||
          lineLower.includes('combined rating') ||
          lineLower.includes('overall rating')) {
        continue;
      }

      // Look for rating percentages (strong indicator of service-connected condition)
      const ratingMatch = line.match(/(\d{1,3})%/);

      if (ratingMatch && !lineLower.includes('denied') && !lineLower.includes('not service')) {
        const rating = parseInt(ratingMatch[1]);

        // Validate rating is a valid individual rating (0-100)
        if (rating > 100) continue;

        // Extract condition name (usually before the percentage or on previous line)
        let conditionName = '';

        // Try to extract from current line
        const beforeRating = line.substring(0, line.indexOf(ratingMatch[0])).trim();
        if (beforeRating.length > 3 && beforeRating.length < 100) {
          conditionName = beforeRating.replace(/^[-•*\d.]+\s*/, ''); // Remove bullet points
        } else if (i > 0) {
          // Check previous line for condition name
          conditionName = lines[i - 1].trim().replace(/^[-•*\d.]+\s*/, '');
        }

        // Look for effective date (common formats: MM/DD/YYYY, Month DD, YYYY)
        let effectiveDate = '';
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\w+ \d{1,2},? \d{4})/);
        if (dateMatch) {
          effectiveDate = dateMatch[0];
        } else if (i < lines.length - 1) {
          const nextLine = lines[i + 1];
          const nextDateMatch = nextLine.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\w+ \d{1,2},? \d{4})/);
          if (nextDateMatch) {
            effectiveDate = nextDateMatch[0];
          }
        }

        if (conditionName && rating >= 0 && rating <= 100) {
          disabilities.push({
            id: Date.now().toString() + '-' + disabilities.length,
            name: conditionName,
            rating: rating,
            effectiveDate: effectiveDate,
            description: ''
          });
        }
      }
    }

    return disabilities;
  };

  // Parse denied conditions from document text
  const parseDeniedConditions = (text: string): DeniedCondition[] => {
    const deniedConditions: DeniedCondition[] = [];

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for denial keywords
      if (line.toLowerCase().includes('denied') ||
          line.toLowerCase().includes('not service-connected') ||
          line.toLowerCase().includes('lack of') ||
          line.toLowerCase().includes('insufficient evidence')) {

        let conditionName = '';
        let denialReason = line;
        let denialDate = '';

        // Try to extract condition name from current line or surrounding lines
        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          if (prevLine.length > 3 && prevLine.length < 100 && !prevLine.includes('%')) {
            conditionName = prevLine.replace(/^[-•*\d.]+\s*/, '');
          }
        }

        // If no condition name found above, try current line before denial keyword
        if (!conditionName) {
          const beforeDenial = line.split(/denied|not service/i)[0].trim();
          if (beforeDenial.length > 3 && beforeDenial.length < 100) {
            conditionName = beforeDenial.replace(/^[-•*\d.]+\s*/, '');
          }
        }

        // Look for denial date
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})|(\w+ \d{1,2},? \d{4})/);
        if (dateMatch) {
          denialDate = dateMatch[0];
        }

        if (conditionName) {
          deniedConditions.push({
            id: Date.now().toString() + '-d' + deniedConditions.length,
            name: conditionName,
            denialDate: denialDate,
            denialReason: denialReason.substring(0, 200), // Limit reason length
            description: ''
          });
        }
      }
    }

    return deniedConditions;
  };

  // Add Denied Condition
  const addDeniedCondition = () => {
    if (newDeniedCondition.name) {
      const condition: DeniedCondition = {
        id: Date.now().toString(),
        ...newDeniedCondition
      };
      setDeniedConditions([...deniedConditions, condition]);
      setNewDeniedCondition({ name: '', denialDate: '', denialReason: '', description: '' });
    }
  };

  // Remove Denied Condition
  const removeDeniedCondition = (id: string) => {
    setDeniedConditions(deniedConditions.filter(d => d.id !== id));
  };

  // Analyze Connections - This is the AI-powered medical reasoning analyzer
  const analyzeConnections = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis with comprehensive medical reasoning
    const results: ConnectionAnalysis[] = [];

    deniedConditions.forEach(denied => {
      const connections: ConnectionAnalysis['potentialConnections'] = [];
      const deniedName = denied.name.toLowerCase();

      serviceConnectedDisabilities.forEach(scDisability => {
        const scName = scDisability.name.toLowerCase();

        // PTSD/Mental Health -> Various Secondary Conditions
        if ((scName.includes('ptsd') || scName.includes('depression') || scName.includes('anxiety') || scName.includes('mental')) &&
            (deniedName.includes('sleep') || deniedName.includes('apnea'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Research shows a strong bidirectional relationship between PTSD/mental health conditions and sleep disorders. The hyperarousal symptoms of PTSD (nightmares, difficulty sleeping, heightened startle response) directly contribute to sleep fragmentation and can lead to or exacerbate obstructive sleep apnea. Studies indicate veterans with PTSD have 2-3x higher prevalence of sleep apnea. Additionally, certain psychotropic medications (SSRIs, antipsychotics) used to treat PTSD can cause weight gain, which is a risk factor for sleep apnea. The chronic stress response associated with PTSD affects the autonomic nervous system, potentially contributing to upper airway instability during sleep.`,
            strength: 'strong',
            researchReferences: [
              'Sharafkhaneh et al. (2005) - Association of PTSD and Sleep Apnea',
              'Mysliwiec et al. (2013) - Comorbid PTSD and Sleep Apnea in Military Veterans',
              'Colvonen et al. (2015) - Sleep Disturbances and PTSD',
              'VA/DoD Clinical Practice Guidelines for PTSD (2017)'
            ],
            nextSteps: [
              'Obtain a sleep study (polysomnography) to confirm sleep apnea diagnosis',
              'Get a nexus letter from a psychiatrist or sleep medicine specialist',
              'Document timeline: When did PTSD begin vs when did sleep issues start?',
              'Gather medication records showing PTSD treatments that may contribute to weight gain',
              'Buddy statements about observed sleep difficulties since service/PTSD diagnosis',
              'Consider filing as secondary to PTSD with supporting medical opinion'
            ]
          });
        }

        if ((scName.includes('ptsd') || scName.includes('depression') || scName.includes('anxiety')) &&
            (deniedName.includes('migraine') || deniedName.includes('headache'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Medical literature establishes a well-documented connection between PTSD/mental health disorders and migraines. The chronic stress and hyperarousal associated with PTSD cause persistent activation of the hypothalamic-pituitary-adrenal (HPA) axis and sympathetic nervous system, leading to vascular changes and neurochemical imbalances that trigger migraines. Research shows veterans with PTSD have significantly higher rates of migraines compared to the general population. Additionally, the muscle tension, poor sleep, and medication side effects associated with PTSD treatment can all contribute to headache frequency and severity.`,
            strength: 'strong',
            researchReferences: [
              'Peterlin et al. (2011) - PTSD and Migraine Headache',
              'Smitherman et al. (2013) - Headache and PTSD Comorbidity',
              'Kaplan et al. (2015) - Psychiatric Disorders and Headache',
              'American Headache Society Clinical Guidelines'
            ],
            nextSteps: [
              'Get formal migraine diagnosis from neurologist or headache specialist',
              'Obtain nexus letter explaining PTSD-migraine connection',
              'Maintain headache diary showing frequency, triggers, and severity',
              'Document that migraines worsened after PTSD diagnosis',
              'Note if PTSD medications (SSRIs) contribute to headaches',
              'File as secondary to PTSD with detailed medical nexus'
            ]
          });
        }

        if ((scName.includes('ptsd') || scName.includes('mental')) && deniedName.includes('gerd')) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Gastroesophageal Reflux Disease (GERD) is commonly found secondary to PTSD through multiple mechanisms. First, psychotropic medications used to treat PTSD (particularly SSRIs, SNRIs, and benzodiazepines) can relax the lower esophageal sphincter, allowing acid reflux. Second, chronic stress and anxiety associated with PTSD increase stomach acid production and alter gastrointestinal motility. Third, many veterans with PTSD develop poor dietary habits, irregular eating patterns, and increased alcohol/caffeine use as coping mechanisms, all of which exacerbate GERD. Studies show significantly higher GERD prevalence in PTSD populations compared to matched controls.`,
            strength: 'strong',
            researchReferences: [
              'Beaulieu-Jones et al. (2019) - GI Disorders and PTSD in Veterans',
              'Gradus et al. (2013) - PTSD and Gastrointestinal Disorders',
              'VA Clinical Practice Guidelines - PTSD Comorbidities',
              'American Gastroenterological Association - Stress and GERD'
            ],
            nextSteps: [
              'Get GERD diagnosis confirmed via endoscopy or pH monitoring if not already done',
              'Obtain medication list showing PTSD medications with GERD as known side effect',
              'Get nexus letter from gastroenterologist or your treating physician',
              'Document timeline showing GERD onset after PTSD diagnosis/treatment',
              'Note any lifestyle changes related to PTSD that may contribute',
              'File as secondary to PTSD citing medication-induced or stress-induced GERD'
            ]
          });
        }

        // Back/Spine Issues -> Lower Extremity Problems
        if ((scName.includes('back') || scName.includes('spine') || scName.includes('lumbar')) &&
            (deniedName.includes('hip') || deniedName.includes('knee') || deniedName.includes('leg') || deniedName.includes('foot'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Biomechanical secondary conditions from spinal pathology are well-established in medical literature. When the spine is injured or degenerative, the body compensates through altered gait mechanics and postural adjustments. This abnormal biomechanical loading places excessive stress on the hips, knees, ankles, and feet. The kinetic chain effect means that dysfunction at one level (spine) creates compensatory dysfunction at adjacent levels. Studies using gait analysis demonstrate that patients with chronic lower back pain exhibit altered hip extension, increased knee flexion moments, and abnormal foot strike patterns - all of which accelerate degenerative changes in these joints. Additionally, nerve root compression from spinal conditions can cause referred pain and weakness affecting lower extremity function.`,
            strength: 'strong',
            researchReferences: [
              'Lamoth et al. (2006) - Gait Variability in Back Pain Patients',
              'Hodges et al. (2003) - Motor Control Changes in Low Back Pain',
              'Van Dillen et al. (2007) - Hip and Knee Biomechanics in Back Pain',
              'Kendall et al. (2010) - Muscles: Testing and Function with Posture and Pain'
            ],
            nextSteps: [
              'Get orthopedic evaluation of affected hip/knee/leg with gait analysis if possible',
              'Obtain nexus letter from orthopedist or physiatrist explaining biomechanical connection',
              'Document that lower extremity pain began or worsened after back problems',
              'X-rays or MRI showing degenerative changes in affected joint',
              'Physical therapy notes documenting gait abnormalities',
              'Consider bilateral factors if both sides affected due to compensation',
              'File as secondary to service-connected back condition'
            ]
          });
        }

        // TBI -> Various Neurological/Cognitive Issues
        if ((scName.includes('tbi') || scName.includes('brain') || scName.includes('concussion')) &&
            (deniedName.includes('migraine') || deniedName.includes('cognitive') || deniedName.includes('memory') ||
             deniedName.includes('balance') || deniedName.includes('vertigo') || deniedName.includes('vision'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Traumatic Brain Injury (TBI) causes a cascade of neurological effects that can manifest as various secondary conditions. Post-traumatic migraines are extremely common, resulting from disrupted neurotransmitter systems, altered cerebral blood flow, and structural brain changes. Cognitive dysfunction (memory, attention, executive function deficits) stems from damage to frontal lobe, hippocampus, and white matter tracts. Vestibular dysfunction causing balance issues and vertigo results from damage to the vestibular system or its central processing pathways. Visual disturbances can result from damage to visual processing centers or oculomotor control systems. Research using advanced imaging (DTI-MRI, fMRI) has demonstrated persistent structural and functional brain changes in TBI patients that correlate with these symptoms, even years after the initial injury.`,
            strength: 'strong',
            researchReferences: [
              'Theeler et al. (2013) - Post-Traumatic Headache and TBI',
              'McAllister et al. (2006) - Neuroimaging of TBI',
              'Arciniegas et al. (2005) - Cognitive Impairment Following TBI',
              'VA/DoD Clinical Practice Guideline for TBI (2016)',
              'Hoffer et al. (2004) - Vestibular Dysfunction in TBI'
            ],
            nextSteps: [
              'Neurological evaluation with cognitive testing (neuropsych eval)',
              'Consider advanced imaging (fMRI, DTI-MRI) if available',
              'Vestibular testing for balance/vertigo issues',
              'Ophthalmologic exam for visual disturbances',
              'Nexus letter from neurologist connecting symptoms to TBI',
              'Document timeline showing symptoms began after TBI',
              'Gather service records documenting the TBI incident',
              'File each condition as secondary to service-connected TBI'
            ]
          });
        }

        // Diabetes -> Peripheral Neuropathy, ED, Vision
        if (scName.includes('diabetes') &&
            (deniedName.includes('neuropathy') || deniedName.includes('erectile') || deniedName.includes('ed') ||
             deniedName.includes('vision') || deniedName.includes('retinopathy') || deniedName.includes('kidney'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'secondary',
            medicalRationale: `Diabetes causes microvascular and macrovascular complications that are well-established in medical literature. Peripheral neuropathy results from chronic hyperglycemia damaging peripheral nerves through multiple mechanisms including sorbitol accumulation, oxidative stress, and microvascular ischemia. Erectile dysfunction occurs due to both vascular insufficiency and autonomic neuropathy affecting penile nerves. Diabetic retinopathy results from retinal blood vessel damage. Nephropathy (kidney disease) develops from glomerular damage. These are among the most common and well-documented complications of diabetes mellitus. The American Diabetes Association recognizes these as standard diabetic complications that should be screened for regularly.`,
            strength: 'strong',
            researchReferences: [
              'American Diabetes Association Standards of Medical Care (2023)',
              'Pop-Busui et al. (2017) - Diabetic Neuropathy',
              'Malavige & Levy (2009) - Erectile Dysfunction in Diabetes',
              'Solomon et al. (2017) - Diabetic Retinopathy',
              'VA Diabetes Clinical Practice Guidelines'
            ],
            nextSteps: [
              'Get formal diagnosis of the diabetic complication',
              'Nerve conduction studies for neuropathy',
              'Ophthalmologic exam with dilated fundus exam for retinopathy',
              'Renal function tests (creatinine, GFR) for nephropathy',
              'Medical records showing diabetes control (A1C levels)',
              'Nexus letter typically not required - direct diabetic complications',
              'File as secondary to service-connected diabetes',
              'May qualify as presumptive if diabetes is presumptive (Agent Orange, etc.)'
            ]
          });
        }

        // Knee/Hip -> Opposite Side (Bilateral/Favoring)
        if ((scName.includes('knee') || scName.includes('hip')) &&
            (deniedName.includes('knee') || deniedName.includes('hip')) &&
            !deniedName.includes(scName)) { // Different side
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'bilateral',
            medicalRationale: `When one lower extremity joint (knee or hip) is damaged, the body naturally compensates by shifting weight and altering gait to favor the uninjured side. This creates abnormal biomechanical loading on the opposite joint, accelerating degenerative changes. Gait studies demonstrate that patients with unilateral knee or hip pathology show increased ground reaction forces, prolonged stance phase, and altered joint moments on the contralateral limb. Over time, this repetitive abnormal loading causes the opposite joint to develop similar degenerative changes, pain, and dysfunction. This is a well-recognized phenomenon in orthopedic medicine and is commonly granted as a bilateral factor or secondary connection by the VA.`,
            strength: 'moderate',
            researchReferences: [
              'Shakoor et al. (2011) - Asymmetric Loading and Knee OA',
              'Hurwitz et al. (2000) - Gait Compensations in Knee Pain',
              'Liikavainio et al. (2010) - Contralateral Hip Loading in Knee OA',
              'VA Schedule for Rating Disabilities - Bilateral Factor'
            ],
            nextSteps: [
              'Get orthopedic evaluation of the opposite knee/hip',
              'X-rays showing degenerative changes',
              'Document timeline: opposite side symptoms began after original injury',
              'Physical therapy notes documenting gait abnormalities and compensation',
              'Nexus letter from orthopedist explaining favoring/compensation',
              'Consider filing for bilateral factor increase if both sides now service-connected',
              'File as secondary to service-connected knee/hip condition'
            ]
          });
        }

        // Hearing Loss/Tinnitus -> Mental Health (Aggravation)
        if ((scName.includes('hearing') || scName.includes('tinnitus')) &&
            (deniedName.includes('depression') || deniedName.includes('anxiety') || deniedName.includes('sleep'))) {
          connections.push({
            serviceConnectedDisability: scDisability.name,
            connectionType: 'aggravation',
            medicalRationale: `Chronic tinnitus and hearing loss significantly impact mental health through multiple pathways. The constant perception of sound (tinnitus) causes chronic stress, sleep disruption, concentration difficulties, and social isolation. Studies show veterans with tinnitus have substantially higher rates of depression and anxiety compared to those without. The inability to communicate effectively due to hearing loss leads to social withdrawal and frustration. Sleep disturbances from tinnitus create a cycle of fatigue and mood dysregulation. While the denied condition may have pre-existed, the service-connected hearing issues demonstrably aggravate these mental health conditions beyond their natural progression.`,
            strength: 'moderate',
            researchReferences: [
              'Lockwood et al. (2002) - Tinnitus and Psychological Distress',
              'Tyler et al. (2007) - Tinnitus Severity and Quality of Life',
              'Hébert et al. (2012) - Tinnitus and Depression',
              'VA Tinnitus Management Guidelines'
            ],
            nextSteps: [
              'Mental health evaluation documenting current depression/anxiety severity',
              'Nexus letter explaining how tinnitus/hearing loss aggravates mental health',
              'Establish baseline: was mental health condition present before tinnitus worsened?',
              'Document sleep disruption specifically due to tinnitus',
              'Gather treatment records showing mental health treatment increase after hearing issues',
              'File as aggravation of pre-existing condition by service-connected tinnitus/hearing loss',
              'May also consider secondary if mental health condition arose after tinnitus began'
            ]
          });
        }
      });

      if (connections.length > 0) {
        results.push({
          deniedCondition: denied.name,
          potentialConnections: connections
        });
      }
    });

    setAnalysisResults(results);
    setShowAnalysisResults(true);
    setIsAnalyzing(false);
  };

  const addDisability = () => {
    if (currentDisability.name && currentDisability.description) {
      const newDisability: Disability = {
        id: Date.now().toString(),
        ...currentDisability,
      };
      setDisabilities([...disabilities, newDisability]);
      setCurrentDisability({ name: '', description: '', serviceConnection: 'direct' });
    }
  };

  const removeDisability = (id: string) => {
    setDisabilities(disabilities.filter(d => d.id !== id));
  };

  const analyzeSecondaryConditions = () => {
    const potentialSecondary: string[] = [];

    disabilities.forEach(disability => {
      const name = disability.name.toLowerCase();
      if (name.includes('ptsd') || name.includes('anxiety') || name.includes('depression')) {
        potentialSecondary.push('🔗 Sleep Apnea - Secondary to PTSD/Mental Health');
        potentialSecondary.push('🔗 Migraine Headaches - Secondary to PTSD/Stress');
        potentialSecondary.push('🔗 Gastroesophageal Reflux Disease (GERD) - Secondary to PTSD medications');
      }
      if (name.includes('back') || name.includes('spine')) {
        potentialSecondary.push('🔗 Hip Pain - Secondary to altered gait from back injury');
        potentialSecondary.push('🔗 Knee Pain - Secondary to altered gait from back injury');
        potentialSecondary.push('🔗 Radiculopathy - Secondary to spinal condition');
      }
      if (name.includes('knee') || name.includes('hip')) {
        potentialSecondary.push('🔗 Lower Back Pain - Secondary to compensatory gait');
        potentialSecondary.push('🔗 Opposite Leg Issues - Secondary to overcompensation');
      }
      if (name.includes('tbi') || name.includes('brain') || name.includes('concussion')) {
        potentialSecondary.push('🔗 Migraine Headaches - Secondary to TBI');
        potentialSecondary.push('🔗 Cognitive Dysfunction - Secondary to TBI');
        potentialSecondary.push('🔗 Balance Issues/Vertigo - Secondary to TBI');
        potentialSecondary.push('🔗 Sleep Disorders - Secondary to TBI');
      }
      if (name.includes('diabetes')) {
        potentialSecondary.push('🔗 Peripheral Neuropathy - Secondary to Diabetes');
        potentialSecondary.push('🔗 Erectile Dysfunction - Secondary to Diabetes');
        potentialSecondary.push('🔗 Vision Problems - Secondary to Diabetes');
      }
    });

    const uniqueSecondary = [...new Set(potentialSecondary)];
    setSecondaryAnalysis(uniqueSecondary);
    setShowAnalysis(true);
  };

  const serviceConnectionTheories = [
    {
      type: 'Direct Service Connection',
      icon: '⚡',
      description: 'Injury or disease that occurred during active duty or was caused by your military service',
      examples: [
        'Combat injury',
        'Training accident',
        'Exposure to hazards (burn pits, Agent Orange, radiation)',
        'Hearing loss from noise exposure'
      ],
      evidence: 'Service medical records, buddy statements, incident reports, VA medical opinions'
    },
    {
      type: 'Secondary Service Connection',
      icon: '🔗',
      description: 'Condition caused or aggravated by an already service-connected disability',
      examples: [
        'Sleep apnea secondary to PTSD',
        'Knee pain secondary to service-connected back injury',
        'Depression secondary to chronic pain',
        'Erectile dysfunction secondary to diabetes'
      ],
      evidence: 'Nexus letter from doctor, medical records showing causal relationship, IMO/DBQ'
    },
    {
      type: 'Presumptive Service Connection',
      icon: '📋',
      description: 'Conditions presumed to be service-connected based on service location, time period, or exposure',
      examples: [
        'Diabetes (Type 2) for Agent Orange exposure',
        'Chronic conditions within 1 year of discharge',
        'Gulf War presumptive conditions',
        'PACT Act conditions (burn pit exposure)'
      ],
      evidence: 'DD-214, deployment records, proof of service in qualifying location/time period'
    },
    {
      type: 'Aggravation',
      icon: '📈',
      description: 'Pre-existing condition that was made worse (permanently aggravated) by military service',
      examples: [
        'Pre-existing asthma worsened by military service',
        'Prior knee injury aggravated during service',
        'Existing mental health condition made worse by service trauma'
      ],
      evidence: 'Pre-service medical records showing baseline, service records showing worsening, VA medical opinion'
    },
    {
      type: 'Concurrent Service',
      icon: '⚖️',
      description: 'Condition that existed before service but was made worse during a period of service',
      examples: [
        'Reserve/Guard members who develop conditions during active duty periods',
        'Conditions that worsen during annual training'
      ],
      evidence: 'Medical records from before and after active duty periods, VA medical opinion'
    }
  ];

  const filingSteps = [
    {
      step: 1,
      title: 'Gather Your Evidence',
      content: [
        'DD-214 (Certificate of Release from Active Duty)',
        'Service medical records (STRs)',
        'VA medical records',
        'Private medical records and treatment history',
        'Lay statements (buddy letters)',
        'Nexus letters from qualified medical providers',
        'Any relevant service documents (awards, deployment orders, etc.)'
      ]
    },
    {
      step: 2,
      title: 'File Your Claim',
      content: [
        'Online: VA.gov (Fastest method)',
        'Mail: VA Form 21-526EZ',
        'In-person: At your local VA Regional Office',
        'Through a VSO (Veterans Service Officer) - FREE help',
        'Include all evidence upfront - don\'t wait for VA to request it'
      ]
    },
    {
      step: 3,
      title: 'Attend C&P Exam',
      content: [
        'Scheduled by VA after claim submission',
        'Be honest and thorough - describe your WORST days',
        'Bring copies of medical records',
        'Describe impact on daily life and work',
        'Don\'t minimize your symptoms',
        'The examiner works for VA - be professional but detailed'
      ]
    },
    {
      step: 4,
      title: 'Wait for Decision',
      content: [
        'Check status at VA.gov or call 1-800-827-1000',
        'Average wait: 90-120 days (varies by region)',
        'Don\'t file duplicate claims - it restarts the process',
        'Respond quickly to any VA requests for information'
      ]
    },
    {
      step: 5,
      title: 'Review Decision Letter',
      content: [
        'Granted: Congratulations! Note your rating and effective date',
        'Denied: Don\'t panic - you have appeal options',
        'Review the "Reasons for Decision" carefully',
        'Check if examiner errors or missed evidence caused denial',
        'You have 1 year to appeal from decision date'
      ]
    },
    {
      step: 6,
      title: 'Appeal if Necessary',
      content: [
        'Supplemental Claim: Submit new evidence',
        'Higher-Level Review: Senior reviewer re-examines same evidence',
        'Board Appeal: Appeals to Board of Veterans Appeals',
        'Consider getting a VSO or attorney to help with appeals',
        'Use the decision review form (VA Form 20-0995 or 20-0996)'
      ]
    }
  ];

  const faqs = [
    {
      q: 'What does "service-connected" mean?',
      a: 'Service-connected means your disability was caused by or aggravated during your active military service. The VA must find a connection (nexus) between your current condition and your service.'
    },
    {
      q: 'How long do I have to file a claim after discharge?',
      a: 'There is no time limit to file a VA disability claim. However, your effective date (when benefits start) is typically the date you filed the claim or the date you became disabled, whichever is later. Filing within 1 year of discharge can give you an effective date back to your discharge date.'
    },
    {
      q: 'What is a nexus letter and do I need one?',
      a: 'A nexus letter is a medical opinion from a qualified healthcare provider stating that your condition is "at least as likely as not" (50% or greater probability) related to your military service. It\'s crucial for claims where the connection isn\'t obvious, especially secondary conditions.'
    },
    {
      q: 'Can I work while receiving VA disability?',
      a: 'Yes! VA disability is not based on unemployment. You can work full-time and still receive 100% VA disability. The ratings are based on severity of symptoms, not your ability to work. However, if you claim Individual Unemployability (TDIU), working above the poverty level may affect that specific benefit.'
    },
    {
      q: 'What if my condition wasn\'t diagnosed during service?',
      a: 'Many conditions aren\'t diagnosed until after service. You can still file a claim. You\'ll need to establish that symptoms began during service (or shortly after) and provide medical evidence of the current diagnosis. Lay statements from fellow service members or family can help establish when symptoms began.'
    },
    {
      q: 'How are disability ratings calculated?',
      a: 'Each condition is rated from 0% to 100% based on severity using the VA\'s Schedule for Rating Disabilities (38 CFR Part 4). Multiple conditions are combined using VA math (not simple addition). Use our calculator below to estimate your combined rating.'
    },
    {
      q: 'What is a secondary condition?',
      a: 'A secondary condition is a disability caused or aggravated by a condition you\'re already service-connected for. Example: If you have service-connected PTSD and develop sleep apnea as a result, the sleep apnea can be claimed as secondary to PTSD.'
    },
    {
      q: 'Should I use a VSO, attorney, or file myself?',
      a: 'VSOs (Veterans Service Officers) are FREE and highly recommended for most veterans. They know the system and can significantly improve your chances. Attorneys typically charge 20-33% of back pay and are best for complex cases or appeals. Many veterans successfully file initial claims themselves using resources like this site.'
    },
    {
      q: 'What is a C&P exam?',
      a: 'Compensation & Pension (C&P) exam is a medical examination scheduled by the VA to evaluate your claimed conditions. The examiner assesses severity and may provide an opinion on service connection. This exam is crucial - be honest, thorough, and describe your worst days.'
    },
    {
      q: 'Can I increase my rating later?',
      a: 'Yes! You can file for an increase if your service-connected condition worsens. This is one of the most common claim types. However, be aware that the VA can also reduce your rating if they find improvement (though ratings held for 20+ years are generally protected).'
    },
    {
      q: 'What evidence is strongest for my claim?',
      a: 'The strongest evidence is: (1) Service medical records showing diagnosis or treatment during service, (2) Nexus letter from a qualified medical provider, (3) Current medical diagnosis and treatment records, (4) Lay statements from fellow service members, and (5) Your own detailed statement about symptoms and their impact.'
    },
    {
      q: 'What is presumptive service connection?',
      a: 'Certain conditions are presumed to be service-connected if you served in specific locations or time periods. Examples include Agent Orange exposure (Vietnam veterans), Gulf War presumptive conditions, and PACT Act conditions (burn pit exposure). You don\'t need to prove the condition was caused by service - just that you served in that location/time.'
    }
  ];

  return (
    <DisabilityProvider>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-900 to-red-800 rounded-lg shadow-2xl p-8 text-white border-4 border-yellow-500">
          <h1 className="text-4xl font-bold mb-4">🎯 VA Claims Education Center</h1>
          <p className="text-xl text-gray-200">Educational guidance on service connection theories, filing strategies, and claim preparation - <strong>Advisory Only, No Claim Submission</strong></p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-900">
          <div className="grid grid-cols-3 md:grid-cols-9 border-b border-gray-200">
            <button onClick={() => setActiveTab('analyzer')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'analyzer' ? 'bg-purple-900 text-white border-b-4 border-yellow-500' : 'text-gray-600 hover:bg-gray-100'}`}>
              🔬 Analyzer
            </button>
            <button onClick={() => setActiveTab('wizard')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'wizard' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              📝 Wizard
            </button>
            <button onClick={() => setActiveTab('theories')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'theories' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              🎓 Theories
            </button>
            <button onClick={() => setActiveTab('guide')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'guide' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              📚 Guide
            </button>
            <button onClick={() => setActiveTab('faq')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'faq' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              ❓ FAQ
            </button>
            <button onClick={() => setActiveTab('calculator')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'calculator' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              🎖️ Calculator
            </button>
            <button onClick={() => setActiveTab('effective-date')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'effective-date' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              📅 Effective
            </button>
            <button onClick={() => setActiveTab('entitlement')} className={`px-4 py-4 font-bold text-sm ${activeTab === 'entitlement' ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              🎯 Entitlement
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'analyzer' && (
              <div className="space-y-8">
                {/* Educational Disclaimer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">Educational Advisory Tool - Not a Nexus Letter</h3>
                      <p className="text-sm text-yellow-800">
                        This Medical Reasoning Analyzer is an <strong>educational resource</strong> designed to help you understand potential medical connections
                        between your denied conditions and service-connected disabilities based on research and medical literature.
                      </p>
                      <p className="text-sm text-yellow-800 mt-2">
                        <strong>This is NOT a nexus letter.</strong> It provides research-based guidance to help you understand which denied conditions may be worth
                        pursuing with a qualified medical professional. To establish service connection, you must obtain an official nexus opinion from a licensed
                        physician or independent medical expert. Use this tool to guide your research and medical consultations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1: Service-Connected Disabilities */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
                  <h2 className="text-2xl font-bold text-green-900 mb-4">
                    ✅ Step 1: Your Current Service-Connected Disabilities
                  </h2>
                  <p className="text-gray-700 mb-4">
                    List all disabilities you currently have service-connected with the VA. These are the conditions we'll analyze to find potential medical connections to denied claims.
                  </p>

                  {/* Upload Rating Decision Option */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1">
                        {serviceConnectedDisabilities.length > 0 ? (
                          <>
                            <h3 className="font-bold text-green-900 mb-1">
                              ✅ Data Loaded from Onboarding ({serviceConnectedDisabilities.length} conditions)
                            </h3>
                            <p className="text-sm text-gray-700 mb-3">
                              Your service-connected disabilities from onboarding have been automatically loaded below.
                              If you have a <strong>newer rating decision</strong> from a recent claim, you can upload it here to update or add conditions.
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-blue-900 mb-1">Upload Your VA Rating Decision (Optional)</h3>
                            <p className="text-sm text-gray-700 mb-3">
                              Upload your VA rating decision letter for faster review. This helps you reference your official ratings while entering disabilities below.
                              Your document stays on your device - we don't send it anywhere.
                            </p>
                          </>
                        )}

                        {!uploadedRatingDecision ? (
                          <div>
                            <label htmlFor="rating-decision-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                              <span>📤</span>
                              <span>
                                {serviceConnectedDisabilities.length > 0
                                  ? 'Upload Additional Rating Decision'
                                  : 'Upload Rating Decision'}
                              </span>
                              <input
                                type="file"
                                id="rating-decision-upload"
                                name="rating-decision-upload"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleRatingDecisionUpload}
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                              {serviceConnectedDisabilities.length > 0
                                ? 'Upload a newer decision to add/update conditions'
                                : 'Accepts PDF, JPG, PNG, DOC, DOCX (Max 10MB)'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-white border-2 border-blue-200 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">📎</span>
                                <div>
                                  <p className="font-bold text-gray-900">{uploadedRatingDecision.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(uploadedRatingDecision.size / 1024).toFixed(1)} KB - Ready to scan
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={removeRatingDecision}
                                className="text-red-600 hover:text-red-800 font-bold px-3 py-1 rounded"
                              >
                                Remove
                              </button>
                            </div>

                            {/* AI Scan Button */}
                            <button
                              onClick={scanRatingDecision}
                              disabled={isScanning}
                              className={`w-full px-4 py-3 ${
                                isScanning
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                              } text-white rounded-lg font-bold flex items-center justify-center gap-2`}
                            >
                              <span className="text-xl">🤖</span>
                              <span>
                                {isScanning
                                  ? 'Scanning Document...'
                                  : serviceConnectedDisabilities.length > 0
                                    ? 'Scan & Add New Conditions'
                                    : 'AI Scan & Auto-Fill Step 1'}
                              </span>
                            </button>

                            {/* Progress Indicator */}
                            {scanProgress && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                                <p className="text-sm font-medium text-purple-900">{scanProgress}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Service-Connected Disability Form */}
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-green-900 mb-3">Add Service-Connected Disability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sc-condition-name" className="block text-sm font-medium text-gray-700 mb-1">Condition Name *</label>
                        <input
                          type="text"
                          id="sc-condition-name"
                          name="sc-condition-name"
                          value={newSCDisability.name}
                          onChange={(e) => setNewSCDisability({ ...newSCDisability, name: e.target.value })}
                          placeholder="e.g., PTSD, Lumbar Strain, Tinnitus"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="sc-rating" className="block text-sm font-medium text-gray-700 mb-1">Current Rating % *</label>
                        <input
                          type="number"
                          id="sc-rating"
                          name="sc-rating"
                          value={newSCDisability.rating || ''}
                          onChange={(e) => setNewSCDisability({ ...newSCDisability, rating: parseInt(e.target.value) || 0 })}
                          placeholder="0-100"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="sc-effective-date" className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                        <input
                          type="text"
                          id="sc-effective-date"
                          name="sc-effective-date"
                          value={newSCDisability.effectiveDate}
                          onChange={(e) => setNewSCDisability({ ...newSCDisability, effectiveDate: e.target.value })}
                          placeholder="MM/DD/YYYY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="sc-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          id="sc-description"
                          name="sc-description"
                          value={newSCDisability.description}
                          onChange={(e) => setNewSCDisability({ ...newSCDisability, description: e.target.value })}
                          placeholder="Brief description or notes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addServiceConnectedDisability}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      + Add Service-Connected Disability
                    </button>
                  </div>

                  {/* List of Service-Connected Disabilities */}
                  {serviceConnectedDisabilities.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-green-900">Your Service-Connected Disabilities ({serviceConnectedDisabilities.length})</h3>
                      {[...serviceConnectedDisabilities].sort((a, b) => b.rating - a.rating).map(disability => (
                        <div key={disability.id} className="bg-white border-2 border-green-200 rounded-lg p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg text-gray-900">{disability.name}</h4>
                              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {disability.rating}% Rating
                              </span>
                            </div>
                            {disability.effectiveDate && (
                              <p className="text-sm text-gray-600 mt-1">Effective: {disability.effectiveDate}</p>
                            )}
                            {disability.description && (
                              <p className="text-sm text-gray-700 mt-2">{disability.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeServiceConnectedDisability(disability.id)}
                            className="text-red-600 hover:text-red-800 font-bold ml-4"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                      No service-connected disabilities added yet. Add your current SC disabilities above to begin.
                    </div>
                  )}
                </div>

                {/* Section 2: Denied Conditions */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
                  <h2 className="text-2xl font-bold text-red-900 mb-4">
                    ❌ Step 2: Your Denied Conditions
                  </h2>
                  <p className="text-gray-700 mb-4">
                    List all conditions that were denied by the VA. The analyzer will search for potential medical connections between these denied conditions and your service-connected disabilities.
                  </p>

                  {/* Add Denied Condition Form */}
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-red-900 mb-3">Add Denied Condition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="denied-condition-name" className="block text-sm font-medium text-gray-700 mb-1">Condition Name *</label>
                        <input
                          type="text"
                          id="denied-condition-name"
                          name="denied-condition-name"
                          value={newDeniedCondition.name}
                          onChange={(e) => setNewDeniedCondition({ ...newDeniedCondition, name: e.target.value })}
                          placeholder="e.g., Sleep Apnea, Migraine, Knee Pain"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="denial-date" className="block text-sm font-medium text-gray-700 mb-1">Denial Date</label>
                        <input
                          type="text"
                          id="denial-date"
                          name="denial-date"
                          value={newDeniedCondition.denialDate}
                          onChange={(e) => setNewDeniedCondition({ ...newDeniedCondition, denialDate: e.target.value })}
                          placeholder="MM/DD/YYYY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="denial-reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Denial (if known)</label>
                        <input
                          type="text"
                          id="denial-reason"
                          name="denial-reason"
                          value={newDeniedCondition.denialReason}
                          onChange={(e) => setNewDeniedCondition({ ...newDeniedCondition, denialReason: e.target.value })}
                          placeholder="e.g., Lack of nexus, Insufficient evidence"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="denied-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          id="denied-description"
                          name="denied-description"
                          value={newDeniedCondition.description}
                          onChange={(e) => setNewDeniedCondition({ ...newDeniedCondition, description: e.target.value })}
                          placeholder="Brief description or notes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addDeniedCondition}
                      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                    >
                      + Add Denied Condition
                    </button>
                  </div>

                  {/* List of Denied Conditions */}
                  {deniedConditions.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-bold text-red-900">Your Denied Conditions ({deniedConditions.length})</h3>
                      {deniedConditions.map(condition => (
                        <div key={condition.id} className="bg-white border-2 border-red-200 rounded-lg p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{condition.name}</h4>
                            {condition.denialDate && (
                              <p className="text-sm text-gray-600 mt-1">Denied: {condition.denialDate}</p>
                            )}
                            {condition.denialReason && (
                              <p className="text-sm text-red-700 mt-1">Reason: {condition.denialReason}</p>
                            )}
                            {condition.description && (
                              <p className="text-sm text-gray-700 mt-2">{condition.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeDeniedCondition(condition.id)}
                            className="text-red-600 hover:text-red-800 font-bold ml-4"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                      No denied conditions added yet. Add your denied conditions above to analyze.
                    </div>
                  )}
                </div>

                {/* Section 3: AI Medical Reasoning Analyzer */}
                {serviceConnectedDisabilities.length > 0 && deniedConditions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                    <h2 className="text-2xl font-bold text-purple-900 mb-4">
                      🔬 Step 3: AI Medical Reasoning Analysis
                    </h2>
                    <p className="text-gray-700 mb-4">
                      Click the button below to analyze all denied conditions and identify potential medical connections to your service-connected disabilities.
                      The analyzer uses medical research and literature to explain possible relationships.
                    </p>

                    <button
                      onClick={analyzeConnections}
                      disabled={isAnalyzing}
                      className={`w-full px-8 py-4 ${isAnalyzing ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg font-bold text-lg`}
                    >
                      {isAnalyzing ? '🔄 Analyzing Medical Connections...' : '🔬 Analyze All Denied Conditions'}
                    </button>

                    {/* Analysis Results */}
                    {showAnalysisResults && analysisResults.length > 0 && (
                      <div className="mt-8 space-y-6">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h3 className="font-bold text-purple-900 text-xl mb-2">
                            📊 Analysis Complete: Found {analysisResults.reduce((acc, r) => acc + r.potentialConnections.length, 0)} Potential Connections
                          </h3>
                          <p className="text-sm text-purple-800">
                            Review each denied condition below to see potential medical connections to your service-connected disabilities.
                            <strong> Remember: This is educational only. You need an official nexus opinion from a qualified physician.</strong>
                          </p>
                        </div>

                        {analysisResults.map((result, idx) => (
                          <div key={idx} className="bg-white border-2 border-purple-300 rounded-lg p-6">
                            <h3 className="text-2xl font-bold text-purple-900 mb-4">
                              {result.deniedCondition}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Found {result.potentialConnections.length} potential connection(s):
                            </p>

                            <div className="space-y-6">
                              {result.potentialConnections.map((connection, connIdx) => (
                                <div key={connIdx} className="bg-gray-50 p-5 rounded-lg border-l-4 border-purple-500">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-bold text-lg text-gray-900">
                                        🔗 Connection to: {connection.serviceConnectedDisability}
                                      </h4>
                                      <div className="flex gap-2 mt-2">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                          {connection.connectionType === 'secondary' && '🔗 Secondary'}
                                          {connection.connectionType === 'bilateral' && '⚖️ Bilateral'}
                                          {connection.connectionType === 'aggravation' && '📈 Aggravation'}
                                          {connection.connectionType === 'direct' && '⚡ Direct'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                          connection.strength === 'strong' ? 'bg-green-100 text-green-800' :
                                          connection.strength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-orange-100 text-orange-800'
                                        }`}>
                                          {connection.strength === 'strong' && '💪 Strong Connection'}
                                          {connection.strength === 'moderate' && '⚖️ Moderate Connection'}
                                          {connection.strength === 'possible' && '🤔 Possible Connection'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <h5 className="font-bold text-gray-900 mb-2">📚 Medical Rationale:</h5>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                      {connection.medicalRationale}
                                    </p>
                                  </div>

                                  <div className="mb-4">
                                    <h5 className="font-bold text-gray-900 mb-2">📖 Research References:</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                      {connection.researchReferences.map((ref, refIdx) => (
                                        <li key={refIdx} className="text-sm text-gray-700">{ref}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h5 className="font-bold text-gray-900 mb-2">✅ Recommended Next Steps:</h5>
                                    <ol className="list-decimal list-inside space-y-2">
                                      {connection.nextSteps.map((step, stepIdx) => (
                                        <li key={stepIdx} className="text-sm text-gray-700">{step}</li>
                                      ))}
                                    </ol>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Final Advisory */}
                        <div className="bg-yellow-50 border-2 border-yellow-500 p-6 rounded-lg">
                          <h4 className="font-bold text-yellow-900 mb-2">⚠️ Important Reminders:</h4>
                          <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800">
                            <li><strong>This is NOT a nexus letter</strong> - You must obtain an official medical nexus opinion from a licensed physician</li>
                            <li>Use this analysis to guide your research and medical consultations</li>
                            <li>Seek qualified independent medical opinions (IMO) or nexus letters from specialists</li>
                            <li>Gather all recommended evidence before filing supplemental claims</li>
                            <li>Consider working with an accredited VSO or VA disability attorney</li>
                            <li>This tool is educational only and does not guarantee VA approval</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {showAnalysisResults && analysisResults.length === 0 && (
                      <div className="mt-8 bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600 mb-2">
                          <strong>No automatic connections found</strong> based on the common medical patterns in our database.
                        </p>
                        <p className="text-sm text-gray-500">
                          This doesn't mean connections don't exist - consider consulting with a medical professional who can provide
                          a personalized nexus opinion based on your specific medical history and records.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(serviceConnectedDisabilities.length === 0 || deniedConditions.length === 0) && (
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="text-blue-900 font-bold mb-2">
                      ℹ️ Ready to Analyze?
                    </p>
                    <p className="text-sm text-blue-800">
                      Add at least one service-connected disability and one denied condition to use the Medical Reasoning Analyzer.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wizard' && (
              <div className="space-y-6">
                {/* Educational Disclaimer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">Educational Tool Only - No Claim Submission</h3>
                      <p className="text-sm text-yellow-800">
                        This Disability Claim Wizard is an <strong>educational resource</strong> designed to help you understand
                        how to prepare a VA disability claim. <strong>It does NOT file or submit any information to the VA.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <DisabilityWizard />
              </div>
            )}

            {activeTab === 'strategy-advisor' && (
              <div className="space-y-6">
                {/* Educational Disclaimer */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2">Educational Tool Only - No Claim Submission</h3>
                      <p className="text-sm text-yellow-800">
                        This Claim Strategy Advisor is an <strong>educational resource</strong> designed to help you understand,
                        plan, and prepare your VA disability claim strategy. <strong>It does NOT file, submit, or transmit any information
                        to the VA.</strong> All outputs are for planning and educational purposes only.
                      </p>
                      <p className="text-sm text-yellow-800 mt-2">
                        To file an official claim, visit <a href="https://www.va.gov/disability/how-to-file-claim/" target="_blank" rel="noopener noreferrer" className="underline font-bold">VA.gov</a> or
                        work with an accredited Veterans Service Officer (VSO).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Educational Planning Tools */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">📋 Claim Planning & Strategy Resources</h2>
                  <p className="text-gray-700 mb-6">
                    Use these educational tools to build your claim knowledge, identify potential secondary conditions,
                    understand rating calculations, and learn about evidence requirements. All information is for reference only.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('wizard')}
                      className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-left"
                    >
                      <span className="text-2xl mb-2 block">📝</span>
                      <h3 className="font-bold text-blue-900 mb-1">Disability Claim Wizard</h3>
                      <p className="text-sm text-gray-600">Educational step-by-step guidance for understanding claim preparation</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('calculator')}
                      className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:border-green-400 transition text-left"
                    >
                      <span className="text-2xl mb-2 block">🎖️</span>
                      <h3 className="font-bold text-green-900 mb-1">Rating Calculator (Educational)</h3>
                      <p className="text-sm text-gray-600">Learn how VA calculates combined disability ratings</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('theories')}
                      className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-left"
                    >
                      <span className="text-2xl mb-2 block">🎓</span>
                      <h3 className="font-bold text-purple-900 mb-1">Service Connection Education</h3>
                      <p className="text-sm text-gray-600">Learn about direct, secondary, and presumptive service connection</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('effective-date')}
                      className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition text-left"
                    >
                      <span className="text-2xl mb-2 block">📅</span>
                      <h3 className="font-bold text-orange-900 mb-1">Effective Date Education</h3>
                      <p className="text-sm text-gray-600">Understand how effective dates impact potential back pay</p>
                    </button>
                  </div>
                </div>

                {/* Secondary Condition Educational Mapper */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
                  <h2 className="text-2xl font-bold text-green-900 mb-4">🔗 Secondary Condition Education Tool</h2>
                  <p className="text-gray-700 mb-4">
                    Learn about potential secondary conditions that may be related to primary service-connected disabilities.
                    This is for <strong>educational purposes only</strong> - not a diagnosis or official determination.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Condition (for learning about secondaries)
                      </label>
                      <input
                        type="text"
                        value={currentDisability.name}
                        onChange={(e) => setCurrentDisability({ ...currentDisability, name: e.target.value })}
                        placeholder="e.g., PTSD, Lower Back Pain, Tinnitus"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={currentDisability.description}
                        onChange={(e) => setCurrentDisability({ ...currentDisability, description: e.target.value })}
                        placeholder="Add notes about this condition for your reference"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button
                      onClick={addDisability}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Add to Learning List
                    </button>
                  </div>

                  {disabilities.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-bold text-gray-900 mb-3">Your Learning List:</h3>
                      <div className="space-y-2">
                        {disabilities.map((disability) => (
                          <div key={disability.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{disability.name}</p>
                              {disability.description && (
                                <p className="text-sm text-gray-600">{disability.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeDisability(disability.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={analyzeSecondaryConditions}
                        className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        🔍 Learn About Potential Secondaries
                      </button>
                    </div>
                  )}

                  {showAnalysis && secondaryAnalysis.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <h3 className="font-bold text-green-900 mb-3">💡 Educational Information: Common Secondary Conditions</h3>
                      <ul className="space-y-2">
                        {secondaryAnalysis.map((condition, index) => (
                          <li key={index} className="text-sm text-gray-700">{condition}</li>
                        ))}
                      </ul>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                        <p className="text-xs text-gray-700">
                          <strong>⚠️ Educational Disclaimer:</strong> This list shows commonly documented secondary conditions
                          based on medical literature and VA precedent. This is NOT medical advice or an official VA determination.
                          You must:
                        </p>
                        <ul className="text-xs text-gray-700 mt-2 ml-4 list-disc">
                          <li>Get diagnosed by a qualified healthcare provider</li>
                          <li>Establish medical nexus (connection) with medical evidence</li>
                          <li>Consult with a VSO or attorney for claim strategy</li>
                          <li>File through official VA channels only</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps - Official Filing */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                  <h3 className="font-bold text-blue-900 mb-3">📝 Ready to File Your Official Claim?</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    After using these educational planning tools, file your official VA disability claim through:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✅ <strong>VA.gov (Recommended):</strong> <a href="https://www.va.gov/disability/how-to-file-claim/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-bold">File online at VA.gov</a></li>
                    <li>✅ <strong>Veterans Service Officer (VSO):</strong> Free accredited representatives (DAV, VFW, American Legion, etc.)</li>
                    <li>✅ <strong>VA Regional Office:</strong> In-person assistance at your local VA office</li>
                    <li>✅ <strong>Mail:</strong> VA Form 21-526EZ to your regional VA office</li>
                    <li>✅ <strong>Accredited Attorney/Agent:</strong> For complex claims or appeals</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-4">
                    <strong>Important:</strong> This tool does not file claims on your behalf. All claim submissions must go through official VA channels.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'wizard' && (
              <DisabilityWizard />
            )}

          {activeTab === 'theories' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-900 p-6 rounded">
                <h3 className="font-bold text-lg mb-2">Understanding Service Connection</h3>
                <p className="text-gray-700">To receive VA disability compensation, you must establish service connection. This means proving your condition is related to your military service. There are multiple theories of service connection - understanding which applies to your situation is crucial for a successful claim.</p>
              </div>
              {serviceConnectionTheories.map((theory, index) => (
                <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                  <div className="flex items-center mb-3">
                    <span className="text-4xl mr-3">{theory.icon}</span>
                    <h3 className="text-2xl font-bold text-blue-900">{theory.type}</h3>
                  </div>
                  <p className="text-gray-700 mb-4">{theory.description}</p>
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-800 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {theory.examples.map((example, i) => (
                        <li key={i} className="text-gray-700 flex items-start"><span className="mr-2">•</span><span>{example}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 border-l-4 border-green-500 p-4 rounded">
                    <h4 className="font-bold text-gray-800 mb-2">Evidence Needed:</h4>
                    <p className="text-gray-700">{theory.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">Step-by-Step Filing Guide</h3>
                <p>Follow this proven process to maximize your claim success</p>
              </div>
              {filingSteps.map((section) => (
                <div key={section.step} className="bg-white border-2 border-blue-900 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">{section.step}</div>
                    <h3 className="text-2xl font-bold text-blue-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2 ml-16">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-gray-700 flex items-start"><span className="text-green-600 mr-2">▶</span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-start"><span className="text-yellow-500 mr-2">Q:</span>{faq.q}</h3>
                  <p className="text-gray-700 ml-6"><span className="text-green-600 font-bold mr-2">A:</span>{faq.a}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Educational Tool:</strong> This calculator provides estimated ratings for educational purposes only.
                  Actual VA ratings are determined by the VA based on your C&P exam and medical evidence.
                  This tool does not submit or file any information with the VA.
                </p>
              </div>
              <AdvancedDisabilityCalculator />
            </div>
          )}

          {activeTab === 'effective-date' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Educational Tool:</strong> This effective date calculator helps you understand how filing dates
                  impact potential back pay. All calculations are estimates for planning purposes only. Actual effective dates
                  are determined by the VA. This tool does not file claims.
                </p>
              </div>
              <EffectiveDateCalculator />
            </div>
          )}

          {activeTab === 'entitlement' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Educational Tool:</strong> This entitlement helper provides general information about VA benefits
                  you may be eligible for based on your disability rating. This is for educational purposes only and does not
                  constitute official eligibility determination. Visit VA.gov for official benefit information.
                </p>
              </div>
              <EnhancedEntitlementHelper />
            </div>
          )}
        </div>
      </div>
    </div>
    </DisabilityProvider>
  );
};



