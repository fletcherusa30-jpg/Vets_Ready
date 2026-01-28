import React from 'react';
import NavBar from './NavBar';
import Sidebar from './Sidebar';

const Page: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
    <Sidebar />
    <div style={{ flex: 1, marginLeft: 220 }}>
      <NavBar />
      <main style={{ padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{title}</h1>
        {children}
      </main>
    </div>
  </div>
);

export default Page;
