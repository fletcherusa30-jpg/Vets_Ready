// frontend/src/pages/ResumeBuilder.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import ResumeSkills, { MOS_SKILLS } from '../components/ResumeSkills';
import styles from './ResumeBuilder.module.css';

const ResumeBuilder = () => {
  const [serviceHistory, setServiceHistory] = useState('');
  const [resume, setResume] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [mosCode, setMosCode] = useState('');
  const setResumeData = useAppStore((s) => s.setResumeData);

  // Strip prefixes and try to match MOS codes (e.g. "AFSC 1N0X1" -> "1N0X1")
  const normalizeCode = (code: string): string => {
    return code
      .replace(/^(AFSC|AFM|USN|USMC|USCG|USAF)\s*/i, '') // Remove service prefixes
      .trim()
      .toUpperCase();
  };

  const normalizedCode = normalizeCode(mosCode);
  const mosSkills = normalizedCode && MOS_SKILLS[normalizedCode] ? MOS_SKILLS[normalizedCode] : [];

  const handleGenerate = async () => {
    const res = await api.post('/resume/generate', {
      service_history: serviceHistory,
      skills: selectedSkills,
    });
    setResume(res.resume_text);
    setResumeData(res.resume_text);
  };

  return (
    <Page title="Resume Builder">
      <div className={styles.resumeBuilderContainer}>
        <label className={styles.mosLabel}>Enter MOS/AFSC/Rating Code:</label>
        <input
          type="text"
          value={mosCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMosCode(e.target.value)}
          placeholder="e.g. 11B, 68W, 3D1X2, 0311, AFSC 1N0X1, BM"
          className={styles.mosInput}
        />
        {normalizedCode && !mosSkills.length && (
          <div style={{ color: '#f44336', marginTop: '8px', fontSize: '14px' }}>
            No skills found for "{normalizedCode}". Try other codes from your military branch.
          </div>
        )}
        {mosSkills.length > 0 && (
          <div className={styles.mosSkillsList}>
            {mosSkills.map((skill: string) => (
              <span
                key={skill}
                onClick={() => setSelectedSkills((sel: string[]) => sel.includes(skill) ? sel : [...sel, skill])}
                className={styles.mosSkill + (selectedSkills.includes(skill) ? ' ' + styles.selected : '')}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <ResumeSkills onSelect={setSelectedSkills} />
      <textarea
        value={serviceHistory}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setServiceHistory(e.target.value)}
        placeholder="Enter your service history..."
        rows={6}
        className={styles.textarea}
      />
      <button onClick={handleGenerate}>Generate Resume</button>
      {resume && (
        <pre className={styles.resumeOutput}>{resume}</pre>
      )}
    </Page>
  );
};

export default ResumeBuilder;
