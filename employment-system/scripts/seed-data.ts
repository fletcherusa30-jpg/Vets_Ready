#!/usr/bin/env tsx

/**
 * Seed database with sample veteran profiles and jobs
 * Usage: npm run seed
 */

import type { VeteranProfile, JobPosting } from '../data/models/index.js';

const SAMPLE_VETERANS: VeteranProfile[] = [
  {
    id: 'vet-sample-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-0101',
    location: 'San Diego, CA',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Navy',
        mosOrAfscOrRating: 'CTN',
        title: 'Cryptologic Technician Networks',
        startDate: '2015-03-01',
        endDate: '2023-03-01',
        rankAtSeparation: 'PO1',
        awards: ['Navy Achievement Medal'],
        deployments: [
          { location: 'Middle East', startDate: '2018-01-01', endDate: '2018-07-01' }
        ]
      }
    ],
    skills: [
      { id: 's1', name: 'Network Security', category: 'Information Technology', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
      { id: 's2', name: 'Incident Response', category: 'Information Technology', level: 'advanced', source: 'MOS', yearsOfExperience: 8 },
      { id: 's3', name: 'Leadership', category: 'Leadership', level: 'advanced', source: 'MOS', yearsOfExperience: 8 }
    ],
    credentials: [
      { id: 'c1', name: 'Security+', type: 'certification', provider: 'CompTIA', status: 'completed', completionDate: '2020-05-15' }
    ],
    interests: ['Cybersecurity', 'Technology', 'Information Security'],
    targetIndustries: ['Information Technology', 'Defense'],
    targetRoles: ['Security Analyst', 'SOC Analyst', 'Cybersecurity Engineer'],
    locationPreferences: ['San Diego, CA', 'Remote'],
    clearanceLevel: 'TS/SCI',
    clearanceStatus: 'active',
    currentEmploymentStatus: 'Transitioning',
    employmentGoals: ['Find remote cybersecurity role', 'Leverage clearance'],
    desiredSalaryRange: { min: 90000, max: 130000, currency: 'USD', period: 'yearly' }
  },
  {
    id: 'vet-sample-2',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    phone: '555-0102',
    location: 'San Antonio, TX',
    branchHistory: [
      {
        id: 'service-2',
        branch: 'Army',
        mosOrAfscOrRating: '68W',
        title: 'Combat Medic Specialist',
        startDate: '2016-06-01',
        endDate: '2024-06-01',
        rankAtSeparation: 'SSG',
        awards: ['Army Commendation Medal', 'Army Achievement Medal'],
        deployments: [
          { location: 'Afghanistan', startDate: '2019-01-01', endDate: '2020-01-01' }
        ]
      }
    ],
    skills: [
      { id: 's4', name: 'Emergency Medical Care', category: 'Healthcare', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
      { id: 's5', name: 'Patient Care', category: 'Healthcare', level: 'expert', source: 'MOS', yearsOfExperience: 8 },
      { id: 's6', name: 'Crisis Management', category: 'Soft Skills', level: 'advanced', source: 'MOS', yearsOfExperience: 8 }
    ],
    credentials: [
      { id: 'c2', name: 'EMT-B', type: 'license', provider: 'NREMT', status: 'completed' },
      { id: 'c3', name: 'ACLS', type: 'certification', provider: 'American Heart Association', status: 'completed' }
    ],
    interests: ['Healthcare', 'Emergency Medicine', 'Nursing'],
    targetIndustries: ['Healthcare'],
    targetRoles: ['Registered Nurse', 'Paramedic', 'Emergency Room Technician'],
    locationPreferences: ['San Antonio, TX', 'Austin, TX'],
    currentEmploymentStatus: 'Employed',
    employmentGoals: ['Transition to RN role', 'Complete nursing degree'],
    desiredSalaryRange: { min: 60000, max: 85000, currency: 'USD', period: 'yearly' }
  },
  {
    id: 'vet-sample-3',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '555-0103',
    location: 'Seattle, WA',
    branchHistory: [
      {
        id: 'service-3',
        branch: 'Air Force',
        mosOrAfscOrRating: '2T2X1',
        title: 'Air Transportation',
        startDate: '2012-01-01',
        endDate: '2022-01-01',
        rankAtSeparation: 'MSgt',
        awards: ['Air Medal', 'Meritorious Service Medal']
      }
    ],
    skills: [
      { id: 's7', name: 'Logistics Management', category: 'Logistics', level: 'expert', source: 'MOS', yearsOfExperience: 10 },
      { id: 's8', name: 'Supply Chain', category: 'Logistics', level: 'advanced', source: 'MOS', yearsOfExperience: 10 },
      { id: 's9', name: 'Team Leadership', category: 'Leadership', level: 'expert', source: 'MOS', yearsOfExperience: 10 }
    ],
    credentials: [],
    interests: ['Logistics', 'Supply Chain', 'Operations'],
    targetIndustries: ['Logistics', 'E-commerce', 'Manufacturing'],
    targetRoles: ['Logistics Manager', 'Operations Manager', 'Supply Chain Analyst'],
    locationPreferences: ['Seattle, WA', 'Portland, OR'],
    currentEmploymentStatus: 'Employed',
    employmentGoals: ['Move into management role', 'Increase salary to $100K+'],
    desiredSalaryRange: { min: 80000, max: 110000, currency: 'USD', period: 'yearly' }
  }
];

