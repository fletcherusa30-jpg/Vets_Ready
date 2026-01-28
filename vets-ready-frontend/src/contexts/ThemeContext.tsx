import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useVeteranProfile } from './VeteranProfileContext';

export type ThemeMode = 'light' | 'dark' | 'high-contrast';

export type BranchAccent = {
  primary: string;
  secondary: string;
  gradient: string;
};

const branchAccents: Record<string, BranchAccent> = {
  'Army': {
    primary: '#4B5320',
    secondary: '#000000',
    gradient: 'linear-gradient(135deg, #4B5320 0%, #2C3E10 100%)'
  },
  'Navy': {
    primary: '#000080',
    secondary: '#FFD700',
    gradient: 'linear-gradient(135deg, #000080 0%, #001F5C 100%)'
  },
  'Air Force': {
    primary: '#5D8AA8',
    secondary: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #5D8AA8 0%, #4A6D82 100%)'
  },
  'Marine Corps': {
    primary: '#DC143C',
    secondary: '#FFD700',
    gradient: 'linear-gradient(135deg, #DC143C 0%, #A80F2D 100%)'
  },
  'Coast Guard': {
    primary: '#0066CC',
    secondary: '#FF6600',
    gradient: 'linear-gradient(135deg, #0066CC 0%, #004C99 100%)'
  },
  'Space Force': {
    primary: '#000000',
    secondary: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)'
  },
  'National Guard': {
    primary: '#B22234',
    secondary: '#3C3B6E',
    gradient: 'linear-gradient(135deg, #B22234 0%, #3C3B6E 100%)'
  }
};

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  branchAccent: BranchAccent;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useVeteranProfile();
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  const branchAccent = branchAccents[profile.branch || 'Army'] || branchAccents['Army'];
  const isDark = mode === 'dark';
  const isHighContrast = mode === 'high-contrast';

  useEffect(() => {
    localStorage.setItem('themeMode', mode);

    // Apply theme to document root
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);

    // Apply CSS variables
    if (mode === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f7fafc');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--shadow', '0 2px 4px rgba(0,0,0,0.1)');
    } else if (mode === 'dark') {
      root.style.setProperty('--bg-primary', '#1a202c');
      root.style.setProperty('--bg-secondary', '#2d3748');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#cbd5e0');
      root.style.setProperty('--border-color', '#4a5568');
      root.style.setProperty('--shadow', '0 2px 4px rgba(0,0,0,0.3)');
    } else {
      // High contrast
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#ffff00');
      root.style.setProperty('--border-color', '#ffffff');
      root.style.setProperty('--shadow', '0 2px 4px rgba(255,255,255,0.2)');
    }

    // Apply branch accent
    root.style.setProperty('--accent-primary', branchAccent.primary);
    root.style.setProperty('--accent-secondary', branchAccent.secondary);
    root.style.setProperty('--accent-gradient', branchAccent.gradient);
  }, [mode, branchAccent]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, branchAccent, isDark, isHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
