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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/resume" element={<ResumeBuilder />} />
      <Route path="/jobs" element={<JobMatching />} />
      <Route path="/budget" element={<BudgetTool />} />
      <Route path="/retirement" element={<RetirementTool />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default App;
