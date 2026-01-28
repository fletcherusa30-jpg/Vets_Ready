/**
 * VETERAN DOCUMENT VAULT (ADVANCED)
 *
 * Expanded document system with tagging, versioning, expiration alerts,
 * secure sharing, and full-text search.
 *
 * INTEGRATIONS:
 * - Digital Twin (document metadata)
 * - GIE (coverage and gaps)
 * - Evidence Builder (evidence sources)
 * - Mission Packs (required documents)
 * - Readiness Index (documentation category)
 */

import { DigitalTwin } from '../types/digitalTwin';

/**
 * Document types
 */
export type DocumentType =
  | 'dd214'
  | 'rating-decision'
  | 'medical-record'
  | 'lay-statement'
  | 'nexus-letter'
  | 'financial'
  | 'identification'
  | 'other';

/**
 * Document structure
 */
export interface VaultDocument {
  id: string;
  name: string;
  type: DocumentType;
  tags: string[];
  uploadedDate: Date;
  version: number;
  versions: DocumentVersion[];
  size: number; // bytes
  mimeType: string;
  url: string;
  extractedText?: string;
  extractedData?: any;
  expirationDate?: Date;
  expirationAlerted?: boolean;
  relatedTo?: string[]; // IDs of related documents or conditions
  sharedWith?: SharedAccess[];
  metadata: Record<string, any>;
}

/**
 * Document version
 */
export interface DocumentVersion {
  versionNumber: number;
  uploadedDate: Date;
  size: number;
  url: string;
  uploadedBy: string;
  note?: string;
}

/**
 * Shared access
 */
export interface SharedAccess {
  sharedWith: string; // Email or ID
  accessLevel: 'view' | 'download';
  sharedDate: Date;
  expiresDate?: Date;
  revoked: boolean;
}

/**
 * Document search filters
 */
export interface DocumentSearchFilters {
  types?: DocumentType[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  expiringSoon?: boolean; // Within 30 days
  searchQuery?: string;
  relatedTo?: string;
}

/**
 * Get all documents
 */
export function getAllDocuments(digitalTwin: DigitalTwin): VaultDocument[] {
  return digitalTwin.documents || [];
}

/**
 * Search documents
 */
export function searchDocuments(
  digitalTwin: DigitalTwin,
  filters: DocumentSearchFilters = {}
): VaultDocument[] {
  let results = getAllDocuments(digitalTwin);

  // Filter by type
  if (filters.types && filters.types.length > 0) {
    results = results.filter(doc => filters.types!.includes(doc.type));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(doc =>
      filters.tags!.some(tag => doc.tags.includes(tag))
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    results = results.filter(doc =>
      doc.uploadedDate >= filters.dateRange!.start &&
      doc.uploadedDate <= filters.dateRange!.end
    );
  }

  // Filter expiring soon
  if (filters.expiringSoon) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    results = results.filter(doc =>
      doc.expirationDate &&
      doc.expirationDate <= thirtyDaysFromNow &&
      doc.expirationDate >= new Date()
    );
  }

  // Full-text search
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    results = results.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (doc.extractedText && doc.extractedText.toLowerCase().includes(query))
    );
  }

  // Filter by related documents/conditions
  if (filters.relatedTo) {
    results = results.filter(doc =>
      doc.relatedTo?.includes(filters.relatedTo!)
    );
  }

  return results;
}

/**
 * Upload document (new or new version)
 */
export function uploadDocument(
  digitalTwin: DigitalTwin,
  document: {
    name: string;
    type: DocumentType;
    tags: string[];
    file: File;
    expirationDate?: Date;
    replaceDocumentId?: string; // If updating existing doc
  }
): VaultDocument {
  const existingDocuments = getAllDocuments(digitalTwin);

  // If replacing, add as new version
  if (document.replaceDocumentId) {
    const existingDoc = existingDocuments.find(d => d.id === document.replaceDocumentId);
    if (existingDoc) {
      const newVersion: DocumentVersion = {
        versionNumber: existingDoc.version + 1,
        uploadedDate: new Date(),
        size: document.file.size,
        url: URL.createObjectURL(document.file),
        uploadedBy: 'user',
      };

      return {
        ...existingDoc,
        name: document.name,
        version: newVersion.versionNumber,
        versions: [...existingDoc.versions, newVersion],
        size: document.file.size,
        uploadedDate: new Date(),
        url: newVersion.url,
      };
    }
  }

  // New document
  const newDoc: VaultDocument = {
    id: `doc-${Date.now()}`,
    name: document.name,
    type: document.type,
    tags: document.tags,
    uploadedDate: new Date(),
    version: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedDate: new Date(),
        size: document.file.size,
        url: URL.createObjectURL(document.file),
        uploadedBy: 'user',
      },
    ],
    size: document.file.size,
    mimeType: document.file.type,
    url: URL.createObjectURL(document.file),
    expirationDate: document.expirationDate,
    metadata: {},
  };

  return newDoc;
}

/**
 * Tag document
 */
export function tagDocument(
  document: VaultDocument,
  tag: string
): VaultDocument {
  if (document.tags.includes(tag)) {
    return document;
  }

  return {
    ...document,
    tags: [...document.tags, tag],
  };
}

