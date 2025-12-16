import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth';
import { LoadingSpinner } from '../Common/LoadingSpinner';

// @audit-info - Verificador de estado de login
// @audit-ok - 4.3 - Segurança

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
