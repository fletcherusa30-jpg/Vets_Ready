import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { mode, setMode } = useTheme();
  const { profile } = useVeteranProfile();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const toggleTheme = () => {
    const modes: Array<'light' | 'dark' | 'high-contrast'> = ['light', 'dark', 'high-contrast'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo/Title */}
        <div className="header-brand" onClick={() => navigate('/')}>
          <div className="brand-icon">🎖️</div>
          <div className="brand-text">
            <h1 className="brand-title">Vets Ready</h1>
            <p className="brand-subtitle">VA Claims & Benefits Platform</p>
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-btn theme-toggle"
            aria-label="Toggle theme"
            title={`Current: ${mode}`}
          >
            {mode === 'light' && '☀️'}
            {mode === 'dark' && '🌙'}
            {mode === 'high-contrast' && '🔆'}
          </button>

          {/* Profile Menu */}
          <div className="profile-menu-container">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="header-btn profile-btn"
              aria-label="Profile menu"
            >
              <div className="profile-avatar">
                {profile.firstName?.[0] || 'V'}
              </div>
              <span className="profile-name">
                {profile.firstName || 'Veteran'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => navigate('/profile')}>
                  👤 Profile
                </div>
                <div className="dropdown-item" onClick={() => navigate('/dashboard')}>
                  📊 Dashboard
                </div>
                <div className="dropdown-item" onClick={() => navigate('/wizard')}>
                  🧭 Wizard
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}>
                  🚪 Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .app-header {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .header-brand:hover {
          opacity: 0.8;
        }

        .brand-icon {
          font-size: 2.5rem;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .header-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--accent-primary);
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .profile-menu-container {
          position: relative;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          min-width: 200px;
          z-index: 1000;
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .dropdown-item:hover {
          background: var(--bg-secondary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.5rem 0;
        }

        @media (max-width: 768px) {
          .brand-subtitle {
            display: none;
          }

          .profile-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
