/**
 * Resume Builder
 * Generates veteran-friendly resumes from profile data
 */

import { type MilitarySkill } from './mosToSkills';

export interface ResumeSection {
  type: 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'awards';
  title: string;
  content: string | string[];
  order: number;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    clearance?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: MilitarySkill[];
  certifications: string[];
  awards?: string[];
}

export interface ExperienceEntry {
  jobTitle: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  achievements: string[];
  civilianTranslation?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: number;
  honors?: string;
}

/**
 * Generate professional summary
 */
export function generateProfessionalSummary(
  mosCode: string,
  mosTitle: string,
  yearsOfService: number,
  topSkills: string[],
  clearance?: string
): string {
  const skillsList = topSkills.slice(0, 3).join(', ');
  const clearanceText = clearance ? ` with active ${clearance} security clearance` : '';

  return `Results-driven professional with ${yearsOfService}+ years of military experience as ${mosTitle}${clearanceText}. Proven expertise in ${skillsList}. Strong background in leadership, team coordination, and operating in high-pressure environments. Seeking to leverage military training and discipline to contribute to organizational success in civilian sector.`;
}

/**
 * Translate military experience to civilian resume
 */
export function translateMilitaryExperience(
  rank: string,
  mosTitle: string,
  unit: string,
  achievements: string[]
): ExperienceEntry {
  // Civilian title translation
  const civilianTitle = translateRankToTitle(rank, mosTitle);

  // Translate achievements to action verbs
  const civilianAchievements = achievements.map(achievement =>
    translateAchievementToCivilian(achievement)
  );

  return {
    jobTitle: civilianTitle,
    organization: `United States Military - ${unit}`,
    location: 'Various Locations',
    startDate: '',
    endDate: '',
    achievements: civilianAchievements,
    civilianTranslation: civilianTitle,
  };
}

/**
 * Translate military rank to civilian job title
 */
function translateRankToTitle(rank: string, mosTitle: string): string {
  // Officer ranks
  if (rank.includes('Captain') || rank.includes('Major')) {
    return `Operations Manager - ${civilianizeMOSTitle(mosTitle)}`;
  }
  if (rank.includes('Lieutenant')) {
    return `Team Lead - ${civilianizeMOSTitle(mosTitle)}`;
  }

  // NCO ranks
  if (rank.includes('Sergeant First Class') || rank.includes('Master Sergeant')) {
    return `Senior ${civilianizeMOSTitle(mosTitle)}`;
  }
  if (rank.includes('Staff Sergeant') || rank.includes('Sergeant')) {
    return `${civilianizeMOSTitle(mosTitle)} Specialist`;
  }

  // Junior enlisted
  return civilianizeMOSTitle(mosTitle);
}

/**
 * Civilianize MOS title
 */
function civilianizeMOSTitle(mosTitle: string): string {
  const translations: Record<string, string> = {
    'Infantryman': 'Security Specialist',
    'Information Technology Specialist': 'IT Technician',
    'Combat Medic Specialist': 'Emergency Medical Technician',
    'Unit Supply Specialist': 'Supply Chain Coordinator',
  };

  return translations[mosTitle] || mosTitle;
}

/**
 * Translate military achievement to civilian bullet point
 */
function translateAchievementToCivilian(achievement: string): string {
  // Replace military jargon with civilian terms
  let civilianAchievement = achievement
    .replace(/platoon/gi, 'team')
    .replace(/company/gi, 'department')
    .replace(/battalion/gi, 'organization')
    .replace(/mission/gi, 'project')
    .replace(/deployment/gi, 'assignment')
    .replace(/combat/gi, 'high-pressure')
    .replace(/soldiers/gi, 'personnel')
    .replace(/commanded/gi, 'managed')
    .replace(/led/gi, 'supervised');

  // Ensure starts with action verb
  if (!startsWithActionVerb(civilianAchievement)) {
    civilianAchievement = `Managed ${civilianAchievement.toLowerCase()}`;
  }

  return civilianAchievement;
}

/**
 * Check if starts with action verb
 */
