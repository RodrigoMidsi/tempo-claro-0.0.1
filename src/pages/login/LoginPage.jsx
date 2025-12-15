import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/useAuth';
import { GoogleLoginButton } from '../../components/Auth/GoogleLoginButton';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { loginManager } from './loginManager';
import './LoginPage.css';

export const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const pageData = loginManager.getLoginPageData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Redirecionar se já estiver logado
  useEffect(() => {
    loginManager.handleAuthCheck(user, isLoading, navigate);
  }, [user, isLoading, navigate]);

  const handleLoginChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const validationErrors = loginManager.validateCredentials(email, password);
    
    if (Object.keys(validationErrors).length === 0) {
      // Credenciais válidas - recarregar página
      window.location.reload();
    } else {
      setErrors(validationErrors);
    }
  };

  if (loginManager.isPageLoading(isLoading)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{pageData.appTitle}</h1>
          <p>{pageData.welcomeText}</p>
        </div>

        <div className="login-content">
          <p className="login-description">
            {pageData.loginDescription}
          </p>

          {/* Formulário de Login com Email e Senha */}
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Seu email"
                value={email}
                onChange={(e) => handleLoginChange('email', e.target.value)}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => handleLoginChange('password', e.target.value)}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="login-button">
              {pageData.loginButtonText}
            </button>
          </form>

          <div className="login-divider">
            <span>OU</span>
          </div>

          <GoogleLoginButton />
        </div>

        <div className="login-footer">
          <p className="terms-text">
            {pageData.termsText}{' '}
            <a href={pageData.termsLink}>{pageData.termsLabel}</a> e{' '}
            <a href={pageData.privacyLink}>{pageData.privacyLabel}</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
