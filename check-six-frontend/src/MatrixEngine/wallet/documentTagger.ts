/**
 * Digital Wallet - Document Tagger
 * Auto-tags uploaded documents based on content and filename
 */

export interface Document {
  id: string;
  filename: string;
  uploadDate: Date;
  fileType: string; // pdf, jpg, png, etc.
  size: number; // bytes
  tags: string[];
  autoExtractedData?: {
    dates?: string[];
    names?: string[];
    ratings?: string[];
    conditions?: string[];
    claimNumbers?: string[];
  };
}

export type DocumentType =
  | 'DD214'
  | 'Rating Decision'
  | 'Rating Letter'
  | 'Medical Record'
  | 'Lay Statement'
  | 'Buddy Statement'
  | 'Evidence'
  | 'Award Certificate'
  | 'Deployment Orders'
  | 'Claim Form'
  | 'Appeal Form'
  | 'CRSC Document'
  | 'Housing Document'
  | 'Employment Document'
  | 'Education Document'
  | 'Other';

export interface TaggingResult {
  documentType: DocumentType;
  suggestedTags: string[];
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * Auto-tags a document based on filename and content analysis
 * @param filename - Name of the uploaded file
 * @param content - Optional text content extracted from document (for OCR/text PDFs)
 * @returns Tagging result with suggested document type and tags
 */
export function autoTagDocument(
  filename: string,
  content?: string
): TaggingResult {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content?.toLowerCase() || '';

  // DD214 Detection
  if (
    lowerFilename.includes('dd214') ||
    lowerFilename.includes('dd-214') ||
    lowerContent.includes('certificate of release or discharge') ||
    lowerContent.includes('dd form 214')
  ) {
    return {
      documentType: 'DD214',
      suggestedTags: ['DD214', 'Service Record', 'Discharge'],
      confidence: 0.95,
      reasoning: 'Filename or content indicates DD214',
    };
  }

  // Rating Decision/Letter Detection
  if (
    lowerFilename.includes('rating') ||
    lowerContent.includes('rating decision') ||
    lowerContent.includes('department of veterans affairs') && lowerContent.includes('rating')
  ) {
    return {
      documentType: 'Rating Decision',
      suggestedTags: ['Rating Decision', 'VA Decision', 'Benefits'],
      confidence: 0.9,
      reasoning: 'Filename or content indicates VA rating decision',
    };
  }

  // Medical Records
  if (
    lowerFilename.includes('medical') ||
    lowerFilename.includes('exam') ||
    lowerFilename.includes('cp exam') ||
    lowerContent.includes('medical examination') ||
    lowerContent.includes('diagnosis')
  ) {
    return {
      documentType: 'Medical Record',
      suggestedTags: ['Medical Record', 'Evidence'],
      confidence: 0.85,
      reasoning: 'Filename or content indicates medical documentation',
    };
  }

  // Lay Statement
  if (
    lowerFilename.includes('lay statement') ||
    lowerFilename.includes('laystatement') ||
    lowerContent.includes('i declare under penalty of perjury') ||
    lowerContent.includes('lay statement')
  ) {
    return {
      documentType: 'Lay Statement',
      suggestedTags: ['Lay Statement', 'Evidence', 'Personal Statement'],
      confidence: 0.9,
      reasoning: 'Filename or content indicates lay statement',
    };
  }

  // Buddy Statement
  if (
    lowerFilename.includes('buddy statement') ||
    lowerFilename.includes('witness statement') ||
    lowerContent.includes('buddy statement')
  ) {
    return {
      documentType: 'Buddy Statement',
      suggestedTags: ['Buddy Statement', 'Evidence', 'Witness Statement'],
      confidence: 0.9,
      reasoning: 'Filename or content indicates buddy statement',
    };
  }

  // Award/Certificate
  if (
    lowerFilename.includes('award') ||
    lowerFilename.includes('certificate') ||
    lowerFilename.includes('medal') ||
    lowerContent.includes('awarded') ||
    lowerContent.includes('commendation')
  ) {
    return {
      documentType: 'Award Certificate',
      suggestedTags: ['Award', 'Certificate', 'Service Record'],
      confidence: 0.8,
      reasoning: 'Filename or content indicates award/certificate',
    };
  }

  // Deployment Orders
  if (
    lowerFilename.includes('order') ||
    lowerFilename.includes('deployment') ||
    lowerContent.includes('deployment orders') ||
    lowerContent.includes('temporary duty')
  ) {
    return {
      documentType: 'Deployment Orders',
      suggestedTags: ['Deployment', 'Orders', 'Service Record'],
      confidence: 0.85,
      reasoning: 'Filename or content indicates deployment orders',
    };
  }

  // Claim Forms
  if (
    lowerFilename.includes('526') ||
    lowerFilename.includes('claim') ||
    lowerContent.includes('va form 21-526')
  ) {
    return {
      documentType: 'Claim Form',
      suggestedTags: ['Claim', 'VA Form'],
      confidence: 0.9,
      reasoning: 'Filename or content indicates VA claim form',
    };
  }

  // Appeal Forms
  if (
    lowerFilename.includes('appeal') ||
    lowerFilename.includes('nod') ||
    lowerFilename.includes('notice of disagreement') ||
    lowerContent.includes('appeal')
  ) {
    return {
      documentType: 'Appeal Form',
      suggestedTags: ['Appeal', 'NOD', 'VA Form'],
      confidence: 0.9,
      reasoning: 'Filename or content indicates appeal documentation',
    };
  }

  // Default: Generic Evidence
  return {
    documentType: 'Evidence',
    suggestedTags: ['Evidence', 'Document'],
    confidence: 0.5,
    reasoning: 'Unable to determine specific document type',
  };
}

/**
 * Extracts metadata from document content (dates, names, ratings, etc.)
 * This is a simplified version - in production, use OCR + NLP
 */
export function extractMetadata(content: string): Document['autoExtractedData'] {
  const metadata: Document['autoExtractedData'] = {};

  // Extract dates (MM/DD/YYYY or YYYY-MM-DD)
  const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g;
  const dates = content.match(dateRegex);
  if (dates) {
    metadata.dates = [...new Set(dates)]; // Remove duplicates
  }

  // Extract ratings (e.g., "50%", "100% P&T")
  const ratingRegex = /\b(\d{1,3})%\s*(P&T|service[- ]connected)?/gi;
  const ratings = content.match(ratingRegex);
  if (ratings) {
    metadata.ratings = [...new Set(ratings)];
  }

  // Extract claim numbers (e.g., "Claim #123456789")
  const claimRegex = /claim\s*#?\s*(\d{6,})/gi;
  const claimMatches = content.matchAll(claimRegex);
  const claimNumbers = [];
  for (const match of claimMatches) {
    claimNumbers.push(match[1]);
  }
  if (claimNumbers.length > 0) {
    metadata.claimNumbers = [...new Set(claimNumbers)];
  }

  // Extract common condition names (simplified list)
  const commonConditions = [
    'tinnitus',
    'ptsd',
    'anxiety',
    'depression',
    'sleep apnea',
    'knee',
    'back',
    'shoulder',
    'hearing loss',
    'migraine',
    'hypertension',
  ];

  const foundConditions: string[] = [];
  const lowerContent = content.toLowerCase();
  for (const condition of commonConditions) {
    if (lowerContent.includes(condition)) {
      foundConditions.push(condition);
    }
  }
  if (foundConditions.length > 0) {
    metadata.conditions = foundConditions;
  }

  return metadata;
}

/**
 * Generates tag suggestions based on veteran profile and document context
 */
export function suggestTags(
  document: Document,
  veteranProfile?: {
    serviceConnectedConditions?: Array<{ condition: string }>;
    claimHistory?: Array<{ claimNumber: string }>;
  }
): string[] {
  const suggestions: string[] = [...document.tags];

  // Add condition tags if document mentions veteran's conditions
  if (veteranProfile?.serviceConnectedConditions && document.autoExtractedData?.conditions) {
    for (const profileCondition of veteranProfile.serviceConnectedConditions) {
      for (const docCondition of document.autoExtractedData.conditions) {
        if (profileCondition.condition.toLowerCase().includes(docCondition)) {
          if (!suggestions.includes(profileCondition.condition)) {
            suggestions.push(profileCondition.condition);
          }
        }
      }
    }
  }

  // Add claim number tags
  if (document.autoExtractedData?.claimNumbers) {
    for (const claimNum of document.autoExtractedData.claimNumbers) {
      const tag = `Claim #${claimNum}`;
      if (!suggestions.includes(tag)) {
        suggestions.push(tag);
      }
    }
  }

  return suggestions;
}
