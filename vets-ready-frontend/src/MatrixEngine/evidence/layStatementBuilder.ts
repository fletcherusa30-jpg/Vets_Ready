/**
 * Lay Statement Builder
 * Generates lay statements for VA claims
 */

export interface LayStatementTemplate {
  id: string;
  name: string;
  purpose: string;
  sections: LayStatementSection[];
  tips: string[];
}

export interface LayStatementSection {
  title: string;
  prompts: string[];
  example?: string;
}

export interface LayStatementData {
  veteranName: string;
  condition: string;
  inServiceEvent?: string;
  currentSymptoms: string[];
  impactOnLife: string[];
  frequency: string;
  severity: string;
  witnessedBy?: string[];
  dateOfOnset?: string;
}

const LAY_STATEMENT_TEMPLATE: LayStatementTemplate = {
  id: 'general-lay-statement',
  name: 'General Lay Statement for VA Claim',
  purpose: 'Describe your condition in your own words to support VA claim',
  sections: [
    {
      title: 'Introduction',
      prompts: [
        'State your name and service dates',
        'Identify the condition you\'re claiming',
      ],
      example: 'My name is John Smith. I served in the U.S. Army from June 2010 to June 2014. I am writing this statement to support my claim for service connection for tinnitus (ringing in ears).',
    },
    {
      title: 'In-Service Event or Exposure',
      prompts: [
        'Describe what happened during service that caused the condition',
        'Include specific dates, locations, and circumstances',
        'Mention any witnesses or records',
      ],
      example: 'During my deployment to Afghanistan from March 2012 to November 2012, I was exposed to loud explosions and gunfire on a daily basis. On July 15, 2012, an IED exploded approximately 50 feet from my position. I remember my ears ringing immediately after the blast.',
    },
    {
      title: 'Continuity of Symptoms',
      prompts: [
        'Describe symptoms from service to present',
        'Explain how symptoms have continued or worsened',
        'Include any treatment you\'ve received',
      ],
      example: 'Since that IED blast, I have experienced constant ringing in both ears. The ringing is high-pitched and never stops. I mentioned it to the medic after the blast, but we were in a combat zone and I didn\'t follow up. When I returned from deployment, I sought treatment at the base clinic.',
    },
    {
      title: 'Current Symptoms',
      prompts: [
        'Describe symptoms you experience today',
        'How frequent are the symptoms?',
        'How severe are they?',
      ],
      example: 'Today, I experience ringing in both ears 24/7. The volume is usually moderate, but it gets louder when I\'m tired or stressed. The ringing makes it hard to hear conversations, especially in noisy environments.',
    },
    {
      title: 'Impact on Daily Life',
      prompts: [
        'How does the condition affect your work?',
        'How does it affect your family life?',
        'How does it affect your sleep, hobbies, or social activities?',
      ],
      example: 'The constant ringing affects my daily life significantly. I have trouble concentrating at work because of the noise. I often ask people to repeat themselves. I avoid social gatherings because loud environments make the ringing worse. I have difficulty falling asleep because of the ringing.',
    },
    {
      title: 'Conclusion',
      prompts: [
        'Restate that your statement is true to the best of your knowledge',
        'Sign and date the statement',
      ],
      example: 'I declare under penalty of perjury that the foregoing is true and correct to the best of my knowledge and belief.\n\nSigned: ____________\nDate: ____________',
    },
  ],
  tips: [
    'Be specific with dates, locations, and details',
    'Use plain language - write like you\'re talking to a friend',
    'Focus on facts, not emotions',
    'Include all symptoms, even if they seem minor',
    'Describe impact on daily life (work, family, sleep, etc.)',
    'Attach any supporting evidence (photos, witness statements, etc.)',
    'Keep it to 1-3 pages',
    'Have someone proofread for clarity',
    'Sign and date the statement',
    'Make copies for your records',
  ],
};

/**
 * Generate lay statement from data
 */
export function generateLayStatement(data: LayStatementData): string {
  let statement = '';

  // Introduction
  statement += `My name is ${data.veteranName}. I am writing this statement to support my claim for service connection for ${data.condition}.\n\n`;

  // In-Service Event
  if (data.inServiceEvent) {
    statement += `IN-SERVICE EVENT:\n${data.inServiceEvent}\n\n`;
  }

  // Current Symptoms
  if (data.currentSymptoms.length > 0) {
    statement += `CURRENT SYMPTOMS:\n`;
    statement += `I currently experience the following symptoms:\n`;
    data.currentSymptoms.forEach(symptom => {
      statement += `- ${symptom}\n`;
    });
    statement += `\nThese symptoms occur ${data.frequency} and are ${data.severity} in severity.\n\n`;
  }

  // Impact on Life
  if (data.impactOnLife.length > 0) {
    statement += `IMPACT ON DAILY LIFE:\n`;
    statement += `This condition affects my daily life in the following ways:\n`;
    data.impactOnLife.forEach(impact => {
      statement += `- ${impact}\n`;
    });
    statement += '\n';
  }

  // Witnesses
  if (data.witnessedBy && data.witnessedBy.length > 0) {
    statement += `WITNESSES:\n`;
    statement += `The following people can verify my symptoms or the events:\n`;
    data.witnessedBy.forEach(witness => {
      statement += `- ${witness}\n`;
    });
    statement += '\n';
  }

  // Conclusion
  statement += `I declare under penalty of perjury that the foregoing is true and correct to the best of my knowledge and belief.\n\n`;
  statement += `Signed: ___________________________\n`;
  statement += `Date: ___________________________\n`;

  return statement;
}

/**
 * Get lay statement template
 */
export function getLayStatementTemplate(): LayStatementTemplate {
  return LAY_STATEMENT_TEMPLATE;
}

/**
 * Get lay statement tips
 */
export function getLayStatementTips(): string[] {
  return LAY_STATEMENT_TEMPLATE.tips;
}

/**
 * Validate lay statement
 */
export function validateLayStatement(statement: string): {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check length
  if (statement.length < 200) {
    warnings.push('Statement is very short - consider adding more detail');
  }

  if (statement.length > 5000) {
    warnings.push('Statement is very long - consider condensing to 1-3 pages');
  }

  // Check for signature
  if (!statement.includes('Signed:') && !statement.includes('Signature:')) {
    warnings.push('Missing signature line');
  }

  // Check for date
  if (!statement.includes('Date:')) {
    warnings.push('Missing date line');
  }

  // Check for first person
  if (!statement.toLowerCase().includes('i ')) {
    suggestions.push('Write in first person (I, my, me)');
  }

  // Check for specific details
  if (!statement.match(/\d{4}/)) { // Look for years
    suggestions.push('Include specific dates (month and year)');
  }

  // Check for impact section
  if (!statement.toLowerCase().includes('affect') && !statement.toLowerCase().includes('impact')) {
    suggestions.push('Describe how condition affects your daily life');
  }

  return {
    valid: warnings.length === 0,
    warnings,
    suggestions,
  };
}
