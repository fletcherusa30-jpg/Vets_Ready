#!/usr/bin/env node

/**
 * Employment System Demo
 * Demonstrates key features of the rallyforge Employment System
 */

import {
  matchVeteranToJobs,
  generateResume,
  discoverCareerPaths,
  generateInterviewPrep,
  searchJobs,
  recommendCredentials,
  generateCareerForecast,
  createDigitalTwin
} from './index.js';

import type { VeteranProfile, JobPosting } from './data/models/index.js';

// Sample veteran profile
const sampleVeteran: VeteranProfile = {
  id: 'demo-veteran-1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '555-123-4567',
  location: 'San Diego, CA',

  branchHistory: [
    {
      id: 'service-1',
      branch: 'Army',
      mosOrAfscOrRating: '25D',
      title: 'Cyber Network Defender',
      startDate: '2015-01-01',
      endDate: '2023-12-31',
      rankAtSeparation: 'SSG',
      deployments: [
        { location: 'Afghanistan', startDate: '2018-06-01', endDate: '2019-06-01' }
      ]
    }
  ],

  skills: [
    { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 },
    { id: 's2', name: 'Incident Response', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 },
    { id: 's3', name: 'Team Leadership', category: 'Leadership', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
    { id: 's4', name: 'Problem Solving', category: 'Soft Skills', level: 'expert', source: 'MOS', yearsOfExperience: 8 }
  ],

  credentials: [
    { id: 'c1', name: 'Security+', type: 'certification', provider: 'CompTIA', status: 'completed', completionDate: '2020-06-15' }
  ],

  interests: ['Cybersecurity', 'Technology', 'Information Security'],
  targetIndustries: ['Information Technology', 'Defense', 'Finance'],
  targetRoles: ['Cybersecurity Analyst', 'Security Engineer', 'SOC Analyst'],
  locationPreferences: ['San Diego, CA', 'Washington, DC', 'Northern Virginia'],

  clearanceLevel: 'Secret',
  clearanceStatus: 'active',

  employmentGoals: [
    'Transition to cybersecurity role in private sector',
    'Leverage military experience and clearance',
    'Earn $80K+ annually'
  ],

  currentEmploymentStatus: 'Transitioning',
  desiredSalaryRange: { min: 80000, max: 120000, currency: 'USD', period: 'yearly' }
};

// Sample job postings
const sampleJobs: JobPosting[] = [
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
    requiredSkills: ['Network Security', 'Incident Response', 'SIEM'],
    preferredSkills: ['Penetration Testing', 'Python'],
    requiredCredentials: ['Security+'],
    preferredCredentials: ['CEH'],
    clearanceRequired: 'Secret',
    veteranFriendly: true,
    relevantMOS: ['25D', '17C', 'CTN'],
    postedDate: new Date().toISOString()
  },
  {
    id: 'job-2',
    title: 'Senior Security Engineer',
    companyName: 'Defense Contractor LLC',
    industry: 'Defense',
    location: 'Washington, DC',
    remoteOption: false,
    jobType: 'full-time',
    salaryRange: { min: 100000, max: 140000, currency: 'USD', period: 'yearly' },
    description: 'Lead security operations for defense projects',
    requiredSkills: ['Network Security', 'Incident Response', 'Security Architecture'],
    preferredSkills: ['Cloud Security', 'Compliance'],
    requiredCredentials: ['Security+', 'CISSP'],
    clearanceRequired: 'Top Secret',
    canSponsorClearance: true,
    veteranFriendly: true,
    relevantMOS: ['25D', '17C', '35Q', 'CTN'],
    postedDate: new Date().toISOString()
  }
];