/**
 * Remove tag from document
 */
export function removeTagFromDocument(
  document: VaultDocument,
  tag: string
): VaultDocument {
  return {
    ...document,
    tags: document.tags.filter(t => t !== tag),
  };
}

/**
 * Get expiring documents
 */
export function getExpiringDocuments(
  digitalTwin: DigitalTwin,
  daysAhead: number = 30
): VaultDocument[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  return getAllDocuments(digitalTwin).filter(doc =>
    doc.expirationDate &&
    doc.expirationDate <= cutoffDate &&
    doc.expirationDate >= new Date() &&
    !doc.expirationAlerted
  );
}

/**
 * Mark expiration alert sent
 */
export function markExpirationAlerted(
  document: VaultDocument
): VaultDocument {
  return {
    ...document,
    expirationAlerted: true,
  };
}

/**
 * Get documents by tag
 */
export function getDocumentsByTag(
  digitalTwin: DigitalTwin,
  tag: string
): VaultDocument[] {
  return searchDocuments(digitalTwin, { tags: [tag] });
}

/**
 * Get documents for condition
 */
export function getDocumentsForCondition(
  digitalTwin: DigitalTwin,
  conditionId: string
): VaultDocument[] {
  return searchDocuments(digitalTwin, { relatedTo: conditionId });
}

/**
 * Calculate document coverage
 */
export function calculateDocumentCoverage(digitalTwin: DigitalTwin): {
  overallPercentage: number;
  categories: Array<{
    category: string;
    required: string[];
    present: string[];
    missing: string[];
  }>;
} {
  const documents = getAllDocuments(digitalTwin);

  // Required document categories
  const categories = [
    {
      category: 'Service Records',
      required: ['DD-214'],
      present: [] as string[],
      missing: [] as string[],
    },
    {
      category: 'Disability Documentation',
      required: ['Rating Decision Letter', 'C&P Exam Results'],
      present: [] as string[],
      missing: [] as string[],
    },
    {
      category: 'Medical Evidence',
      required: ['Medical Records', 'Treatment History'],
      present: [] as string[],
      missing: [] as string[],
    },
    {
      category: 'Supporting Statements',
      required: ['Personal Statement', 'Lay Statements'],
      present: [] as string[],
      missing: [] as string[],
    },
  ];

  // Check which documents are present
  categories.forEach(cat => {
    cat.required.forEach(reqDoc => {
      const hasDoc = documents.some(doc =>
        doc.tags.includes(reqDoc.toLowerCase().replace(/\s+/g, '-')) ||
        doc.name.toLowerCase().includes(reqDoc.toLowerCase())
      );

      if (hasDoc) {
        cat.present.push(reqDoc);
      } else {
        cat.missing.push(reqDoc);
      }
    });
  });

  // Calculate overall percentage
  const totalRequired = categories.reduce((sum, cat) => sum + cat.required.length, 0);
  const totalPresent = categories.reduce((sum, cat) => sum + cat.present.length, 0);
  const overallPercentage = Math.round((totalPresent / totalRequired) * 100);

  return {
    overallPercentage,
    categories,
  };
}

/**
 * Get suggested tags based on document type and content
 */
export function getSuggestedTags(
  documentType: DocumentType,
  documentName: string,
  extractedText?: string
): string[] {
  const tags: string[] = [];

  // Type-based tags
  switch (documentType) {
    case 'dd214':
      tags.push('dd214', 'service-record', 'military-service');
      break;
    case 'rating-decision':
      tags.push('rating-decision', 'va-decision', 'disability-rating');
      break;
    case 'medical-record':
      tags.push('medical-record', 'medical-evidence', 'healthcare');
      break;
    case 'lay-statement':
      tags.push('lay-statement', 'supporting-evidence', 'personal-statement');
      break;
    case 'nexus-letter':
      tags.push('nexus-letter', 'medical-opinion', 'expert-opinion');
      break;
    case 'financial':
      tags.push('financial-document', 'financial-record');
      break;
    case 'identification':
      tags.push('identification', 'id-document');
      break;
  }

  // Name-based tags
  const nameLower = documentName.toLowerCase();
  if (nameLower.includes('ptsd')) tags.push('ptsd');
  if (nameLower.includes('tbi')) tags.push('tbi');
  if (nameLower.includes('back') || nameLower.includes('spine')) tags.push('back-condition');
  if (nameLower.includes('knee')) tags.push('knee-condition');
  if (nameLower.includes('hearing')) tags.push('hearing-loss');
  if (nameLower.includes('claim')) tags.push('claim-related');
  if (nameLower.includes('appeal')) tags.push('appeal-related');

  // Content-based tags (if extracted text available)
  if (extractedText) {
    const textLower = extractedText.toLowerCase();
    if (textLower.includes('service connection')) tags.push('service-connection');
    if (textLower.includes('compensation')) tags.push('compensation');
    if (textLower.includes('treatment')) tags.push('treatment-record');
    if (textLower.includes('diagnosis')) tags.push('diagnosis');
  }

  return [...new Set(tags)]; // Remove duplicates
}
