// frontend/src/pages/JobMatching.tsx
import React, { useEffect } from 'react';
import Page from '../components/layout/Page';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';

const JobMatching = () => {
  const jobMatches = useAppStore((s) => s.jobMatches);
  const setJobMatches = useAppStore((s) => s.setJobMatches);

  useEffect(() => {
    api.get('/jobs/matches').then(res => setJobMatches(res.matches));
  }, [setJobMatches]);

  return (
    <Page title="Job Matching">
      <h2>Job Matches</h2>
      <div>
        {jobMatches && jobMatches.length > 0 ? (
          jobMatches.map((job: any, idx: number) => (
            <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <strong>{job.title}</strong> at {job.company} <span style={{ float: 'right' }}>Score: {job.score}</span>
            </div>
          ))
        ) : (
          <p>No matches found.</p>
        )}
      </div>
    </Page>
  );
};

export default JobMatching;
