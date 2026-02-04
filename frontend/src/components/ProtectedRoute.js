import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // User is not authenticated, redirect them to the home page (or a login page)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