async function runDemo() {
  console.log('='.repeat(80));
  console.log('rallyforge EMPLOYMENT SYSTEM DEMO');
  console.log('='.repeat(80));
  console.log();

  // 1. Job Matching
  console.log('📊 JOB MATCHING DEMO');
  console.log('-'.repeat(80));
  const matches = await matchVeteranToJobs(sampleVeteran, sampleJobs);
  console.log(`\nFound ${matches.length} matching jobs for ${sampleVeteran.name}:\n`);

  matches.forEach((match, index) => {
    const job = sampleJobs.find(j => j.id === match.jobId);
    console.log(`${index + 1}. ${job?.title} at ${job?.companyName}`);
    console.log(`   Match Score: ${match.matchScore}%`);
    console.log(`   Strengths: ${match.strengths.join(', ')}`);
    if (match.gaps.length > 0) {
      console.log(`   Gaps: ${match.gaps.join(', ')}`);
    }
    console.log();
  });

  // 2. Resume Generation
  console.log('\n📝 RESUME GENERATION DEMO');
  console.log('-'.repeat(80));
  const resume = await generateResume(sampleVeteran, 'chronological', 'Cybersecurity Analyst');
  console.log(`\nGenerated ${resume.format} resume with ATS score: ${resume.atsScore}/100\n`);
  console.log(`Sections included: ${resume.sections.map(s => s.title).join(', ')}`);
  console.log(`\nTop keywords: ${resume.keywords.slice(0, 10).join(', ')}`);

  // 3. Career Discovery
  console.log('\n\n🎯 CAREER DISCOVERY DEMO');
  console.log('-'.repeat(80));
  const careers = await discoverCareerPaths(sampleVeteran, 3);
  console.log(`\nDiscovered ${careers.length} career paths:\n`);

  careers.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.career.title} (${rec.matchScore}% match)`);
    console.log(`   Industry: ${rec.career.industry}`);
    console.log(`   Salary Range: $${rec.career.salaryRange.min.toLocaleString()} - $${rec.career.salaryRange.max.toLocaleString()}`);
    console.log(`   Reasons: ${rec.reasons.join('; ')}`);
    console.log(`   Next Steps: ${rec.nextSteps.slice(0, 2).join('; ')}`);
    console.log();
  });

  // 4. Interview Prep
  console.log('\n💼 INTERVIEW PREP DEMO');
  console.log('-'.repeat(80));
  const interviewPrep = await generateInterviewPrep(sampleVeteran, sampleJobs[0]);
  console.log(`\nGenerated interview prep for: ${interviewPrep.jobTitle}\n`);
  console.log(`Questions prepared: ${interviewPrep.questions.length}`);
  console.log(`STAR stories: ${interviewPrep.storyBank.length}`);
  console.log(`\nSample Question:`);
  console.log(`Q: ${interviewPrep.questions[0].question}`);
  console.log(`Tips: ${interviewPrep.questions[0].tips.slice(0, 2).join('\n      ')}`);

  // 5. Credential Recommendations
  console.log('\n\n🎓 CREDENTIAL RECOMMENDATIONS DEMO');
  console.log('-'.repeat(80));
  const credentialRecs = await recommendCredentials(sampleVeteran, 'Information Technology');
  console.log(`\nRecommended ${credentialRecs.length} certifications:\n`);

  credentialRecs.slice(0, 3).forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.credential.name} (${rec.priority} priority)`);
    console.log(`   Cost: ~$${rec.cost}`);
    console.log(`   Time: ${rec.timeToComplete}`);
    console.log(`   GI Bill: ${rec.giBillEligible ? 'Yes' : 'No'}`);
    console.log(`   Reasons: ${rec.reasons.join('; ')}`);
    console.log();
  });

  // 6. Career Forecast
  console.log('\n📈 CAREER FORECAST DEMO');
  console.log('-'.repeat(80));
  const forecast = await generateCareerForecast(sampleVeteran, '5-year');
  console.log(`\n5-Year Career Forecast for ${sampleVeteran.name}:\n`);

  forecast.projections.forEach((proj, index) => {
    console.log(`${index + 1}. ${proj.role} (${proj.probabilityOfAchieving}% probability)`);
    console.log(`   Salary: $${proj.estimatedSalary.min.toLocaleString()} - $${proj.estimatedSalary.max.toLocaleString()}`);
    console.log(`   Timeline: ${proj.estimatedTimeToRole}`);
    console.log();
  });

  // 7. Digital Twin
  console.log('\n🤖 DIGITAL TWIN DEMO');
  console.log('-'.repeat(80));
  const twin = await createDigitalTwin(sampleVeteran);
  console.log(`\nCreated digital twin for ${sampleVeteran.name}\n`);
  console.log(`Current Role: ${twin.currentState.currentRole}`);
  console.log(`Market Value: $${twin.currentState.marketValue.toLocaleString()}`);
  console.log(`Career Momentum: ${twin.currentState.careerMomentum}`);
  console.log(`\nTop Opportunities:`);
  twin.currentState.opportunities.slice(0, 3).forEach(opp => {
    console.log(`  • ${opp}`);
  });
  console.log(`\nTop Recommendations:`);
  twin.recommendations.slice(0, 3).forEach(rec => {
    console.log(`  • ${rec.action} (Impact: ${rec.impactScore}/100)`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('DEMO COMPLETE');
  console.log('='.repeat(80));
}

// Run demo
runDemo().catch(console.error);

