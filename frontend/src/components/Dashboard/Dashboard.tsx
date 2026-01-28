/**
 * Dashboard Component - Main veteran dashboard
 * Displays veteran profile, latest resume, job matches, and quick links
 * Phase 3 - Frontend Development
 */

import React, { useState, useEffect } from 'react';
import { veteranAPI, resumeAPI, jobAPI, budgetAPI, healthAPI } from '../../services/api';
import type { Veteran, Resume, JobMatch, Budget, PlatformStats } from '../../types/models';
import './Dashboard.css';

interface DashboardProps {
  veteranId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ veteranId }) => {
  const [veteran, setVeteran] = useState<Veteran | null>(null);
  const [latestResume, setLatestResume] = useState<Resume | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [veteranId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [veteranData, resumeData, matchesData, budgetData, statsData] = await Promise.allSettled([
        veteranAPI.getById(veteranId),
        resumeAPI.getLatest(veteranId),
        jobAPI.getActive(),
        budgetAPI.getCurrent(veteranId),
        healthAPI.stats(),
      ]);

      if (veteranData.status === 'fulfilled') {
        setVeteran(veteranData.value);
      }

      if (resumeData.status === 'fulfilled') {
        setLatestResume(resumeData.value);
      }

      if (matchesData.status === 'fulfilled') {
        setJobMatches(matchesData.value.jobs.slice(0, 5)); // Top 5 jobs
      }

      if (budgetData.status === 'fulfilled') {
        setCurrentBudget(budgetData.value);
      }

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {veteran?.first_name}!</h1>
        <p className="dashboard-subtitle">
          {veteran?.service_branch} Veteran • {veteran?.years_service} years of service
        </p>
      </header>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <h2>Your Profile</h2>
          {veteran && (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">
                  {veteran.first_name} {veteran.last_name}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{veteran.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Service Branch:</span>
                <span className="value">{veteran.service_branch}</span>
              </div>
              <div className="info-row">
                <span className="label">Rank:</span>
                <span className="value">{veteran.separation_rank}</span>
              </div>
              <div className="info-row">
                <span className="label">Disability Rating:</span>
                <span className="value">{veteran.disability_rating}%</span>
              </div>
              <div className="info-row">
                <span className="label">Profile Complete:</span>
                <span className={`badge ${veteran.profile_complete ? 'badge-success' : 'badge-warning'}`}>
                  {veteran.profile_complete ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => (window.location.href = '/profile')}>
            Edit Profile
          </button>
        </div>

        {/* Latest Resume Card */}
        <div className="dashboard-card resume-card">
          <h2>Latest Resume</h2>
          {latestResume ? (
            <div className="resume-info">
              <p className="resume-title">{latestResume.title}</p>
              <p className="resume-version">Version: {latestResume.version}</p>
              <p className="resume-summary">{latestResume.summary}</p>
              <div className="resume-skills">
                <strong>Skills:</strong>
                <div className="skill-tags">
                  {latestResume.skills.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => (window.location.href = '/resume')}>
                View Full Resume
              </button>
            </div>
          ) : (
            <div className="resume-empty">
              <p>No resume yet</p>
              <button className="btn btn-primary" onClick={() => (window.location.href = '/resume/create')}>
                Create Resume
              </button>
            </div>
          )}
        </div>

        {/* Job Matches Card */}
        <div className="dashboard-card jobs-card">
          <h2>Top Job Opportunities</h2>
          {jobMatches.length > 0 ? (
            <div className="job-list">
              {jobMatches.map((job: any) => (
                <div key={job.id} className="job-item">
                  <h3>{job.title}</h3>
                  <p className="job-company">{job.company}</p>
                  <p className="job-location">{job.location}</p>
                  {job.remote && <span className="badge badge-info">Remote</span>}
                </div>
              ))}
            </div>
          ) : (
            <p>No job matches yet</p>
          )}
          <button className="btn btn-secondary" onClick={() => (window.location.href = '/jobs')}>
            View All Jobs
          </button>
        </div>

        {/* Budget Card */}
        <div className="dashboard-card budget-card">
          <h2>Current Budget</h2>
          {currentBudget ? (
            <div className="budget-info">
              <div className="budget-row">
                <span>Income:</span>
                <span className="amount income">${currentBudget.total_income.toLocaleString()}</span>
              </div>
              <div className="budget-row">
                <span>Expenses:</span>
                <span className="amount expenses">${currentBudget.total_expenses.toLocaleString()}</span>
              </div>
              <div className="budget-row budget-total">
                <span>Net:</span>
                <span className={`amount ${currentBudget.total_income - currentBudget.total_expenses >= 0 ? 'positive' : 'negative'}`}>
                  ${(currentBudget.total_income - currentBudget.total_expenses).toLocaleString()}
                </span>
              </div>
              <button className="btn btn-secondary" onClick={() => (window.location.href = '/budget')}>
                Manage Budget
              </button>
            </div>
          ) : (
            <div className="budget-empty">
              <p>No budget created for this month</p>
              <button className="btn btn-primary" onClick={() => (window.location.href = '/budget/create')}>
                Create Budget
              </button>
            </div>
          )}
        </div>

        {/* Platform Stats Card */}
        {stats && (
          <div className="dashboard-card stats-card">
            <h2>Platform Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_veterans.toLocaleString()}</div>
                <div className="stat-label">Total Veterans</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.active_jobs.toLocaleString()}</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_resumes.toLocaleString()}</div>
                <div className="stat-label">Resumes Generated</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Card */}
        <div className="dashboard-card quick-links-card">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <a href="/scanner" className="quick-link-button">
              <span className="icon">📄</span>
              <span>Upload DD214</span>
            </a>
            <a href="/resume/create" className="quick-link-button">
              <span className="icon">📝</span>
              <span>Generate Resume</span>
            </a>
            <a href="/jobs" className="quick-link-button">
              <span className="icon">💼</span>
              <span>Find Jobs</span>
            </a>
            <a href="/budget" className="quick-link-button">
              <span className="icon">💰</span>
              <span>Financial Planning</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