const SAMPLE_JOBS: JobPosting[] = [
  {
    id: 'job-sample-1',
    title: 'Senior Cybersecurity Analyst',
    companyName: 'TechDefense Corp',
    industry: 'Information Technology',
    location: 'Remote',
    remoteOption: true,
    jobType: 'full-time',
    salaryRange: { min: 95000, max: 135000, currency: 'USD', period: 'yearly' },
    description: 'Lead security operations and incident response for defense contractor',
    requiredSkills: ['Network Security', 'Incident Response', 'SIEM'],
    preferredSkills: ['Penetration Testing', 'Threat Hunting'],
    requiredCredentials: ['Security+', 'CISSP'],
    clearanceRequired: 'Top Secret',
    veteranFriendly: true,
    relevantMOS: ['CTN', '25D', '17C', '1B4'],
    postedDate: new Date().toISOString()
  },
  {
    id: 'job-sample-2',
    title: 'Emergency Department RN',
    companyName: 'Memorial Hospital',
    industry: 'Healthcare',
    location: 'San Antonio, TX',
    remoteOption: false,
    jobType: 'full-time',
    salaryRange: { min: 65000, max: 85000, currency: 'USD', period: 'yearly' },
    description: 'Provide emergency care in fast-paced ED environment',
    requiredSkills: ['Patient Care', 'Emergency Medicine', 'Critical Thinking'],
    preferredSkills: ['Trauma Care', 'ACLS'],
    requiredCredentials: ['RN License'],
    preferredCredentials: ['BSN', 'ACLS', 'PALS'],
    veteranFriendly: true,
    relevantMOS: ['68W', 'HM'],
    postedDate: new Date().toISOString()
  },
  {
    id: 'job-sample-3',
    title: 'Logistics Operations Manager',
    companyName: 'Amazon',
    industry: 'E-commerce',
    location: 'Seattle, WA',
    remoteOption: false,
    jobType: 'full-time',
    salaryRange: { min: 85000, max: 120000, currency: 'USD', period: 'yearly' },
    description: 'Manage warehouse operations and optimize supply chain processes',
    requiredSkills: ['Logistics Management', 'Team Leadership', 'Process Improvement'],
    preferredSkills: ['Lean Six Sigma', 'Warehouse Management Systems'],
    veteranFriendly: true,
    relevantMOS: ['2T2X1', '88N', '92A'],
    postedDate: new Date().toISOString()
  }
];

async function seed() {
  console.log('🌱 Seeding employment system database...\n');

  console.log(`📋 Sample Veterans: ${SAMPLE_VETERANS.length}`);
  SAMPLE_VETERANS.forEach((vet, i) => {
    console.log(`  ${i + 1}. ${vet.name} - ${vet.branchHistory[0]?.title}`);
  });

  console.log(`\n💼 Sample Jobs: ${SAMPLE_JOBS.length}`);
  SAMPLE_JOBS.forEach((job, i) => {
    console.log(`  ${i + 1}. ${job.title} at ${job.companyName}`);
  });

  console.log('\n✅ Seed data prepared');
  console.log('Note: In production, this would insert into database');
  console.log('For now, this data can be used for testing and demos\n');

  // In real implementation, insert into database
  // await db.veterans.insertMany(SAMPLE_VETERANS);
  // await db.jobs.insertMany(SAMPLE_JOBS);

  return {
    veterans: SAMPLE_VETERANS,
    jobs: SAMPLE_JOBS
  };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export { SAMPLE_VETERANS, SAMPLE_JOBS };
