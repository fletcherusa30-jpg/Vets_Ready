import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">⚠️ Important Disclaimer</h3>
          <p className="footer-text">
            Rally Forge is an <strong>educational and organizational tool</strong> only.
            We are <strong>NOT affiliated</strong> with the U.S. Department of Veterans Affairs,
            Department of Defense, or any government agency. We do <strong>NOT</strong> file claims,
            provide legal advice, or guarantee outcomes.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">📋 File Your Claim</h3>
          <p className="footer-text">
            To submit your VA claim, visit{' '}
            <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer" className="footer-link">
              VA.gov
            </a>{' '}
            or work with an accredited Veterans Service Organization (VSO).
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">♿ Accessibility</h3>
          <p className="footer-text">
            This platform is designed to meet WCAG 2.1 AA standards. If you encounter
            accessibility issues, please contact us.
          </p>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 Rally Forge • Educational Tool Only • Not Government Affiliated</p>
        </div>
      </div>

      <style>{`
        .app-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: 4rem;
          padding: 3rem 1.5rem 2rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-section {
          margin-bottom: 2rem;
        }

        .footer-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.75rem 0;
        }

        .footer-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .footer-link {
          color: var(--accent-primary);
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
          margin-top: 1.5rem;
        }

        .copyright {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
          margin: 0;
        }

        @media (min-width: 768px) {
          .footer-content {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }

          .footer-bottom {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </footer>
  );
};
