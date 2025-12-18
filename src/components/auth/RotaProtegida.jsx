import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CarregadorSpinner } from '../Common/CarregadorSpinner';

// @audit-info - Verificador de estado de login
// @audit-ok - 4.3 - Segurança

export const RotaProtegida = ({ children }) => {
  const { user, carregando } = useContext(AuthContext);

  if (carregando) {
    return <CarregadorSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};