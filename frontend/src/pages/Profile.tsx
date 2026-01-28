// frontend/src/pages/Profile.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';
import BackgroundSelector from '../components/profile/BackgroundSelector';
import { useAppStore } from '../store/appStore';

const Profile = () => {
  const user = useAppStore((s) => s.user);
  const [manualVeteranId, setManualVeteranId] = useState('');
  const activeVeteranId = user?.id || manualVeteranId.trim() || null;

  return (
    <Page title="Profile">
      <div style={{ display: 'grid', gap: '2rem' }}>
        <section style={{ background: '#0e1b24', color: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>Account Snapshot</h2>
          {user ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'grid', gap: '0.5rem' }}>
              <li><strong>Name:</strong> {user.name || '—'}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Service Branch:</strong> {user.service_branch || 'Not captured yet'}</li>
              <li><strong>Profile ID:</strong> {user.id || 'Pending assignment'}</li>
            </ul>
          ) : (
            <p style={{ marginBottom: '1rem' }}>Sign in to load your verified profile details.</p>
          )}

          {!user?.id && (
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="manual-vet-id" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.35rem' }}>
                Provide a Veteran ID to test personalization
              </label>
              <input
                id="manual-vet-id"
                type="text"
                placeholder="e.g. VET_001"
                value={manualVeteranId}
                onChange={(event) => setManualVeteranId(event.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: '#132534',
                  color: '#f8fafc',
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'rgba(248,250,252,0.7)', marginTop: '0.35rem' }}>
                This field is optional; authentication will populate it automatically in production.
              </p>
            </div>
          )}
        </section>

        <BackgroundSelector veteranId={activeVeteranId} />
      </div>
    </Page>
  );
};

export default Profile;
