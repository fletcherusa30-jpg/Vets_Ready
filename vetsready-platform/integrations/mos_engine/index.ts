/**
 * MOS Engine Integration
 * Interfaces for querying Military Occupational Specialties Intelligence Engine
 */

export interface MOS {
  code: string;
  title: string;
  branch: string;
  description: string;
  skills: string[];
  trainingPath: string;
  civilianiEquivalents: string[];
  industryMatches: string[];
}

export interface IMOSEngineIntegration {
  /**
   * Query MOS by code
   */
  getMOS(mosCode: string): Promise<MOS | null>;

  /**
   * Search MOSs by keyword
   */
  searchMOS(query: string): Promise<MOS[]>;

  /**
   * Get MOS for specific branch
   */
  getByBranch(branch: string): Promise<MOS[]>;

  /**
   * Get civilian career equivalents
   */
  getCivilianiEquivalents(mosCode: string): Promise<string[]>;

  /**
   * Get industry matches
   */
  getIndustryMatches(mosCode: string): Promise<string[]>;

  /**
   * Translate MOS to skills
   */
  translateSkills(mosCode: string): Promise<string[]>;
}
