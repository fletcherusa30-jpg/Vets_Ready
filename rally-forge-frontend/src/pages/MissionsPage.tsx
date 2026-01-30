/**
 * Missions Page
 * Step-by-step mission packs for common veteran goals
 */

import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import ContentShell from '../components/ContentShell';
import { MISSION_PACKS, calculateMissionProgress } from '../MatrixEngine/missions/missionPackGenerator';

const MissionsPage: React.FC = () => {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const mission = selectedMission ? MISSION_PACKS.find(m => m.id === selectedMission) : null;
  const progress = mission ? calculateMissionProgress(mission, completedSteps) : null;

  const toggleStep = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(id => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  return (
    <AppLayout showSidebar={false}>
      <ContentShell width="wide" padding="large">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Mission Packs</h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
            Step-by-step guided workflows for achieving your most important goals
          </p>

          {!selectedMission ? (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Available Missions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {MISSION_PACKS.map((pack) => {
                  const mockProgress = calculateMissionProgress(pack, []);
                  return (
                    <div key={pack.id} style={{
                      background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                      onClick={() => setSelectedMission(pack.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{pack.icon}</div>
                      <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>{pack.title}</h3>
                      <p style={{ color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>{pack.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <span style={{
                          padding: '6px 12px', background: '#eff6ff', color: '#2563eb',
                          borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                        }}>
                          {pack.difficulty}
                        </span>
                        <span style={{
                          padding: '6px 12px', background: '#fef3c7', color: '#92400e',
                          borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                        }}>
                          {pack.estimatedTime}
                        </span>
                        <span style={{
                          padding: '6px 12px', background: '#f1f5f9', color: '#475569',
                          borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                        }}>
                          {pack.steps.length} steps
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${mockProgress.percentage}%`, height: '100%',
                            background: '#10b981', borderRadius: '4px',
                          }} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                          {mockProgress.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedMission(null)} style={{
                padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1',
                borderRadius: '6px', marginBottom: '24px', cursor: 'pointer', fontWeight: '500',
              }}>
                ← Back to All Missions
              </button>

              {mission && progress && (
                <>
                  <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                      <div>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{mission.icon}</div>
                        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{mission.title}</h2>
                        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>{mission.description}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{
                            padding: '6px 12px', background: '#eff6ff', color: '#2563eb',
                            borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                          }}>
                            {mission.difficulty}
                          </span>
                          <span style={{
                            padding: '6px 12px', background: '#fef3c7', color: '#92400e',
                            borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                          }}>
                            {mission.estimatedTime}
                          </span>
                          <span style={{
                            padding: '6px 12px', background: '#f1f5f9', color: '#475569',
                            borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                          }}>
                            {mission.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                          {progress.percentage}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {progress.completedSteps} of {progress.totalSteps} steps
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '16px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                      <div style={{
                        width: `${progress.percentage}%`, height: '100%',
                        background: progress.percentage === 100 ? '#10b981' : '#2563eb',
                        borderRadius: '8px', transition: 'width 0.3s',
                      }} />
                    </div>

                    {mission.blockers && mission.blockers.length > 0 && (
                      <div style={{
                        padding: '16px 20px', background: '#fef2f2', borderRadius: '8px',
                        border: '1px solid #ef4444', marginBottom: '24px',
                      }}>
                        <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                          ⚠️ Blockers Detected
                        </div>
                        <ul style={{ paddingLeft: '24px', margin: 0, color: '#dc2626' }}>
                          {mission.blockers.map((blocker, idx) => (
                            <li key={idx}>{blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Mission Steps</h3>
                    {mission.steps.map((step, idx) => {
                      const isCompleted = completedSteps.includes(step.id);
                      const isBlocked = step.blockers && step.blockers.length > 0;

                      return (
                        <div key={step.id} style={{
                          padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px',
                          marginBottom: '16px', background: isCompleted ? '#f0fdf4' : '#fff',
                          opacity: isBlocked ? 0.6 : 1,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                            <button onClick={() => !isBlocked && toggleStep(step.id)} disabled={isBlocked} style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              border: `2px solid ${isCompleted ? '#10b981' : '#cbd5e1'}`,
                              background: isCompleted ? '#10b981' : '#fff',
                              color: isCompleted ? '#fff' : '#64748b',
                              cursor: isBlocked ? 'not-allowed' : 'pointer',
                              fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {isCompleted ? '✓' : idx + 1}
                            </button>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '18px', fontWeight: '600', marginBottom: '8px',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                              }}>
                                {step.title}
                              </h4>
                              <p style={{ color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
                                {step.description}
                              </p>

                              {step.actionItems && step.actionItems.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                  <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}>
                                    Action Items:
                                  </div>
                                  <ul style={{ paddingLeft: '24px', margin: 0 }}>
                                    {step.actionItems.map((item, aidx) => (
                                      <li key={aidx} style={{ marginBottom: '4px', color: '#475569' }}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {step.resources && step.resources.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                  <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}>
                                    Resources:
                                  </div>
                                  {step.resources.map((resource, ridx) => (
                                    <div key={ridx} style={{
                                      padding: '8px 12px', background: '#f8fafc', borderRadius: '4px',
                                      marginBottom: '4px', fontSize: '14px',
                                    }}>
                                      <div style={{ fontWeight: '500' }}>{resource.title}</div>
                                      {resource.url && (
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{
                                          color: '#2563eb', fontSize: '13px',
                                        }}>
                                          {resource.url}
                                        </a>
                                      )}
                                      {resource.description && (
                                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                                          {resource.description}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {step.estimatedTime && (
                                <div style={{
                                  padding: '6px 12px', background: '#fef3c7', color: '#92400e',
                                  borderRadius: '4px', display: 'inline-block', fontSize: '13px', fontWeight: '500',
                                }}>
                                  ⏱ {step.estimatedTime}
                                </div>
                              )}

                              {step.blockers && step.blockers.length > 0 && (
                                <div style={{
                                  marginTop: '12px', padding: '12px', background: '#fef2f2', borderRadius: '6px',
                                  border: '1px solid #fecaca',
                                }}>
                                  <div style={{ fontWeight: '500', color: '#dc2626', fontSize: '14px', marginBottom: '4px' }}>
                                    🔒 Blocked by:
                                  </div>
                                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#dc2626', fontSize: '14px' }}>
                                    {step.blockers.map((blocker, bidx) => (
                                      <li key={bidx}>{blocker}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {progress.percentage === 100 && (
                    <div style={{
                      background: '#dcfce7', padding: '32px', borderRadius: '12px',
                      border: '2px solid #10b981', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                      <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
                        Mission Complete!
                      </h2>
                      <p style={{ fontSize: '16px', color: '#166534', marginBottom: '24px' }}>
                        Congratulations! You've completed all steps in this mission pack.
                      </p>
                      <button style={{
                        padding: '12px 32px', background: '#10b981', color: '#fff',
                        border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '16px', cursor: 'pointer',
                      }}>
                        Choose Next Mission →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </ContentShell>
    </AppLayout>
  );
};

export default MissionsPage;
