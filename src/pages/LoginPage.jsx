import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from '../components/Auth/GoogleLoginButton';
import '../styles/LoginPage.css';

export const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/routine');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>TEMPO-CLARO</h1>
          <p>Bem-vindo ao nosso aplicativo</p>
        </div>

        <div className="login-content">
          <p className="login-description">
            Faça login usando sua conta Google para acessar o aplicativo.
          </p>

          <GoogleLoginButton />
        </div>

        <div className="login-footer">
          <p className="terms-text">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/terms">Termos de Serviço</a> e{' '}
            <a href="/privacy">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
