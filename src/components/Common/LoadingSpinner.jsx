import React from 'react';
import '../Common/LoadingSpinner.css';

export const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Carregando...</p>
    </div>
  );
};
