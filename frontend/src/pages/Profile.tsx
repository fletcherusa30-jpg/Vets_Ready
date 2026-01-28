// frontend/src/pages/Profile.tsx
import React from 'react';
import Page from '../components/layout/Page';
import { useAppStore } from '../store/appStore';

const Profile = () => {
  const user = useAppStore((s) => s.user);
  return (
    <Page title="Profile">
      <div style={{ maxWidth: 400 }}>
        <h2>User Profile</h2>
        {user ? (
          <>
            <div><strong>Email:</strong> {user.email}</div>
          </>
        ) : (
          <div>No user info available.</div>
        )}
      </div>
    </Page>
  );
};

export default Profile;
