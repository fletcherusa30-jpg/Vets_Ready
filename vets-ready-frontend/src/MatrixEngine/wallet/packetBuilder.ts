/**
 * Digital Wallet - Packet Builder
 * Assembles documents into organized packets for claims, appeals, CRSC, etc.
 */

import type { Document } from './documentTagger';

export type PacketType =
  | 'Initial Claim'
  | 'Supplemental Claim'
  | 'Appeal (NOD)'
  | 'Appeal (Supplemental)'
  | 'CRSC Application'
  | 'Discharge Upgrade'
  | 'Increase Request'
  | 'Housing Application'
  | 'Custom';

export interface Packet {
  id: string;
  type: PacketType;
  name: string;
  createdDate: Date;
  documents: Document[];
  coverSheet?: {
    veteranName: string;
    ssn?: string; // Last 4 only
    fileNumber?: string;
    claimType: string;
    conditions?: string[];
    dateSubmitted?: Date;
  };
  status: 'Draft' | 'Ready' | 'Submitted';
  notes?: string;
}

export interface PacketTemplate {
  type: PacketType;
  name: string;
  description: string;
  requiredDocuments: string[];
  optionalDocuments: string[];
  instructions: string[];
}

/**
 * Pre-defined packet templates
 */
export const PACKET_TEMPLATES: PacketTemplate[] = [
  {
    type: 'Initial Claim',
    name: 'Initial VA Disability Claim',
    description: 'Submit your first claim for service-connected disabilities',
    requiredDocuments: [
      'DD214',
      'VA Form 21-526EZ (Claim Form)',
    ],
    optionalDocuments: [
      'Medical Records',
      'Lay Statement',
      'Buddy Statement',
      'Deployment Orders',
      'Award Certificates',
    ],
    instructions: [
      '1. Complete VA Form 21-526EZ',
      '2. Include your DD214',
      '3. Add medical evidence for each condition',
      '4. Include lay statements describing symptoms',
      '5. Submit via VA.gov, mail, or VSO',
    ],
  },
  {
    type: 'Supplemental Claim',
    name: 'Supplemental Claim with New Evidence',
    description: 'Submit new evidence for a previously denied condition',
    requiredDocuments: [
      'VA Form 20-0995',
      'New Medical Evidence',
    ],
    optionalDocuments: [
      'Lay Statement',
      'Buddy Statement',
      'Previous Rating Decision',
    ],
    instructions: [
      '1. Complete VA Form 20-0995',
      '2. Identify which conditions you\'re contesting',
      '3. Include all new and relevant evidence',
      '4. Explain how the new evidence supports your claim',
      '5. Submit within one year of decision for protected effective date',
    ],
  },
  {
    type: 'Appeal (NOD)',
    name: 'Notice of Disagreement (Higher-Level Review)',
    description: 'Appeal a VA decision with a higher-level reviewer',
    requiredDocuments: [
      'VA Form 20-0996',
      'Previous Rating Decision',
    ],
    optionalDocuments: [
      'Written argument',
    ],
    instructions: [
      '1. Complete VA Form 20-0996',
      '2. Include the decision you\'re appealing',
      '3. No new evidence allowed in Higher-Level Review',
      '4. Submit within one year of decision',
    ],
  },
  {
    type: 'CRSC Application',
    name: 'CRSC Application Packet',
    description: 'Apply for Combat-Related Special Compensation',
    requiredDocuments: [
      'DD214',
      'CRSC Narrative',
      'Rating Decision',
    ],
    optionalDocuments: [
      'Deployment Orders',
      'Award Certificates',
      'Medical Records',
      'Lay Statement',
    ],
    instructions: [
      '1. Complete branch-specific CRSC form',
      '2. Include narrative linking injuries to combat',
      '3. Provide deployment orders and awards',
      '4. Include VA rating decision showing 10%+ rating',
      '5. Submit to branch retirement/finance center',
    ],
  },
  {
    type: 'Discharge Upgrade',
    name: 'Discharge Upgrade Application',
    description: 'Request upgrade to discharge characterization',
    requiredDocuments: [
      'DD214',
      'DD Form 293 or 149',
      'Discharge Upgrade Narrative',
    ],
    optionalDocuments: [
      'Medical Records',
      'Mental Health Documentation',
      'Character References',
      'Lay Statement',
    ],
    instructions: [
      '1. Determine which form: DD293 (within 15 years) or DD149 (after 15 years)',
      '2. Complete form explaining reason for upgrade',
      '3. Include evidence of mitigating factors (PTSD, TBI, MST, etc.)',
      '4. Provide character references',
      '5. Submit to Board for Correction of Military Records',
    ],
  },
  {
    type: 'Increase Request',
    name: 'Rating Increase Request',
    description: 'Request increase for existing service-connected condition',
    requiredDocuments: [
      'VA Form 21-526EZ',
      'New Medical Evidence',
    ],
    optionalDocuments: [
      'Lay Statement',
      'Symptom Log',
      'Buddy Statement',
    ],
    instructions: [
      '1. Complete VA Form 21-526EZ',
      '2. Check "Request to Increase Existing Condition"',
      '3. Provide recent medical evidence showing worsening',
      '4. Include lay statement describing increased impact',
      '5. Document functional limitations',
    ],
  },
];

