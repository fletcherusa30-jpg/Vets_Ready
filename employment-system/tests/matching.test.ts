import { describe, it, expect } from '@jest/globals';
import { matchVeteranToJobs } from '../src/core/matching/index.js';
import type { VeteranProfile, JobPosting } from '../data/models/index.js';

describe('Job Matching Engine', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Army',
        mosOrAfscOrRating: '25D',
        title: 'Cyber Network Defender',
        startDate: '2015-01-01',
        endDate: '2023-12-31',
        rankAtSeparation: 'SSG'
      }
    ],
    skills: [
      { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'advanced', source: 'MOS' },
      { id: 's2', name: 'Incident Response', category: 'Information Technology', level: 'advanced', source: 'MOS' },
      { id: 's3', name: 'Leadership', category: 'Leadership', level: 'expert', source: 'MOS' }
    ],
    credentials: [
      { id: 'c1', name: 'Security+', type: 'certification', provider: 'CompTIA', status: 'completed' }
    ],
    interests: ['Cybersecurity', 'Technology'],
    targetIndustries: ['Information Technology', 'Defense'],
    targetRoles: ['Cybersecurity Analyst', 'Security Engineer'],
    locationPreferences: ['San Diego, CA', 'Washington, DC'],
    clearanceLevel: 'Secret',
    clearanceStatus: 'active',
    employmentGoals: ['Find cybersecurity role', 'Leverage military experience'],
    desiredSalaryRange: { min: 75000, max: 110000, currency: 'USD', period: 'yearly' }
  };

  const mockJobs: JobPosting[] = [
    {
      id: 'job-1',
      title: 'Cybersecurity Analyst',
      companyName: 'TechSecure Inc.',
      industry: 'Information Technology',
      location: 'San Diego, CA',
      remoteOption: true,
      jobType: 'full-time',
      salaryRange: { min: 75000, max: 110000, currency: 'USD', period: 'yearly' },
      description: 'Protect our systems from cyber threats',
      requiredSkills: ['Network Security', 'Incident Response'],
      preferredSkills: ['Penetration Testing'],
      requiredCredentials: ['Security+'],
      veteranFriendly: true,
      clearanceRequired: 'Secret',
      postedDate: new Date().toISOString()
    },
    {
      id: 'job-2',
      title: 'Software Engineer',
      companyName: 'Tech Corp',
      industry: 'Technology',
      location: 'Austin, TX',
      remoteOption: false,
      jobType: 'full-time',
      salaryRange: { min: 90000, max: 130000, currency: 'USD', period: 'yearly' },
      description: 'Build web applications',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      preferredSkills: [],
      veteranFriendly: false,
      postedDate: new Date().toISOString()
    }
  ];

  it('should match veteran to jobs with scores', async () => {
    const matches = await matchVeteranToJobs(mockVeteran, mockJobs);

    expect(matches).toBeDefined();
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(0);
    expect(matches[0].matchScore).toBeLessThanOrEqual(100);
  });

  it('should rank cybersecurity job higher than software engineering', async () => {
    const matches = await matchVeteranToJobs(mockVeteran, mockJobs);

    const cyberJob = matches.find(m => m.jobId === 'job-1');
    const softwareJob = matches.find(m => m.jobId === 'job-2');

    expect(cyberJob).toBeDefined();
    expect(softwareJob).toBeDefined();
    expect(cyberJob!.matchScore).toBeGreaterThan(softwareJob!.matchScore);
  });

  it('should provide match details', async () => {
    const matches = await matchVeteranToJobs(mockVeteran, mockJobs);
    const topMatch = matches[0];

    expect(topMatch.skillMatchDetails).toBeDefined();
    expect(topMatch.credentialMatchDetails).toBeDefined();
    expect(topMatch.strengths).toBeDefined();
    expect(topMatch.recommendations).toBeDefined();
  });

  it('should filter by minimum match score', async () => {
    const matches = await matchVeteranToJobs(mockVeteran, mockJobs, {
      minMatchScore: 80
    });

    matches.forEach(match => {
      expect(match.matchScore).toBeGreaterThanOrEqual(80);
    });
  });

  it('should respect max results limit', async () => {
    const matches = await matchVeteranToJobs(mockVeteran, mockJobs, {
      maxResults: 1
    });

    expect(matches.length).toBeLessThanOrEqual(1);
  });
});