function startsWithActionVerb(text: string): boolean {
  const actionVerbs = [
    'managed', 'led', 'supervised', 'coordinated', 'developed', 'implemented',
    'trained', 'maintained', 'operated', 'analyzed', 'created', 'improved',
    'reduced', 'increased', 'achieved', 'executed', 'directed', 'oversaw'
  ];

  const firstWord = text.trim().toLowerCase().split(' ')[0];
  return actionVerbs.includes(firstWord);
}

/**
 * Generate skills section
 */
export function generateSkillsSection(skills: MilitarySkill[]): {
  technical: string[];
  leadership: string[];
  certifications: string[];
} {
  return {
    technical: skills
      .filter(s => s.category === 'Technical' || s.category === 'Medical')
      .map(s => s.name),
    leadership: skills
      .filter(s => s.category === 'Leadership')
      .map(s => s.name),
    certifications: skills
      .flatMap(s => s.certifications || []),
  };
}

/**
 * Generate complete resume
 */
export function generateResume(data: ResumeData): ResumeSection[] {
  const sections: ResumeSection[] = [];

  // Professional Summary
  sections.push({
    type: 'summary',
    title: 'Professional Summary',
    content: data.summary,
    order: 1,
  });

  // Skills
  const skillsSection = generateSkillsSection(data.skills);
  sections.push({
    type: 'skills',
    title: 'Core Competencies',
    content: [
      ...skillsSection.technical,
      ...skillsSection.leadership,
    ],
    order: 2,
  });

  // Experience
  const experienceContent = data.experience.map(exp =>
    formatExperienceEntry(exp)
  ).join('\n\n');
  sections.push({
    type: 'experience',
    title: 'Professional Experience',
    content: experienceContent,
    order: 3,
  });

  // Education
  const educationContent = data.education.map(edu =>
    formatEducationEntry(edu)
  ).join('\n');
  sections.push({
    type: 'education',
    title: 'Education',
    content: educationContent,
    order: 4,
  });

  // Certifications
  if (data.certifications.length > 0) {
    sections.push({
      type: 'certifications',
      title: 'Certifications & Licenses',
      content: data.certifications,
      order: 5,
    });
  }

  // Awards
  if (data.awards && data.awards.length > 0) {
    sections.push({
      type: 'awards',
      title: 'Awards & Recognition',
      content: data.awards,
      order: 6,
    });
  }

  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Format experience entry
 */
function formatExperienceEntry(exp: ExperienceEntry): string {
  const title = `${exp.jobTitle} | ${exp.organization}`;
  const location = `${exp.location} | ${exp.startDate} - ${exp.endDate}`;
  const achievements = exp.achievements.map(a => `• ${a}`).join('\n');

  return `${title}\n${location}\n${achievements}`;
}

/**
 * Format education entry
 */
function formatEducationEntry(edu: EducationEntry): string {
  const gpaText = edu.gpa ? ` | GPA: ${edu.gpa.toFixed(2)}` : '';
  const honorsText = edu.honors ? ` | ${edu.honors}` : '';
  return `${edu.degree} | ${edu.institution} | ${edu.graduationDate}${gpaText}${honorsText}`;
}

/**
 * Get resume templates
 */
export const RESUME_TEMPLATES = {
  FEDERAL: 'Federal Resume - USAJOBS Format',
  TECHNICAL: 'Technical Resume - IT/Engineering Focus',
  HEALTHCARE: 'Healthcare Resume - Medical Roles',
  SECURITY: 'Security Resume - Law Enforcement/Security',
  GENERAL: 'General Resume - Versatile Format',
};

/**
 * Get resume writing tips
 */
export function getResumeTips(): string[] {
  return [
    'Use action verbs: Led, Managed, Coordinated, Developed, Implemented',
    'Quantify achievements: "Managed team of 12" not just "Managed team"',
    'Translate military jargon: Use civilian equivalents',
    'List security clearance at top if you have one',
    'Keep to 1-2 pages maximum',
    'Use keywords from job description',
    'Proofread carefully - no typos',
    'Save as PDF to preserve formatting',
    'Include LinkedIn profile URL',
    'Update resume for each application to match job requirements',
  ];
}
