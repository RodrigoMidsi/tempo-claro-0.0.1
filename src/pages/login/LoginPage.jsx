import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/useAuth';
import { GoogleLoginButton } from '../../components/Auth/GoogleLoginButton';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import './LoginPage.css';

export const LoginPage = () => {
  const { user, carregando } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!carregando && user) {
      navigate('/routine');
    }
  }, [user, carregando, navigate]);

  if (carregando) {
    return <LoadingSpinner />;
  }

  return (

    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>TEMPO-CLARO</h1>
          <p>Bem-vindo ao nosso aplicativo</p>
        </div>

        <div className="texto-login">
          <p className="descricao-login">
            Faça login para acessar suas rotinas e calendário.
          </p>
          <div>
            <GoogleLoginButton />
          </div>
        </div>

        <div className="footer-login">
          <p className="termos-login">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/termos">Termos de Serviço</a> e{' '}
            <a href="/privacidade">Política de Privacidade</a>.
          </p>
        </div>
      </div>

    </div>
  );
};