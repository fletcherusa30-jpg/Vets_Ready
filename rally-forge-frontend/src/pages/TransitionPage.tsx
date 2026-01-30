/**
 * Transition Hub Page - Separation & Career Transition Support
 *
 * WORKSPACE POLICY COMPLIANT:
 * - Educational transition guidance ONLY
 * - No VA claims work or ratings
 * - Career planning, MOS translation, employment resources
 * - Timeline: 24 months before to 24 months after separation
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { DocumentScanner } from '../components/DocumentScanner';

export const TransitionPage: React.FC = () => {
  const { currentTheme } = useSettings();
  const [activePhase, setActivePhase] = useState<'pre' | 'during' | 'post'>('pre');

  return (
    <div className="transition-page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`,
          color: currentTheme.colors.text,
          padding: '4rem 2rem',
          borderRadius: '12px',
          marginBottom: '3rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '100px', marginBottom: '1rem' }}>🎯</div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Transition Center
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, marginBottom: '2rem', lineHeight: 1.6 }}>
            Plan your military-to-civilian transition. From TAP to career launch—we've got you covered.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/employment"
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                background: currentTheme.colors.accent,
                color: currentTheme.colors.primary,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔍 Translate Your MOS
            </Link>
            <Link
              to="/education"
              style={{
                padding: '1.25rem 3rem',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.2)',
                color: currentTheme.colors.text,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📚 Explore Education
            </Link>
          </div>
        </div>
      </section>

      {/* Transition Timeline */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#2d3748'
        }}>
          Your Transition Timeline
        </h2>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'pre', label: '24 Months Before', icon: '📅' },
            { id: 'during', label: 'Separation Phase', icon: '🎖️' },
            { id: 'post', label: '24 Months After', icon: '🚀' }
          ].map(phase => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as any)}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: activePhase === phase.id ? 'bold' : 'normal',
                borderRadius: '8px',
                border: `2px solid ${activePhase === phase.id ? currentTheme.colors.primary : '#e2e8f0'}`,
                background: activePhase === phase.id ? currentTheme.colors.primary : 'white',
                color: activePhase === phase.id ? currentTheme.colors.text : '#2d3748',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {phase.icon} {phase.label}
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div style={{
          background: '#f7fafc',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {activePhase === 'pre' && (
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d3748' }}>
                Pre-Separation Phase (24-12 Months Out)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Attend TAP</strong> - Transition Assistance Program eligibility begins
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Research Careers</strong> - Use MOS translator to explore civilian jobs
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Plan Education</strong> - Decide on GI Bill usage and schools
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Financial Planning</strong> - Budget for transition expenses
                </li>
                <li style={{ padding: '0.75rem 0' }}>
                  ✅ <strong>Network Building</strong> - Connect with veteran employment organizations
                </li>
              </ul>
            </div>
          )}

          {activePhase === 'during' && (
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d3748' }}>
                Separation Phase (0-6 Months)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Final Out-Processing</strong> - Complete all separation paperwork
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Secure DD-214</strong> - Get multiple certified copies
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Healthcare Transition</strong> - Enroll in TRICARE, VA healthcare, or civilian insurance
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Job Applications</strong> - Apply to positions matching your skills
                </li>
                <li style={{ padding: '0.75rem 0' }}>
                  ✅ <strong>Relocate if Needed</strong> - Move to your post-military location
                </li>
              </ul>
            </div>
          )}

          {activePhase === 'post' && (
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d3748' }}>
                Post-Separation Phase (6-24 Months)
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Career Launch</strong> - Start new job or business
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Education Enrollment</strong> - Begin using GI Bill benefits
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Community Integration</strong> - Join veteran organizations
                </li>
                <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ✅ <strong>Benefits Optimization</strong> - Ensure all earned benefits are activated
                </li>
                <li style={{ padding: '0.75rem 0' }}>
                  ✅ <strong>Long-term Planning</strong> - Set career and financial goals
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Tools & Resources */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#2d3748'
        }}>
          Transition Tools
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Link
            to="/employment"
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#2d3748',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>MOS Translator</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
              Convert military skills to civilian job titles and find matching careers
            </p>
          </Link>

          <Link
            to="/employment"
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#2d3748',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Resume Builder</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
              Create civilian-friendly resumes that highlight your military experience
            </p>
          </Link>

          <Link
            to="/education"
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#2d3748',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>GI Bill Planner</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
              Maximize your education benefits and plan your academic career
            </p>
          </Link>

          <Link
            to="/jobs"
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#2d3748',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💼</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Job Board</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
              Browse veteran-friendly job opportunities across all industries
            </p>
          </Link>

          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Transition Checklist</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6, marginBottom: '1rem' }}>
              Complete interactive checklist covering all transition phases
            </p>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                background: currentTheme.colors.primary,
                color: currentTheme.colors.text,
                cursor: 'pointer'
              }}
            >
              Coming Soon
            </button>
          </div>

          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              gridColumn: 'span 2'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem', textAlign: 'center' }}>🗂️</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>DD-214 Document Scanner</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'center' }}>
              Scan and organize your DD-214 with automated field extraction
            </p>
            <DocumentScanner 
              onUploadComplete={(docId) => {
                // PRODUCTION TODO: Add proper success handling (e.g., redirect, show notification)
                // Document uploaded successfully with ID: docId
              }}
            />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{
        background: '#fff5f5',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderLeft: '4px solid #e53e3e',
          padding: '2rem',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#c53030', marginBottom: '1rem' }}>⚠️ Educational Resource Only</h3>
          <p style={{ color: '#4a5568', lineHeight: 1.6, marginBottom: '1rem' }}>
            rallyforge provides <strong>educational transition planning resources only</strong>. We do not provide legal advice, career counseling, or official transition services.
          </p>
          <p style={{ color: '#4a5568', lineHeight: 1.6 }}>
            For official transition assistance, visit your installation's <strong>Transition Assistance Program (TAP)</strong> office or <a href="https://www.dodtap.mil/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>DodTAP.mil</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default TransitionPage;

