import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth';
import { LoadingSpinner } from '../Common/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { user, carregando } = useAuth();

  if (carregando) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
