/**
 * Resume bullet templates using action verbs and impact metrics
 */
export const ACTION_VERBS = {
  leadership: ['Led', 'Directed', 'Managed', 'Supervised', 'Coordinated', 'Mentored', 'Trained'],
  technical: ['Operated', 'Maintained', 'Troubleshot', 'Repaired', 'Diagnosed', 'Calibrated', 'Programmed'],
  analytical: ['Analyzed', 'Assessed', 'Evaluated', 'Investigated', 'Researched', 'Reviewed', 'Examined'],
  communication: ['Briefed', 'Presented', 'Communicated', 'Liaised', 'Coordinated', 'Advised', 'Counseled'],
  planning: ['Planned', 'Organized', 'Scheduled', 'Coordinated', 'Developed', 'Designed', 'Implemented'],
  execution: ['Executed', 'Performed', 'Conducted', 'Delivered', 'Achieved', 'Accomplished', 'Completed'],
  improvement: ['Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Reduced', 'Increased', 'Maximized'],
  safety: ['Ensured', 'Enforced', 'Maintained', 'Monitored', 'Inspected', 'Validated', 'Certified'],
};

export const IMPACT_METRICS = {
  people: ['X personnel', 'X-member team', 'X subordinates', 'team of X'],
  money: ['$X million', '$X in assets', '$X budget', 'X% cost reduction'],
  time: ['X% faster', 'X hours saved', 'X-day turnaround', 'X% efficiency gain'],
  quality: ['100% accountability', 'X% accuracy', 'zero defects', 'X% improvement'],
  scope: ['X operations', 'X missions', 'X projects', 'X locations'],
};

export const RESUME_BULLET_TEMPLATES = [
  '{ACTION_VERB} {SCOPE} {RESULT}',
  '{ACTION_VERB} team of {NUMBER} personnel in {TASK}, resulting in {OUTCOME}',
  '{ACTION_VERB} {EQUIPMENT_VALUE} in equipment with {QUALITY_METRIC} accountability',
  '{ACTION_VERB} {NUMBER} {OPERATIONS} across {LOCATIONS}, achieving {RESULT}',
  '{ACTION_VERB} and {ACTION_VERB} {TECHNICAL_SYSTEM} to {OUTCOME}',
  'Managed {RESOURCE} valued at {MONEY} while maintaining {QUALITY}',
  'Coordinated {SCOPE} resulting in {IMPACT_METRIC}',
];

export interface ResumeBulletContext {
  actionVerb: string;
  task: string;
  scope?: string;
  metric?: string;
  outcome: string;
  timeframe?: string;
}

/**
 * Generate resume bullet from context
 */
export function generateResumeBullet(context: ResumeBulletContext): string {
  const parts = [context.actionVerb, context.task];

  if (context.scope) {
    parts.push(`for ${context.scope}`);
  }

  if (context.metric) {
    parts.push(`achieving ${context.metric}`);
  } else if (context.outcome) {
    parts.push(`resulting in ${context.outcome}`);
  }

  if (context.timeframe) {
    parts.push(`over ${context.timeframe}`);
  }

  return parts.join(' ');
}
