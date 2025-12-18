import React, { createContext, useState, useEffect, useCallback } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [clienteToken, setClienteToken] = useState(null);

  // 1. Função de Logout 
  const capturaLogout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setClienteToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('saveHoraExpToken');

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const capturaAuthSuccess = useCallback(async (token, expiraEmSegundos) => {
    try {
      setAccessToken(token);

      const tempoExpiracao = Date.now() + expiraEmSegundos * 1000;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('saveHoraExpToken', tempoExpiracao.toString());

      const resposta = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const dadosUsuario = await resposta.json();

      const googleUser = {
        id: dadosUsuario.sub,
        name: dadosUsuario.name,
        email: dadosUsuario.email,
        picture: dadosUsuario.picture,
      };

      setUser(googleUser);
      localStorage.setItem('user', JSON.stringify(googleUser));
    } catch (erro) {
      console.error(erro);
      capturaLogout();
    }
  }, [capturaLogout]);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('user');
    const tokenSalvo = localStorage.getItem('accessToken');
    const horaExpSalva = localStorage.getItem('saveHoraExpToken');

    // Restaura sessão se válida
    if (usuarioSalvo && tokenSalvo && horaExpSalva) {
      if (Date.now() < Number(horaExpSalva)) {
        setUser(JSON.parse(usuarioSalvo));
        setAccessToken(tokenSalvo);
      } else {
        capturaLogout();
      }
    }

    // Inicializa cliente Google
    const iniciarCliente = () => {
      if (window.google?.accounts?.oauth2) {
        const cliente = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope:
            'https://www.googleapis.com/auth/userinfo.profile ' +
            'https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/calendar',
          callback: (respostaToken) => {
            if (respostaToken?.access_token) {
              capturaAuthSuccess(
                respostaToken.access_token,
                respostaToken.expires_in
              );
            }
          },
        });
        setClienteToken(cliente);
        setCarregando(false);
        return true;
      }
      return false;
    };

    if (!iniciarCliente()) {
      const timer = setInterval(() => {
        if (iniciarCliente()) clearInterval(timer);
      }, 500);
      return () => clearInterval(timer);
    }
  }, [capturaLogout, capturaAuthSuccess]);

  // Função de Login com Google
  const loginComGoogle = () => {
    if (clienteToken) {
      clienteToken.requestAccessToken();
    } else {
      console.error('Cliente Google não inicializado');
    }
  };

  const obterTokenCalendario = useCallback(async () => {
    return accessToken;
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        carregando,
        loginComGoogle,
        capturaLogout,
        getCalendarToken: obterTokenCalendario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};