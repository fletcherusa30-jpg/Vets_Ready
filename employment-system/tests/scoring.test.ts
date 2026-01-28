import { describe, it, expect } from '@jest/globals';
import {
  calculateSkillMatch,
  calculateCredentialMatch,
  calculateLocationMatch,
  calculateSalaryMatch,
  calculateClearanceMatch
} from '../src/core/scoring/index.js';

import type { Skill, Credential, SalaryRange } from '../data/models/index.js';

describe('Scoring Module', () => {
  describe('Skill Matching', () => {
    const veteranSkills: Skill[] = [
      { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 },
      { id: 's2', name: 'Leadership', category: 'Leadership', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
      { id: 's3', name: 'Problem Solving', category: 'Soft Skills', level: 'advanced', source: 'training', yearsOfExperience: 6 }
    ];

    it('should score exact skill matches highly', () => {
      const requiredSkills = ['Network Security'];
      const result = calculateSkillMatch(veteranSkills, requiredSkills, []);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.matchedSkills).toContain('Network Security');
    });

    it('should identify skill gaps', () => {
      const requiredSkills = ['Network Security', 'Cloud Computing', 'Python'];
      const result = calculateSkillMatch(veteranSkills, requiredSkills, []);

      expect(result.missingSkills).toContain('Cloud Computing');
      expect(result.missingSkills).toContain('Python');
    });

    it('should detect transferable skills', () => {
      const requiredSkills = ['Team Leadership'];
      const result = calculateSkillMatch(veteranSkills, requiredSkills, []);

      // Leadership should be recognized as transferable to Team Leadership
      expect(result.transferableSkills.length).toBeGreaterThan(0);
    });

    it('should boost score for preferred skills', () => {
      const requiredSkills = ['Network Security'];
      const preferredSkills = ['Leadership'];

      const resultWithPreferred = calculateSkillMatch(veteranSkills, requiredSkills, preferredSkills);
      const resultWithoutPreferred = calculateSkillMatch(veteranSkills, requiredSkills, []);

      expect(resultWithPreferred.score).toBeGreaterThan(resultWithoutPreferred.score);
    });
  });

  describe('Credential Matching', () => {
    const veteranCredentials: Credential[] = [
      { id: 'c1', name: 'Security+', type: 'certification', provider: 'CompTIA', status: 'completed' },
      { id: 'c2', name: 'Bachelor of Science in IT', type: 'degree', provider: 'University', status: 'completed', level: 'bachelor' }
    ];

    it('should match exact credentials', () => {
      const requiredCreds = ['Security+'];
      const result = calculateCredentialMatch(veteranCredentials, requiredCreds, []);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.matchedCredentials).toContain('Security+');
    });

    it('should identify missing credentials', () => {
      const requiredCreds = ['Security+', 'CISSP'];
      const result = calculateCredentialMatch(veteranCredentials, requiredCreds, []);

      expect(result.missingCredentials).toContain('CISSP');
    });

    it('should recognize equivalent credentials', () => {
      const requiredCreds = ['CEH'];
      const result = calculateCredentialMatch(veteranCredentials, requiredCreds, []);

      // Security+ should be recognized as related to CEH
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Location Matching', () => {
    const locationPreferences = ['San Diego, CA', 'Washington, DC'];

    it('should match exact location', () => {
      const result = calculateLocationMatch(locationPreferences, 'San Diego, CA', false);

      expect(result.score).toBe(100);
      expect(result.matchType).toBe('exact');
    });

    it('should match remote jobs highly', () => {
      const result = calculateLocationMatch(locationPreferences, 'New York, NY', true);

      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.matchType).toBe('remote');
    });

    it('should partially match same state', () => {
      const result = calculateLocationMatch(locationPreferences, 'Los Angeles, CA', false);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
    });

    it('should not match different locations without remote option', () => {
      const result = calculateLocationMatch(locationPreferences, 'Austin, TX', false);

      expect(result.score).toBe(0);
      expect(result.matchType).toBe('none');
    });
  });

  describe('Salary Matching', () => {
    const desiredRange: SalaryRange = {
      min: 80000,
      max: 120000,
      currency: 'USD',
      period: 'yearly'
    };

    it('should match salary within desired range', () => {
      const jobRange: SalaryRange = {
        min: 85000,
        max: 115000,
        currency: 'USD',
        period: 'yearly'
      };

      const result = calculateSalaryMatch(desiredRange, jobRange);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.matchType).toBe('within-range');
    });

    it('should score higher salaries favorably', () => {
      const higherRange: SalaryRange = {
        min: 100000,
        max: 150000,
        currency: 'USD',
        period: 'yearly'
      };

      const result = calculateSalaryMatch(desiredRange, higherRange);

      expect(result.score).toBeGreaterThan(70);
      expect(result.matchType).toBe('above-range');
    });

    it('should penalize lower salaries', () => {
      const lowerRange: SalaryRange = {
        min: 50000,
        max: 70000,
        currency: 'USD',
        period: 'yearly'
      };

      const result = calculateSalaryMatch(desiredRange, lowerRange);

      expect(result.score).toBeLessThan(50);
      expect(result.matchType).toBe('below-range');
    });
  });

  describe('Clearance Matching', () => {
    it('should match exact clearance levels', () => {
      const result = calculateClearanceMatch('Secret', 'active', 'Secret');

      expect(result.score).toBe(100);
      expect(result.matchType).toBe('exact');
    });

    it('should match higher clearance levels', () => {
      const result = calculateClearanceMatch('Top Secret', 'active', 'Secret');

      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.matchType).toBe('exceeds');
    });

    it('should not match lower clearance levels', () => {
      const result = calculateClearanceMatch('Secret', 'active', 'Top Secret');

      expect(result.score).toBeLessThan(50);
      expect(result.matchType).toBe('insufficient');
    });

    it('should handle no clearance requirement', () => {
      const result = calculateClearanceMatch('Secret', 'active', undefined);

      expect(result.score).toBe(100);
      expect(result.matchType).toBe('not-required');
    });

    it('should penalize inactive clearances', () => {
      const activeResult = calculateClearanceMatch('Secret', 'active', 'Secret');
      const inactiveResult = calculateClearanceMatch('Secret', 'inactive', 'Secret');

      expect(inactiveResult.score).toBeLessThan(activeResult.score);
    });
  });
});
