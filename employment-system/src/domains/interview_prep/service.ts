import { VeteranProfile, JobPosting } from '../../../data/models/index.js';

/**
 * Interview Preparation Service
 * Helps veterans prepare for interviews with tailored questions and answers
 */

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'veteran-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAnswer?: string;
  tips: string[];
}

export interface InterviewPrep {
  jobTitle: string;
  company?: string;
  questions: InterviewQuestion[];
  storyBank: STARStory[];
  commonMistakes: string[];
  dresscode: string;
}

export interface STARStory {
  id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  applicableQuestions: string[];
}

/**
 * Generate interview prep for a specific job
 */
export async function generateInterviewPrep(
  veteran: VeteranProfile,
  job: JobPosting
): Promise<InterviewPrep> {
  const questions = await generateQuestions(veteran, job);
  const storyBank = await generateSTARStories(veteran);
  const commonMistakes = getCommonMistakesForVeterans();
  const dresscode = getDressCodeRecommendation(job);

  return {
    jobTitle: job.title,
    company: job.companyName,
    questions,
    storyBank,
    commonMistakes,
    dresscode
  };
}

/**
 * Generate tailored interview questions
 */
async function generateQuestions(veteran: VeteranProfile, job: JobPosting): Promise<InterviewQuestion[]> {
  const questions: InterviewQuestion[] = [];

  // Behavioral questions
  questions.push(
    {
      id: 'tell-me-about-yourself',
      question: 'Tell me about yourself.',
      category: 'behavioral',
      difficulty: 'easy',
      tips: [
        'Start with your military background (2-3 sentences)',
        'Connect military skills to civilian role',
        'End with why you\'re interested in this position',
        'Keep it to 2 minutes max'
      ],
      suggestedAnswer: `I served ${veteran.branchHistory.length} years in the ${veteran.branchHistory[0]?.branch} as a ${veteran.branchHistory[0]?.title}. During my service, I developed strong skills in ${veteran.skills.slice(0, 3).map(s => s.name).join(', ')}. I'm now looking to transition these skills into ${job.title}, where I can apply my military-honed discipline and expertise.`
    },
    {
      id: 'leadership-example',
      question: 'Give me an example of a time you demonstrated leadership.',
      category: 'behavioral',
      difficulty: 'medium',
      tips: [
        'Use STAR format (Situation, Task, Action, Result)',
        'Choose a specific military example',
        'Quantify results when possible',
        'Translate military jargon to civilian terms'
      ]
    },
    {
      id: 'conflict-resolution',
      question: 'Describe a time when you had to resolve a conflict within your team.',
      category: 'behavioral',
      difficulty: 'medium',
      tips: [
        'Show emotional intelligence',
        'Demonstrate communication skills',
        'Focus on the resolution, not the conflict',
        'Highlight teamwork'
      ]
    },
    {
      id: 'high-pressure',
      question: 'How do you handle high-pressure situations?',
      category: 'situational',
      difficulty: 'medium',
      tips: [
        'Draw on deployment or combat experience (if applicable)',
        'Emphasize calm decision-making',
        'Mention prioritization skills',
        'Give a specific example'
      ]
    }
  );

  // Technical questions based on job requirements
  for (const skill of job.requiredSkills.slice(0, 3)) {
    questions.push({
      id: `technical-${skill.toLowerCase().replace(/\s+/g, '-')}`,
      question: `What experience do you have with ${skill}?`,
      category: 'technical',
      difficulty: 'medium',
      tips: [
        'Relate military experience to this skill',
        'Mention specific projects or tasks',
        'Discuss continuous learning',
        'Be honest about skill level'
      ]
    });
  }

  // Veteran-specific questions
  questions.push(
    {
      id: 'military-transition',
      question: 'Why are you transitioning out of the military?',
      category: 'veteran-specific',
      difficulty: 'easy',
      tips: [
        'Stay positive about military service',
        'Focus on career growth opportunities',
        'Emphasize skills you want to apply',
        'Avoid negative comments about military'
      ]
    },
    {
      id: 'military-jargon',
      question: 'How will you communicate without military jargon?',
      category: 'veteran-specific',
      difficulty: 'medium',
      tips: [
        'Acknowledge the challenge',
        'Show you\'ve already started the transition',
        'Mention research into civilian terminology',
        'Demonstrate adaptability'
      ]
    },
    {
      id: 'structure-independence',
      question: 'The civilian workplace is less structured than the military. How will you adapt?',
      category: 'veteran-specific',
      difficulty: 'medium',
      tips: [
        'Emphasize flexibility and adaptability',
        'Give examples of independent thinking in military',
        'Show understanding of civilian work culture',
        'Highlight ability to work without constant direction'
      ]
    }
  );

  return questions;
}

/**
 * Generate STAR stories from military experience
 */
