/**
 * Community Domain Service
 * Mentor matching, mentee management, resource discovery
 */

export interface MentorProfile {
  id: string;
  name: string;
  expertise: string[];
  background: string;
  yearsOfExperience: number;
  availability: 'limited' | 'moderate' | 'flexible';
  goals: string;
  rating: number; // 1-5
  reviews: number;
  profileUrl: string;
}

export interface MenteeProfile {
  id: string;
  veteranId: string;
  goalsDescription: string;
  areasOfInterest: string[];
  preferredMentorBackground: string;
  expectations: string;
}

export interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'completed';
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  lastTouchDate: Date;
}

export interface LocalResourceGroup {
  id: string;
  name: string;
  type: 'support_group' | 'volunteer' | 'civic' | 'social';
  location: Location;
  meetingSchedule: string;
  description: string;
  contact: string;
  website?: string;
  memberCount: number;
  tags: string[];
}

export interface ICommunityService {
  // Mentor Discovery
  findMentors(interests: string[], backgroundPreference?: string): Promise<MentorProfile[]>;
  getMentorDetails(mentorId: string): Promise<MentorProfile>;
  getMentorsByExpertise(expertise: string): Promise<MentorProfile[]>;

  // Connection Management
  createMentorshipConnection(veteranId: string, mentorId: string): Promise<MentorshipConnection>;
  updateConnection(connectionId: string, updates: any): Promise<MentorshipConnection>;
  endConnection(connectionId: string): Promise<void>;
  getActiveConnections(veteranId: string): Promise<MentorshipConnection[]>;

  // Mentee Profile
  createMenteeProfile(veteranId: string, profile: MenteeProfile): Promise<MenteeProfile>;
  updateMenteeProfile(profileId: string, updates: any): Promise<MenteeProfile>;

  // Group Discovery
  findLocalGroups(veteranId: string, types?: string[]): Promise<LocalResourceGroup[]>;
  searchGroups(query: string, location?: any): Promise<LocalResourceGroup[]>;
  getGroupDetails(groupId: string): Promise<LocalResourceGroup>;

  // Network Building
  suggestConnections(veteranId: string): Promise<SuggestedConnection[]>;
  getCommunityEvents(): Promise<CommunityEvent[]>;
  getForumTopics(): Promise<ForumTopic[]>;
}

export interface Location {
  city: string;
  state: string;
  distance?: number; // miles
}

export interface SuggestedConnection {
  userId: string;
  name: string;
  commonInterests: string[];
  mutualConnections: number;
}

export interface CommunityEvent {
  id: string;
  name: string;
  date: Date;
  location: Location;
  type: string;
  description: string;
  registrationUrl: string;
  attendeeCount: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  replyCount: number;
  lastActivity: Date;
  tags: string[];
}
