// frontend/src/pages/Settings.tsx
import React from 'react';
import Page from '../components/layout/Page';
import { useTheme } from '../design-system/theme';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Page title="Settings">
      <h2>Settings</h2>
      <div>
        <label>Theme: </label>
        <button onClick={toggleTheme}>{theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}</button>
      </div>
    </Page>
  );
};

export default Settings;
