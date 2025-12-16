import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [carregando, setcarregando] = useState(true);
  const [tokenClient, setTokenClient] = useState(null);

  useEffect(() => {
    // 1. Verificar se há sessão salva
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const savedExpiration = localStorage.getItem('tokenExpiration');

    if (savedUser && savedToken && savedExpiration) {
      // Verifica se o token ainda é válido (duração de 1h)
      if (new Date().getTime() < parseInt(savedExpiration)) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
      } else {
        // Token expirou, limpar tudo
        handleLogout();
      }
    }

    // 2. Inicializar o cliente OAuth (Unificado)
    const initClient = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          // PEDIMOS TUDO AQUI: Perfil, Email E Calendário
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              handleAuthSuccess(tokenResponse.access_token, tokenResponse.expires_in);
            }
          },
        });
        setTokenClient(client);
        return true;
      }
      return false;
    };

    // Tentativa de inicialização (retry se script não carregou)
    if (!initClient()) {
      const timer = setInterval(() => {
        if (initClient()) clearInterval(timer);
      }, 500);
      return () => clearInterval(timer);
    }

    setcarregando(false);
  }, []);

  // Processar o sucesso da autenticação
  const handleAuthSuccess = async (token, expiresInSeconds) => {
    try {
      setAccessToken(token);

      // Salvar token e expiração
      const expirationTime = new Date().getTime() + (expiresInSeconds * 1000);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('tokenExpiration', expirationTime);

      // 3. Buscar dados do usuário manualmente usando o token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = await userInfoResponse.json();

      const userPayload = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      };

      setUser(userPayload);
      localStorage.setItem('user', JSON.stringify(userPayload));

    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  // Função chamada pelo Botão de Login
  const loginWithGoogle = () => {
    if (tokenClient) {
      // Isso abre o popup pedindo Login E Agenda de uma vez
      tokenClient.requestAccessToken();
    } else {
      console.error("Cliente Google não inicializado");
    }
  };

  const getCalendarToken = useCallback(async () => {
    // Como pedimos tudo no login, o accessToken já serve para a agenda
    return accessToken;
  }, [accessToken]);

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiration');
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      carregando,
      loginWithGoogle, // Nova função exportada
      handleLogout,
      getCalendarToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};