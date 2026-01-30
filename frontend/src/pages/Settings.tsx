// frontend/src/pages/Settings.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';
import { useTheme } from '../design-system/theme';
import { useAppStore } from '../store/appStore';
import './Settings.css';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const user = useAppStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');
  const [editMode, setEditMode] = useState(false);

  return (
    <Page title="Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your profile, account, and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            🔐 Account
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <div className="panel-header">
                <h2>Veteran Profile</h2>
                <button
                  className="btn-edit"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? '✓ Done' : '✏️ Edit'}
                </button>
              </div>

              {user ? (
                <div className="profile-info">
                  <div className="info-group">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>

                  {user.name && (
                    <div className="info-group">
                      <label>Name</label>
                      <p>{user.name}</p>
                    </div>
                  )}

                  {user.service_branch && (
                    <div className="info-group">
                      <label>Service Branch</label>
                      <p>{user.service_branch}</p>
                    </div>
                  )}

                  {editMode && (
                    <div className="edit-form">
                      <p className="note">Profile editing coming soon. Contact support to update your information.</p>
                    </div>
                  )}

                  <div className="completion-indicator">
                    <p>✓ Profile Created</p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>📋 No profile information available</p>
                  <a href="/profile" className="btn-primary">Create Profile →</a>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="settings-panel">
              <h2>Account Settings</h2>

              <div className="account-section">
                <h3>Email & Login</h3>
                <div className="info-group">
                  <label>Email Address</label>
                  <p>{user?.email || 'Not set'}</p>
                  <button className="btn-secondary">Change Email</button>
                </div>

                <div className="info-group">
                  <label>Password</label>
                  <p>••••••••</p>
                  <button className="btn-secondary">Change Password</button>
                </div>
              </div>

              <div className="account-section">
                <h3>Two-Factor Authentication</h3>
                <div className="info-group">
                  <label>2FA Status</label>
                  <p>Not enabled</p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>
              </div>

              <div className="account-section danger-zone">
                <h3>Danger Zone</h3>
                <button className="btn-danger">Delete Account</button>
                <p className="warning-text">This action cannot be undone. All your data will be permanently deleted.</p>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-panel">
              <h2>Preferences</h2>

              <div className="preference-section">
                <h3>Theme</h3>
                <div className="setting-item">
                  <label htmlFor="theme-toggle">Appearance</label>
                  <button
                    id="theme-toggle"
                    className="btn-toggle"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                </div>
              </div>

              <div className="preference-section">
                <h3>Notifications</h3>
                <div className="setting-item">
                  <label>Email Notifications</label>
                  <input type="checkbox" defaultChecked aria-label="Email Notifications" />
                  <span className="setting-description">Receive email updates about benefits and tools</span>
                </div>

                <div className="setting-item">
                  <label>Benefit Alerts</label>
                  <input type="checkbox" defaultChecked aria-label="Benefit Alerts" />
                  <span className="setting-description">Get notified about new VA benefits you may qualify for</span>
                </div>

                <div className="setting-item">
                  <label>Marketing Emails</label>
                  <input type="checkbox" aria-label="Marketing Emails" />
                  <span className="setting-description">Receive news and updates from rallyforge</span>
                </div>
              </div>

              <div className="preference-section">
                <h3>Data & Privacy</h3>
                <div className="setting-item">
                  <label>Share with VSO Partners</label>
                  <input type="checkbox" aria-label="VSO Sharing" />
                  <span className="setting-description">Allow Veterans Service Organizations to see your benefits</span>
                </div>

                <div className="setting-item">
                  <label>Analytics</label>
                  <input type="checkbox" defaultChecked aria-label="Analytics" />
                  <span className="setting-description">Help us improve rallyforge with usage analytics</span>
                </div>
              </div>

              <div className="preference-section">
                <h3>Export Data</h3>
                <p className="description">Download a copy of your data for backup or portability</p>
                <button className="btn-secondary">Download My Data</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Settings;

