/**
 * Document Intelligence Layer - DD-214 Extractor
 *
 * Extracts structured data from DD-214 (Member 4 copy) using OCR and pattern matching.
 * Auto-populates veteran profile and triggers integrity checks.
 *
 * Phase A - Step A2: Document Intelligence
 */

export interface DD214Data {
  // Basic Information
  name?: {
    first: string;
    middle?: string;
    last: string;
  };
  ssn?: string;
  branch: string;
  grade?: string; // E-5, O-3, etc.
  rank?: string; // Sergeant, Captain, etc.

  // Service Dates
  entryDate: Date;
  separationDate: Date;
  totalActiveService?: string; // "4 years 2 months 15 days"

  // Service Characterization
  characterOfService: 'Honorable' | 'General' | 'OTH' | 'Bad Conduct' | 'Dishonorable' | 'Entry Level Separation';
  separationAuthority?: string;
  separationCode?: string;
  reentryCode?: string;
  narrativeReasonForSeparation?: string;

  // MOS/AFSC/Rating
  primarySpecialty?: {
    code: string;
    title: string;
  };

  // Assignments and Deployments
  assignments?: string[];
  campaigns?: string[];

  // Awards and Decorations
  awards?: string[];

  // Education
  militaryEducation?: string[];

  // Reserve/Guard Information
  reserveObligation?: {
    endDate: Date;
    componentRequirement: string;
  };

  // Document metadata
  extractedAt: Date;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

/**
 * Extract data from DD-214 document
 * In production, this would use OCR (Tesseract, Azure Form Recognizer, AWS Textract)
 * For demo purposes, we'll simulate extraction
 */
export async function extractDD214Data(file: File): Promise<DD214Data> {
  console.log('Extracting DD-214 data from:', file.name);

  // In production: OCR extraction
  // const ocrResult = await performOCR(file);
  // const extractedData = parseDD214Fields(ocrResult);

  // Demo: Return mock extracted data
  // This simulates successful extraction of a real DD-214
  return {
    name: {
      first: 'John',
      middle: 'A',
      last: 'Smith',
    },
    branch: 'Army',
    grade: 'E-5',
    rank: 'Sergeant',
    entryDate: new Date('2015-06-15'),
    separationDate: new Date('2019-08-30'),
    totalActiveService: '4 years 2 months 15 days',
    characterOfService: 'Honorable',
    separationAuthority: 'AR 635-200',
    separationCode: 'JFF',
    reentryCode: 'RE-1',
    narrativeReasonForSeparation: 'End of Active Service Obligation',
    primarySpecialty: {
      code: '11B',
      title: 'Infantryman',
    },
    assignments: [
      '3rd Infantry Division, Fort Stewart, GA',
      '173rd Airborne Brigade, Vicenza, Italy',
    ],
    campaigns: [
      'Operation Inherent Resolve',
      'NATO Deterrence',
    ],
    awards: [
      'Army Commendation Medal',
      'Army Achievement Medal (2)',
      'Good Conduct Medal',
      'National Defense Service Medal',
      'Afghanistan Campaign Medal',
      'Global War on Terrorism Service Medal',
    ],
    extractedAt: new Date(),
    confidence: 'high',
    warnings: [],
  };
}

/**
 * Extract data from DD-214 image/PDF using OCR
 * This is a placeholder for actual OCR implementation
 */
async function performOCR(file: File): Promise<string> {
  // Production implementation would use:
  // - Azure Form Recognizer (recommended for DD-214s)
  // - AWS Textract
  // - Google Cloud Vision
  // - Tesseract.js (open source, client-side)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('OCR text would be here');
    }, 1000);
  });
}

/**
 * Parse DD-214 field patterns from OCR text
 */
function parseDD214Fields(ocrText: string): Partial<DD214Data> {
  // This would use regex patterns to extract specific fields
  // DD-214 has standardized boxes and field numbers

  const data: Partial<DD214Data> = {};

  // Example pattern matching (production would be more sophisticated)
  // Box 12a: Branch of Service
  const branchMatch = ocrText.match(/Branch.*?(Army|Navy|Air Force|Marine Corps|Coast Guard|Space Force)/i);
  if (branchMatch) {
    data.branch = branchMatch[1];
  }

  // Box 24: Character of Service
  const characterMatch = ocrText.match(/Character.*?(Honorable|General|OTH)/i);
  if (characterMatch) {
    data.characterOfService = characterMatch[1] as any;
  }

  // More field extractions...

  return data;
}

/**
 * Validate extracted DD-214 data
 */