/**
 * Creates a new packet from a template
 */
export function createPacketFromTemplate(
  template: PacketTemplate,
  veteranName: string
): Packet {
  return {
    id: `packet-${Date.now()}`,
    type: template.type,
    name: template.name,
    createdDate: new Date(),
    documents: [],
    coverSheet: {
      veteranName,
      claimType: template.type,
    },
    status: 'Draft',
  };
}

/**
 * Adds a document to a packet
 */
export function addDocumentToPacket(packet: Packet, document: Document): Packet {
  return {
    ...packet,
    documents: [...packet.documents, document],
  };
}

/**
 * Removes a document from a packet
 */
export function removeDocumentFromPacket(packet: Packet, documentId: string): Packet {
  return {
    ...packet,
    documents: packet.documents.filter(doc => doc.id !== documentId),
  };
}

/**
 * Checks if packet has all required documents
 */
export function validatePacket(packet: Packet): {
  isValid: boolean;
  missingDocuments: string[];
  warnings: string[];
} {
  const template = PACKET_TEMPLATES.find(t => t.type === packet.type);

  if (!template) {
    return {
      isValid: true, // Custom packet, no validation
      missingDocuments: [],
      warnings: [],
    };
  }

  const missingDocuments: string[] = [];
  const warnings: string[] = [];

  // Check required documents
  for (const requiredDoc of template.requiredDocuments) {
    const hasDoc = packet.documents.some(doc =>
      doc.tags.some(tag =>
        tag.toLowerCase().includes(requiredDoc.toLowerCase())
      )
    );

    if (!hasDoc) {
      missingDocuments.push(requiredDoc);
    }
  }

  // Check for common issues
  if (packet.documents.length === 0) {
    warnings.push('Packet has no documents');
  }

  if (!packet.coverSheet?.veteranName) {
    warnings.push('Missing veteran name on cover sheet');
  }

  return {
    isValid: missingDocuments.length === 0,
    missingDocuments,
    warnings,
  };
}

/**
 * Generates a cover sheet for the packet
 */
export function generateCoverSheet(packet: Packet): string {
  const template = PACKET_TEMPLATES.find(t => t.type === packet.type);

  let coverSheet = `
═══════════════════════════════════════════════════════════
                    ${packet.type.toUpperCase()}
═══════════════════════════════════════════════════════════

Veteran Name: ${packet.coverSheet?.veteranName || '[Not Provided]'}
${packet.coverSheet?.ssn ? `SSN (Last 4): ***-**-${packet.coverSheet.ssn}` : ''}
${packet.coverSheet?.fileNumber ? `VA File Number: ${packet.coverSheet.fileNumber}` : ''}

Packet Name: ${packet.name}
Date Created: ${packet.createdDate.toLocaleDateString()}
${packet.coverSheet?.dateSubmitted ? `Date Submitted: ${packet.coverSheet.dateSubmitted.toLocaleDateString()}` : ''}

${packet.coverSheet?.conditions ? `
Conditions Claimed:
${packet.coverSheet.conditions.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
` : ''}

INCLUDED DOCUMENTS (${packet.documents.length}):
${packet.documents.map((doc, i) => `  ${i + 1}. ${doc.filename} (${doc.tags.join(', ')})`).join('\n')}

${template ? `
INSTRUCTIONS:
${template.instructions.map((inst, i) => `  ${inst}`).join('\n')}
` : ''}

${packet.notes ? `
NOTES:
${packet.notes}
` : ''}

═══════════════════════════════════════════════════════════
                  VetsReady Digital Wallet
           This packet was assembled for educational
            purposes only and does not constitute
              legal or medical advice. Consult
               with a VSO or attorney before
                 submitting to the VA.
═══════════════════════════════════════════════════════════
  `;

  return coverSheet.trim();
}

/**
 * Exports packet to downloadable format (mock - in production, generate PDF)
 */
export function exportPacket(packet: Packet): {
  coverSheet: string;
  documentList: Array<{ filename: string; tags: string[] }>;
  metadata: {
    packetId: string;
    type: PacketType;
    createdDate: Date;
    totalDocuments: number;
  };
} {
  return {
    coverSheet: generateCoverSheet(packet),
    documentList: packet.documents.map(doc => ({
      filename: doc.filename,
      tags: doc.tags,
    })),
    metadata: {
      packetId: packet.id,
      type: packet.type,
      createdDate: packet.createdDate,
      totalDocuments: packet.documents.length,
    },
  };
}
