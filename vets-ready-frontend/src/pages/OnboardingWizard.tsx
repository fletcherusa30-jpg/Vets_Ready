import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { searchConditions, DisabilityCondition, DISABILITY_CONDITIONS } from '../data/disabilityConditions';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { BranchEmblem } from '../components/BranchEmblems';

// Configure PDF.js worker - use local version from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface SelectedCondition {
  condition: DisabilityCondition;
  rating: number;
  effectiveDate: string;
  side?: 'Left' | 'Right' | 'Bilateral' | 'Not Applicable';
  description?: string;
}

interface ServicePeriod {
  id: string;
  fileName: string;
  branch: string;
  entryDate: string;
  separationDate: string;
  yearsOfService: number;
  rank?: string;
  component?: string; // Active, Reserve, Guard
  characterOfService?: string;
  isRetirement?: boolean;
  hasCombatService?: boolean;
}

const OnboardingWizard: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Document Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DD-214 Upload (Step 1 - Basic Information) - Support multiple periods
  const [servicePeriods, setServicePeriods] = useState<ServicePeriod[]>([]);
  const [isScanningDD214, setIsScanningDD214] = useState(false);
  const [dd214ScanProgress, setDD214ScanProgress] = useState('');
  const [showAdditionalDD214Prompt, setShowAdditionalDD214Prompt] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(true);
  const dd214InputRef = useRef<HTMLInputElement>(null);
  const [dd214DebugLog, setDD214DebugLog] = useState<string[]>([]);

  // Disability Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DisabilityCondition[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<SelectedCondition[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState<string>('');

  // Top 20 most common VA service-connected disabilities
  const topDisabilities = [
    'PTSD (Post-Traumatic Stress Disorder)',
    'Tinnitus',
    'Lumbar Strain (Lower Back)',
    'Hearing Loss',
    'Sleep Apnea',
    'Knee Strain',
    'Migraine Headaches',
    'Sciatica',
    'Depression',
    'Anxiety',
    'Shoulder Injury',
    'Cervical Strain (Neck)',
    'Traumatic Brain Injury (TBI)',
    'Plantar Fasciitis',
    'Hypertension (High Blood Pressure)',
    'Diabetes',
    'Asthma',
    'Hip Injury',
    'Carpal Tunnel Syndrome',
    'Sinusitis'
  ];

  // Handle disability search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchConditions(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Handle DD-214 upload
  const handleDD214Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('DD-214 Upload triggered');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      setDD214ScanProgress('❌ File too large. Maximum size is 10MB.');
      setTimeout(() => setDD214ScanProgress(''), 5000);
      if (dd214InputRef.current) dd214InputRef.current.value = '';
      return;
    }

    // Validate file type (PDF only for DD-214)
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.error('Invalid file type:', file.type);
      setDD214ScanProgress('❌ DD-214 must be in PDF format.');
      setTimeout(() => setDD214ScanProgress(''), 5000);
      if (dd214InputRef.current) dd214InputRef.current.value = '';
      return;
    }

    console.log('File validation passed, starting scan...');

    // Automatically scan the uploaded DD-214
    setIsScanningDD214(true);
    try {
      await parseDD214(file);
    } catch (error) {
      console.error('Error during DD-214 parsing:', error);
      setDD214ScanProgress('❌ Error processing DD-214. Please try again.');
      setTimeout(() => setDD214ScanProgress(''), 5000);
    }
    setIsScanningDD214(false);

    // Show prompt asking about additional DD-214s
    setShowAdditionalDD214Prompt(true);
    setShowUploadButton(false);

    // Reset file input to allow uploading another DD-214
    if (dd214InputRef.current) dd214InputRef.current.value = '';
  };

  // Remove service period
  const removeServicePeriod = (id: string) => {
    const updatedPeriods = servicePeriods.filter(p => p.id !== id);
    setServicePeriods(updatedPeriods);

    // Recalculate profile data
    updateProfileFromServicePeriods(updatedPeriods);

    if (updatedPeriods.length === 0) {
      setDD214ScanProgress('');
      setShowUploadButton(true);
      setShowAdditionalDD214Prompt(false);
    }
  };

  // Update profile from all service periods
  const updateProfileFromServicePeriods = (periods: ServicePeriod[]) => {
    if (periods.length === 0) return;

    // Get most recent period (by separation date)
    const sortedPeriods = [...periods].sort((a, b) =>
      new Date(b.separationDate).getTime() - new Date(a.separationDate).getTime()
    );
    const mostRecent = sortedPeriods[0];

    // Calculate total years of service across all periods
    const totalYears = periods.reduce((sum, period) => sum + period.yearsOfService, 0);

    // Check if any period shows retirement
    const isRetired = periods.some(p => p.isRetirement);

    // Check if any period shows combat service
    const hasCombat = periods.some(p => p.hasCombatService);

    // Get first and last names from most recent if available
    const updates: any = {
      branch: mostRecent.branch,
      yearsOfService: Math.round(totalYears),
      hasCombatService: hasCombat,
      isRetired: isRetired
    };

    // Set retirement status based on character of service
    if (isRetired) {
      updates.hasRetirementPay = true;
    }

    updateProfile(updates);
  };

  // Parse DD-214 document
  const parseDD214 = async (file: File): Promise<void> => {
    const debugLog: string[] = [];
    const addLog = (msg: string) => {
      console.log(msg);
      debugLog.push(msg);
      setDD214DebugLog([...debugLog]);
    };

    addLog('========== STARTING DD-214 ANALYSIS ==========');
    addLog(`File: ${file.name}`);
    setDD214ScanProgress(`📄 Reading ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      setDD214ScanProgress(`📖 Processing ${pdf.numPages} page(s)...`);

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      addLog(`📊 DD-214 Full Text Length: ${fullText.length} characters`);

      // If very little text extracted, this is likely a scanned image - use OCR
      if (fullText.length < 100) {
        addLog('🔍 Scanned image detected! Running EXPERT-LEVEL OCR with multi-pass analysis...');
        setDD214ScanProgress('🔍 Expert OCR Mode - Multi-pass scanning initiated...');

        try {
          // Initialize Tesseract with professional-grade settings (silent mode)
          const worker = await createWorker('eng', 1);

          let ocrText = '';

          // EXPERT PREPROCESSING: Multiple enhancement strategies
          const preprocessImage = (canvas: HTMLCanvasElement, strategy: string): string => {
            const ctx = canvas.getContext('2d')!;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            if (strategy === 'high-contrast') {
              // Strategy 1: High contrast for clear, dark text
              addLog('🎨 Applying HIGH CONTRAST preprocessing...');
              for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const contrast = 2.5;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                const enhanced = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
                const threshold = enhanced > 140 ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = threshold;
              }
            } else if (strategy === 'adaptive') {
              // Strategy 2: Adaptive thresholding for varying lighting
              addLog('🎨 Applying ADAPTIVE THRESHOLD preprocessing...');
              const blockSize = 15;
              for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                  const idx = (y * canvas.width + x) * 4;
                  const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

                  // Calculate local average
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
              // Strategy 3: Denoise + moderate contrast for noisy scans
              addLog('🎨 Applying DENOISE + SHARPEN preprocessing...');
              const tempData = new Uint8ClampedArray(data);
              // Median filter for noise reduction
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

          // SOPHISTICATED 5-STRATEGY SCANNER - Maximum accuracy
          const strategies = [
            { name: 'high-contrast', psm: '1', desc: 'High Contrast + OSD' },
            { name: 'adaptive', psm: '3', desc: 'Adaptive Threshold' },
            { name: 'denoise', psm: '6', desc: 'Denoise + Block Text' },
            { name: 'high-contrast', psm: '4', desc: 'Single Column' },
            { name: 'adaptive', psm: '11', desc: 'Sparse Text' }
          ];

          for (let i = 1; i <= Math.min(pdf.numPages, 4); i++) {
            setDD214ScanProgress(`🔍 Analyzing page ${i}/${Math.min(pdf.numPages, 4)}...`);

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 6.0 }); // Maximum resolution

            const pageResults: any[] = [];

            // Run all 5 strategies silently in background
            for (const strategy of strategies) {
              const canvas = document.createElement('canvas');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;

              await worker.setParameters({
                tessedit_pageseg_mode: parseInt(strategy.psm) as any,
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/., ()\'"',
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

            // Intelligent scoring: confidence × length × (word_count / 10)
            pageResults.forEach(r => {
              const wordCount = r.text.split(/\s+/).filter((w: string) => w.length > 2).length;
              r.score = r.confidence * (r.length / 100) * (wordCount / 10);
            });
            pageResults.sort((a, b) => b.score - a.score);

            const winner = pageResults[0];
            addLog(`✓ Page ${i}: ${winner.length} chars (${winner.strategy}, ${Math.round(winner.confidence)}% confidence)`);
            ocrText += winner.text + '\n';
          }

          await worker.terminate();
          fullText = ocrText;
          addLog(`\n✅ OCR Complete: ${fullText.length} characters extracted`);
          setDD214ScanProgress('✅ Analyzing extracted data...');
        } catch (ocrError) {
          addLog(`❌ OCR failed: ${ocrError}`);
          setDD214ScanProgress('❌ OCR failed - Please try manual entry');
        }
      }

      addLog(`📝 First 500 chars: ${fullText.substring(0, 500)}`);
      addLog(`📝 Last 300 chars: ${fullText.substring(Math.max(0, fullText.length - 300))}`);
      setDD214ScanProgress('🔍 Analyzing DD-214 data...');

      // Extract information from DD-214
      const extractedData: any = {
        fileName: file.name
      };

      // Normalize text for better matching - preserve original but create searchable version
      const normalizedText = fullText.replace(/\s+/g, ' ').trim();
      addLog(`Normalized text length: ${normalizedText.length}`);

      // Check if we have actual content
      if (fullText.length < 100) {
        addLog('⚠️ Very short document - may be empty or unreadable');
      }

      // Name extraction (Box 1 - Name)
      // Pattern: Last name, First name, Middle initial or Full name - very flexible for older formats and OCR
      const namePatterns = [
        /(?:1\.?\s*(?:NAME|MEMBER\s*NAME).*?)[:\s]+([A-Z]+),\s*([A-Z]+)(?:\s+([A-Z]))?/i,
        /(?:NAME|MEMBER\s*NAME)[:\s]+([A-Z]+),\s*([A-Z]+)(?:\s+([A-Z]))?/i,
        // Older format: may just say "NAME" without box number
        /(?:^|\n)\s*NAME[:\s]+([A-Z]+),\s*([A-Z]+)/im,
        // Very lenient: Last, First before SSN pattern
        /([A-Z]{2,}),\s*([A-Z]{2,})(?:\s+([A-Z]))?(?=\s*\d{3}[\s-]?\d{2}[\s-]?\d{4})/,
        // Last, First before any number sequence
        /([A-Z]{3,}),\s*([A-Z]{3,})(?=\s+\d)/,
        // OCR-friendly: handles extra spaces, works with "1 NAME" or "1. NAME" or just "NAME"
        /(?:1\s*\.?\s*)?(?:NAME|MEMBER|LAST.*?FIRST)[:\s,]+([A-Z]{2,})\s*,?\s*([A-Z]{2,})/i,
        // Very aggressive: any two capitalized words with comma between them near start of doc
        /^.{0,500}([A-Z]{3,20})\s*,\s*([A-Z]{3,20})/m
      ];

      for (const pattern of namePatterns) {
        const nameMatch = fullText.match(pattern);
        if (nameMatch) {
          extractedData.lastName = nameMatch[1]?.trim();
          extractedData.firstName = nameMatch[2]?.trim();
          addLog(`✓ Name found: ${extractedData.firstName} ${extractedData.lastName}`);
          break;
        }
      }

      // Fallback: look for any LASTNAME, FIRSTNAME pattern anywhere
      if (!extractedData.lastName && !extractedData.firstName) {
        addLog('⚠ Standard name patterns failed, trying aggressive fallback...');
        // Exclude common form text before searching
        const excludeWords = /\b(AUTOMATED|PREVIOUS|EDITION|OBSOLETE|FORM|MEMBER|COPY|RECORD|NOV|DEC|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|DEPARTMENT|DEFENSE|FORCE)\b/i;

        // Look for pattern like "SMITH, JOHN" anywhere in first 1000 chars
        const candidates = fullText.substring(0, 1000).match(/([A-Z]{3,20})\s*,\s*([A-Z]{3,20})/g);
        if (candidates) {
          for (const candidate of candidates) {
            const parts = candidate.match(/([A-Z]{3,20})\s*,\s*([A-Z]{3,20})/);
            if (parts && !excludeWords.test(parts[1]) && !excludeWords.test(parts[2])) {
              extractedData.lastName = parts[1].trim();
              extractedData.firstName = parts[2].trim();
              addLog(`✓ Name found via fallback: ${extractedData.firstName} ${extractedData.lastName}`);
              break;
            }
          }
        }
        if (!extractedData.lastName) {
          addLog('⚠ No name pattern found');
        }
      }

      // Branch of Service (Box 4) - Very flexible patterns including older formats
      const branchPatterns = [
        // Box number based
        /(?:4\.?\s*(?:BRANCH|COMPONENT).*?)[:\s]+(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|SPACE FORCE|USAF|USN|USA|USMC|USCG|USSF)/i,
        // Field name based
        /(?:BRANCH|COMPONENT)[:\s]+(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|SPACE FORCE|USAF|USN|USA|USMC|USCG|USSF)/i,
        /(?:SERVICE)[:\s]+(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|SPACE FORCE|USAF|USN|USA|USMC|USCG|USSF)/i,
        /(?:RESERVE COMPONENT|ACTIVE|RESERVE)[:\s]+(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|SPACE FORCE|USAF|USN|USA|USMC|USCG|USSF)/i,
        // Department based (common in older DD-214s)
        /(?:DEPARTMENT OF THE)\s+(ARMY|NAVY|AIR FORCE)/i,
        /(?:UNITED STATES)\s+(ARMY|NAVY|AIR FORCE|MARINE CORPS|COAST GUARD|SPACE FORCE)/i,
        // Older format: "U.S. Army" or "US Army"
        /U\.?S\.?\s*(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD)/i,
        // Header/title based (older DD-214s often have this at top)
        /CERTIFICATE OF RELEASE.*?(ARMY|NAVY|AIR FORCE|MARINE CORPS|COAST GUARD)/i,
        // Look near name field (older formats)
        /(?:NAME|MEMBER).*?(?:ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|USAF|USN|USA|USMC|USCG)/i,
        // Just look for the branch names anywhere (fallback)
        /(ARMY|NAVY|AIR FORCE|MARINE CORPS|MARINES|COAST GUARD|SPACE FORCE)/i,
        // Abbreviations standalone
        /(USAF|USN|USA|USMC|USCG|USSF)/
      ];

      addLog('Attempting branch extraction...');
      for (const pattern of branchPatterns) {
        const branchMatch = normalizedText.match(pattern);
        if (branchMatch) {
          let branch = branchMatch[1].trim().toUpperCase();
          // Normalize branch names and abbreviations
          if (branch === 'MARINES') branch = 'MARINE CORPS';
          if (branch === 'USA') branch = 'ARMY';
          if (branch === 'USN') branch = 'NAVY';
          if (branch === 'USAF') branch = 'AIR FORCE';
          if (branch === 'USMC') branch = 'MARINE CORPS';
          if (branch === 'USCG') branch = 'COAST GUARD';
          if (branch === 'USSF') branch = 'SPACE FORCE';
          extractedData.branch = branch.charAt(0) + branch.slice(1).toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
          addLog(`✓ Branch found: ${extractedData.branch}`);
          break;
        }
      }

      // Ultra-aggressive fallback - just look for any branch keyword anywhere
      if (!extractedData.branch) {
        addLog('⚠ Standard branch patterns failed, trying aggressive fallback...');
        const upperText = fullText.toUpperCase();
        if (upperText.includes('ARMY') || upperText.includes('USA ')) {
          extractedData.branch = 'Army';
          addLog('✓ Branch found via fallback: Army');
        } else if (upperText.includes('NAVY') || upperText.includes('USN')) {
          extractedData.branch = 'Navy';
          addLog('✓ Branch found via fallback: Navy');
        } else if (upperText.includes('AIR FORCE') || upperText.includes('USAF') || upperText.includes('AIRFORCE')) {
          extractedData.branch = 'Air Force';
          addLog('✓ Branch found via fallback: Air Force');          console.log('✓ Branch found via fallback: Air Force');
        } else if (upperText.includes('MARINE') || upperText.includes('USMC')) {
          extractedData.branch = 'Marine Corps';
          console.log('✓ Branch found via fallback: Marine Corps');
        } else if (upperText.includes('COAST GUARD') || upperText.includes('USCG')) {
          extractedData.branch = 'Coast Guard';
          console.log('✓ Branch found via fallback: Coast Guard');
        } else if (upperText.includes('SPACE FORCE') || upperText.includes('USSF')) {
          extractedData.branch = 'Space Force';
          console.log('✓ Branch found via fallback: Space Force');
        } else {
          console.log('⚠ Branch not found in document even with aggressive search');
        }
      }

      // Pay Grade/Rank (Box 11)
      const rankPatterns = [
        /(?:11\.?\s*(?:GRADE|RANK|PAY GRADE).*?)[:\s]+([A-Z]-?\d{1,2})/i,
        /(?:GRADE|RANK|PAY GRADE)[:\s]+([A-Z]-?\d{1,2})/i,
        /(?:E-?[1-9]|O-?[1-9]|W-?[1-5])/i
      ];

      for (const pattern of rankPatterns) {
        const rankMatch = fullText.match(pattern);
        if (rankMatch) {
          extractedData.rank = rankMatch[1].trim().toUpperCase();
          console.log('✓ Rank found:', extractedData.rank);
          break;
        }
      }

      // Service Component (Active, Reserve, National Guard)
      const componentPatterns = [
        /(?:RESERVE COMPONENT|COMPONENT)[:\s]+(ACTIVE|RESERVE|NATIONAL GUARD|ARMY RESERVE|NAVY RESERVE|AIR FORCE RESERVE|MARINE CORPS RESERVE|COAST GUARD RESERVE|ARMY NATIONAL GUARD|AIR NATIONAL GUARD)/i,
        /(ACTIVE DUTY|RESERVE|NATIONAL GUARD)/i
      ];

      for (const pattern of componentPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          let component = match[1].trim();
          if (component.includes('NATIONAL GUARD')) {
            extractedData.component = 'National Guard';
          } else if (component.includes('RESERVE')) {
            extractedData.component = 'Reserve';
          } else if (component.includes('ACTIVE')) {
            extractedData.component = 'Active';
          }
          console.log('✓ Component found:', extractedData.component);
          break;
        }
      }

      // Service dates and calculate years of service (Box 12a - Entry, Box 12b - Separation)
      // Very flexible - try many different date formats including older DD-214s and OCR text
      const entryDatePatterns = [
        // Standard formats with various separators (OCR-friendly with optional spaces)
        /(?:12\s*a|ENTRY.*?DATE|DATE.*?ENTERED|ENTERED.*?ACTIVE|PEBD|PAY.*?ENTRY|ORIGINAL.*?ENTRY|DATE.*?OF.*?ENTRY)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        /(?:ENTRY)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        // Older format: "INITIAL ENTRY" or "BASD" (Basic Active Service Date)
        /(?:INITIAL.*?ENTRY|BASD|BASIC.*?ACTIVE)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        // YYYYMMDD format (OCR may have spaces)
        /(?:12\s*a|ENTRY|PEBD|BASD)[:\s]+(\d{4})\s*(\d{2})\s*(\d{2})/i,
        // Very generic - just look for "entered" or "entry" followed by date
        /(?:ENTERED|ENTRY).*?(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{2,4})/i,
        // OCR: Box 12a might be read as "12 a" or "12a" or "I2a"
        /(?:12\s*[aA]|I2\s*[aA])[:\s\.]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        // Date near start of document (likely entry date)
        /(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{4})/
      ];

      const separationDatePatterns = [
        // Standard formats (OCR-friendly)
        /(?:12\s*b|SEPARATION|SEPARATED|RELEASE|DISCHARGE|DISCHARGED|DATE.*?OF.*?DISCHARGE|EFFECTIVE.*?DATE|ETS)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        /(?:SEPARATION|DISCHARGE)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        // Older formats: RELEASED, SEPARATED, DATE RELEASED
        /(?:RELEASED|DATE.*?RELEASED|DATE.*?SEPARATED)[:\s]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i,
        // YYYYMMDD format (OCR may have spaces)
        /(?:12\s*b|SEPARATION|DISCHARGE|RELEASE)[:\s]+(\d{4})\s*(\d{2})\s*(\d{2})/i,
        // Very generic - just look for "separated" or "discharged" followed by date
        /(?:SEPARATED|DISCHARGED|RELEASED).*?(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{2,4})/i,
        // OCR: Box 12b might be read as "12 b" or "12b" or "I2b"
        /(?:12\s*[bB]|I2\s*[bB])[:\s\.]+(\d{1,2})\s*[\/-]?\s*(\d{1,2})\s*[\/-]?\s*(\d{2,4})/i
      ];

      let entryDate: Date | null = null;
      let separationDate: Date | null = null;

      console.log('Attempting entry date extraction...');
      for (const pattern of entryDatePatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          let year: number, month: number, day: number;

          // Check if it's YYYYMMDD format
          if (match[1].length === 4) {
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          } else {
            month = parseInt(match[1]);
            day = parseInt(match[2]);
            year = parseInt(match[3]);
            // Handle 2-digit years
            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }
          }

          entryDate = new Date(year, month - 1, day);
          if (!isNaN(entryDate.getTime()) && year > 1900 && year < 2100) {
            console.log('✓ Entry date found:', entryDate.toLocaleDateString(), 'using pattern:', pattern);
            break;
          } else {
            entryDate = null;
          }
        }
      }

      // Ultra-aggressive fallback for entry date
      if (!entryDate) {
        console.log('⚠ Standard entry date patterns failed, trying aggressive fallback...');
        // Look for any date in first half of document (likely to be entry date)
        const firstHalf = fullText.substring(0, fullText.length / 2);
        const anyDateMatch = firstHalf.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (anyDateMatch) {
          const month = parseInt(anyDateMatch[1]);
          const day = parseInt(anyDateMatch[2]);
          let year = parseInt(anyDateMatch[3]);
          if (year < 100) year += year < 50 ? 2000 : 1900;

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1940 && year < 2100) {
            entryDate = new Date(year, month - 1, day);
            console.log('✓ Entry date found via fallback:', entryDate.toLocaleDateString());
          }
        }

        if (!entryDate) {
          console.log('⚠ Entry date not found even with aggressive search');
        }
      }

      console.log('Attempting separation date extraction...');
      for (const pattern of separationDatePatterns) {
        const match = normalizedText.match(pattern);
        if (match) {
          let year: number, month: number, day: number;

          // Check if it's YYYYMMDD format
          if (match[1].length === 4) {
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          } else {
            month = parseInt(match[1]);
            day = parseInt(match[2]);
            year = parseInt(match[3]);
            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }
          }

          separationDate = new Date(year, month - 1, day);
          if (!isNaN(separationDate.getTime()) && year > 1900 && year < 2100) {
            console.log('✓ Separation date found:', separationDate.toLocaleDateString(), 'using pattern:', pattern);
            break;
          } else {
            separationDate = null;
          }
        }
      }

      // Ultra-aggressive fallback for separation date
      if (!separationDate) {
        console.log('⚠ Standard separation date patterns failed, trying aggressive fallback...');
        // Look for any date in second half of document (likely to be separation date)
        const secondHalf = fullText.substring(fullText.length / 2);
        const anyDateMatch = secondHalf.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (anyDateMatch) {
          const month = parseInt(anyDateMatch[1]);
          const day = parseInt(anyDateMatch[2]);
          let year = parseInt(anyDateMatch[3]);
          if (year < 100) year += year < 50 ? 2000 : 1900;

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 1940 && year < 2100) {
            separationDate = new Date(year, month - 1, day);
            console.log('✓ Separation date found via fallback:', separationDate.toLocaleDateString());
          }
        }

        if (!separationDate) {
          console.log('⚠ Separation date not found even with aggressive search');
        }
      }

      // Calculate years of service
      if (entryDate && separationDate) {
        const diffTime = Math.abs(separationDate.getTime() - entryDate.getTime());
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
        extractedData.yearsOfService = diffYears;
        console.log('✓ Years of service calculated:', diffYears);
      }

      // Combat service detection (Box 13 - Decorations, Box 18 - Remarks)
      const combatIndicators = [
        /COMBAT ACTION/i,
        /PURPLE HEART/i,
        /BRONZE STAR/i,
        /SILVER STAR/i,
        /COMBAT INFANTRYMAN/i,
        /COMBAT MEDICAL/i,
        /COMBAT ACTION BADGE/i,
        /COMBAT ACTION RIBBON/i,
        /IRAQ|AFGHANISTAN|VIETNAM|KOREA|DESERT STORM|DESERT SHIELD/i,
        /OPERATION IRAQI FREEDOM|OPERATION ENDURING FREEDOM|OIF|OEF/i,
        /HOSTILE FIRE/i,
        /IMMINENT DANGER/i
      ];

      for (const indicator of combatIndicators) {
        if (indicator.test(fullText)) {
          extractedData.hasCombatService = true;
          console.log('✓ Combat service detected:', indicator.source);
          break;
        }
      }

      // Character of service (Box 24 - Honorable, General, etc.)
      const characterPatterns = [
        /(?:24\.?\s*CHARACTER.*?SERVICE)[:\s]+(HONORABLE|GENERAL|OTHER THAN HONORABLE|BAD CONDUCT|DISHONORABLE)/i,
        /(?:CHARACTER.*?SERVICE|DISCHARGE.*?CHARACTER)[:\s]+(HONORABLE|GENERAL|OTHER THAN HONORABLE|BAD CONDUCT|DISHONORABLE)/i
      ];

      for (const pattern of characterPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          extractedData.characterOfService = match[1].trim();
          console.log('✓ Character of service:', extractedData.characterOfService);
          break;
        }
      }

      // Retirement detection (Box 25 - Type of Separation)
      const retirementPatterns = [
        /(?:25\.?\s*(?:SEPARATION|TYPE).*?)[:\s]+(RETIREMENT|RETIRED|VOLUNTARY RETIREMENT|INVOLUNTARY RETIREMENT)/i,
        /(?:TYPE.*?SEPARATION|SEPARATION.*?CODE)[:\s]+([A-Z]{2,3}).*?(RETIREMENT|RETIRED)/i,
        /RETIREMENT/i
      ];

      for (const pattern of retirementPatterns) {
        if (pattern.test(fullText)) {
          extractedData.isRetirement = true;
          console.log('✓ Retirement detected');
          break;
        }
      }

      setDD214ScanProgress('✅ DD-214 scan complete!');
      console.log('========== DD-214 EXTRACTION COMPLETE ==========');
      console.log('Extracted Data Summary:');
      console.log('  - Name:', extractedData.firstName, extractedData.lastName);
      console.log('  - Branch:', extractedData.branch || 'NOT FOUND');
      console.log('  - Rank:', extractedData.rank || 'NOT FOUND');
      console.log('  - Component:', extractedData.component || 'NOT FOUND');
      console.log('  - Entry Date:', entryDate ? entryDate.toLocaleDateString() : 'NOT FOUND');
      console.log('  - Separation Date:', separationDate ? separationDate.toLocaleDateString() : 'NOT FOUND');
      console.log('  - Character:', extractedData.characterOfService || 'NOT FOUND');
      console.log('  - Combat:', extractedData.hasCombatService || false);
      console.log('  - Retirement:', extractedData.isRetirement || false);
      console.log('Full extracted object:', extractedData);

      // Create service period object - be EXTREMELY lenient
      // If we extracted ANY text from the PDF (> 50 chars), accept it and let user fill in gaps
      const hasAnyExtractedData = extractedData.firstName || extractedData.lastName ||
                                  extractedData.branch || extractedData.rank ||
                                  entryDate || separationDate ||
                                  extractedData.component || extractedData.characterOfService;

      const hasReadableText = fullText.length > 50;

      if (hasAnyExtractedData || hasReadableText) {
        // Use defaults if data is missing
        const defaultBranch = extractedData.branch || profile.branch || 'Unknown';
        const defaultEntry = entryDate ? entryDate.toLocaleDateString() : 'Not found';
        const defaultSeparation = separationDate ? separationDate.toLocaleDateString() : 'Not found';

        const period: ServicePeriod = {
          id: Date.now().toString(),
          fileName: file.name,
          branch: defaultBranch,
          entryDate: defaultEntry,
          separationDate: defaultSeparation,
          yearsOfService: extractedData.yearsOfService || 0,
          rank: extractedData.rank,
          component: extractedData.component,
          characterOfService: extractedData.characterOfService,
          isRetirement: extractedData.isRetirement,
          hasCombatService: extractedData.hasCombatService
        };

        const updatedPeriods = [...servicePeriods, period];
        setServicePeriods(updatedPeriods);

        // Auto-populate profile with name on first DD-214 only
        if (servicePeriods.length === 0) {
          const nameUpdates: any = {};
          if (extractedData.firstName) nameUpdates.firstName = extractedData.firstName;
          if (extractedData.lastName) nameUpdates.lastName = extractedData.lastName;
          if (Object.keys(nameUpdates).length > 0) {
            updateProfile(nameUpdates);
          }
        }

        // Update profile from all service periods (only if we have valid dates)
        if (entryDate && separationDate) {
          updateProfileFromServicePeriods(updatedPeriods);
        } else {
          // Just update branch if we have it
          if (extractedData.branch) {
            updateProfile({ branch: extractedData.branch });
          }
        }

        const totalYears = updatedPeriods.reduce((sum, p) => sum + p.yearsOfService, 0);

        // Provide feedback about what was found vs missing
        const foundFields = [];
        const missingFields = [];

        if (extractedData.firstName || extractedData.lastName) foundFields.push('name');
        if (extractedData.branch) foundFields.push('branch');
        else missingFields.push('branch');

        if (entryDate) foundFields.push('entry date');
        else missingFields.push('entry date');

        if (separationDate) foundFields.push('separation date');
        else missingFields.push('separation date');

        if (extractedData.rank) foundFields.push('rank');
        if (extractedData.component) foundFields.push('component');

        if (missingFields.length > 0 && foundFields.length > 0) {
          setDD214ScanProgress(`✅ Found: ${foundFields.join(', ')}. Missing: ${missingFields.join(', ')} - please complete manually.`);
        } else if (foundFields.length > 0) {
          setDD214ScanProgress(`✅ Period ${updatedPeriods.length} added! Total service: ${Math.round(totalYears)} years`);
        } else {
          setDD214ScanProgress(`⚠️ Limited data found. Please verify and complete manually.`);
        }
      } else {
        // Document had no readable text
        console.error('❌ DD-214 appears to be empty or unreadable. Text length:', fullText.length);
        setDD214ScanProgress(`❌ Could not read DD-214 content (${fullText.length} chars extracted). File may be scanned image or corrupted. Please enter information manually.`);
      }

      setTimeout(() => setDD214ScanProgress(''), 8000);

    } catch (error) {
      console.error('DD-214 parsing error:', error);
      setDD214ScanProgress('❌ Error scanning DD-214. Please enter information manually.');
      setTimeout(() => setDD214ScanProgress(''), 5000);
    }
  };

  // Handle file upload with validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setScanProgress('❌ File too large. Maximum size is 10MB.');
      setTimeout(() => setScanProgress(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['.pdf', '.txt', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const validMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(fileExtension) && !validMimeTypes.includes(file.type)) {
      setScanProgress('❌ Invalid file type. Please upload PDF, TXT, DOC, or DOCX files only.');
      setTimeout(() => setScanProgress(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadedFile(file);
    setScanProgress(''); // Clear any previous errors
  };

  // Scan rating decision document
  const scanDocument = async () => {
    if (!uploadedFile) {
      setScanProgress('❌ No file selected. Please choose a file first.');
      setTimeout(() => setScanProgress(''), 3000);
      return;
    }

    setIsScanning(true);
    setScanProgress('📄 Reading document...');

    try {
      const fileText = await extractTextFromFile(uploadedFile);

      // Check if file is empty or unreadable
      if (!fileText || fileText.trim().length === 0) {
        throw new Error('Document appears to be empty or unreadable.');
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress('🔍 Analyzing disabilities and ratings...');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setScanProgress('🤖 AI extracting service-connected conditions...');

      const extracted = parseRatingDecision(fileText);

      await new Promise(resolve => setTimeout(resolve, 800));

      if (extracted.length === 0) {
        setScanProgress('⚠️ No disabilities found. Please add them manually or try a different document.');
        setTimeout(() => {
          setScanProgress('');
          setIsScanning(false);
        }, 5000);
        return;
      }

      setScanProgress(`✅ Found ${extracted.length} service-connected ${extracted.length === 1 ? 'disability' : 'disabilities'}!`);

      setSelectedConditions(extracted);

      // Calculate total rating
      const totalRating = calculateCombinedRating(extracted.map(c => c.rating));
      updateProfile({ vaDisabilityRating: totalRating });

      setTimeout(() => {
        setScanProgress('');
        setIsScanning(false);
      }, 3000);

    } catch (error) {
      console.error('Error scanning document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setScanProgress(`❌ Error: ${errorMessage}. Please enter disabilities manually.`);
      setTimeout(() => {
        setScanProgress('');
        setIsScanning(false);
      }, 5000);
    }
  };

  // Extract text from PDF or text file
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
        const arrayBuffer = await file.arrayBuffer();
        console.log('PDF file loaded, size:', arrayBuffer.byteLength, 'bytes');

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('PDF parsed successfully, pages:', pdf.numPages);

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + ' ';
          console.log(`Page ${i} extracted: ${pageText.length} characters`);
        }

        console.log('Total text extracted:', fullText.length, 'characters');
        return fullText;
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
        throw new Error(`PDF parsing failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'}`);
      }
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string || '';
          console.log('Text file extracted:', text.length, 'characters');
          resolve(text);
        };
        reader.onerror = () => {
          console.error('FileReader error');
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      });
    }
  };

  // Parse rating decision text with improved accuracy
  const parseRatingDecision = (text: string): SelectedCondition[] => {
    const found: SelectedCondition[] = [];
    const deniedConditions: string[] = [];

    console.log('========== STARTING PDF ANALYSIS ==========');
    console.log('Document length:', text.length, 'characters');
    console.log('First 300 chars:', text.substring(0, 300));

    // Extract all rating lines - look for common VA rating decision patterns
    const ratingPatterns = [
      // Pattern: "Condition name is granted at 70% rating"
      /([a-z\s\-,()]+?)\s+(?:is\s+)?(?:granted|rated|evaluated|service-connected)\s+(?:at\s+)?(\d{1,3})\s*%/gi,
      // Pattern: "70% - Condition name"
      /(\d{1,3})\s*%\s*[-–—]\s*([a-z\s\-,()]+?)(?:\n|$|effective)/gi,
      // Pattern: "Service connection for [condition] is granted and evaluated as 70 percent"
      /(?:service\s+connection\s+for\s+)([a-z\s\-,()]+?)\s+(?:is\s+)?(?:granted|evaluated)\s+(?:as\s+)?(\d{1,3})\s*(?:percent|%)/gi,
      // Pattern: Table format "Condition | Rating | Effective Date"
      /([a-z\s\-,()]+?)\s*[|\t]\s*(\d{1,3})\s*%/gi,
    ];

    // Extract denied conditions
    const deniedPatterns = [
      /(?:service\s+connection\s+for\s+)([a-z\s\-,()]+?)\s+is\s+denied/gi,
      /([a-z\s\-,()]+?)\s+(?:is\s+)?denied/gi,
      /(?:claim\s+for\s+)([a-z\s\-,()]+?)\s+(?:is\s+)?(?:not\s+)?(?:service-connected|denied)/gi,
    ];

    console.log('Extracting denied conditions...');
    deniedPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const conditionText = match[1].trim();
        if (conditionText.length > 3 && conditionText.length < 100) {
          deniedConditions.push(conditionText);
          console.log('❌ Denied:', conditionText);
        }
      }
    });

    // Store denied conditions in sessionStorage for Claims Education Center
    if (deniedConditions.length > 0) {
      sessionStorage.setItem('deniedConditions', JSON.stringify(deniedConditions));
      console.log(`Stored ${deniedConditions.length} denied conditions in sessionStorage`);
    }

    console.log('Extracting granted conditions with ratings...');

    // Try each pattern to extract condition-rating pairs
    const extractedPairs: Array<{ text: string; rating: number; position: number }> = [];

    ratingPatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const conditionText = match[1]?.trim() || match[2]?.trim();
        const ratingText = match[2] || match[1];
        const rating = parseInt(ratingText);

        if (conditionText && rating > 0 && rating <= 100 && conditionText.length > 2) {
          extractedPairs.push({
            text: conditionText,
            rating: rating,
            position: match.index
          });
          console.log(`Pattern ${patternIndex + 1} matched: "${conditionText}" -> ${rating}%`);
        }
      }
    });

    console.log(`Extracted ${extractedPairs.length} condition-rating pairs`);

    // Match extracted pairs to our condition database
    extractedPairs.forEach(pair => {
      // Find best matching condition in database
      let bestMatch: DisabilityCondition | null = null;
      let bestScore = 0;

      DISABILITY_CONDITIONS.forEach(condition => {
        const conditionLower = pair.text.toLowerCase();
        const conditionNameLower = condition.name.toLowerCase();

        // Direct name match (highest score)
        if (conditionLower.includes(conditionNameLower) || conditionNameLower.includes(conditionLower)) {
          const score = 100;
          if (score > bestScore) {
            bestMatch = condition;
            bestScore = score;
          }
        }

        // Keyword match
        condition.keywords.forEach(keyword => {
          if (conditionLower.includes(keyword.toLowerCase())) {
            const score = 70;
            if (score > bestScore) {
              bestMatch = condition;
              bestScore = score;
            }
          }
        });

        // Fuzzy match on similar words
        const pairWords = conditionLower.split(/\s+/);
        const nameWords = conditionNameLower.split(/\s+/);
        const commonWords = pairWords.filter(w => nameWords.includes(w) && w.length > 3);
        if (commonWords.length > 0) {
          const score = (commonWords.length / Math.max(pairWords.length, nameWords.length)) * 50;
          if (score > bestScore && score > 20) {
            bestMatch = condition;
            bestScore = score;
          }
        }
      });

      if (bestMatch && bestScore > 20) {
        // Check if already added (avoid duplicates)
        const exists = found.find(f => f.condition.id === bestMatch!.id);
        if (!exists) {
          // Extract effective date near this condition
          const contextStart = Math.max(0, pair.position - 200);
          const contextEnd = Math.min(text.length, pair.position + 200);
          const context = text.substring(contextStart, contextEnd);

          const datePatterns = [
            /effective\s+(?:date\s+)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
          ];

          let effectiveDate = new Date().toISOString().split('T')[0];
          for (const datePattern of datePatterns) {
            const dateMatch = context.match(datePattern);
            if (dateMatch) {
              effectiveDate = dateMatch[1];
              // Convert to YYYY-MM-DD format if needed
              if (effectiveDate.includes('/')) {
                const parts = effectiveDate.split('/');
                if (parts.length === 3) {
                  const month = parts[0].padStart(2, '0');
                  const day = parts[1].padStart(2, '0');
                  let year = parts[2];
                  if (year.length === 2) {
                    year = (parseInt(year) > 50 ? '19' : '20') + year;
                  }
                  effectiveDate = `${year}-${month}-${day}`;
                }
              }
              break;
            }
          }

          // Detect side for paired extremities
          const pairedExtremities = ['arm', 'leg', 'hand', 'foot', 'knee', 'ankle', 'wrist', 'elbow', 'shoulder', 'hip'];
          const isPaired = pairedExtremities.some(ext => bestMatch!.name.toLowerCase().includes(ext));
          let side: 'Left' | 'Right' | 'Bilateral' | 'Not Applicable' = 'Not Applicable';

          if (isPaired) {
            const contextLower = context.toLowerCase();
            if (contextLower.includes('bilateral') || (contextLower.includes('left') && contextLower.includes('right'))) {
              side = 'Bilateral';
            } else if (contextLower.includes('left')) {
              side = 'Left';
            } else if (contextLower.includes('right')) {
              side = 'Right';
            } else {
              side = 'Left'; // Default for paired extremities
            }
          }

          console.log(`✅ MATCHED: ${bestMatch.name} -> ${pair.rating}% (score: ${bestScore}, side: ${side}, date: ${effectiveDate})`);

          found.push({
            condition: bestMatch,
            rating: pair.rating,
            effectiveDate: effectiveDate,
            side: side,
            description: `Extracted from VA rating decision: "${pair.text.substring(0, 100)}"`
          });
        }
      } else {
        console.log(`⚠️ No match found for: "${pair.text}" at ${pair.rating}%`);
      }
    });

    console.log('========== ANALYSIS COMPLETE ==========');
    console.log(`✅ Found ${found.length} service-connected conditions`);
    console.log(`❌ Found ${deniedConditions.length} denied conditions`);

    return found;
  };

  // Check if bilateral factor applies (two or more paired extremities)
  const checkBilateralFactor = (conditions: SelectedCondition[]): boolean => {
    const pairedExtremities = ['arm', 'leg', 'hand', 'foot', 'knee', 'ankle', 'wrist', 'elbow', 'shoulder', 'hip'];
    const affectedSides = new Map<string, Set<string>>();

    conditions.forEach(item => {
      if (item.side && item.side !== 'Not Applicable') {
        const conditionName = item.condition.name.toLowerCase();
        const extremity = pairedExtremities.find(ext => conditionName.includes(ext));
        if (extremity) {
          if (!affectedSides.has(extremity)) {
            affectedSides.set(extremity, new Set());
          }
          affectedSides.get(extremity)?.add(item.side);
        }
      }
    });

    // Bilateral factor applies if any extremity has both sides affected OR any condition is marked bilateral
    for (const sides of affectedSides.values()) {
      if (sides.size >= 2 || sides.has('Bilateral')) {
        return true;
      }
    }
    return false;
  };

  // Calculate combined VA rating with optional bilateral factor
  const calculateCombinedRating = (ratings: number[], applyBilateral: boolean = false): number => {
    if (ratings.length === 0) return 0;
    if (ratings.length === 1) return ratings[0];

    const sorted = ratings.sort((a, b) => b - a);
    let combined = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const remaining = 100 - combined;
      combined += (remaining * sorted[i]) / 100;
    }

    // Apply bilateral factor (10% of the combined bilateral rating)
    if (applyBilateral) {
      combined = combined + (combined * 0.10);
    }

    return Math.round(combined / 10) * 10;
  };

  // Get current combined rating with bilateral check
  const getCurrentCombinedRating = (): { rating: number; hasBilateral: boolean } => {
    const hasBilateral = checkBilateralFactor(selectedConditions);
    const rating = calculateCombinedRating(
      selectedConditions.map(c => c.rating),
      hasBilateral
    );
    return { rating, hasBilateral };
  };

  // Add condition manually
  const addCondition = (condition: DisabilityCondition) => {
    const exists = selectedConditions.find(c => c.condition.id === condition.id);
    if (!exists) {
      // Detect if condition affects paired extremities for default side
      const pairedExtremities = ['arm', 'leg', 'hand', 'foot', 'knee', 'ankle', 'wrist', 'elbow', 'shoulder', 'hip'];
      const isPaired = pairedExtremities.some(ext => condition.name.toLowerCase().includes(ext));

      setSelectedConditions([...selectedConditions, {
        condition,
        rating: condition.commonRatings[0] || 0,
        effectiveDate: new Date().toISOString().split('T')[0],
        side: isPaired ? 'Left' : 'Not Applicable',
        description: ''
      }]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  // Add condition from dropdown
  const addConditionFromDropdown = () => {
    if (!selectedFromDropdown) return;

    // Find the condition in database by name
    const condition = DISABILITY_CONDITIONS.find(c =>
      c.name.toLowerCase() === selectedFromDropdown.toLowerCase() ||
      selectedFromDropdown.toLowerCase().includes(c.name.toLowerCase())
    );

    if (condition) {
      addCondition(condition);
      setSelectedFromDropdown('');
    }
  };

  // Remove condition
  const removeCondition = (conditionId: string) => {
    setSelectedConditions(selectedConditions.filter(c => c.condition.id !== conditionId));
  };

  // Update condition rating
  const updateConditionRating = (conditionId: string, rating: number) => {
    setSelectedConditions(selectedConditions.map(c =>
      c.condition.id === conditionId ? { ...c, rating } : c
    ));
  };

  // Update condition effective date
  const updateConditionDate = (conditionId: string, effectiveDate: string) => {
    setSelectedConditions(selectedConditions.map(c =>
      c.condition.id === conditionId ? { ...c, effectiveDate } : c
    ));
  };

  // Update condition side
  const updateConditionSide = (conditionId: string, side: 'Left' | 'Right' | 'Bilateral' | 'Not Applicable') => {
    setSelectedConditions(selectedConditions.map(c =>
      c.condition.id === conditionId ? { ...c, side } : c
    ));
  };

  // Update condition description
  const updateConditionDescription = (conditionId: string, description: string) => {
    setSelectedConditions(selectedConditions.map(c =>
      c.condition.id === conditionId ? { ...c, description } : c
    ));
  };

  // Save and continue to next step
  const handleNext = () => {
    if (step === 3) {
      // Save disabilities to profile
      const conditions = selectedConditions.map(c => ({
        name: c.condition.name,
        rating: c.rating,
        effectiveDate: c.effectiveDate
      }));
      const totalRating = calculateCombinedRating(selectedConditions.map(c => c.rating));
      updateProfile({
        serviceConnectedConditions: conditions,
        vaDisabilityRating: totalRating
      });
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      updateProfile({ profileCompleted: true });
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">🎖️ Veteran Onboarding</h1>
          <span className="text-lg font-semibold text-blue-600">Step {step} of 5</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4">
          <div
            className={`absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ${
              step === 1 ? 'w-1/5' : step === 2 ? 'w-2/5' : step === 3 ? 'w-3/5' : step === 4 ? 'w-4/5' : 'w-full'
            }`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span className={step >= 1 ? 'font-bold text-blue-600' : ''}>Profile</span>
          <span className={step >= 2 ? 'font-bold text-blue-600' : ''}>Retirement</span>
          <span className={step >= 3 ? 'font-bold text-blue-600' : ''}>Disabilities</span>
          <span className={step >= 4 ? 'font-bold text-blue-600' : ''}>Dependents</span>
          <span className={step >= 5 ? 'font-bold text-blue-600' : ''}>Review</span>
        </div>
      </div>

      {/* Step 1: Basic Profile */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-2">
                First Name *
                {servicePeriods.length > 0 && profile.firstName && (
                  <span className="text-green-600 text-xs ml-2">✓ From DD-214</span>
                )}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={profile.firstName}
                onChange={(e) => updateProfile({ firstName: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="John"
                autoComplete="given-name"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-2">
                Last Name *
                {servicePeriods.length > 0 && profile.lastName && (
                  <span className="text-green-600 text-xs ml-2">✓ From DD-214</span>
                )}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={profile.lastName}
                onChange={(e) => updateProfile({ lastName: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Smith"
                autoComplete="family-name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Branch of Service *
                {servicePeriods.length > 0 && profile.branch && (
                  <span className="text-green-600 text-xs ml-2">✓ Most Recent</span>
                )}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'Army', label: 'U.S. Army' },
                  { value: 'Navy', label: 'U.S. Navy' },
                  { value: 'Air Force', label: 'U.S. Air Force' },
                  { value: 'Marine Corps', label: 'U.S. Marine Corps' },
                  { value: 'Coast Guard', label: 'U.S. Coast Guard' },
                  { value: 'Space Force', label: 'U.S. Space Force' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateProfile({ branch: value as any })}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      profile.branch === value
                        ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                    }`}
                    title={label}
                  >
                    <BranchEmblem branch={value} size={48} className="opacity-90" />
                    <span className={`text-xs font-semibold ${
                      profile.branch === value ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {label.replace('U.S. ', '')}
                    </span>
                    {profile.branch === value && (
                      <span className="text-blue-600 text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="yearsOfService" className="block text-sm font-bold text-gray-700 mb-2">
                Years of Service
                {servicePeriods.length > 0 && profile.yearsOfService > 0 && (
                  <span className="text-green-600 text-xs ml-2">✓ Total Calculated</span>
                )}
              </label>
              <input
                id="yearsOfService"
                name="yearsOfService"
                type="number"
                min="0"
                max="50"
                value={profile.yearsOfService}
                onChange={(e) => updateProfile({ yearsOfService: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  id="hasCombatService"
                  name="hasCombatService"
                  type="checkbox"
                  checked={profile.hasCombatService}
                  onChange={(e) => updateProfile({ hasCombatService: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-900">
                  I served in a combat zone or had combat-related duties
                  {servicePeriods.some(p => p.hasCombatService) && (
                    <span className="text-green-600 text-xs ml-2">✓ Detected from DD-214</span>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* DD-214 Upload Section */}
          <div className="mt-8 border-t pt-8">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">📋</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">
                    Upload DD-214(s) for Auto-Fill (Optional)
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Upload your DD Form 214. We'll automatically extract your service information.
                    Your document stays on your device - we don't send it anywhere.
                  </p>

                  {/* Upload Button - Show when no DD-214 uploaded or user wants to add more */}
                  {showUploadButton && (
                    <div className="mb-4">
                      <label
                        onClick={() => console.log('Upload button clicked')}
                        className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 ${
                        isScanningDD214 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-lg font-bold transition-colors`}>
                        <span>📤</span>
                        <span>{servicePeriods.length > 0 ? 'Upload Another DD-214' : 'Upload DD-214 (PDF)'}</span>
                        <input
                          id="dd214Upload"
                          name="dd214Upload"
                          ref={dd214InputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleDD214Upload}
                          className="hidden"
                          disabled={isScanningDD214}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Accepts PDF format only (Max 10MB)</p>
                    </div>
                  )}

                  {/* Small prompt asking about additional DD-214s */}
                  {showAdditionalDD214Prompt && !isScanningDD214 && (
                    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-blue-900 mb-3">Do you have additional DD-214s to upload?</p>
                      <p className="text-xs text-blue-800 mb-3">If you served multiple periods (Active + Reserve, multiple enlistments, etc.), upload each DD-214 separately.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowAdditionalDD214Prompt(false);
                            setShowUploadButton(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors text-sm"
                        >
                          Yes, Upload Another
                        </button>
                        <button
                          onClick={() => setShowAdditionalDD214Prompt(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-bold transition-colors text-sm"
                        >
                          No, That's All
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scanning Progress */}
                  {isScanningDD214 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin text-2xl">🤖</div>
                        <p className="text-sm font-medium text-purple-900">Scanning DD-214...</p>
                      </div>
                    </div>
                  )}

                  {/* Progress/Result Message */}
                  {dd214ScanProgress && !isScanningDD214 && (
                    <div className={`${
                      dd214ScanProgress.includes('❌') ? 'bg-red-50 border-red-200 text-red-900' :
                      dd214ScanProgress.includes('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                      'bg-green-50 border-green-200 text-green-900'
                    } border-2 rounded-lg p-4 text-center mb-4`}>
                      <p className="text-sm font-medium">{dd214ScanProgress}</p>
                    </div>
                  )}

                  {/* Service Periods List */}
                  {servicePeriods.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-bold text-gray-800 text-sm">📚 Service Periods ({servicePeriods.length}):</h4>
                      {servicePeriods.map((period, index) => (
                        <div key={period.id} className="bg-white border-2 border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-blue-900">Period {index + 1}</span>
                                {period.isRetirement && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                                    🎖️ Retirement
                                  </span>
                                )}
                                {period.hasCombatService && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                                    ⭐ Combat
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><strong>Branch:</strong> {period.branch}</p>
                                <p><strong>Years:</strong> {period.yearsOfService}</p>
                                <p><strong>From:</strong> {period.entryDate}</p>
                                <p><strong>To:</strong> {period.separationDate}</p>
                                {period.rank && <p><strong>Rank:</strong> {period.rank}</p>}
                                {period.component && <p><strong>Component:</strong> {period.component}</p>}
                                {period.characterOfService && (
                                  <p className="col-span-2"><strong>Character:</strong> {period.characterOfService}</p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Source: {period.fileName}</p>
                            </div>
                            <button
                              onClick={() => removeServicePeriod(period.id)}
                              className="text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded transition-colors text-sm ml-4"
                              title="Remove this period"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Total Summary */}
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
                        <p className="font-bold text-blue-900">
                          📊 Total Service: {servicePeriods.reduce((sum, p) => sum + p.yearsOfService, 0)} years across {servicePeriods.length} period{servicePeriods.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                          Most Recent Branch: {profile.branch || 'Not set'}
                          {servicePeriods.some(p => p.isRetirement) && ' • Retired'}
                          {servicePeriods.some(p => p.hasCombatService) && ' • Combat Service'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mt-4">
                <p className="text-xs text-blue-900">
                  <strong>💡 What we extract:</strong> Name, Branch, Rank, Service Dates, Years of Service, Combat indicators, Retirement status
                  <br />
                  <strong> Where to find DD-214:</strong> Contact your branch's personnel center or visit{' '}
                  <a href="https://www.archives.gov/veterans/military-service-records" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                    eVetRecs
                  </a>
                </p>
              </div>

              {/* Debug Log Panel - Shows extraction details */}
              {dd214DebugLog.length > 0 && (
                <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg border-2 border-gray-700 max-h-96 overflow-y-auto font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white">📊 DD-214 Analysis Log</h4>
                    <button
                      onClick={() => setDD214DebugLog([])}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  </div>
                  {dd214DebugLog.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Retirement Status & CRSC Screening */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎖️ Retirement Status</h2>

          {/* Auto-populated notice */}
          {servicePeriods.some(p => p.isRetirement) && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                <strong>✓ Retirement detected from DD-214!</strong> We've automatically checked the retirement status below based on your uploaded DD-214.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Retirement Status */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                id="isRetired"
                name="isRetired"
                type="checkbox"
                checked={profile.isRetired}
                onChange={(e) => updateProfile({
                  isRetired: e.target.checked,
                  isMedicallyRetired: false,
                  hasRetirementPay: e.target.checked && !profile.isMedicallyRetired,
                  crscCombatInjury: false,
                  crscCombatTraining: false,
                  crscHazardousDuty: false,
                  crscToxicExposure: false,
                  crscMentalHealthCombat: false,
                  crscMayQualify: false
                })}
                className="w-5 h-5"
                aria-label="I am retired from military service"
              />
              <span className="font-semibold text-gray-900">I am retired from military service</span>
            </label>

            {profile.isRetired && (
              <>
                <label className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 border-2 border-yellow-200">
                  <input
                    id="isMedicallyRetired"
                    name="isMedicallyRetired"
                    type="checkbox"
                    checked={profile.isMedicallyRetired}
                    onChange={(e) => {
                      const isMedical = e.target.checked;
                      updateProfile({
                        isMedicallyRetired: isMedical,
                        hasRetirementPay: !isMedical,
                        retirementPayAmount: isMedical ? 0 : profile.retirementPayAmount,
                        crscCombatInjury: false,
                        crscCombatTraining: false,
                        crscHazardousDuty: false,
                        crscToxicExposure: false,
                        crscMentalHealthCombat: false,
                        crscMayQualify: false
                      });
                    }}
                    className="w-5 h-5"
                    aria-label="I am medically retired"
                  />
                  <span className="font-semibold text-gray-900">☑ I am medically retired</span>
                </label>

                {/* Regular Retirement - Show Retirement Pay Field */}
                {!profile.isMedicallyRetired && (
                  <div>
                    <label htmlFor="retirementPayAmount" className="block text-sm font-bold text-gray-700 mb-2">
                      Monthly Retirement Pay (before VA offset)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        id="retirementPayAmount"
                        name="retirementPayAmount"
                        type="number"
                        min="0"
                        step="100"
                        value={profile.retirementPayAmount || ''}
                        onChange={(e) => updateProfile({
                          retirementPayAmount: parseFloat(e.target.value) || 0
                        })}
                        className="w-full pl-8 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="3500"
                        aria-label="Monthly retirement pay amount"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Enter your gross monthly retirement pay before any VA disability offset
                    </p>
                  </div>
                )}

                {/* Medical Retirement - Show CRSC Screening */}
                {profile.isMedicallyRetired && (
                  <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Combat-Related Special Compensation (CRSC) Screening
                    </h3>
                    <p className="text-sm text-gray-700 mb-6">
                      Answer the questions below to help us determine if you may qualify for CRSC.
                      This does not guarantee eligibility, but helps us guide you toward the right benefits.
                    </p>

                    <div className="space-y-5">
                      {/* Question 1: Combat Injury */}
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="crscCombatInjury"
                            name="crscCombatInjury"
                            type="checkbox"
                            checked={profile.crscCombatInjury}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              updateProfile({
                                crscCombatInjury: newValue,
                                crscMayQualify: newValue || profile.crscCombatTraining || profile.crscHazardousDuty || profile.crscToxicExposure || profile.crscMentalHealthCombat
                              });
                            }}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            aria-label="Combat injury or combat-related condition"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Was your medical retirement caused by a combat injury or combat-related condition?
                            </span>
                            <span className="text-sm text-gray-600">
                              Examples include injuries from combat operations, hostile fire, or hazardous duty.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Question 2: Combat Training */}
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="crscCombatTraining"
                            name="crscCombatTraining"
                            type="checkbox"
                            checked={profile.crscCombatTraining}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              updateProfile({
                                crscCombatTraining: newValue,
                                crscMayQualify: profile.crscCombatInjury || newValue || profile.crscHazardousDuty || profile.crscToxicExposure || profile.crscMentalHealthCombat
                              });
                            }}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            aria-label="Combat training or field exercises"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Did your condition occur during combat training, field exercises, or simulated combat environments?
                            </span>
                            <span className="text-sm text-gray-600">
                              Includes injuries from training exercises, war games, combat drills, live-fire exercises, and field training operations. These are considered "combat-related" under CRSC guidance.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Question 3: Hazardous Duty */}
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="crscHazardousDuty"
                            name="crscHazardousDuty"
                            type="checkbox"
                            checked={profile.crscHazardousDuty}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              updateProfile({
                                crscHazardousDuty: newValue,
                                crscMayQualify: profile.crscCombatInjury || profile.crscCombatTraining || newValue || profile.crscToxicExposure || profile.crscMentalHealthCombat
                              });
                            }}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            aria-label="Hazardous duty related condition"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Was your condition caused by hazardous duty such as parachuting, airborne operations, diving, flight operations, or demolition?
                            </span>
                            <span className="text-sm text-gray-600">
                              This includes special operations, flight crew duties, EOD (Explosive Ordnance Disposal), and other high-risk military assignments. Injuries from training jumps, flight operations, diving exercises, and field deployments ALL qualify.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Question 4: Toxic Exposure */}
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="crscToxicExposure"
                            name="crscToxicExposure"
                            type="checkbox"
                            checked={profile.crscToxicExposure}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              updateProfile({
                                crscToxicExposure: newValue,
                                crscMayQualify: profile.crscCombatInjury || profile.crscCombatTraining || profile.crscHazardousDuty || newValue || profile.crscMentalHealthCombat
                              });
                            }}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            aria-label="Toxic exposure related condition"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Is your condition related to exposure to Agent Orange, burn pits, radiation, or other toxic substances?
                            </span>
                            <span className="text-sm text-gray-600">
                              This includes conditions from environmental hazards in combat zones.
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Question 5: Mental Health Combat-Related */}
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="crscMentalHealthCombat"
                            name="crscMentalHealthCombat"
                            type="checkbox"
                            checked={profile.crscMentalHealthCombat}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              updateProfile({
                                crscMentalHealthCombat: newValue,
                                crscMayQualify: profile.crscCombatInjury || profile.crscCombatTraining || profile.crscHazardousDuty || profile.crscToxicExposure || newValue
                              });
                            }}
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            aria-label="Mental health condition related to combat"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Is your condition a mental health issue (e.g., PTSD) directly related to combat or combat exposure?
                            </span>
                            <span className="text-sm text-gray-600">
                              This includes PTSD, anxiety, depression, or other mental health conditions from combat trauma.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Advisory Note */}
                    {profile.crscMayQualify && (
                      <div className="mt-6 p-5 bg-green-50 border-2 border-green-400 rounded-lg">
                        <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                          <span className="text-2xl">✅</span>
                          Advisory Note
                        </h4>
                        <p className="text-sm text-green-800">
                          Based on your answers, you may qualify for CRSC. This benefit is tax-free and paid in addition to VA compensation.
                          Final eligibility is determined by your branch of service.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Disabilities (with upload & search) */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🏥 Service-Connected Disabilities</h2>
          <p className="text-gray-600 mb-6">Upload your VA rating decision or add disabilities manually</p>

          {/* Option 1: Upload Document */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📄 Option 1: Upload VA Rating Decision</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll automatically scan your rating decision and extract your disabilities (PDF or text file)
            </p>

            <div className="flex gap-4 items-center flex-wrap">
              <input
                id="ratingDecisionUpload"
                name="ratingDecisionUpload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload VA rating decision document"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                aria-label={uploadedFile ? 'Change uploaded file' : 'Choose file to upload'}
              >
                {uploadedFile ? '✓ Change File' : '📁 Choose File'}
              </button>
              {uploadedFile && (
                <>
                  <span className="text-sm text-gray-700 font-medium" title={uploadedFile.name}>
                    {uploadedFile.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </span>
                  <button
                    onClick={scanDocument}
                    disabled={isScanning}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Scan document to extract disabilities"
                  >
                    {isScanning ? '⏳ Scanning...' : '🔍 Scan Document'}
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              📋 Accepted formats: PDF, TXT, DOC, DOCX | Maximum size: 10MB
            </p>

            {scanProgress && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300">
                <p className="text-blue-700 font-semibold">{scanProgress}</p>
              </div>
            )}
          </div>

          {/* Option 2: Manual Entry with Dropdown + Search */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">✍️ Option 2: Add Disabilities Manually</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose from common disabilities or search from 70+ VA conditions
            </p>

            {/* Quick Select Dropdown */}
            <div className="mb-4">
              <label htmlFor="quickSelectDisability" className="block text-sm font-bold text-gray-700 mb-2">
                📋 Quick Select - Most Common VA Disabilities
              </label>
              <div className="flex gap-3">
                <select
                  id="quickSelectDisability"
                  name="quickSelectDisability"
                  value={selectedFromDropdown}
                  onChange={(e) => setSelectedFromDropdown(e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base"
                  aria-label="Select common disability from dropdown"
                >
                  <option value="">-- Select a Common Disability --</option>
                  {topDisabilities.map((disability, index) => (
                    <option key={index} value={disability}>
                      {disability}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addConditionFromDropdown}
                  disabled={!selectedFromDropdown}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add selected disability"
                >
                  ➕ Add
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500 font-semibold">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <label htmlFor="disabilitySearch" className="block text-sm font-bold text-gray-700 mb-2">
                🔍 Search All Disabilities (Type to Search)
              </label>
              <input
                id="disabilitySearch"
                name="disabilitySearch"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg"
                placeholder="🔍 Type to search (e.g., 'knee', 'PTSD', 'back pain')..."
                aria-label="Search for service-connected disabilities"
              />

              {/* Search Results Dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                  {searchResults.map((condition) => (
                    <button
                      key={condition.id}
                      onClick={() => addCondition(condition)}
                      className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-200 transition"
                    >
                      <div className="font-bold text-gray-900">{condition.name}</div>
                      <div className="text-sm text-gray-600">{condition.description}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Category: {condition.category} | Common ratings: {condition.commonRatings.join(', ')}%
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Disabilities */}
          {selectedConditions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  📋 Selected Disabilities ({selectedConditions.length})
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Combined Rating (Advisory)</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {getCurrentCombinedRating().rating}%
                  </div>
                  {getCurrentCombinedRating().hasBilateral && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      ✓ Bilateral factor applied automatically
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {selectedConditions.map((item) => (
                  <div
                    key={item.condition.id}
                    className="p-5 bg-white rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header with name and remove button */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{item.condition.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.condition.description}</div>
                      </div>
                      <button
                        onClick={() => removeCondition(item.condition.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition flex-shrink-0 ml-3"
                        title="Remove disability"
                        aria-label={`Remove ${item.condition.name}`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Input Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Rating Percentage */}
                      <div>
                        <label htmlFor={`rating-${item.condition.id}`} className="block text-xs font-bold text-gray-700 mb-2">
                          Rating % *
                          <span className="ml-1 text-gray-500 font-normal" title="VA disability rating percentage">
                            ℹ️
                          </span>
                        </label>
                        <input
                          id={`rating-${item.condition.id}`}
                          name={`rating-${item.condition.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="10"
                          value={item.rating}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0 && value <= 100) {
                              updateConditionRating(item.condition.id, value);
                            }
                          }}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          aria-label={`Rating percentage for ${item.condition.name}`}
                          placeholder="0-100"
                        />
                      </div>

                      {/* Side Selector */}
                      <div>
                        <label htmlFor={`side-${item.condition.id}`} className="block text-xs font-bold text-gray-700 mb-2">
                          Side/Location
                          <span className="ml-1 text-gray-500 font-normal" title="Affected body side for paired extremities">
                            ℹ️
                          </span>
                        </label>
                        <select
                          id={`side-${item.condition.id}`}
                          name={`side-${item.condition.id}`}
                          value={item.side || 'Not Applicable'}
                          onChange={(e) => updateConditionSide(item.condition.id, e.target.value as any)}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          aria-label={`Side affected for ${item.condition.name}`}
                        >
                          <option value="Not Applicable">Not Applicable</option>
                          <option value="Left">Left</option>
                          <option value="Right">Right</option>
                          <option value="Bilateral">Bilateral (Both)</option>
                        </select>
                      </div>

                      {/* Effective Date */}
                      <div>
                        <label htmlFor={`effectiveDate-${item.condition.id}`} className="block text-xs font-bold text-gray-700 mb-2">
                          Effective Date
                        </label>
                        <input
                          id={`effectiveDate-${item.condition.id}`}
                          name={`effectiveDate-${item.condition.id}`}
                          type="date"
                          value={item.effectiveDate}
                          onChange={(e) => updateConditionDate(item.condition.id, e.target.value)}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          aria-label={`Effective date for ${item.condition.name}`}
                        />
                      </div>
                    </div>

                    {/* Description Field (Full Width) */}
                    <div className="mt-3">
                      <label htmlFor={`description-${item.condition.id}`} className="block text-xs font-bold text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id={`description-${item.condition.id}`}
                        name={`description-${item.condition.id}`}
                        value={item.description || ''}
                        onChange={(e) => updateConditionDescription(item.condition.id, e.target.value)}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                        rows={2}
                        placeholder="Add any additional details about this condition..."
                        aria-label={`Additional notes for ${item.condition.name}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Combined Rating Display */}
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-2 border-blue-400 shadow-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-700 font-semibold mb-2">Advisory Combined VA Rating</div>
                  <div className="text-5xl font-black text-blue-700">
                    {getCurrentCombinedRating().rating}%
                  </div>
                  {getCurrentCombinedRating().hasBilateral ? (
                    <div className="text-sm text-green-700 font-semibold mt-3 bg-green-50 py-2 px-4 rounded-lg inline-block">
                      ✓ Bilateral factor (10%) applied automatically
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 mt-2">Calculated using VA's combined ratings table</div>
                  )}
                  <div className="text-xs text-gray-500 mt-3 italic">This is an advisory calculation only. Official ratings are determined by VA.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Dependents */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">👨‍👩‍👧‍👦 Dependents & Family</h2>

          <div className="space-y-6">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                id="isMarried"
                name="isMarried"
                type="checkbox"
                checked={profile.isMarried}
                onChange={(e) => {
                  updateProfile({
                    isMarried: e.target.checked,
                    hasSpouse: e.target.checked
                  });
                }}
                className="w-5 h-5"
              />
              <span className="font-semibold text-gray-900">I am married</span>
            </label>

            <div>
              <label htmlFor="numberOfChildren" className="block text-sm font-bold text-gray-700 mb-2">Number of Children</label>
              <input
                id="numberOfChildren"
                name="numberOfChildren"
                type="number"
                min="0"
                max="20"
                value={profile.numberOfChildren}
                onChange={(e) => updateProfile({
                  numberOfChildren: parseInt(e.target.value) || 0,
                  numberOfDependents: parseInt(e.target.value) || 0
                })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="0"
                title="Number of children"
                autoComplete="off"
              />
            </div>

            {profile.numberOfChildren > 0 && (
              <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
                <input
                  id="hasDependentsInSchool"
                  name="hasDependentsInSchool"
                  type="checkbox"
                  checked={profile.hasDependentsInSchool}
                  onChange={(e) => updateProfile({ hasDependentsInSchool: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-900">I have dependent(s) age 18-23 attending school full-time</span>
              </label>
            )}

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                id="hasDependentParents"
                name="hasDependentParents"
                type="checkbox"
                checked={profile.hasDependentParents}
                onChange={(e) => updateProfile({ hasDependentParents: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold text-gray-900">I have dependent parent(s)</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Review Your Information</h2>

          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Personal Info</h3>
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Branch:</strong> {profile.branch}</p>
              <p><strong>Years of Service:</strong> {profile.yearsOfService}</p>
              <p><strong>Combat Service:</strong> {profile.hasCombatService ? 'Yes' : 'No'}</p>
            </div>

            {profile.isRetired && (
              <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Retirement Status</h3>
                <p><strong>Retired:</strong> Yes</p>
                <p><strong>Medical Retirement:</strong> {profile.isMedicallyRetired ? 'Yes' : 'No'}</p>
                {!profile.isMedicallyRetired && profile.retirementPayAmount > 0 && (
                  <p><strong>Monthly Retirement Pay:</strong> ${profile.retirementPayAmount.toLocaleString()}</p>
                )}
                {profile.isMedicallyRetired && profile.crscMayQualify && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-400">
                    <p className="font-semibold text-green-900">✅ May Qualify for CRSC</p>
                    <p className="text-sm text-green-800 mt-1">
                      Based on screening, you may be eligible for Combat-Related Special Compensation
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Disabilities</h3>
              <p className="text-3xl font-black text-green-700 mb-4">{profile.vaDisabilityRating}% Combined Rating</p>
              <div className="space-y-2">
                {profile.serviceConnectedConditions.map((c, i) => (
                  <p key={i}>• {c.name}: <strong>{c.rating}%</strong></p>
                ))}
              </div>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Dependents</h3>
              <p><strong>Married:</strong> {profile.isMarried ? 'Yes' : 'No'}</p>
              <p><strong>Children:</strong> {profile.numberOfChildren}</p>
              <p><strong>Dependents in School:</strong> {profile.hasDependentsInSchool ? 'Yes' : 'No'}</p>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 You're All Set!</h3>
              <p className="text-gray-700 mb-4">
                Based on your profile, we'll show you personalized benefits including VA compensation,
                SMC, DEA, housing grants, and more on your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={step === 1}
          className="px-8 py-4 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-green-700 transition shadow-lg"
        >
          {step === 5 ? '🚀 Go to Dashboard' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
