import { describe, it, expect } from '@jest/globals';
import { generateInterviewPrep, generateSTARStories } from '../src/domains/interview_prep/service.js';
import type { VeteranProfile, JobPosting, BranchServiceRecord } from '../data/models/index.js';

describe('Interview Prep Service', () => {
  const mockVeteran: VeteranProfile = {
    id: 'vet-1',
    name: 'Test Veteran',
    email: 'test@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Marine Corps',
        mosOrAfscOrRating: '0651',
        title: 'Cyber Network Operator',
        startDate: '2016-01-01',
        endDate: '2024-01-01',
        rankAtSeparation: 'Sgt',
        awards: ['Navy Achievement Medal'],
        deployments: [
          { location: 'Okinawa', startDate: '2018-01-01', endDate: '2019-01-01' }
        ]
      }
    ],
    skills: [
      { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'advanced', source: 'MOS' }
    ],
    credentials: [],
    interests: ['Cybersecurity'],
    targetIndustries: ['Information Technology'],
    targetRoles: [],
    locationPreferences: [],
    desiredSalaryRange: { min: 70000, max: 100000, currency: 'USD', period: 'yearly' }
  };

  const mockJob: JobPosting = {
    id: 'job-1',
    title: 'Network Security Analyst',
    companyName: 'TechCorp',
    industry: 'Information Technology',
    location: 'Remote',
    remoteOption: true,
    jobType: 'full-time',
    salaryRange: { min: 75000, max: 100000, currency: 'USD', period: 'yearly' },
    description: 'Monitor and secure network infrastructure',
    requiredSkills: ['Network Security', 'Incident Response'],
    preferredSkills: [],
    veteranFriendly: true,
    postedDate: new Date().toISOString()
  };

  it('should generate interview prep package', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    expect(prep).toBeDefined();
    expect(prep.jobTitle).toBe(mockJob.title);
    expect(prep.companyName).toBe(mockJob.companyName);
  });

  it('should include behavioral questions', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    const behavioralQuestions = prep.questions.filter(q => q.type === 'behavioral');
    expect(behavioralQuestions.length).toBeGreaterThan(0);
  });

  it('should include technical questions', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    const technicalQuestions = prep.questions.filter(q => q.type === 'technical');
    expect(technicalQuestions.length).toBeGreaterThan(0);
  });

  it('should include veteran-specific questions', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    const veteranQuestions = prep.questions.filter(q => q.type === 'veteran-specific');
    expect(veteranQuestions.length).toBeGreaterThan(0);
  });

  it('should generate STAR stories', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    expect(prep.storyBank).toBeDefined();
    expect(prep.storyBank.length).toBeGreaterThan(0);
  });

  it('should include tips for each question', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    prep.questions.forEach(question => {
      expect(question.tips).toBeDefined();
      expect(question.tips.length).toBeGreaterThan(0);
    });
  });

  it('should include veteran-specific interview mistakes', async () => {
    const prep = await generateInterviewPrep(mockVeteran, mockJob);

    expect(prep.veteranSpecificTips).toBeDefined();
    expect(prep.veteranSpecificTips.length).toBeGreaterThan(0);
  });

  it('should generate STAR stories from military experience', async () => {
    const stories = await generateSTARStories(mockVeteran.branchHistory);

    expect(stories).toBeDefined();
    expect(stories.length).toBeGreaterThan(0);

    stories.forEach(story => {
      expect(story.situation).toBeDefined();
      expect(story.task).toBeDefined();
      expect(story.action).toBeDefined();
      expect(story.result).toBeDefined();
    });
  });
});
