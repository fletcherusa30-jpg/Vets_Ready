/**
 * Life Map - Timeline Builder
 * Constructs interactive timeline of veteran's service and life events
 */

export type EventType =
  | 'Service'
  | 'Deployment'
  | 'Injury'
  | 'Diagnosis'
  | 'Rating Decision'
  | 'Appeal'
  | 'Employment'
  | 'Education'
  | 'Housing'
  | 'Family'
  | 'Award'
  | 'Training'
  | 'Other';

export interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  date: Date;
  endDate?: Date; // For events with duration (deployments, employment, education)
  description: string;
  location?: string;
  linkedDocuments?: string[]; // Document IDs
  metadata?: {
    unit?: string;
    mos?: string;
    rating?: string;
    condition?: string;
    employer?: string;
    school?: string;
    degree?: string;
    [key: string]: string | undefined;
  };
  color?: string; // Override default color for event type
  icon?: string; // Custom icon
}

/**
 * Event type color coding
 */
export const EVENT_COLORS: Record<EventType, string> = {
  Service: '#2563EB', // Blue
  Deployment: '#7C3AED', // Purple
  Injury: '#DC2626', // Red
  Diagnosis: '#DC2626', // Red
  'Rating Decision': '#16A34A', // Green
  Appeal: '#EA580C', // Orange
  Employment: '#7C3AED', // Purple
  Education: '#0891B2', // Teal
  Housing: '#92400E', // Brown
  Family: '#DB2777', // Pink
  Award: '#CA8A04', // Gold
  Training: '#0891B2', // Teal
  Other: '#6B7280', // Gray
};

/**
 * Extracts timeline events from veteran profile
 */
