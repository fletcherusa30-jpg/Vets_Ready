import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: ThemeType;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('theme') as ThemeType) || 'light');

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#181a1b' : '#f7f8fa';
    document.body.style.color = theme === 'dark' ? '#f5f5f5' : '#222';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
