import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../services/auth';

const ProtectedRoute: React.FC = () => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
