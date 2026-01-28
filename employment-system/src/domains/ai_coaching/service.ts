import { VeteranProfile } from '../../../data/models/index.js';

/**
 * AI Coaching Service
 * Provides personalized AI-driven career coaching for veterans
 */

export interface CoachingSession {
  id: string;
  veteranId: string;
  topic: string;
  messages: CoachingMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CoachingMessage {
  role: 'veteran' | 'coach';
  content: string;
  timestamp: string;
}

export interface CoachingGoal {
  id: string;
  description: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

/**
 * Start a new coaching session
 */
export async function startCoachingSession(
  veteranId: string,
  topic: string
): Promise<CoachingSession> {
  const session: CoachingSession = {
    id: `session-${Date.now()}`,
    veteranId,
    topic,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Generate initial coaching message
  const initialMessage = generateInitialCoachingMessage(topic);
  session.messages.push({
    role: 'coach',
    content: initialMessage,
    timestamp: new Date().toISOString()
  });

  return session;
}

/**
 * Generate AI coaching response
 */
export async function generateCoachingResponse(
  session: CoachingSession,
  veteranMessage: string,
  veteranProfile: VeteranProfile
): Promise<string> {
  // Add veteran message to session
  session.messages.push({
    role: 'veteran',
    content: veteranMessage,
    timestamp: new Date().toISOString()
  });

  // Generate contextual response based on topic and veteran profile
  const response = await generateAIResponse(session, veteranProfile);

  // Add coach response to session
  session.messages.push({
    role: 'coach',
    content: response,
    timestamp: new Date().toISOString()
  });

  session.updatedAt = new Date().toISOString();

  return response;
}

/**
 * Generate initial coaching message based on topic
 */
function generateInitialCoachingMessage(topic: string): string {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('resume')) {
    return "I'm here to help you create a powerful resume that translates your military experience into civilian value. Let's start by discussing your target role. What type of position are you interested in?";
  }

  if (topicLower.includes('interview')) {
    return "Great! I'll help you prepare for interviews. Can you tell me about an upcoming interview or the type of role you're interviewing for?";
  }

  if (topicLower.includes('career') || topicLower.includes('transition')) {
    return "I'm here to guide you through your military-to-civilian career transition. What's your biggest concern or question about transitioning?";
  }

  if (topicLower.includes('job search')) {
    return "Let's develop an effective job search strategy. What industries or roles are you targeting?";
  }

  if (topicLower.includes('networking')) {
    return "Networking is crucial for veterans. Let's build your professional network. Have you started connecting with veterans in your target industry?";
  }

  return `I'm your AI career coach, here to help with ${topic}. What would you like to focus on today?`;
}

/**
 * Generate AI response (simplified - in production, use OpenAI API)
 */
async function generateAIResponse(
  session: CoachingSession,
  veteranProfile: VeteranProfile
): Promise<string> {
  const lastMessage = session.messages[session.messages.length - 1];
  const veteranMessage = lastMessage.content.toLowerCase();

  // Resume guidance
  if (session.topic.toLowerCase().includes('resume') || veteranMessage.includes('resume')) {
    return generateResumeGuidance(veteranProfile, veteranMessage);
  }

  // Interview guidance
  if (session.topic.toLowerCase().includes('interview') || veteranMessage.includes('interview')) {
    return generateInterviewGuidance(veteranProfile, veteranMessage);
  }

  // Job search guidance
  if (session.topic.toLowerCase().includes('job search') || veteranMessage.includes('job')) {
    return generateJobSearchGuidance(veteranProfile, veteranMessage);
  }

  // Networking guidance
  if (veteranMessage.includes('network') || veteranMessage.includes('connect')) {
    return generateNetworkingGuidance(veteranProfile);
  }

  // Salary negotiation
  if (veteranMessage.includes('salary') || veteranMessage.includes('negotiate')) {
    return generateSalaryGuidance(veteranProfile);
  }

  // General guidance
  return "I understand. Let me help you with that. Can you provide more details about your specific situation?";
}

function generateResumeGuidance(profile: VeteranProfile, message: string): string {
  const branch = profile.branchHistory[0]?.branch || 'military';
  const mos = profile.branchHistory[0]?.title || 'your MOS';

  return `Based on your ${branch} experience as ${mos}, here's what I recommend for your resume:

1. **Professional Summary**: Lead with your years of service and key accomplishments. Example: "Results-driven professional with ${profile.branchHistory.length}+ years ${branch} experience..."

2. **Skills Section**: Translate military skills to civilian terms:
   - ${profile.skills.slice(0, 3).map(s => `${s.name} (${s.level})`).join('\n   - ')}

3. **Experience Section**: Use STAR format for bullet points:
   - Situation: Brief context
   - Task: Your responsibility
   - Action: What you did
   - Result: Quantifiable outcome

4. **Keywords**: Make sure to include these for ATS:
   - ${profile.targetRoles.slice(0, 3).join(', ')}

Would you like me to help you draft a specific section?`;
}

function generateInterviewGuidance(profile: VeteranProfile, message: string): string {
  return `Let's prepare you for interviews. Here are the most common questions veterans face:

**1. "Tell me about yourself"**
   - Keep it to 2 minutes
   - Start with military background
   - Connect skills to the role
   - End with why you're excited about this opportunity

**2. "Why are you leaving the military?"**
   - Stay positive about your service
   - Focus on new opportunities and growth
   - Emphasize skills you want to apply

**3. "How will you adapt to civilian workplace?"**
   - Show you understand cultural differences
   - Emphasize flexibility and learning
   - Give examples of adapting in the past

**Common Mistakes to Avoid:**
- Using too much military jargon
- Being too modest about accomplishments
- Not researching the company
- Focusing on duties instead of achievements

Want to practice answering any specific questions?`;
}

function generateJobSearchGuidance(profile: VeteranProfile, message: string): string {
  return `Here's your personalized job search strategy:

**1. Target the Right Roles**
Based on your background, focus on:
${profile.targetRoles.slice(0, 3).map((role, i) => `${i + 1}. ${role}`).join('\n')}

**2. Leverage Veteran Resources**
- Hire Heroes USA
- RecruitMilitary
- Veterans Employment Center
- LinkedIn Veterans Program

**3. Optimize Your Applications**
- Customize resume for each role (80% match minimum)
- Use keywords from job description
- Lead with quantifiable achievements
- Highlight security clearance if applicable

**4. Timeline**
- Week 1-2: Perfect resume and LinkedIn
- Week 3-4: Apply to 10-15 quality positions
- Week 5+: Follow up and network

**5. Tracking**
Keep a spreadsheet: Company | Role | Applied Date | Follow-up Date | Status

What industry are you most interested in?`;
}

function generateNetworkingGuidance(profile: VeteranProfile): string {
  return `Networking is the #1 way veterans find jobs. Here's your action plan:

**LinkedIn Optimization (Do this first)**
1. Professional photo (civilian clothes, smile)
2. Headline: Don't say "Veteran" - say your target role
3. Summary: Translate military experience
4. Connect with 50+ people in your target industry

**Veteran Networks**
- American Corporate Partners (ACP) - Free mentorship
- Veterati - 1-on-1 mentoring
- Team RWB - Social + professional networking
- Your branch's professional association

**Informational Interviews**
Reach out to veterans in roles you want:
"Hi [Name], I'm transitioning from the [Branch] and interested in [Industry]. Would you have 15 minutes to share your experience?"

**Local Events**
- VFW / American Legion (but for networking, not just socializing)
- Industry conferences (many offer veteran discounts)
- Chamber of Commerce meetings

**Action Items This Week:**
1. Update LinkedIn profile
2. Connect with 10 people in target industry
3. Request 2 informational interviews
4. Join 1 veteran professional group

Want help crafting your LinkedIn outreach messages?`;
}

function generateSalaryGuidance(profile: VeteranProfile): string {
  return `Salary negotiation is critical - veterans often undervalue themselves. Here's how to negotiate:

**Research First**
1. Use Glassdoor, PayScale, Bureau of Labor Statistics
2. Factor in your security clearance (adds 10-20% value)
3. Consider total compensation (benefits, bonus, equity)

**When Asked About Salary Expectations:**
"I'm looking for a role that values my ${profile.branchHistory.length}+ years of experience and specialized skills in ${profile.skills.slice(0, 2).map(s => s.name).join(' and ')}. Based on my research for this market, I'm targeting $[X-Y]. However, I'm flexible depending on the total compensation package."

**Negotiation Tips:**
- Always negotiate (even if the offer seems good)
- Let them make the first offer when possible
- Ask for 10-20% more than you want
- Negotiate benefits if salary is fixed
- Get everything in writing

**What to Negotiate Beyond Salary:**
- Sign-on bonus
- Additional PTO
- Remote work days
- Professional development budget
- Relocation assistance
- Start date (extra month of military pay)

**Phrases That Work:**
- "I'm excited about this opportunity. Is there flexibility in the salary?"
- "Based on my research and unique qualifications, I was expecting closer to $[X]"
- "Can we discuss the total compensation package?"

What's your target salary range?`;
}

/**
 * Create coaching goals
 */
export async function createCoachingGoal(
  veteranId: string,
  description: string,
  targetDate: string
): Promise<CoachingGoal> {
  const goal: CoachingGoal = {
    id: `goal-${Date.now()}`,
    description,
    targetDate,
    status: 'not-started',
    milestones: generateMilestones(description, targetDate)
  };

  return goal;
}

/**
 * Generate milestones for a goal
 */
function generateMilestones(goalDescription: string, targetDate: string): Milestone[] {
  const milestones: Milestone[] = [];
  const target = new Date(targetDate);
  const now = new Date();
  const daysUntilTarget = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (goalDescription.toLowerCase().includes('job')) {
    // Job search milestones
    milestones.push(
      {
        id: 'm1',
        description: 'Perfect resume and LinkedIn profile',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.2) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm2',
        description: 'Apply to 15+ positions',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.4) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm3',
        description: 'Complete 5+ informational interviews',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.6) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm4',
        description: 'Receive and negotiate job offer',
        dueDate: targetDate,
        completed: false
      }
    );
  } else if (goalDescription.toLowerCase().includes('certif')) {
    // Certification milestones
    milestones.push(
      {
        id: 'm1',
        description: 'Research certification requirements and costs',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.1) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm2',
        description: 'Enroll in training course',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.3) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm3',
        description: 'Complete training and practice exams',
        dueDate: new Date(now.getTime() + (daysUntilTarget * 0.7) * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'm4',
        description: 'Pass certification exam',
        dueDate: targetDate,
        completed: false
      }
    );
  }

  return milestones;
}
