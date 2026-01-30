import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { BRANCH_THEMES } from '../data/branchThemes';

export const SettingsPanel: React.FC = () => {
  const { settings, currentTheme, updateTheme, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-24 z-50 p-3 rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border-2"
        style={{
          background: currentTheme.colors.primary,
          borderColor: currentTheme.colors.accent,
          color: currentTheme.colors.text
        }}
        title="Theme Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 shadow-2xl z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: currentTheme.colors.primary,
          borderLeft: `4px solid ${currentTheme.colors.accent}`
        }}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b-2" style={{ borderColor: currentTheme.colors.accent }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                ⚙️ Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-black hover:bg-opacity-20 transition"
                style={{ color: currentTheme.colors.text }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm opacity-80" style={{ color: currentTheme.colors.text }}>
              Customize your experience
            </p>
          </div>

          {/* Theme Selection */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <span>🎨</span> Background Theme
              </h3>
              <p className="text-sm mb-4 opacity-80" style={{ color: currentTheme.colors.text }}>
                Choose your military branch or preferred theme
              </p>
            </div>

            {/* Theme Cards */}
            <div className="space-y-3">
              {Object.values(BRANCH_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateTheme(theme.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    settings.selectedTheme === theme.id
                      ? 'ring-4 ring-yellow-400 ring-offset-2'
                      : 'hover:border-white'
                  }`}
                  style={{
                    background: theme.gradient,
                    borderColor: settings.selectedTheme === theme.id ? theme.colors.accent : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{theme.icon}</span>
                      <div className="text-left">
                        <div className="font-bold text-white">{theme.name}</div>
                        {settings.selectedTheme === theme.id && (
                          <div className="text-xs text-yellow-300 font-semibold">✓ Active</div>
                        )}
                      </div>
                    </div>
                    {settings.selectedTheme === theme.id && (
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Settings */}
            <div className="mt-8 pt-6 border-t-2" style={{ borderColor: currentTheme.colors.accent }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                <span>🔧</span> Preferences
              </h3>

              {/* Animations Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-black hover:bg-opacity-10 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      Animations
                    </div>
                    <div className="text-xs opacity-70" style={{ color: currentTheme.colors.text }}>
                      Enable visual effects
                    </div>
                  </div>
                </div>
                <input
                  id="showAnimations"
                  name="showAnimations"
                  type="checkbox"
                  checked={settings.showAnimations}
                  onChange={(e) => updateSettings({ showAnimations: e.target.checked })}
                  className="w-6 h-6 rounded"
                />
              </label>

              {/* Auto-Save Toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-black hover:bg-opacity-10 cursor-pointer mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <div className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      Auto-Save
                    </div>
                    <div className="text-xs opacity-70" style={{ color: currentTheme.colors.text }}>
                      Automatically save progress
                    </div>
                  </div>
                </div>
                <input
                  id="autoSaveProgress"
                  name="autoSaveProgress"
                  type="checkbox"
                  checked={settings.autoSaveProgress}
                  onChange={(e) => updateSettings({ autoSaveProgress: e.target.checked })}
                  className="w-6 h-6 rounded"
                />
              </label>
            </div>

            {/* Theme Preview */}
            <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
                Current Theme Colors:
              </div>
              <div className="flex gap-2">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white"
                  style={{ background: currentTheme.colors.primary }}
                  title="Primary"
                />
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white"
                  style={{ background: currentTheme.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-400"
                  style={{ background: currentTheme.colors.accent }}
                  title="Accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
