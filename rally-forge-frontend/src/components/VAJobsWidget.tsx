import React, { useState } from 'react';

interface Job {
  id: string;
  title: string;
  organization: string;
  link: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
}

const VAJobsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'resources'>('jobs');

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Veterans Affairs Nurse',
      organization: 'VA Medical Centers',
      link: 'https://www.va.gov/careers'
    },
    {
      id: '2',
      title: 'IT Specialist',
      organization: 'VA Technology Services',
      link: 'https://www.va.gov/careers'
    },
    {
      id: '3',
      title: 'Administrative Specialist',
      organization: 'VA Regional Offices',
      link: 'https://www.va.gov/careers'
    },
    {
      id: '4',
      title: 'Benefits Advisor',
      organization: 'Veterans Benefits Administration',
      link: 'https://www.va.gov/careers'
    }
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Transition Training',
      description: 'Free resources to help you transition from military to civilian employment',
      link: 'https://www.military.com/transition'
    },
    {
      id: '2',
      title: 'VA Vocational Rehabilitation',
      description: 'Career counseling and training for veterans with service-connected disabilities',
      link: 'https://www.va.gov/careers'
    },
    {
      id: '3',
      title: 'GI Bill Employment Support',
      description: 'Education and training benefits to help advance your career',
      link: 'https://www.va.gov/education'
    },
    {
      id: '4',
      title: 'Veteran Job Boards',
      description: 'Curated job listings for veteran-friendly employers nationwide',
      link: 'https://www.hireheroesusa.org'
    }
  ];

  return (
    <div className="va-jobs-widget border-2 border-blue-900 rounded-lg p-6 mb-6 bg-blue-50">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Employment Opportunities & Resources</h3>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            💼 Job Openings
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'resources'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            📚 Training & Resources
          </button>
        </div>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-blue-900 mb-2">{job.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{job.organization}</p>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                View Details →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-blue-900 mb-2">{resource.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Learn More →
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 border-t border-blue-200 pt-4">
        <p>✓ Updated weekly with new opportunities</p>
      </div>
    </div>
  );
};

export const VAJobsWidgetComponent = VAJobsWidget;
export default VAJobsWidget;