export function buildTimelineFromProfile(profile: {
  enlistmentDate?: Date | string;
  dischargeDate?: Date | string;
  branch?: string;
  rank?: string;
  mos?: string;
  deployments?: Array<{
    location: string;
    startDate: Date | string;
    endDate?: Date | string;
    unit?: string;
  }>;
  serviceConnectedConditions?: Array<{
    condition: string;
    rating: number;
    effectiveDate?: Date | string;
  }>;
  claimHistory?: Array<{
    claimNumber: string;
    filedDate: Date | string;
    decisionDate?: Date | string;
    status: string;
  }>;
  appeals?: Array<{
    appealType: string;
    filedDate: Date | string;
    status: string;
  }>;
  employmentHistory?: Array<{
    employer: string;
    title: string;
    startDate: Date | string;
    endDate?: Date | string;
  }>;
  educationHistory?: Array<{
    school: string;
    degree?: string;
    startDate: Date | string;
    endDate?: Date | string;
  }>;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Service events
  if (profile.enlistmentDate) {
    events.push({
      id: `service-enlist-${Date.now()}`,
      type: 'Service',
      title: `Enlisted in ${profile.branch || 'Military'}`,
      date: new Date(profile.enlistmentDate),
      description: `${profile.rank || 'Rank unknown'}, ${profile.mos || 'MOS unknown'}`,
      metadata: {
        branch: profile.branch,
        rank: profile.rank,
        mos: profile.mos,
      },
    });
  }

  if (profile.dischargeDate) {
    events.push({
      id: `service-discharge-${Date.now()}`,
      type: 'Service',
      title: `Discharged from ${profile.branch || 'Military'}`,
      date: new Date(profile.dischargeDate),
      description: profile.dischargeDescription || 'Honorable Discharge', // Expert stub: Use profile field if available
      metadata: {
        branch: profile.branch,
      },
    });
  }

  // Deployment events
  if (profile.deployments) {
    profile.deployments.forEach((deployment, index) => {
      events.push({
        id: `deployment-${index}-${Date.now()}`,
        type: 'Deployment',
        title: `Deployed to ${deployment.location}`,
        date: new Date(deployment.startDate),
        endDate: deployment.endDate ? new Date(deployment.endDate) : undefined,
        description: deployment.unit || 'Deployment',
        location: deployment.location,
        metadata: {
          unit: deployment.unit,
          location: deployment.location,
        },
      });
    });
  }

  // Rating decisions (from service-connected conditions)
  if (profile.serviceConnectedConditions) {
    profile.serviceConnectedConditions.forEach((condition, index) => {
      if (condition.effectiveDate) {
        events.push({
          id: `rating-${index}-${Date.now()}`,
          type: 'Rating Decision',
          title: `Rated ${condition.rating}% for ${condition.condition}`,
          date: new Date(condition.effectiveDate),
          description: `Service-connected: ${condition.condition}`,
          metadata: {
            condition: condition.condition,
            rating: `${condition.rating}%`,
          },
        });
      }
    });
  }

  // Appeal events
  if (profile.appeals) {
    profile.appeals.forEach((appeal, index) => {
      events.push({
        id: `appeal-${index}-${Date.now()}`,
        type: 'Appeal',
        title: `${appeal.appealType} Filed`,
        date: new Date(appeal.filedDate),
        description: `Status: ${appeal.status}`,
        metadata: {
          appealType: appeal.appealType,
          status: appeal.status,
        },
      });
    });
  }

  // Employment events
  if (profile.employmentHistory) {
    profile.employmentHistory.forEach((job, index) => {
      events.push({
        id: `employment-${index}-${Date.now()}`,
        type: 'Employment',
        title: `${job.title} at ${job.employer}`,
        date: new Date(job.startDate),
        endDate: job.endDate ? new Date(job.endDate) : undefined,
        description: job.employer,
        metadata: {
          employer: job.employer,
          title: job.title,
        },
      });
    });
  }

  // Education events
  if (profile.educationHistory) {
    profile.educationHistory.forEach((edu, index) => {
      events.push({
        id: `education-${index}-${Date.now()}`,
        type: 'Education',
        title: edu.degree ? `${edu.degree} - ${edu.school}` : edu.school,
        date: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        description: edu.school,
        metadata: {
          school: edu.school,
          degree: edu.degree,
        },
      });
    });
  }

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}

/**
 * Groups events by year for display optimization
 */
export function groupEventsByYear(events: TimelineEvent[]): Record<number, TimelineEvent[]> {
  const grouped: Record<number, TimelineEvent[]> = {};

  for (const event of events) {
    const year = event.date.getFullYear();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(event);
  }

  return grouped;
}

/**
 * Filters events by type
 */
export function filterEventsByType(
  events: TimelineEvent[],
  types: EventType[]
): TimelineEvent[] {
  return events.filter(event => types.includes(event.type));
}

/**
 * Filters events by date range
 */
export function filterEventsByDateRange(
  events: TimelineEvent[],
  startDate: Date,
  endDate: Date
): TimelineEvent[] {
  return events.filter(
    event =>
      event.date >= startDate &&
      event.date <= endDate
  );
}

/**
 * Adds a user-generated event to timeline
 */
export function addCustomEvent(
  events: TimelineEvent[],
  newEvent: Omit<TimelineEvent, 'id'>
): TimelineEvent[] {
  const event: TimelineEvent = {
    ...newEvent,
    id: `custom-${Date.now()}`,
  };

  const updatedEvents = [...events, event];
  updatedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  return updatedEvents;
}

/**
 * Removes an event from timeline
 */
export function removeEvent(events: TimelineEvent[], eventId: string): TimelineEvent[] {
  return events.filter(event => event.id !== eventId);
}

/**
 * Gets summary statistics for timeline
 */
export function getTimelineStatistics(events: TimelineEvent[]): {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  serviceYears?: number;
} {
  const eventsByType: Record<EventType, number> = {
    Service: 0,
    Deployment: 0,
    Injury: 0,
    Diagnosis: 0,
    'Rating Decision': 0,
    Appeal: 0,
    Employment: 0,
    Education: 0,
    Housing: 0,
    Family: 0,
    Award: 0,
    Training: 0,
    Other: 0,
  };

  for (const event of events) {
    eventsByType[event.type]++;
  }

  const dates = events.map(e => e.date.getTime());
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  // Calculate service years if enlistment and discharge are present
  const enlistmentEvent = events.find(e => e.type === 'Service' && e.title.includes('Enlisted'));
  const dischargeEvent = events.find(e => e.type === 'Service' && e.title.includes('Discharged'));
  let serviceYears: number | undefined;

  if (enlistmentEvent && dischargeEvent) {
    const diffMs = dischargeEvent.date.getTime() - enlistmentEvent.date.getTime();
    serviceYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  return {
    totalEvents: events.length,
    eventsByType,
    dateRange: {
      earliest,
      latest,
    },
    serviceYears,
  };
}
