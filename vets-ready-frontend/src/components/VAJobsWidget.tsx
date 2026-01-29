/**
 * VA Jobs & Resources Widget
 *
 * Displays current VA job openings, career resources, and veteran employment opportunities
 * Integrates with VA jobs API and news feeds
 */

import React, { useState, useEffect } from 'react';

interface VAJob {
  title: string;
  location: string;
  url: string;
  organization: string;
  category: 'va' | 'vcs' | 'private' | 'skillbridge';
}

interface VAResource {
  title: string;
  description: string;
  url: string;
  type: 'job' | 'training' | 'transition' | 'education';
}

export const VAJobsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'resources'>('jobs');
  const [jobCategory, setJobCategory] = useState<'all' | 'va' | 'vcs' | 'private'>('all');
  const [loading, setLoading] = useState(false);

  // Featured VA jobs (can be fetched from API in production)
  const featuredJobs: VAJob[] = [
    {
      title: 'Peer Specialist',
      location: 'Nationwide',
      url: 'https://www.usajobs.gov/Search/Results/?k=peer%20support&d=VA&p=1&hp=public&hp=vet',
      organization: 'VA',
      category: 'va'
    },
    {
      title: 'Primary Care Physician',
      location: 'Nationwide',
      url: 'https://www.usajobs.gov/search/results/?k=primary%20care&p=1&hp=public',
      organization: 'VA',
      category: 'va'
    },
    {
      title: 'Food Service Worker',
      location: 'Multiple Locations',
      url: 'https://www.vacanteen.va.gov/VACANTEEN/VCSCareers.asp',
      organization: 'Veterans Canteen Service',
      category: 'vcs'
    },
    {
      title: 'SkillBridge Opportunities',
      location: 'Various',
      url: 'https://tenovallc.com/jobs-and-internships',
      organization: 'Multiple Employers',
      category: 'skillbridge'
    }
  ];

  const resources: VAResource[] = [
    {
      title: 'VA Careers - Translate Your Military Skills',
      description: 'Learn how your military experience translates to civilian VA careers',
      url: 'https://vacareers.va.gov/job-news-advice/translate-your-military-skills-to-a-civilian-career/',
      type: 'transition'
    },
    {
      title: 'Weekly VA Jobs Newsletter',
      description: 'Get the latest VA job postings delivered weekly',
      url: 'https://news.va.gov/category/vets-experience/vetresources/',
      type: 'job'
    },
    {
      title: 'The Honor Foundation - Vector Accelerator',
      description: 'Free military transition program for all veterans',
      url: 'https://news.va.gov/144724/honor-foundation-vector-free-program-veterans/',
      type: 'training'
    },
    {
      title: 'VR&E - Vocational Rehabilitation',
      description: 'Get help with job training and employment services',
      url: 'https://www.va.gov/careers-employment/vocational-rehabilitation/',
      type: 'training'
    }
  ];

  const filteredJobs = jobCategory === 'all'
    ? featuredJobs
    : featuredJobs.filter(job => job.category === jobCategory);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💼</span>
          <h2 className="text-2xl font-bold">VA Jobs & Resources</h2>
        </div>
        <p className="text-blue-100 text-sm">
          Explore VA career opportunities and veteran employment resources
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Job Openings
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'resources'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'jobs' ? (
          <div className="space-y-4">
            {/* Job Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setJobCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jobCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setJobCategory('va')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jobCategory === 'va'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VA Positions
              </button>
              <button
                onClick={() => setJobCategory('vcs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jobCategory === 'vcs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Canteen Service
              </button>
              <button
                onClick={() => setJobCategory('private')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  jobCategory === 'private'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Private Sector
              </button>
            </div>

            {/* Job Listings */}
            <div className="space-y-3">
              {filteredJobs.map((job, index) => (
                <a
                  key={index}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">📍 {job.location}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{job.organization}</span>
                      </div>
                    </div>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Browse More Link */}
            <div className="pt-4 border-t border-gray-200">
              <a
                href="https://vacareers.va.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <span>Browse All VA Careers</span>
                <span>→</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resources List */}
            {resources.map((resource, index) => (
              <div
                key={index}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {resource.type === 'job' && '💼'}
                    {resource.type === 'training' && '📚'}
                    {resource.type === 'transition' && '🎯'}
                    {resource.type === 'education' && '🎓'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      <span>Learn More</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Additional Resources */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h4 className="font-semibold text-gray-900">More Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="https://www.va.gov/careers-employment/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-600"
                >
                  <strong className="block mb-1">VA Careers & Employment</strong>
                  <span className="text-xs">Complete employment resource center</span>
                </a>
                <a
                  href="https://news.va.gov/category/vets-experience/vetresources/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-600"
                >
                  <strong className="block mb-1">VetResources Newsletter</strong>
                  <span className="text-xs">Weekly job postings and resources</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Pro Tip:</strong> Check back weekly for new job postings. VA updates positions every Thursday.
        </p>
      </div>
    </div>
  );
};

export default VAJobsWidget;
