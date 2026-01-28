/**
 * Analytics Service
 * Event logging and aggregation for usage and outcomes (no PII in code)
 */

import { AnalyticsEvent, UserMetrics } from '../../data/models';

export interface PageViewEvent {
  userId: string;
  page: string;
  referrer?: string;
  sessionId: string;
  timestamp: Date;
}

export interface UserActionEvent {
  userId: string;
  action: string;
  domain: string;
  sessionId: string;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface GoalProgressEvent {
  userId: string;
  goalId: string;
  goalType: string;
  action: 'created' | 'updated' | 'completed' | 'abandoned';
  timestamp: Date;
}

export interface MetricsFilter {
  domain?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface AggregatedMetrics {
  uniqueUsers: number;
  totalSessions: number;
  totalPageViews: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  topActions: { action: string; count: number }[];
  goalCompletionRate: number;
  userRetention: number; // Percentage
}

export interface IAnalyticsService {
  // Event Logging
  logEvent(event: AnalyticsEvent): Promise<void>;
  logPageView(event: PageViewEvent): Promise<void>;
  logUserAction(event: UserActionEvent): Promise<void>;
  logGoalProgress(event: GoalProgressEvent): Promise<void>;

  // User Tracking
  trackUserFlow(userId: string, flow: string, metadata?: Record<string, any>): Promise<void>;
  getUserMetrics(userId: string): Promise<UserMetrics>;
  getSessionMetrics(sessionId: string): Promise<any>;

  // Aggregated Metrics
  getMetrics(filter: MetricsFilter): Promise<AggregatedMetrics>;
  getMetricsByDomain(domain: string, filter?: MetricsFilter): Promise<AggregatedMetrics>;
  getUserJourney(userId: string): Promise<Event[]>;

  // Reports
  generateDailyReport(): Promise<DailyReport>;
  generateWeeklyReport(): Promise<WeeklyReport>;
  exportMetrics(format: 'json' | 'csv'): Promise<string>;
}

export interface Event {
  eventType: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface DailyReport {
  date: Date;
  uniqueUsers: number;
  sessions: number;
  avgSessionDuration: number;
  topPages: string[];
  newUsers: number;
}

export interface WeeklyReport {
  weekStartDate: Date;
  weekEndDate: Date;
  uniqueUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  userRetention: number;
  topDomains: { domain: string; users: number }[];
  goalCompletionRate: number;
  keyInsights: string[];
}
