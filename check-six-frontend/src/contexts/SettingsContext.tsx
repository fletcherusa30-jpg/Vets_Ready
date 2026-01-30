import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BRANCH_THEMES, DEFAULT_THEME, BranchTheme } from '../data/branchThemes';
import { MILITARY_BACKGROUNDS, getDefaultBackground, MilitaryBackground } from '../data/militaryBackgrounds';

interface AppSettings {
  selectedTheme: string;
  selectedBackground: string;
  showAnimations: boolean;
  autoSaveProgress: boolean;
  lowTextureMode: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  currentTheme: BranchTheme;
  currentBackground: MilitaryBackground;
  updateTheme: (themeId: string) => void;
  updateBackground: (backgroundId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  selectedTheme: DEFAULT_THEME,
  selectedBackground: 'default-patriotic',
  showAnimations: true,
  autoSaveProgress: true,
  lowTextureMode: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Get current theme object
  const currentTheme = BRANCH_THEMES[settings.selectedTheme] || BRANCH_THEMES[DEFAULT_THEME];

  // Get current background object
  const currentBackground = MILITARY_BACKGROUNDS.find(bg => bg.id === settings.selectedBackground) || getDefaultBackground();

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateTheme = (themeId: string) => {
    if (BRANCH_THEMES[themeId]) {
      setSettings(prev => ({ ...prev, selectedTheme: themeId }));
    }
  };

  const updateBackground = (backgroundId: string) => {
    const background = MILITARY_BACKGROUNDS.find(bg => bg.id === backgroundId);
    if (background) {
      setSettings(prev => ({ ...prev, selectedBackground: backgroundId }));
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  return (
    <SettingsContext.Provider value={{ settings, currentTheme, currentBackground, updateTheme, updateBackground, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
