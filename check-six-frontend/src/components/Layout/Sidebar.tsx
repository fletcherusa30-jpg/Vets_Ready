import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  path?: string;
  badge?: string;
}

const dashboardItems: SidebarItem[] = [
  { id: 'profile', icon: '👤', label: 'Profile Overview', path: '/dashboard?tab=profile' },
  { id: 'disabilities', icon: '📋', label: 'Disabilities & Ratings', path: '/dashboard?tab=disabilities' },
  { id: 'benefits', icon: '🎖️', label: 'Benefits Matrix', path: '/dashboard?tab=benefits' },
  { id: 'housing', icon: '🏠', label: 'Housing Wizard', path: '/dashboard?tab=housing' },
  { id: 'appeals', icon: '⚠️', label: 'Appeals Wizard', path: '/dashboard?tab=appeals' },
  { id: 'retirement', icon: '🎯', label: 'Transition & Retirement', path: '/dashboard?tab=retirement' },
  { id: 'discharge-upgrade', icon: '🎖️', label: 'Discharge Upgrade', path: '/dashboard?tab=discharge-upgrade' },
  { id: 'documents', icon: '📄', label: 'Evidence & Documents', path: '/dashboard?tab=documents' },
  { id: 'summary', icon: '✅', label: 'Summary', path: '/dashboard?tab=summary' }
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'profile';

  const handleItemClick = (item: SidebarItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Dashboard</h3>
          {dashboardItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          height: calc(100vh - 73px);
          position: sticky;
          top: 73px;
          overflow-y: auto;
        }

        .sidebar-content {
          padding: 1.5rem 0;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .sidebar-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0 1rem;
          margin: 0 0 0.75rem 0;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-primary);
          position: relative;
        }

        .sidebar-item:hover {
          background: var(--bg-primary);
        }

        .sidebar-item.active {
          background: var(--bg-primary);
          border-left: 3px solid var(--accent-primary);
          font-weight: 600;
        }

        .sidebar-item.active .sidebar-icon {
          transform: scale(1.1);
        }

        .sidebar-icon {
          font-size: 1.25rem;
          transition: transform 0.2s;
        }

        .sidebar-label {
          font-size: 0.875rem;
          flex: 1;
        }

        .sidebar-badge {
          background: var(--accent-primary);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 80px;
          }

          .sidebar-label,
          .sidebar-heading {
            display: none;
          }

          .sidebar-item {
            justify-content: center;
            padding: 1rem;
          }

          .sidebar-badge {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};
