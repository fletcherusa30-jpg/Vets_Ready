import { VeteranProfile, JobPosting } from '../../../data/models/index.js';

/**
 * Application Automation Service
 * Automates job application submissions with smart customization
 */

export interface ApplicationConfig {
  veteranId: string;
  autoApplyEnabled: boolean;
  minMatchScore: number;
  maxApplicationsPerDay: number;
  targetIndustries: string[];
  excludedCompanies: string[];
  customResponses: Record<string, string>;
}

export interface ApplicationResult {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  appliedAt: string;
  status: 'submitted' | 'failed' | 'pending-review';
  customizations: string[];
  documents: ApplicationDocument[];
}

export interface ApplicationDocument {
  type: 'resume' | 'cover-letter' | 'additional';
  filename: string;
  customized: boolean;
  content: string;
}

/**
 * Auto-apply to jobs matching criteria
 */
export async function autoApplyToJobs(
  veteran: VeteranProfile,
  jobs: JobPosting[],
  config: ApplicationConfig
): Promise<ApplicationResult[]> {
  const results: ApplicationResult[] = [];
  let applicationsToday = 0;

  for (const job of jobs) {
    // Check daily limit
    if (applicationsToday >= config.maxApplicationsPerDay) {
      break;
    }

    // Check if company is excluded
    if (config.excludedCompanies.includes(job.companyName)) {
      continue;
    }

    // Check industry filter
    if (config.targetIndustries.length > 0 && !config.targetIndustries.includes(job.industry || '')) {
      continue;
    }

    // Apply to job
    try {
      const result = await applyToJob(veteran, job, config);
      results.push(result);
      applicationsToday++;
    } catch (error) {
      console.error(`Failed to apply to ${job.title} at ${job.companyName}:`, error);
      results.push({
        id: `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        appliedAt: new Date().toISOString(),
        status: 'failed',
        customizations: [],
        documents: []
      });
    }
  }

  return results;
}

/**
 * Apply to a single job with customization
 */
async function applyToJob(
  veteran: VeteranProfile,
  job: JobPosting,
  config: ApplicationConfig
): Promise<ApplicationResult> {
  const customizations: string[] = [];

  // Generate customized resume
  const resume = await generateCustomizedResume(veteran, job);
  customizations.push('Resume tailored to job requirements');

  // Generate cover letter
  const coverLetter = await generateCustomizedCoverLetter(veteran, job);
  customizations.push('Cover letter personalized for company and role');

  // Fill application form
  const formData = fillApplicationForm(veteran, job, config.customResponses);
  customizations.push('Application form auto-filled with veteran data');

  // In production, actually submit to job board API
  // For now, just log the application
  console.log(`Applied to: ${job.title} at ${job.companyName}`);

  return {
    id: `app-${veteran.id}-${job.id}-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    appliedAt: new Date().toISOString(),
    status: 'submitted',
    customizations,
    documents: [
      {
        type: 'resume',
        filename: `${veteran.name.replace(/\s+/g, '_')}_Resume_${job.companyName}.pdf`,
        customized: true,
        content: resume
      },
      {
        type: 'cover-letter',
        filename: `${veteran.name.replace(/\s+/g, '_')}_CoverLetter_${job.companyName}.pdf`,
        customized: true,
        content: coverLetter
      }
    ]
  };
}

/**
 * Generate customized resume for specific job
 */
async function generateCustomizedResume(
  veteran: VeteranProfile,
  job: JobPosting
): Promise<string> {
  // Extract keywords from job description
  const jobKeywords = [...job.requiredSkills, ...job.preferredSkills];

  // Filter veteran skills to match job
  const relevantSkills = veteran.skills.filter(s =>
    jobKeywords.some(jk => jk.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(jk.toLowerCase()))
  );

  // Build resume (simplified - in production, use full resume service)
  let resume = `${veteran.name}\n`;
  resume += `${veteran.email} | ${veteran.phone}\n\n`;

  resume += `PROFESSIONAL SUMMARY\n`;
  resume += `${veteran.branchHistory.length}+ years military experience seeking ${job.title} position.\n\n`;

  resume += `RELEVANT SKILLS\n`;
  relevantSkills.forEach(skill => {
    resume += `• ${skill.name} (${skill.level})\n`;
  });

  resume += `\nEXPERIENCE\n`;
  for (const service of veteran.branchHistory) {
    resume += `${service.title} | ${service.branch}\n`;
    resume += `${service.startDate} - ${service.endDate || 'Present'}\n`;
    resume += `• Led teams in high-pressure environments\n`;
    resume += `• Demonstrated ${jobKeywords.slice(0, 3).join(', ')}\n\n`;
  }

  return resume;
}

/**
 * Generate customized cover letter
 */
async function generateCustomizedCoverLetter(
  veteran: VeteranProfile,
  job: JobPosting
): Promise<string> {
  const branch = veteran.branchHistory[0]?.branch || 'Military';
  const mos = veteran.branchHistory[0]?.title || 'Service Member';

  let letter = `Dear Hiring Manager,\n\n`;

  letter += `I am writing to express my strong interest in the ${job.title} position at ${job.companyName}. `;
  letter += `As a ${branch} veteran with experience as a ${mos}, I bring a unique combination of `;
  letter += `${veteran.skills.slice(0, 3).map(s => s.name).join(', ')} that directly aligns with your requirements.\n\n`;

  letter += `During my military service, I:\n`;
  letter += `• Led teams in high-stakes environments\n`;
  letter += `• Developed strong skills in ${job.requiredSkills.slice(0, 2).join(' and ')}\n`;
  letter += `• Maintained security clearance and handled sensitive information\n\n`;

  if (job.veteranFriendly) {
    letter += `I was particularly drawn to ${job.companyName}'s commitment to hiring veterans. `;
  }

  letter += `I am confident that my military-honed discipline, adaptability, and technical skills `;
  letter += `will make me a valuable addition to your team.\n\n`;

  letter += `I look forward to discussing how my background can contribute to ${job.companyName}'s success.\n\n`;

  letter += `Sincerely,\n${veteran.name}`;

  return letter;
}

/**
 * Fill common application form fields
 */
function fillApplicationForm(
  veteran: VeteranProfile,
  job: JobPosting,
  customResponses: Record<string, string>
): Record<string, any> {
  return {
    // Basic info
    firstName: veteran.name.split(' ')[0],
    lastName: veteran.name.split(' ').slice(1).join(' '),
    email: veteran.email,
    phone: veteran.phone,
    location: veteran.location,

    // Work authorization
    workAuthorized: true,
    requireSponsorship: false,

    // Education
    highestEducation: veteran.credentials.find(c => c.type === 'degree')?.name || 'High School',

    // Experience
    yearsOfExperience: veteran.branchHistory.reduce((total, bh) => {
      const start = new Date(bh.startDate);
      const end = bh.endDate ? new Date(bh.endDate) : new Date();
      return total + (end.getFullYear() - start.getFullYear());
    }, 0),

    // Clearance
    securityClearance: veteran.clearanceLevel,
    clearanceActive: veteran.clearanceStatus === 'active',

    // Veteran status
    veteranStatus: true,
    branch: veteran.branchHistory[0]?.branch,

    // Desired salary
    desiredSalary: veteran.desiredSalaryRange?.min || job.salaryRange?.min,

    // Custom questions
    ...customResponses
  };
}

/**
 * Track application status
 */
export interface ApplicationTracking {
  applicationId: string;
  currentStatus: 'submitted' | 'under-review' | 'phone-screen' | 'interview' | 'offer' | 'rejected';
  timeline: ApplicationEvent[];
  nextSteps: string[];
}

export interface ApplicationEvent {
  status: string;
  timestamp: string;
  notes?: string;
}

export async function trackApplicationStatus(
  applicationId: string
): Promise<ApplicationTracking> {
  // In production, fetch from database
  return {
    applicationId,
    currentStatus: 'submitted',
    timeline: [
      {
        status: 'submitted',
        timestamp: new Date().toISOString(),
        notes: 'Application submitted successfully'
      }
    ],
    nextSteps: [
      'Monitor email for response (typically 1-2 weeks)',
      'Follow up if no response after 2 weeks',
      'Continue applying to other positions'
    ]
  };
}

/**
 * Generate application statistics
 */
export interface ApplicationStats {
  totalApplications: number;
  byStatus: Record<string, number>;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageResponseTime: number; // days
  topIndustries: Array<{ industry: string; count: number }>;
}

export async function getApplicationStats(
  veteranId: string
): Promise<ApplicationStats> {
  // In production, calculate from database
  return {
    totalApplications: 47,
    byStatus: {
      'submitted': 20,
      'under-review': 15,
      'phone-screen': 7,
      'interview': 3,
      'offer': 1,
      'rejected': 1
    },
    responseRate: 57, // percentage
    interviewRate: 21, // percentage
    offerRate: 2, // percentage
    averageResponseTime: 8, // days
    topIndustries: [
      { industry: 'Information Technology', count: 18 },
      { industry: 'Defense', count: 12 },
      { industry: 'Logistics', count: 10 }
    ]
  };
}
