/**
 * External Jobs API Integration
 * Stub for future integration with external job boards and APIs
 */

export interface ExternalJobsIntegration {
  /**
   * Search jobs from external sources
   */
  searchJobs(query: string, filters?: JobSearchFilters): Promise<ExternalJob[]>;

  /**
   * Get job details
   */
  getJobDetails(jobId: string, source: string): Promise<ExternalJob>;

  /**
   * Post job alert
   */
  createJobAlert(criteria: JobAlertCriteria): Promise<string>;

  /**
   * Get job recommendations
   */
  getRecommendations(skills: string[], location: string): Promise<ExternalJob[]>;
}

export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  postUrl: string;
  source: string;
  postDate: Date;
}

export interface JobSearchFilters {
  location?: string;
  industry?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
}

export interface JobAlertCriteria {
  keywords: string[];
  location?: string;
  industry?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}
