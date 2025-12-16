import React from 'react';
import { AuthContext } from '../context/AuthContext';

export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useContext(AuthContext);

  return (
    <div className="google-login-button-wrapper">
      <button 
        onClick={loginWithGoogle}
        className="custom-google-btn"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google logo" 
          className="google-icon"
        />
        <span>Entrar com Google e Permitir Agenda</span>
      </button>
    </div>
  );
};