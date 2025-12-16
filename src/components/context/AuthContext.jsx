import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

//AuthProvider: É como uma "nuvem" que envolve todo o seu app. 
// Qualquer página pode "olhar para cima" e perguntar: "Quem está logado?".
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tokenClient, setTokenClient] = useState(null);

  // useCallback memoriza uma função para que ela não seja recriada a cada render.
  // A função nunca será recriada
  const handleLogout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setTokenClient(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiration');

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const handleAuthSuccess = async (token, expiresInSeconds) => {
    try {
      setAccessToken(token);

      const expirationTime = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('tokenExpiration', expirationTime.toString());

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const userData = await response.json();

      const userPayload = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      };

      setUser(userPayload);
      localStorage.setItem('user', JSON.stringify(userPayload));
    } catch (error) {
      console.error(error);
      handleLogout();
    }
  };

  //useEffect: Assim que o app abre, ele corre no localStorage. 
  // Se achar um token salvo que não expirou, ele loga o usuário automaticamente.
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const savedExpiration = localStorage.getItem('tokenExpiration');

    if (savedUser && savedToken && savedExpiration) {
      if (Date.now() < Number(savedExpiration)) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
      } else {
        handleLogout();
      }
    }
    //initTokenClient: É a função do Google que prepara o botão de login.
    const initClient = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope:
            'https://www.googleapis.com/auth/userinfo.profile ' +
            'https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/calendar',
          callback: (tokenResponse) => {
            if (tokenResponse?.access_token) {
              handleAuthSuccess(
                tokenResponse.access_token,
                tokenResponse.expires_in
              );
            }
          },
        });

        setTokenClient(client);
        setCarregando(false);
        return true;
      }
      return false;
    };

    if (!initClient()) {
      const timer = setInterval(() => {
        if (initClient()) clearInterval(timer);
      }, 500);

      return () => clearInterval(timer);
    }
  }, [handleLogout]);

  const loginWithGoogle = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      console.error('Cliente Google não inicializado');
    }
  };

  const getCalendarToken = useCallback(async () => {
    return accessToken;
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        carregando,
        loginWithGoogle,
        handleLogout,
        getCalendarToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
