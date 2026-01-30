/**
 * Job Board Page
 */

import React, { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  military_friendly: boolean;
  security_clearance: string;
  posted_date: string;
}

export const JobBoard: React.FC = () => {
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Cybersecurity Analyst',
      company: 'Defense Tech Solutions',
      location: 'San Diego, CA',
      salary: '$95,000 - $120,000',
      description: 'Seeking former military cyber professionals with security clearance',
      military_friendly: true,
      security_clearance: 'Secret',
      posted_date: '2026-01-20',
    },
    {
      id: '2',
      title: 'Logistics Manager',
      company: 'Global Supply Chain Corp',
      location: 'Fort Worth, TX',
      salary: '$75,000 - $90,000',
      description: 'Military logistics experience highly valued',
      military_friendly: true,
      security_clearance: 'None',
      posted_date: '2026-01-22',
    },
    {
      id: '3',
      title: 'Project Manager - Defense Contracts',
      company: 'Aerospace Dynamics',
      location: 'Colorado Springs, CO',
      salary: '$105,000 - $135,000',
      description: 'Top Secret clearance required. Veterans strongly encouraged to apply',
      military_friendly: true,
      security_clearance: 'Top Secret',
      posted_date: '2026-01-23',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-purple-800 rounded-lg shadow-2xl p-8 text-white border-4 border-yellow-500">
        <h1 className="text-4xl font-bold mb-4">💼 Veteran Job Board</h1>
        <p className="text-xl text-gray-200">Military-friendly careers for transitioning service members</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-blue-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-blue-900">
          <p className="text-3xl font-bold text-blue-900">{filteredJobs.length}</p>
          <p className="text-gray-600">Active Job Listings</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-green-600">
          <p className="text-3xl font-bold text-green-900">847</p>
          <p className="text-gray-600">Veterans Hired</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-purple-600">
          <p className="text-3xl font-bold text-purple-900">142</p>
          <p className="text-gray-600">Partner Companies</p>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 border-l-4 border-blue-900">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-1">{job.title}</h3>
                <p className="text-lg text-gray-700">{job.company}</p>
              </div>
              {job.military_friendly && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  🎖️ VETERAN FRIENDLY
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>📍</span>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>💰</span>
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>🔒</span>
                <span>Clearance: {job.security_clearance}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{job.description}</p>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
              <button className="bg-gradient-to-r from-blue-900 to-purple-800 text-white font-bold px-6 py-2 rounded-lg hover:shadow-lg transition">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* For Employers */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">For Employers</h2>
        <p className="text-xl mb-6">Connect with highly skilled veteran talent</p>
        <button className="bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:shadow-lg transition">
          Post a Job - Starting at $299
        </button>
      </div>
    </div>
  );
};

export default JobBoard;
