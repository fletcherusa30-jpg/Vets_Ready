import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import ResumeBuilder from './pages/ResumeBuilder';
import JobMatching from './pages/JobMatching';
import BudgetTool from './pages/BudgetTool';
import RetirementTool from './pages/RetirementTool';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DisabilityWizard from './pages/DisabilityWizard';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/jobs" element={<JobMatching />} />
        <Route path="/budget" element={<BudgetTool />} />
        <Route path="/retirement" element={<RetirementTool />} />
        <Route path="/disability-wizard" element={<DisabilityWizard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
