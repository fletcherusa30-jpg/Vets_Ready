import { describe, it, expect } from '@jest/globals';
import { recommendCredentials, createCredentialRoadmap } from '../src/domains/credentialing/service.js';
import type { VeteranProfile } from '../data/models/index.js';

describe('Credentialing Service', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'Test Veteran',
    email: 'test@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Army',
        mosOrAfscOrRating: '25B',
        title: 'Information Technology Specialist',
        startDate: '2016-01-01',
        endDate: '2024-01-01',
        rankAtSeparation: 'SSG'
      }
    ],
    skills: [
      { id: 's1', name: 'Network Administration', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 }
    ],
    credentials: [
      { id: 'c1', name: 'CompTIA A+', type: 'certification', provider: 'CompTIA', status: 'completed' }
    ],
    interests: ['Information Technology'],
    targetIndustries: ['Information Technology'],
    targetRoles: ['Network Administrator', 'System Administrator'],
    locationPreferences: [],
    desiredSalaryRange: { min: 60000, max: 90000, currency: 'USD', period: 'yearly' }
  };

  it('should recommend credentials based on industry', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    expect(recs).toBeDefined();
    expect(recs.length).toBeGreaterThan(0);
  });

  it('should include credential details', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    recs.forEach(rec => {
      expect(rec.credential).toBeDefined();
      expect(rec.credential.name).toBeDefined();
      expect(rec.credential.provider).toBeDefined();
    });
  });

  it('should calculate priority', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    recs.forEach(rec => {
      expect(rec.priority).toMatch(/^(critical|high|medium|low)$/);
    });
  });

  it('should include cost estimates', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    recs.forEach(rec => {
      expect(rec.cost).toBeDefined();
      expect(rec.cost).toBeGreaterThan(0);
    });
  });

  it('should indicate GI Bill eligibility', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    recs.forEach(rec => {
      expect(rec.giBillEligible).toBeDefined();
      expect(typeof rec.giBillEligible).toBe('boolean');
    });
  });

  it('should include reasons for recommendation', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology');

    recs.forEach(rec => {
      expect(rec.reasons).toBeDefined();
      expect(rec.reasons.length).toBeGreaterThan(0);
    });
  });

  it('should sort by priority', async () => {
    const recs = await recommendCredentials(mockVeteran, 'Information Technology', 10);

    const priorityOrder = ['critical', 'high', 'medium', 'low'];

    for (let i = 1; i < recs.length; i++) {
      const currentPriority = priorityOrder.indexOf(recs[i].priority);
      const previousPriority = priorityOrder.indexOf(recs[i - 1].priority);
      expect(currentPriority).toBeGreaterThanOrEqual(previousPriority);
    }
  });

  it('should create credential roadmap', async () => {
    const roadmap = await createCredentialRoadmap(mockVeteran, 'Information Technology');

    expect(roadmap).toBeDefined();
    expect(roadmap.phases).toBeDefined();
    expect(roadmap.phases.length).toBeGreaterThan(0);
  });

  it('should include timeline in roadmap', async () => {
    const roadmap = await createCredentialRoadmap(mockVeteran, 'Information Technology');

    expect(roadmap.estimatedTimeToComplete).toBeDefined();
    expect(roadmap.estimatedCost).toBeGreaterThan(0);
  });
});
