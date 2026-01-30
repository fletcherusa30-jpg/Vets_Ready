import React from 'react';
import { useTheme } from '../../design-system/theme';

const NavBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <nav style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: theme === 'dark' ? '#222' : '#f5f5f5',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <span style={{ fontWeight: 700, fontSize: 20 }}>rallyforge</span>
      <button onClick={toggleTheme} style={{ fontSize: 18 }}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </nav>
  );
};

export default NavBar;