async function generateSTARStories(veteran: VeteranProfile): Promise<STARStory[]> {
  const stories: STARStory[] = [];

  // Leadership story
  stories.push({
    id: 'leadership-1',
    situation: `As a ${veteran.branchHistory[0]?.title} in the ${veteran.branchHistory[0]?.branch}, I was responsible for a team during a critical operation.`,
    task: 'My task was to ensure mission success while maintaining team safety and morale.',
    action: 'I delegated responsibilities based on individual strengths, maintained clear communication, and made decisive calls when situations changed.',
    result: 'We completed the mission successfully with zero incidents, and my team was recognized for exceptional performance.',
    applicableQuestions: [
      'Tell me about a time you demonstrated leadership',
      'Describe your leadership style',
      'Give an example of managing a team'
    ]
  });

  // Problem-solving story
  stories.push({
    id: 'problem-solving-1',
    situation: 'During a deployment, critical equipment failed unexpectedly.',
    task: 'I needed to find a solution quickly to maintain operational capability.',
    action: 'I assessed available resources, coordinated with adjacent units, and implemented a creative workaround using alternative equipment.',
    result: 'Operations continued with minimal disruption, and the solution was adopted as a best practice.',
    applicableQuestions: [
      'Tell me about a time you solved a difficult problem',
      'Describe a situation where you had to think outside the box',
      'How do you handle unexpected challenges?'
    ]
  });

  // Working under pressure
  if (veteran.branchHistory.some(bh => bh.deployments && bh.deployments.length > 0)) {
    stories.push({
      id: 'pressure-1',
      situation: 'While deployed, I faced a high-stress situation with multiple competing priorities.',
      task: 'I had to prioritize tasks and execute under extreme pressure.',
      action: 'I quickly assessed the situation, prioritized based on mission impact, and calmly executed the plan.',
      result: 'All critical tasks were completed successfully, demonstrating my ability to perform under pressure.',
      applicableQuestions: [
        'How do you handle pressure?',
        'Describe a high-stress situation',
        'Tell me about working under a tight deadline'
      ]
    });
  }

  return stories;
}

/**
 * Common mistakes veterans make in interviews
 */
function getCommonMistakesForVeterans(): string[] {
  return [
    'Using too much military jargon (translate acronyms and terminology)',
    'Being too modest about accomplishments (civilian world expects self-promotion)',
    'Not asking questions about the role and company',
    'Focusing only on duties instead of achievements and results',
    'Appearing too rigid or formal (civilian workplace is often more casual)',
    'Not researching the company beforehand',
    'Failing to translate military rank into leadership responsibility',
    'Not having questions prepared for the interviewer'
  ];
}

/**
 * Get dress code recommendation
 */
function getDressCodeRecommendation(job: JobPosting): string {
  const industry = job.industry?.toLowerCase() || '';

  if (industry.includes('tech') || industry.includes('startup')) {
    return 'Business casual (button-down shirt, slacks, closed-toe shoes)';
  }

  if (industry.includes('finance') || industry.includes('law') || industry.includes('consulting')) {
    return 'Business professional (suit and tie for men, suit or professional dress for women)';
  }

  if (industry.includes('healthcare')) {
    return 'Business casual (avoid jeans, opt for clean professional appearance)';
  }

  return 'Business casual to business professional (err on the side of overdressing)';
}

/**
 * Generate mock interview questions
 */
export async function generateMockInterview(
  veteran: VeteranProfile,
  job: JobPosting,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<InterviewQuestion[]> {
  const prep = await generateInterviewPrep(veteran, job);

  const filtered = prep.questions.filter(q => {
    if (difficulty === 'beginner') return q.difficulty === 'easy';
    if (difficulty === 'intermediate') return q.difficulty !== 'hard';
    return true; // advanced gets all questions
  });

  return filtered;
}

/**
 * Evaluate an interview answer
 */
export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  isSTARFormat: boolean;
}

export async function evaluateAnswer(
  question: InterviewQuestion,
  answer: string
): Promise<AnswerEvaluation> {
  const strengths: string[] = [];
  const improvements: string[] = [];
  let score = 50; // Base score

  // Check for STAR format (if behavioral/situational)
  const isSTARFormat = checkSTARFormat(answer);
  if (question.category === 'behavioral' || question.category === 'situational') {
    if (isSTARFormat) {
      strengths.push('Answer follows STAR format');
      score += 20;
    } else {
      improvements.push('Consider using STAR format (Situation, Task, Action, Result)');
      score -= 10;
    }
  }

  // Check length
  const wordCount = answer.split(/\s+/).length;
  if (wordCount >= 50 && wordCount <= 200) {
    strengths.push('Good answer length');
    score += 10;
  } else if (wordCount < 50) {
    improvements.push('Answer is too brief - provide more detail');
    score -= 10;
  } else {
    improvements.push('Answer is too long - be more concise');
    score -= 5;
  }

  // Check for specific examples
  if (answer.toLowerCase().includes('for example') || answer.toLowerCase().includes('specifically')) {
    strengths.push('Includes specific examples');
    score += 10;
  } else {
    improvements.push('Add specific examples to strengthen your answer');
  }

  // Check for military jargon
  const jargon = detectMilitaryJargon(answer);
  if (jargon.length > 0) {
    improvements.push(`Translate military terms: ${jargon.join(', ')}`);
    score -= 5;
  } else {
    strengths.push('No military jargon detected');
    score += 5;
  }

  // Check for quantifiable results
  if (/\d+%|\d+ (percent|people|dollars|months|years)/.test(answer)) {
    strengths.push('Includes quantifiable results');
    score += 15;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    strengths,
    improvements,
    isSTARFormat
  };
}

function checkSTARFormat(answer: string): boolean {
  const lower = answer.toLowerCase();
  const hasSituation = lower.includes('situation') || lower.includes('when') || lower.includes('during');
  const hasTask = lower.includes('task') || lower.includes('needed to') || lower.includes('responsible for');
  const hasAction = lower.includes('action') || lower.includes('i did') || lower.includes('i implemented');
  const hasResult = lower.includes('result') || lower.includes('outcome') || lower.includes('achieved');

  return (hasSituation && hasTask && hasAction) || (hasSituation && hasAction && hasResult);
}

function detectMilitaryJargon(answer: string): string[] {
  const jargon = [
    'MOS', 'AFSC', 'POC', 'SITREP', 'OPORD', 'TDY', 'PCS',
    'NCO', 'NCOIC', 'OIC', 'CO', 'XO', 'TOC', 'FOB'
  ];

  const found: string[] = [];
  const words = answer.split(/\s+/);

  for (const word of words) {
    if (jargon.includes(word.toUpperCase())) {
      found.push(word);
    }
  }

  return found;
}
