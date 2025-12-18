import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export const BotaoLoginGoogle = () => {
  const { loginComGoogle } = useContext(AuthContext);

  return (
    <div className="wrapper-botao-google">
      <button 
        // usa o context para chamar a função de login para esperar que o clienteToken.requestAccessToken() esteja pronto
        onClick={loginComGoogle}
        className="botao-google-personalizado"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google logo" 
          className="icone-google"
        />
        <span>Entrar com Google e Permitir Agenda</span>
      </button>
    </div>
  );
};