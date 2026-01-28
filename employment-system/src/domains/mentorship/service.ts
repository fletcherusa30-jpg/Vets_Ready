/**
 * Veteran Mentorship Service
 * Connects veterans with experienced mentors for career guidance
 */

import type {
  VeteranProfile,
  BranchServiceRecord
} from '../../data/models/index.js';

export interface MentorProfile {
  id: string;
  name: string;
  email: string;
  branchHistory: BranchServiceRecord[];
  currentRole: string;
  currentCompany: string;
  industry: string;
  yearsInCivilianWorkforce: number;
  specialties: string[];
  mentoringSince: string;
  totalMentees: number;
  rating: number;
  bio: string;
  availability: 'available' | 'limited' | 'unavailable';
  preferredCommunication: ('email' | 'phone' | 'video' | 'in-person')[];
}

export interface MentorshipMatch {
  mentor: MentorProfile;
  matchScore: number;
  matchReasons: string[];
  recommendedTopics: string[];
  suggestedMeetingFrequency: string;
}

export interface MentorshipSession {
  id: string;
  veteranId: string;
  mentorId: string;
  scheduledDate: string;
  duration: number;
  topic: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: {
    rating: number;
    comments: string;
  };
}

const MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'mentor-1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Army',
        mosOrAfscOrRating: '25B',
        title: 'Information Technology Specialist',
        startDate: '2010-01-01',
        endDate: '2016-12-31',
        rankAtSeparation: 'SSG'
      }
    ],
    currentRole: 'Senior IT Manager',
    currentCompany: 'TechCorp',
    industry: 'Information Technology',
    yearsInCivilianWorkforce: 8,
    specialties: ['Career Transition', 'IT Careers', 'Resume Writing', 'Interview Prep'],
    mentoringSince: '2018-01-01',
    totalMentees: 45,
    rating: 4.8,
    bio: 'Transitioned from Army IT specialist to corporate IT leadership. Passionate about helping veterans navigate civilian careers.',
    availability: 'available',
    preferredCommunication: ['video', 'email']
  },
  {
    id: 'mentor-2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Marine Corps',
        mosOrAfscOrRating: '0651',
        title: 'Cyber Network Operator',
        startDate: '2012-01-01',
        endDate: '2020-12-31',
        rankAtSeparation: 'SSgt'
      }
    ],
    currentRole: 'Cybersecurity Director',
    currentCompany: 'SecureNet',
    industry: 'Cybersecurity',
    yearsInCivilianWorkforce: 4,
    specialties: ['Cybersecurity', 'Clearance Jobs', 'Technical Skills Development'],
    mentoringSince: '2021-06-01',
    totalMentees: 23,
    rating: 4.9,
    bio: 'Former Marine Corps cyber operator now leading cybersecurity teams. Expert in leveraging clearances.',
    availability: 'limited',
    preferredCommunication: ['video', 'phone']
  },
  {
    id: 'mentor-3',
    name: 'David Williams',
    email: 'david.w@example.com',
    branchHistory: [
      {
        id: 'service-1',
        branch: 'Air Force',
        mosOrAfscOrRating: '2T2X1',
        title: 'Air Transportation',
        startDate: '2008-01-01',
        endDate: '2018-12-31',
        rankAtSeparation: 'MSgt'
      }
    ],
    currentRole: 'VP of Operations',
    currentCompany: 'Logistics Solutions Inc',
    industry: 'Logistics',
    yearsInCivilianWorkforce: 6,
    specialties: ['Leadership Development', 'Operations Management', 'Logistics'],
    mentoringSince: '2019-01-01',
    totalMentees: 38,
    rating: 4.7,
    bio: 'Climbed from logistics coordinator to VP. Specialize in helping veterans transition into leadership roles.',
    availability: 'available',
    preferredCommunication: ['phone', 'email']
  }
];

/**
 * Find mentors matching veteran's background and goals
 */
