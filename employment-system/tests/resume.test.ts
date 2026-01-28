import { describe, it, expect } from '@jest/globals';
import { generateResume, exportResume } from '../src/domains/resume_tools/service.js';
import type { VeteranProfile } from '../data/models/index.js';

describe('Resume Generation', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '555-123-4567',
    location: 'Norfolk, VA',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Navy',
        mosOrAfscOrRating: 'CTN',
        title: 'Cryptologic Technician Networks',
        startDate: '2016-03-15',
        endDate: '2024-03-15',
        rankAtSeparation: 'PO1',
        deployments: [
          { location: 'Middle East', startDate: '2018-01-01', endDate: '2018-07-01' }
        ]
      }
    ],
    skills: [
      { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
      { id: 's2', name: 'Penetration Testing', category: 'Information Technology', level: 'advanced', source: 'training', yearsOfExperience: 5 },
      { id: 's3', name: 'Leadership', category: 'Leadership', level: 'advanced', source: 'MOS', yearsOfExperience: 8 }
    ],
    credentials: [
      { id: 'c1', name: 'Security+', type: 'certification', provider: 'CompTIA', status: 'completed', completionDate: '2020-06-15' },
      { id: 'c2', name: 'CEH', type: 'certification', provider: 'EC-Council', status: 'completed', completionDate: '2022-03-20' }
    ],
    interests: ['Cybersecurity', 'Ethical Hacking'],
    targetIndustries: ['Information Technology', 'Defense'],
    targetRoles: ['Security Analyst', 'Penetration Tester'],
    locationPreferences: ['Norfolk, VA', 'Washington, DC'],
    clearanceLevel: 'TS/SCI',
    clearanceStatus: 'active',
    employmentGoals: ['Find cybersecurity role'],
    desiredSalaryRange: { min: 85000, max: 120000, currency: 'USD', period: 'yearly' }
  };

  it('should generate chronological resume', async () => {
    const resume = await generateResume(mockVeteran, 'chronological');

    expect(resume).toBeDefined();
    expect(resume.format).toBe('chronological');
    expect(resume.sections.length).toBeGreaterThan(0);
  });

  it('should include all key sections', async () => {
    const resume = await generateResume(mockVeteran);

    const sectionTitles = resume.sections.map(s => s.title);

    expect(sectionTitles).toContain('Contact Information');
    expect(sectionTitles).toContain('Professional Summary');
    expect(sectionTitles).toContain('Core Competencies');
    expect(sectionTitles).toContain('Professional Experience');
    expect(sectionTitles).toContain('Education & Certifications');
    expect(sectionTitles).toContain('Security Clearance');
  });

  it('should calculate ATS score', async () => {
    const resume = await generateResume(mockVeteran);

    expect(resume.atsScore).toBeGreaterThanOrEqual(0);
    expect(resume.atsScore).toBeLessThanOrEqual(100);
  });

  it('should extract keywords', async () => {
    const resume = await generateResume(mockVeteran);

    expect(resume.keywords.length).toBeGreaterThan(0);
    expect(resume.keywords).toContain('Network Security');
  });

  it('should export to text format', async () => {
    const resume = await generateResume(mockVeteran);
    const text = await exportResume(resume, 'txt');

    expect(text).toContain(mockVeteran.name);
    expect(text).toContain('PROFESSIONAL SUMMARY');
  });

  it('should export to HTML format', async () => {
    const resume = await generateResume(mockVeteran);
    const html = await exportResume(resume, 'html');

    expect(html).toContain('<html>');
    expect(html).toContain(mockVeteran.name);
    expect(html).toContain('</html>');
  });

  it('should include security clearance for cleared veterans', async () => {
    const resume = await generateResume(mockVeteran);

    const clearanceSection = resume.sections.find(s => s.title === 'Security Clearance');
    expect(clearanceSection).toBeDefined();
    expect(clearanceSection!.content[0]).toContain('TS/SCI');
  });
});
