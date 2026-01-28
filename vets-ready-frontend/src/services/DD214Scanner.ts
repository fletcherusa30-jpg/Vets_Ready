/**
 * DD214 Scanner Service
 *
 * Extracts veteran service information from DD214 documents.
 * Non-destructive: all extractions must be reviewed and confirmed by veteran.
 *
 * Legal Compliance:
 * - Does NOT file claims or transmit data
 * - Educational and preparatory only
 * - All extractions are suggestions, not absolute truth
 */

export interface DD214ExtractedData {
  // Core Service Information
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marine Corps' | 'Coast Guard' | 'Space Force' | '';
  entryDate: string;
  separationDate: string;
  characterOfService: string; // Honorable, General, etc.

  // Separation Details
  separationCode: string;
  narrativeReasonForSeparation: string;

  // Rank & Pay
  payGrade: string;
  rank: string;

  // Awards & Decorations
  awards: string[];

  // Combat Indicators
  combatIndicators: string[];
  hasCombatService: boolean;
  deploymentLocations: string[];

  // Military Occupational Specialty (MOS)
  mosCode: string;
  mosTitle: string;
  specialties: string[];
  skillIdentifiers: string[];

  // Job Placement Data
  suggestedCivilianJobs: string[];
  matchedSkills: string[];
  certificationRecommendations: string[];

  // Extraction Metadata
  extractionConfidence: 'high' | 'medium' | 'low';
  extractedFields: string[];
  extractionLog: string[];
  requiresReview: boolean;
}

/**
 * Extract data from DD214 document
 *
 * NOW USES BACKEND API WITH FULL OCR SUPPORT
 *
 * @param file - Uploaded DD214 file (PDF or image)
 * @param veteranId - Optional veteran ID for file organization
 * @returns Extracted data object
 */
