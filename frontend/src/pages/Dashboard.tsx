// frontend/src/pages/Dashboard.tsx
import React from 'react';
import Page from '../components/layout/Page';
import QuickActions from '../components/layout/QuickActions';

const Dashboard = () => (
  <Page title="Dashboard">
    <QuickActions />
    <div style={{ marginTop: 32 }}>
      <h2>Welcome to rallyforge!</h2>
      <p>This is your dashboard. Use the quick actions to get started.</p>
    </div>
  </Page>
);

export default Dashboard;