export async function findMentors(
  veteran: VeteranProfile,
  maxResults: number = 5
): Promise<MentorshipMatch[]> {
  const matches: MentorshipMatch[] = [];

  for (const mentor of MOCK_MENTORS) {
    let score = 0;
    const reasons: string[] = [];

    // Match by branch (20 points)
    const veteranBranches = veteran.branchHistory.map(s => s.branch);
    const mentorBranches = mentor.branchHistory.map(s => s.branch);
    const branchMatch = veteranBranches.some(b => mentorBranches.includes(b));
    if (branchMatch) {
      score += 20;
      reasons.push('Served in same branch');
    }

    // Match by MOS/career field (25 points)
    const veteranMOS = veteran.branchHistory.map(s => s.mosOrAfscOrRating);
    const mentorMOS = mentor.branchHistory.map(s => s.mosOrAfscOrRating);
    if (veteranMOS.some(m => mentorMOS.includes(m))) {
      score += 25;
      reasons.push('Similar military specialty');
    }

    // Match by target industry (30 points)
    if (veteran.targetIndustries?.includes(mentor.industry)) {
      score += 30;
      reasons.push(`Works in your target industry: ${mentor.industry}`);
    }

    // Mentor experience (15 points)
    if (mentor.yearsInCivilianWorkforce >= 5) {
      score += 15;
      reasons.push(`${mentor.yearsInCivilianWorkforce} years civilian experience`);
    }

    // High mentor rating (10 points)
    if (mentor.rating >= 4.5) {
      score += 10;
      reasons.push(`Highly rated mentor (${mentor.rating}/5.0)`);
    }

    // Determine recommended topics
    const topics: string[] = [];
    if (veteran.currentEmploymentStatus === 'Transitioning') {
      topics.push('Career Transition Strategies');
    }
    if (!veteran.credentials || veteran.credentials.length === 0) {
      topics.push('Certification Planning');
    }
    topics.push('Resume and LinkedIn Optimization');
    topics.push('Interview Preparation');
    topics.push('Networking in Civilian World');

    matches.push({
      mentor,
      matchScore: Math.min(100, score),
      matchReasons: reasons,
      recommendedTopics: topics,
      suggestedMeetingFrequency: 'Bi-weekly for first 3 months, then monthly'
    });
  }

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, maxResults);
}

/**
 * Schedule mentorship session
 */
export async function scheduleMentorshipSession(
  veteranId: string,
  mentorId: string,
  scheduledDate: string,
  topic: string,
  duration: number = 60
): Promise<MentorshipSession> {
  return {
    id: `session-${Date.now()}`,
    veteranId,
    mentorId,
    scheduledDate,
    duration,
    topic,
    status: 'scheduled'
  };
}

/**
 * Submit feedback for completed session
 */
export async function submitSessionFeedback(
  sessionId: string,
  rating: number,
  comments: string
): Promise<MentorshipSession> {
  // In real implementation, update the session in database
  return {
    id: sessionId,
    veteranId: 'vet-1',
    mentorId: 'mentor-1',
    scheduledDate: new Date().toISOString(),
    duration: 60,
    topic: 'Career Transition',
    status: 'completed',
    feedback: {
      rating,
      comments
    }
  };
}

/**
 * Get mentorship recommendations based on veteran's journey stage
 */
export async function getMentorshipRecommendations(
  veteran: VeteranProfile
): Promise<{
  priority: 'critical' | 'high' | 'medium';
  recommendedActions: string[];
  suggestedMentorTypes: string[];
}> {
  const actions: string[] = [];
  const mentorTypes: string[] = [];
  let priority: 'critical' | 'high' | 'medium' = 'medium';

  if (veteran.currentEmploymentStatus === 'Transitioning') {
    priority = 'critical';
    actions.push('Connect with a mentor ASAP - you\'re in transition');
    actions.push('Schedule weekly check-ins during first month');
    mentorTypes.push('Recent transitioner (2-5 years civilian experience)');
  }

  if (!veteran.currentEmploymentStatus || veteran.currentEmploymentStatus === 'Unemployed') {
    priority = 'high';
    actions.push('Focus on job search strategies and interview prep');
    mentorTypes.push('Hiring manager or recruiter with veteran focus');
  }

  if (veteran.targetIndustries && veteran.targetIndustries.length > 0) {
    actions.push(`Seek mentor in your target industry: ${veteran.targetIndustries.join(', ')}`);
    mentorTypes.push(`Professional working in ${veteran.targetIndustries[0]}`);
  }

  actions.push('Join veteran networking groups');
  actions.push('Attend virtual coffee chats monthly');

  return {
    priority,
    recommendedActions: actions,
    suggestedMentorTypes: mentorTypes
  };
}
