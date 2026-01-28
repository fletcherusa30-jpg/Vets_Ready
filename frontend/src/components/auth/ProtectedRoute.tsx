import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../services/auth';

const ProtectedRoute: React.FC = () => {
  // DEV MODE: Skip authentication during development
  const DEV_MODE = import.meta.env.DEV;

  if (!DEV_MODE && !auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
