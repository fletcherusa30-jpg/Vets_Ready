// frontend/src/router/index.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Scanner from '../pages/Scanner';
import ResumeBuilder from '../pages/ResumeBuilder';
import JobMatching from '../pages/JobMatching';
import BudgetTool from '../pages/BudgetTool';
import RetirementTool from '../pages/RetirementTool';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/jobs" element={<JobMatching />} />
        <Route path="/budget" element={<BudgetTool />} />
        <Route path="/retirement" element={<RetirementTool />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