export function validateDD214Data(data: DD214Data): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!data.branch) {
    errors.push('Branch of service is required');
  }

  if (!data.entryDate) {
    errors.push('Entry date is required');
  }

  if (!data.separationDate) {
    errors.push('Separation date is required');
  }

  if (!data.characterOfService) {
    errors.push('Character of service is required');
  }

  // Date logic validations
  if (data.entryDate && data.separationDate && data.separationDate <= data.entryDate) {
    errors.push('Separation date must be after entry date');
  }

  // Warnings for missing optional but helpful fields
  if (!data.primarySpecialty) {
    warnings.push('MOS/AFSC/Rating not found - manual entry recommended for better job matching');
  }

  if (!data.rank) {
    warnings.push('Rank not found - manual entry recommended');
  }

  if (!data.awards || data.awards.length === 0) {
    warnings.push('No awards detected - they may be useful for employment and claims');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Map DD-214 data to Digital Twin structure
 */
export function mapDD214ToDigitalTwin(dd214Data: DD214Data): Partial<any> {
  return {
    branch: dd214Data.branch,
    rank: dd214Data.rank || dd214Data.grade,
    mos: dd214Data.primarySpecialty?.code,
    mosTitle: dd214Data.primarySpecialty?.title,
    entryDate: dd214Data.entryDate,
    separationDate: dd214Data.separationDate,
    characterOfService: dd214Data.characterOfService,
    totalService: dd214Data.totalActiveService,
    deployments: dd214Data.campaigns?.map(campaign => ({
      location: campaign,
      startDate: null,
      endDate: null,
      unit: null,
      documentedBy: ['DD-214'],
    })),
    awards: dd214Data.awards,
    documents: {
      dd214: {
        uploaded: true,
        uploadedAt: dd214Data.extractedAt,
        extractedData: dd214Data,
        verified: true,
      },
    },
  };
}

/**
 * Detect service era from DD-214 dates
 */
export function detectServiceEra(dd214Data: DD214Data): string {
  const sepDate = dd214Data.separationDate;

  if (sepDate >= new Date('2001-09-11')) {
    return 'Post-9/11';
  } else if (sepDate >= new Date('1990-08-02') && sepDate <= new Date('1991-02-28')) {
    return 'Gulf War';
  } else if (sepDate >= new Date('1964-08-05') && sepDate <= new Date('1975-05-07')) {
    return 'Vietnam Era';
  } else if (sepDate >= new Date('1950-06-27') && sepDate <= new Date('1955-01-31')) {
    return 'Korean War';
  } else {
    return 'Peacetime';
  }
}

/**
 * Detect potential exposure patterns from DD-214
 */
export function detectExposurePatterns(dd214Data: DD214Data): {
  pattern: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}[] {
  const patterns = [];

  // Check campaigns for known exposures
  if (dd214Data.campaigns) {
    for (const campaign of dd214Data.campaigns) {
      if (campaign.toLowerCase().includes('iraq') || campaign.toLowerCase().includes('inherent resolve')) {
        patterns.push({
          pattern: 'Burn Pit Exposure',
          confidence: 'high' as const,
          description: 'Service in Iraq/Southwest Asia may involve burn pit exposure (PACT Act presumptive)',
        });
      }

      if (campaign.toLowerCase().includes('afghanistan') || campaign.toLowerCase().includes('freedom')) {
        patterns.push({
          pattern: 'Burn Pit Exposure',
          confidence: 'high' as const,
          description: 'Service in Afghanistan may involve burn pit exposure (PACT Act presumptive)',
        });
      }

      if (campaign.toLowerCase().includes('vietnam')) {
        patterns.push({
          pattern: 'Agent Orange Exposure',
          confidence: 'high' as const,
          description: 'Vietnam service may involve Agent Orange exposure (presumptive conditions apply)',
        });
      }
    }
  }

  // Check service era
  const era = detectServiceEra(dd214Data);
  if (era === 'Post-9/11') {
    patterns.push({
      pattern: 'Combat-Related PTSD',
      confidence: 'medium' as const,
      description: 'Post-9/11 combat veterans should consider PTSD screening and claims',
    });
  }

  return patterns;
}

/**
 * Calculate GI Bill eligibility from DD-214
 */
export function calculateGIBillEligibility(dd214Data: DD214Data): {
  program: string;
  percentage: number;
  monthsAvailable: number;
  notes: string;
} {
  const era = detectServiceEra(dd214Data);

  if (era === 'Post-9/11' && dd214Data.characterOfService === 'Honorable') {
    // Calculate Post-9/11 percentage based on service length
    const entryDate = dd214Data.entryDate;
    const sepDate = dd214Data.separationDate;
    const monthsServed = Math.floor((sepDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    let percentage = 0;
    if (monthsServed >= 36) {
      percentage = 100;
    } else if (monthsServed >= 30) {
      percentage = 90;
    } else if (monthsServed >= 24) {
      percentage = 80;
    } else if (monthsServed >= 18) {
      percentage = 70;
    } else if (monthsServed >= 12) {
      percentage = 60;
    } else if (monthsServed >= 90 / 30) {
      percentage = 50;
    } else {
      percentage = 40;
    }

    return {
      program: 'Post-9/11 GI Bill',
      percentage,
      monthsAvailable: 36,
      notes: `Based on ${monthsServed} months of active duty service`,
    };
  }

  return {
    program: 'MGIB or Other',
    percentage: 100,
    monthsAvailable: 36,
    notes: 'Additional review needed for pre-9/11 service',
  };
}
