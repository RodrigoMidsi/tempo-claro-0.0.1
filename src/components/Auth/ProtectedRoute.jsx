import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth';
import { LoadingSpinner } from '../Common/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
