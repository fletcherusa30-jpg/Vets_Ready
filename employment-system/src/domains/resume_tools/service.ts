import { VeteranProfile, BranchServiceRecord } from '../../../data/models/index.js';

/**
 * Resume Generation Service
 * Creates professional, ATS-optimized resumes from veteran profiles
 */

export interface ResumeSection {
  title: string;
  content: string[];
  order: number;
}

export interface Resume {
  format: 'chronological' | 'functional' | 'hybrid' | 'federal';
  sections: ResumeSection[];
  keywords: string[];
  atsScore: number;
}

/**
 * Generate a complete resume
 */
export async function generateResume(
  veteran: VeteranProfile,
  format: 'chronological' | 'functional' | 'hybrid' | 'federal' = 'chronological',
  targetJob?: string
): Promise<Resume> {
  const sections: ResumeSection[] = [];

  // Header/Contact Info
  sections.push({
    title: 'Contact Information',
    content: [
      veteran.name,
      veteran.email || '',
      veteran.phone || '',
      veteran.location || ''
    ].filter(Boolean),
    order: 1
  });

  // Professional Summary
  const summary = await generateProfessionalSummary(veteran, targetJob);
  sections.push({
    title: 'Professional Summary',
    content: [summary],
    order: 2
  });

  // Skills Section
  const skills = generateSkillsSection(veteran);
  sections.push({
    title: 'Core Competencies',
    content: skills,
    order: 3
  });

  // Work Experience
  const experience = await generateWorkExperience(veteran.branchHistory);
  sections.push({
    title: 'Professional Experience',
    content: experience,
    order: 4
  });

  // Education & Certifications
  const education = generateEducationSection(veteran);
  sections.push({
    title: 'Education & Certifications',
    content: education,
    order: 5
  });

  // Security Clearance
  if (veteran.clearanceLevel && veteran.clearanceLevel !== 'None') {
    sections.push({
      title: 'Security Clearance',
      content: [`${veteran.clearanceLevel} (${veteran.clearanceStatus})`],
      order: 6
    });
  }

  // Extract keywords for ATS
  const keywords = extractKeywords(veteran, sections);

  // Calculate ATS compatibility score
  const atsScore = calculateATSScore(sections, keywords);

  return {
    format,
    sections: sections.sort((a, b) => a.order - b.order),
    keywords,
    atsScore
  };
}

/**
 * Generate professional summary
 */
async function generateProfessionalSummary(veteran: VeteranProfile, targetJob?: string): Promise<string> {
  const yearsOfService = calculateYearsOfService(veteran.branchHistory);
  const primaryBranch = veteran.branchHistory[0]?.branch || 'Military';
  const primaryRole = veteran.branchHistory[0]?.title || 'Service Member';

  const keySkills = veteran.skills
    .filter(s => s.level === 'expert' || s.level === 'advanced')
    .slice(0, 3)
    .map(s => s.name)
    .join(', ');

  let summary = `Results-driven professional with ${yearsOfService}+ years of ${primaryBranch} experience as ${primaryRole}. `;
  summary += `Proven expertise in ${keySkills}. `;

  if (veteran.clearanceLevel && veteran.clearanceLevel !== 'None') {
    summary += `Holds active ${veteran.clearanceLevel} security clearance. `;
  }

  summary += `Seeking to leverage military-honed skills in ${targetJob || 'civilian sector'}.`;

  return summary;
}

/**
 * Calculate years of service
 */
