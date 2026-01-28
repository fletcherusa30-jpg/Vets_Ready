import { describe, it, expect } from '@jest/globals';
import { discoverCareerPaths } from '../src/domains/career_discovery/service.js';
import type { VeteranProfile } from '../data/models/index.js';

describe('Career Discovery Service', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'Test Veteran',
    email: 'test@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Air Force',
        mosOrAfscOrRating: '3D0X2',
        title: 'Cyber Systems Operations',
        startDate: '2014-01-01',
        endDate: '2022-12-31',
        rankAtSeparation: 'SSgt'
      }
    ],
    skills: [
      { id: 's1', name: 'Network Administration', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 },
      { id: 's2', name: 'System Security', category: 'Information Technology', level: 'advanced', source: 'training', yearsOfExperience: 6 }
    ],
    credentials: [],
    interests: ['Technology', 'Cybersecurity'],
    targetIndustries: ['Information Technology'],
    targetRoles: [],
    locationPreferences: ['San Antonio, TX'],
    desiredSalaryRange: { min: 70000, max: 100000, currency: 'USD', period: 'yearly' }
  };

  it('should discover multiple career paths', async () => {
    const paths = await discoverCareerPaths(mockVeteran, 5);

    expect(paths).toBeDefined();
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.length).toBeLessThanOrEqual(5);
  });

  it('should include match scores', async () => {
    const paths = await discoverCareerPaths(mockVeteran);

    paths.forEach(rec => {
      expect(rec.matchScore).toBeGreaterThanOrEqual(0);
      expect(rec.matchScore).toBeLessThanOrEqual(100);
    });
  });

  it('should include match reasons', async () => {
    const paths = await discoverCareerPaths(mockVeteran);

    paths.forEach(rec => {
      expect(rec.reasons).toBeDefined();
      expect(rec.reasons.length).toBeGreaterThan(0);
    });
  });

  it('should include next steps', async () => {
    const paths = await discoverCareerPaths(mockVeteran);

    paths.forEach(rec => {
      expect(rec.nextSteps).toBeDefined();
      expect(rec.nextSteps.length).toBeGreaterThan(0);
    });
  });

  it('should sort results by match score descending', async () => {
    const paths = await discoverCareerPaths(mockVeteran);

    for (let i = 1; i < paths.length; i++) {
      expect(paths[i - 1].matchScore).toBeGreaterThanOrEqual(paths[i].matchScore);
    }
  });
});
