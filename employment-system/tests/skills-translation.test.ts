import { describe, it, expect } from '@jest/globals';
import { translateMilitaryExperience, generateATSKeywords } from '../src/domains/skills_translation/service.js';
import type { BranchServiceRecord } from '../data/models/index.js';

describe('Military Skills Translation', () => {
  const mockServiceRecords: BranchServiceRecord[] = [
    {
      id: 'service-1',
      branch: 'Army',
      mosOrAfscOrRating: '25D',
      title: 'Cyber Network Defender',
      startDate: '2017-01-01',
      endDate: '2023-12-31',
      rankAtSeparation: 'SSG'
    },
    {
      id: 'service-2',
      branch: 'Army',
      mosOrAfscOrRating: '88N',
      title: 'Transportation Management Coordinator',
      startDate: '2014-01-01',
      endDate: '2017-01-01',
      rankAtSeparation: 'SGT'
    }
  ];

  it('should translate military experience to civilian skills', async () => {
    const translations = await translateMilitaryExperience(mockServiceRecords);

    expect(translations).toBeDefined();
    expect(translations.length).toBeGreaterThan(0);
  });

  it('should include universal military skills', async () => {
    const translations = await translateMilitaryExperience(mockServiceRecords);

    const hasLeadership = translations.some(t => t.militarySkill === 'Military Leadership');
    const hasCommunication = translations.some(t => t.militarySkill === 'Military Communication');

    expect(hasLeadership).toBe(true);
    expect(hasCommunication).toBe(true);
  });

  it('should include MOS-specific translations', async () => {
    const translations = await translateMilitaryExperience(mockServiceRecords);

    const cyberTranslation = translations.find(t =>
      t.civilianEquivalents.some(skill => skill.includes('Security'))
    );

    expect(cyberTranslation).toBeDefined();
  });

  it('should categorize skills appropriately', async () => {
    const translations = await translateMilitaryExperience(mockServiceRecords);

    const categories = [...new Set(translations.map(t => t.category))];

    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('Leadership');
  });

  it('should generate ATS keywords', async () => {
    const keywords = await generateATSKeywords(mockServiceRecords, 'Cybersecurity Analyst');

    expect(keywords).toBeDefined();
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should include industry-specific keywords for target job', async () => {
    const keywords = await generateATSKeywords(mockServiceRecords, 'Cybersecurity Analyst');

    // Should include cybersecurity-specific terms
    const hasCyberKeywords = keywords.some(kw =>
      kw.toLowerCase().includes('security') ||
      kw.toLowerCase().includes('network') ||
      kw.toLowerCase().includes('incident')
    );

    expect(hasCyberKeywords).toBe(true);
  });
});