function calculateYearsOfService(branchHistory: BranchServiceRecord[]): number {
  let totalMonths = 0;

  for (const service of branchHistory) {
    const start = new Date(service.startDate);
    const end = service.endDate ? new Date(service.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += months;
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Generate skills section
 */
function generateSkillsSection(veteran: VeteranProfile): string[] {
  const skillsByCategory = new Map<string, string[]>();

  for (const skill of veteran.skills) {
    if (!skillsByCategory.has(skill.category)) {
      skillsByCategory.set(skill.category, []);
    }
    skillsByCategory.get(skill.category)!.push(skill.name);
  }

  const formatted: string[] = [];
  for (const [category, skills] of skillsByCategory.entries()) {
    formatted.push(`${category}: ${skills.join(', ')}`);
  }

  return formatted;
}

/**
 * Generate work experience section
 */
async function generateWorkExperience(branchHistory: BranchServiceRecord[]): Promise<string[]> {
  const experiences: string[] = [];

  for (const service of branchHistory) {
    const startDate = new Date(service.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endDate = service.endDate
      ? new Date(service.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Present';

    experiences.push(`${service.title} | ${service.branch}`);
    experiences.push(`${startDate} - ${endDate}`);
    experiences.push(''); // Blank line

    // Generate bullet points
    const bullets = await generateExperienceBullets(service);
    experiences.push(...bullets);
    experiences.push(''); // Blank line between jobs
  }

  return experiences;
}

/**
 * Generate resume bullet points for a position
 */
async function generateExperienceBullets(service: BranchServiceRecord): Promise<string[]> {
  const bullets: string[] = [];

  // Leadership bullets
  bullets.push(`• Led and mentored team of personnel in ${service.branch} operations`);

  // Deployment bullets
  if (service.deployments && service.deployments.length > 0) {
    bullets.push(`• Deployed to ${service.deployments.length} operational theater(s) supporting critical missions`);
  }

  // Rank progression
  if (service.rankAtSeparation) {
    bullets.push(`• Advanced to ${service.rankAtSeparation} through demonstrated leadership and technical proficiency`);
  }

  // MOS-specific bullets
  const mosBullets = getMOSSpecificBullets(service.mosOrAfscOrRating, service.title);
  bullets.push(...mosBullets);

  return bullets;
}

/**
 * Get MOS-specific resume bullets
 */
function getMOSSpecificBullets(code: string, title: string): string[] {
  const bullets: string[] = [];

  // Cybersecurity
  if (['25D', '25B', '17C', '35Q', 'CTN', '1B4X1'].includes(code)) {
    bullets.push('• Monitored and secured network infrastructure protecting classified information');
    bullets.push('• Conducted vulnerability assessments and implemented security controls');
    bullets.push('• Responded to security incidents and performed forensic analysis');
  }

  // Logistics
  if (['88N', '92A', '92Y', '3043', 'LS', 'SK'].includes(code)) {
    bullets.push('• Managed inventory valued at $X million with 99%+ accuracy');
    bullets.push('• Coordinated multi-modal logistics operations across geographic regions');
    bullets.push('• Optimized supply chain processes reducing costs by X%');
  }

  // Intelligence
  if (['35F', '35M', '35L', '0231', 'IS', '1N0X1'].includes(code)) {
    bullets.push('• Analyzed intelligence data to identify patterns and threats');
    bullets.push('• Produced actionable intelligence reports for senior leadership');
    bullets.push('• Collaborated with interagency partners to support operations');
  }

  // Medical
  if (['68W', '68C', 'HM', '4N0X1'].includes(code)) {
    bullets.push('• Provided emergency medical care in high-stress combat environments');
    bullets.push('• Treated and stabilized X+ patients with diverse medical conditions');
    bullets.push('• Maintained medical readiness and equipment accountability');
  }

  return bullets;
}

/**
 * Generate education section
 */
function generateEducationSection(veteran: VeteranProfile): string[] {
  const education: string[] = [];

  // Certifications
  const completedCerts = veteran.credentials.filter(c => c.status === 'completed');
  if (completedCerts.length > 0) {
    education.push('Certifications:');
    for (const cert of completedCerts) {
      const date = cert.completionDate ? ` (${new Date(cert.completionDate).getFullYear()})` : '';
      education.push(`• ${cert.name}${date}`);
    }
    education.push('');
  }

  // Degrees
  const degrees = veteran.credentials.filter(c => c.type === 'degree' && c.status === 'completed');
  if (degrees.length > 0) {
    education.push('Education:');
    for (const degree of degrees) {
      education.push(`• ${degree.name} - ${degree.provider}`);
    }
  }

  return education;
}

/**
 * Extract keywords for ATS optimization
 */
function extractKeywords(veteran: VeteranProfile, sections: ResumeSection[]): string[] {
  const keywords = new Set<string>();

  // Add skills
  for (const skill of veteran.skills) {
    keywords.add(skill.name);
  }

  // Add credentials
  for (const cred of veteran.credentials) {
    keywords.add(cred.name);
  }

  // Add industry terms
  for (const industry of veteran.targetIndustries) {
    keywords.add(industry);
  }

  // Add role-specific keywords
  for (const role of veteran.targetRoles) {
    keywords.add(role);
  }

  return Array.from(keywords);
}

/**
 * Calculate ATS compatibility score
 */
function calculateATSScore(sections: ResumeSection[], keywords: string[]): number {
  let score = 100;

  // Check for proper formatting
  if (sections.length < 4) {
    score -= 20; // Missing key sections
  }

  // Check for sufficient keywords
  if (keywords.length < 10) {
    score -= 15; // Not enough keywords
  }

  // Check for bullet points
  const hasBullets = sections.some(s => s.content.some(c => c.startsWith('•')));
  if (!hasBullets) {
    score -= 10;
  }

  // Check for quantifiable achievements
  const hasNumbers = sections.some(s => s.content.some(c => /\d+/.test(c)));
  if (!hasNumbers) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Export resume to different formats
 */
export async function exportResume(
  resume: Resume,
  format: 'txt' | 'json' | 'html'
): Promise<string> {
  if (format === 'json') {
    return JSON.stringify(resume, null, 2);
  }

  if (format === 'html') {
    return generateHTMLResume(resume);
  }

  // Default: plain text
  return generateTextResume(resume);
}

function generateTextResume(resume: Resume): string {
  let output = '';

  for (const section of resume.sections) {
    output += `${section.title.toUpperCase()}\n`;
    output += '='.repeat(section.title.length) + '\n\n';
    output += section.content.join('\n') + '\n\n';
  }

  return output;
}

function generateHTMLResume(resume: Resume): string {
  let html = '<html><head><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;}</style></head><body>';

  for (const section of resume.sections) {
    html += `<div class="section">`;
    html += `<h2>${section.title}</h2>`;
    html += `<div class="content">`;

    for (const line of section.content) {
      html += `<p>${line}</p>`;
    }

    html += `</div></div>`;
  }

  html += '</body></html>';
  return html;
}
