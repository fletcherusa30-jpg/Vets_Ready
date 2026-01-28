/**
 * Home Page - Entry Point for VetsReady Platform
 *
 * Purpose:
 * - Introduce the platform clearly and simply
 * - Explain what VetsReady does in plain language
 * - Provide a single obvious starting point
 * - Guide veteran into the Wizard (intake flow)
 *
 * Legal Compliance:
 * - Does NOT file claims
 * - Non-affiliation disclaimer
 * - Links to VA.gov
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { useSettings } from '../contexts/SettingsContext';

export const HomePage: React.FC = () => {
  const { profile } = useVeteranProfile();
  const { currentTheme } = useSettings();

  // Check if veteran has started their profile
  const hasStartedProfile = profile && (profile.branch || profile.vaDisabilityRating > 0);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section va-theme-bg va-theme-text">
        <div className="hero-content">
          <div className="hero-icon">{currentTheme.icon}</div>
          <h1 className="hero-title">Your One-Stop Veteran Support Platform</h1>
          <p className="hero-subtitle">
            Prepare your VA claim, discover benefits, understand your rating, and plan your transition—all in one place.
          </p>

          <div className="hero-ctas">
            <Link
              to="/wizard"
              className="btn-primary-large va-theme-accent-bg text-black"
            >
              {hasStartedProfile ? '📋 Continue Your Profile' : '🚀 Start Your Profile'}
            </Link>

            {hasStartedProfile && (
              <Link
                to="/dashboard"
                className="btn-secondary-large va-theme-card va-theme-text"
              >
                📊 View Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* WHAT THE PLATFORM DOES */}
      <section className="features-section">
        <h2 className="section-title">What VetsReady Does for You</h2>

        <div className="features-grid">
          <Link to="/benefits-center" className="feature-card bg-gradient-to-r from-green-400 to-green-700 text-white col-span-2">
            <div className="feature-icon text-6xl">💰</div>
            <h3 className="text-2xl mb-3">My Total Benefits Value</h3>
            <p className="text-lg leading-relaxed">
              See ALL your benefits in one place: Federal + State + Military Discounts.
              Calculate your total monthly and lifetime value. Don't leave money on the table!
            </p>
          </Link>

          <Link to="/va-knowledge" className="feature-card bg-gradient-to-r from-blue-400 to-blue-900 text-white col-span-2">
            <div className="feature-icon text-6xl">📚</div>
            <h3 className="text-2xl mb-3">VA Knowledge Center + AI Search</h3>
            <p className="text-lg leading-relaxed">
              Access M21-1 Manual, VA Policy Letters, and 38 CFR regulations.
              Ask our AI expert any VA question - powered by comprehensive knowledge to help you fight for your benefits.
            </p>
          </Link>

          <Link to="/claims" className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Claim Preparation</h3>
            <p>Organize your evidence, understand VA requirements, and prepare a complete claim package.</p>
          </Link>

          <Link to="/benefits" className="feature-card">
            <div className="feature-icon">🎖️</div>
            <h3>Benefits Discovery</h3>
            <p>Find all federal and state benefits you qualify for based on your service, rating, and location.</p>
          </Link>

          <Link to="/claims" className="feature-card">
            <div className="feature-icon">🧮</div>
            <h3>Rating Understanding</h3>
            <p>Calculate your combined rating using official VA math, including bilateral factor.</p>
          </Link>

          <Link to="/transition" className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Transition Support</h3>
            <p>Plan your military-to-civilian transition with MOS translation, resume building, and career resources.</p>
          </Link>

          <Link to="/retirement" className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Retirement Planning</h3>
            <p>Calculate military pension, manage disability pay, plan finances with TSP and investment tools.</p>
          </Link>

          <Link to="/evidence" className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Evidence Organization</h3>
            <p>Get a personalized checklist of evidence needed for your specific conditions.</p>
          </Link>

          <Link to="/dashboard" className="feature-card">
            <div className="feature-icon">👨‍👩‍👧‍👦</div>
            <h3>Family Benefits</h3>
            <p>Discover education, healthcare, and survivor benefits for your dependents.</p>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Upload Your Documents</h3>
            <p>Upload your DD214 and rating narrative (or enter information manually).</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Answer a Few Questions</h3>
            <p>Provide basic information about your service, conditions, and current status.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>See Everything You Qualify For</h3>
            <p>Get a complete benefits matrix, evidence checklist, and claim preparation guide.</p>
          </div>
        </div>

        <div className="start-wizard-cta">
          <Link
            to="/wizard"
            className="btn-primary"
            style={{
              background: currentTheme.colors.primary,
              color: currentTheme.colors.text
            }}
          >
            Get Started Now →
          </Link>
        </div>
      </section>

      {/* QUICK LINKS (if profile exists) */}
      {hasStartedProfile && (
        <section className="quick-links-section">
          <h2 className="section-title">Quick Access</h2>

          <div className="quick-links-grid">
            <Link to="/dashboard" className="quick-link-card">
              <div className="quick-link-icon">📊</div>
              <h3>Dashboard</h3>
              <p>View your complete benefits matrix</p>
            </Link>

            <Link to="/dashboard?tab=disabilities" className="quick-link-card">
              <div className="quick-link-icon">📋</div>
              <h3>Disabilities & Ratings</h3>
              <p>Manage your conditions and ratings</p>
            </Link>

            <Link to="/transition" className="quick-link-card">
              <div className="quick-link-icon">🎯</div>
              <h3>Transition Center</h3>
              <p>Career planning and transition resources</p>
            </Link>

            <Link to="/retirement" className="quick-link-card">
              <div className="quick-link-icon">💰</div>
              <h3>Retirement Planning</h3>
              <p>Military pension and financial planning</p>
            </Link>

            <Link to="/dashboard?tab=housing" className="quick-link-card">
              <div className="quick-link-icon">🏠</div>
              <h3>Housing Benefits</h3>
              <p>Explore home loan and housing grants</p>
            </Link>
          </div>
        </section>
      )}

      {/* FOOTER DISCLAIMERS */}
      <section className="disclaimers-section">
        <div className="disclaimer-card">
          <h3>⚠️ Important Notice</h3>
          <p>
            <strong>VetsReady is NOT affiliated with the Department of Veterans Affairs or any government agency.</strong>
          </p>
          <p>
            This platform is an educational and preparatory tool only. We do NOT file claims, provide legal advice, or guarantee benefits.
          </p>
          <p>
            To file your claim, you must visit the official VA website:
          </p>
          <a
            href="https://www.va.gov/disability/file-disability-claim/"
            target="_blank"
            rel="noopener noreferrer"
            className="va-link"
          >
            File Your Claim on VA.gov →
          </a>
        </div>

        <div className="footer-links">
          <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer">Official VA Website</a>
          <span>•</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/accessibility">Accessibility Statement</Link>
          <span>•</span>
          <Link to="/contact">Contact Us</Link>
        </div>
      </section>

      <style>{`
        .home-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-section {
          padding: 4rem 2rem;
          border-radius: 12px;
          margin-bottom: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-icon {
          font-size: 120px;
          margin-bottom: 1rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.95;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary-large,
        .btn-secondary-large {
          padding: 1.25rem 3rem;
          font-size: 1.2rem;
          font-weight: bold;
          border-radius: 8px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-primary-large:hover,
        .btn-secondary-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 2rem;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .features-section {
          padding: 3rem 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.2s;
          text-decoration: none;
          color: inherit;
          display: block;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: #4a5568;
          line-height: 1.6;
        }

        .how-it-works-section {
          padding: 3rem 2rem;
          background: #f7fafc;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          max-width: 1200px;
          margin: 0 auto 2rem;
        }

        .step-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          flex: 1;
          min-width: 250px;
          max-width: 350px;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: #667eea;
          color: white;
          font-size: 2rem;
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .step-arrow {
          font-size: 3rem;
          color: #667eea;
        }

        .step-card h3 {
          font-size: 1.3rem;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        .step-card p {
          color: #4a5568;
          line-height: 1.6;
        }

        .start-wizard-cta {
          text-align: center;
        }

        .btn-primary {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: bold;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
          display: inline-block;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .quick-links-section {
          padding: 3rem 2rem;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .quick-link-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: #2d3748;
          transition: transform 0.2s;
        }

        .quick-link-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .quick-link-icon {
          font-size: 3rem;
          margin-bottom: 0.75rem;
        }

        .quick-link-card h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }

        .quick-link-card p {
          color: #718096;
          font-size: 0.95rem;
        }

        .disclaimers-section {
          padding: 3rem 2rem;
          background: #fff5f5;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .disclaimer-card {
          background: white;
          border-left: 4px solid #e53e3e;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .disclaimer-card h3 {
          color: #c53030;
          margin-bottom: 1rem;
        }

        .disclaimer-card p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .va-link {
          display: inline-block;
          background: #c53030;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
        }

        .va-link:hover {
          background: #9b2c2c;
        }

        .footer-links {
          text-align: center;
          color: #718096;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .footer-links a {
          color: #667eea;
          text-decoration: none;
        }

        .footer-links a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .step-arrow {
            display: none;
          }

          .features-grid,
          .steps-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