export async function extractDD214Data(
  file: File,
  veteranId?: string
): Promise<DD214ExtractedData> {
  const extractionLog: string[] = [];
  extractionLog.push(`Starting DD214 extraction for file: ${file.name}`);
  extractionLog.push(`File size: ${file.size} bytes`);
  extractionLog.push(`File type: ${file.type}`);

  try {
    // Validate file before upload
    if (file.size === 0) {
      throw new Error('File is empty (0 bytes). Please select a valid DD-214 file.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Please upload PDF, JPG, PNG, or TIFF.`);
    }

    extractionLog.push('✓ File validation passed');

    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);
    if (veteranId) {
      formData.append('veteran_id', veteranId);
    }

    extractionLog.push('Uploading to backend API...');

    const uploadResponse = await fetch('http://localhost:8000/api/dd214/upload', {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const uploadResult = await uploadResponse.json();
    const jobId = uploadResult.job_id;

    extractionLog.push(`✓ Upload successful (Job ID: ${jobId})`);
    extractionLog.push(`File saved to: ${uploadResult.file_path}`);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (2 sec intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(`http://localhost:8000/api/dd214/status/${jobId}`);

      if (!statusResponse.ok) {
        throw new Error('Failed to check extraction status');
      }

      const status = await statusResponse.json();

      extractionLog.push(`Status: ${status.status} (${status.progress}%) - ${status.message}`);

      if (status.status === 'completed') {
        // Get final result
        const resultResponse = await fetch(`http://localhost:8000/api/dd214/result/${jobId}`);

        if (!resultResponse.ok) {
          throw new Error('Failed to retrieve extraction result');
        }

        const backendResult = await resultResponse.json();

        // Map backend result to frontend interface
        const result: DD214ExtractedData = {
          branch: backendResult.branch || '',
          entryDate: backendResult.entryDate || '',
          separationDate: backendResult.separationDate || '',
          characterOfService: backendResult.characterOfService || '',
          separationCode: backendResult.separationCode || '',
          narrativeReasonForSeparation: backendResult.narrativeReasonForSeparation || '',
          payGrade: backendResult.payGrade || '',
          rank: backendResult.rank || '',
          awards: backendResult.awards || [],
          combatIndicators: backendResult.combatIndicators || [],
          hasCombatService: backendResult.hasCombatService || false,
          extractionConfidence: backendResult.extractionConfidence || 'low',
          extractedFields: backendResult.extractedFields || [],
          extractionLog: [...extractionLog, ...backendResult.extractionLog],
          requiresReview: backendResult.requiresReview !== false,
          // MOS and job placement fields
          mosCode: backendResult.mosCode || '',
          mosTitle: backendResult.mosTitle || '',
          specialties: backendResult.specialties || [],
          skillIdentifiers: backendResult.skillIdentifiers || [],
          suggestedCivilianJobs: backendResult.suggestedCivilianJobs || [],
          matchedSkills: backendResult.matchedSkills || [],
          certificationRecommendations: backendResult.certificationRecommendations || [],
          deploymentLocations: backendResult.deploymentLocations || []
        };

        // CRITICAL: Validate extraction success
        if (backendResult.textLength === 0) {
          throw new Error(
            'Extraction failed: No text could be read from the document. ' +
            'Please ensure the file is a valid DD-214 and try again.'
          );
        }

        if (backendResult.textLength < 200) {
          throw new Error(
            `Extraction failed: Only ${backendResult.textLength} characters extracted (minimum 200 required). ` +
            'Please upload a clearer copy or verify the file is a DD-214.'
          );
        }

        if (backendResult.extractedFields.length === 0) {
          throw new Error(
            'Extraction failed: No DD-214 fields could be identified. ' +
            'Please verify the file is a DD-214 and upload a clearer copy if needed.'
          );
        }

        result.extractionLog.push('✅ Extraction complete and validated');
        result.extractionLog.push(`Text extracted: ${backendResult.textLength} characters`);
        result.extractionLog.push(`OCR used: ${backendResult.ocrAttempted ? 'Yes' : 'No'}`);
        result.extractionLog.push(`Fields found: ${backendResult.extractedFields.length}`);
        result.extractionLog.push(`Confidence: ${backendResult.extractionConfidence}`);

        // Log MOS and job placement data
        if (result.mosCode) {
          result.extractionLog.push(`\n🎖️ MOS Detected: ${result.mosCode} - ${result.mosTitle}`);
          console.log('MOS:', result.mosCode, '-', result.mosTitle);
        }
        if (result.specialties && result.specialties.length > 0) {
          result.extractionLog.push(`Specialties: ${result.specialties.join(', ')}`);
        }
        if (result.suggestedCivilianJobs && result.suggestedCivilianJobs.length > 0) {
          result.extractionLog.push(`\n💼 Suggested Civilian Jobs (${result.suggestedCivilianJobs.length}):`);
          result.suggestedCivilianJobs.forEach(job => {
            result.extractionLog.push(`  • ${job}`);
          });
          console.log('Suggested Jobs:', result.suggestedCivilianJobs);
        }
        if (result.matchedSkills && result.matchedSkills.length > 0) {
          result.extractionLog.push(`\n✨ Matched Civilian Skills: ${result.matchedSkills.join(', ')}`);
          console.log('Skills:', result.matchedSkills);
        }
        if (result.certificationRecommendations && result.certificationRecommendations.length > 0) {
          result.extractionLog.push(`\n📜 Recommended Certifications: ${result.certificationRecommendations.join(', ')}`);
        }
        if (result.deploymentLocations && result.deploymentLocations.length > 0) {
          result.extractionLog.push(`\n🌍 Deployment Locations: ${result.deploymentLocations.join(', ')}`);
          console.log('Deployments:', result.deploymentLocations);
        }

        return result;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || status.message || 'Extraction failed');
      }

      attempts++;
    }

    throw new Error('Extraction timed out. Please try again.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    extractionLog.push(`❌ ERROR: ${errorMessage}`);

    // Log detailed error information
    console.error('DD-214 Extraction Error:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: errorMessage,
      extractionLog
    });

    // Return failed result with error information
    const failedResult: DD214ExtractedData = {
      branch: '',
      entryDate: '',
      separationDate: '',
      characterOfService: '',
      separationCode: '',
      narrativeReasonForSeparation: '',
      payGrade: '',
      rank: '',
      awards: [],
      combatIndicators: [],
      hasCombatService: false,
      extractionConfidence: 'low',
      extractedFields: [],
      extractionLog,
      requiresReview: true
    };

    // Re-throw error with clear message
    throw new Error(
      `We could not read your DD-214. ${errorMessage}. ` +
      'Please check the file and try again, or enter the information manually.'
    );
  }
}

/**
 * Extract text from file (uses backend API with OCR)
 */
async function extractTextFromFile(file: File): Promise<string> {
  // THIS IS NOW HANDLED BY BACKEND - DO NOT USE CLIENT-SIDE
  // This function is deprecated and should not be called
  throw new Error('extractTextFromFile is deprecated. Use backend API instead.');
}

/**
 * Extract branch of service
 */
function extractBranch(text: string): DD214ExtractedData['branch'] {
  const textLower = text.toLowerCase();

  if (textLower.includes('army') || textLower.includes('usa')) return 'Army';
  if (textLower.includes('navy') || textLower.includes('usn')) return 'Navy';
  if (textLower.includes('air force') || textLower.includes('usaf')) return 'Air Force';
  if (textLower.includes('marine') || textLower.includes('usmc')) return 'Marine Corps';
  if (textLower.includes('coast guard') || textLower.includes('uscg')) return 'Coast Guard';
  if (textLower.includes('space force') || textLower.includes('ussf')) return 'Space Force';

  return '';
}

/**
 * Extract service dates
 */
function extractServiceDates(text: string): { entry: string; separation: string } {
  // Simple date pattern matching
  // In production, use more sophisticated date extraction
  const datePattern = /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
  const dates = text.match(datePattern) || [];

  return {
    entry: dates[0] || '',
    separation: dates[1] || ''
  };
}

/**
 * Extract character of service
 */
function extractCharacterOfService(text: string): string {
  const textLower = text.toLowerCase();

  if (textLower.includes('honorable')) return 'Honorable';
  if (textLower.includes('general under honorable')) return 'General Under Honorable Conditions';
  if (textLower.includes('other than honorable')) return 'Other Than Honorable';
  if (textLower.includes('bad conduct')) return 'Bad Conduct';
  if (textLower.includes('dishonorable')) return 'Dishonorable';

  return '';
}

/**
 * Extract separation code and narrative
 */
function extractSeparationInfo(text: string): { code: string; narrative: string } {
  // Common separation codes and narratives
  const codePattern = /(?:separation code|spon code|spd)[:\s]*([A-Z0-9]{3})/i;
  const codeMatch = text.match(codePattern);

  return {
    code: codeMatch?.[1] || '',
    narrative: '' // Would extract from specific DD214 fields
  };
}

/**
 * Extract rank and pay grade
 */
function extractRankInfo(text: string): { payGrade: string; rank: string } {
  // Common pay grades and ranks
  const payGradePattern = /(?:pay grade|grade)[:\s]*(E-[1-9]|O-[1-9]|W-[1-5])/i;
  const payGradeMatch = text.match(payGradePattern);

  return {
    payGrade: payGradeMatch?.[1] || '',
    rank: '' // Would map from pay grade or extract directly
  };
}

/**
 * Extract awards and decorations
 */
function extractAwards(text: string): string[] {
  const awards: string[] = [];
  const textLower = text.toLowerCase();

  // Common awards
  const awardsList = [
    'Purple Heart',
    'Bronze Star',
    'Silver Star',
    'Combat Action Badge',
    'Combat Action Ribbon',
    'Combat Infantryman Badge',
    'Air Medal',
    'Army Commendation Medal',
    'Navy Achievement Medal',
    'Good Conduct Medal',
    'National Defense Service Medal',
    'Afghanistan Campaign Medal',
    'Iraq Campaign Medal'
  ];

  awardsList.forEach(award => {
    if (textLower.includes(award.toLowerCase())) {
      awards.push(award);
    }
  });

  return awards;
}

/**
 * Detect combat indicators
 */
function detectCombatIndicators(text: string, awards: string[]): string[] {
  const indicators: string[] = [];
  const textLower = text.toLowerCase();

  // Combat awards
  const combatAwards = [
    'Purple Heart',
    'Bronze Star',
    'Combat Action Badge',
    'Combat Action Ribbon',
    'Combat Infantryman Badge'
  ];

  combatAwards.forEach(award => {
    if (awards.includes(award)) {
      indicators.push(`${award} (combat award)`);
    }
  });

  // Combat zones
  const combatZones = ['Iraq', 'Afghanistan', 'Vietnam', 'Korea', 'Gulf War'];
  combatZones.forEach(zone => {
    if (textLower.includes(zone.toLowerCase())) {
      indicators.push(`Service in ${zone}`);
    }
  });

  // Combat pay indicators
  if (textLower.includes('hostile fire pay') || textLower.includes('imminent danger pay')) {
    indicators.push('Combat pay received');
  }

  return indicators;
}

/**
 * Calculate extraction confidence
 */
function calculateConfidence(fieldsExtracted: number): 'high' | 'medium' | 'low' {
  if (fieldsExtracted >= 7) return 'high';
  if (fieldsExtracted >= 4) return 'medium';
  return 'low';
}

/**
 * Map extracted data to VeteranProfile
 * Non-destructive: only updates if veteran confirms
 */
export function mapDD214ToProfile(
  extractedData: DD214ExtractedData,
  confirmedFields: string[]
): Partial<any> {
  const updates: any = {};

  if (confirmedFields.includes('branch')) {
    updates.branch = extractedData.branch;
  }
  if (confirmedFields.includes('entryDate')) {
    updates.serviceStartDate = extractedData.entryDate;
  }
  if (confirmedFields.includes('separationDate')) {
    updates.serviceEndDate = extractedData.separationDate;
  }
  if (confirmedFields.includes('combatIndicators')) {
    updates.hasCombatService = extractedData.hasCombatService;
  }

  return updates;
}
