/**
 * Employment Hub Page
 * Main page for employment features: MOS translator, job matching, resume builder
 */

import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import ContentShell from '../components/Layout/ContentShell';
import { translateMOSToSkills, extractAllSkills, groupSkillsByCategory } from '../MatrixEngine/employment/mosToSkills';
import { matchJobsToMOS, getCareerPaths, getJobSearchTips } from '../MatrixEngine/employment/mosToJobs';
import { generateJobMatches, getTopMatches } from '../MatrixEngine/employment/jobMatchEngine';

const EmploymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'translator' | 'jobs' | 'resume' | 'tips'>('translator');
  const [mosCode, setMosCode] = useState('92R');
  const [branch, setBranch] = useState('Army');
  const [unknownMOS, setUnknownMOS] = useState(false);
  const [skipMOS, setSkipMOS] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const translatorRef = useRef<HTMLDivElement | null>(null);
  const branchDropdownRef = useRef<HTMLDivElement | null>(null);

  const branches = ['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'];

  // Keep the branch selector/MOS inputs in view on load and when returning to the translator tab
  useEffect(() => {
    if (activeTab === 'translator' && translatorRef.current) {
      translatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get MOS data with graceful degradation
  const mosMapping = (!skipMOS && mosCode && branch)
    ? translateMOSToSkills(mosCode, branch)
    : null;

  const skills = mosMapping ? mosMapping.skills : [];
  const skillsByCategory = groupSkillsByCategory(skills);
  const jobs = mosMapping ? matchJobsToMOS(mosCode, branch) : [];
  const careerPaths = mosMapping ? getCareerPaths(mosCode, branch) : [];
  const tips = getJobSearchTips(mosCode);

  // Show confidence warning for approximate results
  const showConfidenceWarning = mosMapping?.isApproximate || mosMapping?.confidence === 'low';

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
              Employment Hub
            </h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
              Translate your military experience, find jobs, and build your civilian career
            </p>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '24px',
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>
                  {skills.length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Your Marketable Skills</div>
              </div>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                  {jobs.length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Matching Jobs</div>
              </div>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>
                  {careerPaths.length}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Career Paths</div>
              </div>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                  Ready
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Job Search Status</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '16px',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '32px',
          }}>
            {[
              { id: 'translator', label: 'MOS Translator' },
              { id: 'jobs', label: 'Job Matches' },
              { id: 'resume', label: 'Resume Builder' },
              { id: 'tips', label: 'Job Search Tips' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MOS Input - POLICY COMPLIANT */}
          <div
            ref={translatorRef}
            style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            overflow: 'visible',
            }}
          >
            <div style={{ marginBottom: '16px', fontWeight: '600' }}>Your Military Background</div>

            {!skipMOS ? (
              <>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }} ref={branchDropdownRef}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                      Branch
                    </label>
                    <button
                      onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        minWidth: '150px',
                        cursor: 'pointer',
                        background: '#fff',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{branch}</span>
                      <span style={{ fontSize: '12px' }}>▼</span>
                    </button>
                    {branchDropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderTop: 'none',
                        borderRadius: '0 0 6px 6px',
                        zIndex: 1000,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}>
                        {branches.map(b => (
                          <div
                            key={b}
                            onClick={() => {
                              setBranch(b);
                              setBranchDropdownOpen(false);
                            }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              background: b === branch ? '#eff6ff' : '#fff',
                              color: b === branch ? '#2563eb' : '#000',
                              borderBottom: '1px solid #e2e8f0',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = b === branch ? '#dbeafe' : '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = b === branch ? '#eff6ff' : '#fff';
                            }}
                          >
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                      MOS/AFSC/Rating {!unknownMOS && <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>(e.g., 11B, 25B, 68W)</span>}
                    </label>
                    <input
                      type="text"
                      value={mosCode}
                      onChange={(e) => setMosCode(e.target.value.toUpperCase())}
                      placeholder="Enter your MOS/AFSC/Rating"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        minWidth: '200px',
                      }}
                    />
                  </div>
                </div>

                {/* POLICY: "I don't know" and "Skip" options */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button
                    onClick={() => {
                      setUnknownMOS(true);
                      setMosCode('UNKNOWN');
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    I don't know my MOS/AFSC
                  </button>
                  <button
                    onClick={() => setSkipMOS(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Skip for now
                  </button>
                </div>

                {/* MOS Recognition Feedback */}
                {mosMapping && !unknownMOS && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: showConfidenceWarning ? '#fef3c7' : '#eff6ff',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${showConfidenceWarning ? '#f59e0b' : '#2563eb'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{mosMapping.title}</strong> ({mosMapping.mosCode})
                        {showConfidenceWarning && (
                          <div style={{ fontSize: '13px', color: '#92400e', marginTop: '4px' }}>
                            ⚠️ We don't have specific data for this MOS. Showing estimated general military skills.
                          </div>
                        )}
                      </div>
                      {showConfidenceWarning && (
                        <button
                          onClick={() => {
                            // Future: Open manual skill entry
                            alert('Manual skill entry coming soon! For now, we\'ll show general military skills.');
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Add Skills Manually
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {unknownMOS && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#eff6ff',
                    borderRadius: '6px',
                    borderLeft: '4px solid #3b82f6',
                  }}>
                    <strong>No problem!</strong> We'll show you general military skills that apply to all service members.
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
                      You can add specific skills manually later, or describe your job duties in your own words.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ marginBottom: '12px', color: '#64748b' }}>
                  You've skipped MOS entry. We'll show general military skills.
                </div>
                <button
                  onClick={() => setSkipMOS(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Enter MOS/AFSC/Rating
                </button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'translator' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Your Civilian Skills {skipMOS && '(General Military Skills)'}
              </h2>

              {skills.length === 0 && (
                <div style={{
                  background: '#fff',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    No Skills Yet
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    Enter your MOS/AFSC/Rating above to see your translatable civilian skills, or add skills manually.
                  </p>
                  <button
                    onClick={() => setSkipMOS(false)}
                    style={{
                      padding: '12px 24px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Enter Military Background
                  </button>
                </div>
              )}

              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                    {category} Skills
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {categorySkills.map(skill => (
                      <div key={skill.id} style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                          <div style={{ fontWeight: '500', flex: 1 }}>{skill.name}</div>
                          {skill.confidence === 'low' && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              background: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '3px',
                              marginLeft: '8px',
                            }}>
                              Estimated
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b',
                            display: 'inline-block',
                            padding: '2px 8px',
                            background: skill.proficiencyLevel === 'Expert' ? '#dcfce7' :
                                       skill.proficiencyLevel === 'Advanced' ? '#dbeafe' :
                                       skill.proficiencyLevel === 'Intermediate' ? '#fef3c7' : '#f1f5f9',
                            borderRadius: '4px',
                          }}>
                            {skill.proficiencyLevel}
                          </div>
                          {skill.source && (
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                            }}>
                              {skill.source === 'mos-catalog' ? '📋 MOS' :
                               skill.source === 'user-entered' ? '✏️ Custom' :
                               '💡 Inferred'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {mosMapping && mosMapping.civilianEquivalents.length > 0 && (
                <div style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginTop: '24px',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Civilian Job Titles
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {mosMapping.civilianEquivalents.map((title, idx) => (
                      <div key={idx} style={{
                        padding: '10px 16px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: '6px',
                        fontWeight: '500',
                        border: '1px solid #bfdbfe',
                      }}>
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Jobs Matching Your MOS ({jobs.length} found)
              </h2>

              {jobs.map(job => (
                <div key={job.id} style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                        {job.title}
                      </h3>
                      {job.company && (
                        <div style={{ color: '#64748b', marginBottom: '8px' }}>{job.company}</div>
                      )}
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        📍 {job.location} • {job.jobType}
                      </div>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: job.matchScore >= 80 ? '#dcfce7' : job.matchScore >= 60 ? '#dbeafe' : '#fef3c7',
                      color: job.matchScore >= 80 ? '#166534' : job.matchScore >= 60 ? '#1e40af' : '#92400e',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '16px',
                    }}>
                      {job.matchScore}% Match
                    </div>
                  </div>

                  <p style={{ color: '#475569', marginBottom: '16px', lineHeight: '1.6' }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', gap: '32px', fontSize: '14px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Salary: </span>
                      <span style={{ fontWeight: '600' }}>
                        ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                      </span>
                    </div>
                    {job.veteranFriendly && (
                      <div style={{
                        color: '#10b981',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        ✓ Veteran-Friendly
                      </div>
                    )}
                    {job.clearanceRequired && (
                      <div>
                        <span style={{ color: '#64748b' }}>Clearance: </span>
                        <span style={{ fontWeight: '600' }}>{job.clearanceRequired}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                        Required Skills
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.requiredSkills.map((skill, idx) => (
                          <span key={idx} style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            borderRadius: '4px',
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                        Preferred Skills
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.preferredSkills.map((skill, idx) => (
                          <span key={idx} style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            background: '#eff6ff',
                            color: '#1e40af',
                            borderRadius: '4px',
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button style={{
                    marginTop: '16px',
                    padding: '10px 20px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}>
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resume' && (
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Resume Builder
              </h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Create a veteran-friendly resume that translates your military experience for civilian employers.
              </p>
              <button style={{
                padding: '14px 28px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}>
                Start Building Resume
              </button>
            </div>
          )}

          {activeTab === 'tips' && (
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
                Job Search Tips for {mosMapping?.title || 'Your MOS'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tips.map((tip, idx) => (
                  <div key={idx} style={{
                    padding: '16px 20px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb',
                    lineHeight: '1.6',
                  }}>
                    <span style={{ fontWeight: '600', marginRight: '8px' }}>Tip {idx + 1}:</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Disclaimer - POLICY COMPLIANT */}
          <div style={{
            marginTop: '48px',
            padding: '16px',
            background: '#fef3c7',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b',
            fontSize: '14px',
            color: '#92400e',
          }}>
            <strong>Note:</strong> This Employment Hub translates your military skills and suggests potential career paths.
            Job availability, salaries, and requirements vary by location and employer.
            {showConfidenceWarning && (
              <> If we don't have specific data for your MOS/AFSC/Rating, we show estimated skills based on general military experience.
              You can always add specific skills manually.</>
            )}
            {' '}Always verify job details directly with employers. This tool is for educational purposes only and does not guarantee employment.
          </div>
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default EmploymentPage;
