/**
 * Legal Rights Domain Service (Educational)
 * Educational content on workplace rights, USERRA, ADA, etc.
 * NO LEGAL ADVICE - EDUCATIONAL ONLY
 */

export interface LegalRightsGuide {
  id: string;
  title: string;
  description: string;
  law: string;
  keyPoints: string[];
  yourRights: string[];
  yourResponsibilities: string[];
  exemptions: string[];
  officialResources: string[];
  legalAidResources: string[];
}

export interface DisputeResource {
  name: string;
  type: 'legal_aid' | 'pro_bono' | 'government_agency' | 'advocacy_group';
  description: string;
  phone: string;
  website: string;
  serviceArea: string;
  languages: string[];
}

export interface DocumentationTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  whenToUse: string;
  disclaimer: string;
}

export interface ILegalRightsService {
  // Educational Resources
  getUSERRAInformation(): Promise<LegalRightsGuide>;
  getADAInformation(): Promise<LegalRightsGuide>;
  getAFCBACInformation(): Promise<LegalRightsGuide>;
  getWhistleblowerProtections(): Promise<LegalRightsGuide>;
  getEmploymentRights(): Promise<LegalRightsGuide[]>;

  // Resource Discovery
  findLegalAid(veteranId: string): Promise<DisputeResource[]>;
  findProBonoLawyers(specialty: string): Promise<DisputeResource[]>;
  getGovernmentAgencies(): Promise<DisputeResource[]>;

  // Information
  searchLegalTopics(query: string): Promise<LegalRightsGuide[]>;
  getDocumentTemplates(category: string): Promise<DocumentationTemplate[]>;

  // Disclaimer
  getFullLegalDisclaimer(): Promise<string>;
}
