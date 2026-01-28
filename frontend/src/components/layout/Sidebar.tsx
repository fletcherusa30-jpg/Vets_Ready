import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/scanner', label: 'Scanner', icon: '📄' },
  { to: '/resume', label: 'Resume', icon: '📄' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/budget', label: 'Budget', icon: '💰' },
  { to: '/retirement', label: 'Retirement', icon: '🏖️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar: React.FC = () => (
  <aside style={{
    width: 220,
    background: '#fafbfc',
    borderRight: '1px solid #e0e0e0',
    height: '100vh',
    paddingTop: 16,
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
  }}>
    <nav>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            color: isActive ? '#1976d2' : '#333',
            textDecoration: 'none',
            fontWeight: isActive ? 700 : 400,
            background: isActive ? '#e3f2fd' : 'transparent',
            borderRadius: 8,
            margin: '4px 8px',
            fontSize: 16,
          })}
        >
          <span style={{ marginRight: 12 }}>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
