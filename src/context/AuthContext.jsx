import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null); // valor inicial

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Guarda o objeto JSON com os dados do perfil
  const [accessToken, setAccessToken] = useState(null); // token OAuth2 (Bearer Token) para requisições com google
  const [carregando, setCarregando] = useState(true); // bool carregador
  const [tokenClient, setTokenClient] = useState(null); // instância do cliente OAuth2 do Google Identity Services

  // A função de reset de autenticação e logaut
  const capturaLogout = useCallback(() => { // useCallBack para o useEffect não starte a cada render
    setUser(null);
    setAccessToken(null);
    setTokenClient(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('saveHoraExpToken');

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect(); // para não fazer login automatico ao deslogar
    }
  }, []);

  const capturaAuthSuccess = async (token, expiresInSeconds) => {
    try {
      setAccessToken(token);

      //salva as informações do token como tempo de duração
      const expirationTime = Date.now() + expiresInSeconds * 1000; // converção para milisegundos e junta a data para gerar um numero absoluto
      localStorage.setItem('accessToken', token);
      localStorage.setItem('saveHoraExpToken', expirationTime.toString());

      // captura as informações do usuário com o token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário'); // joga pro catch caso de erro
      }

      const userData = await response.json(); // passa pra json o usuário

      const googleUser = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      };

      setUser(googleUser); // seta estado
      localStorage.setItem('user', JSON.stringify(googleUser)); // salva no localStorage
    } catch (error) {
      console.error(error);
      capturaLogout(); // desloga
    }
  };

  //useEffect: Assim que o app abre, procura um token salvo que não expirou, 
  // e loga o usuário automaticamente.
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const saveHoraExp = localStorage.getItem('saveHoraExpToken');

    if (savedUser && savedToken && saveHoraExp) {

      if (Date.now() < Number(saveHoraExp)) {

        setUser(JSON.parse(savedUser));

        setAccessToken(savedToken);

      } else {
        capturaLogout(); 
      }
    }
    // função do Google para o botão de login
    const initClient = () => {
      if (window.google?.accounts?.oauth2) { // verifica se o script de carregamento das bibliotecas <script src="https://accounts.google.com/gsi/client">
        const client = window.google.accounts.oauth2.initTokenClient({ // cria objeto oauth2
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope:
            'https://www.googleapis.com/auth/userinfo.profile ' + // solicita permissão de acesso ao perfil
            'https://www.googleapis.com/auth/userinfo.email ' + // solicita permissão de acesso ao email
            'https://www.googleapis.com/auth/calendar', // solicita permissão de acesso ao CALENDARIO
          callback: (tokenResponse) => { // google salva a função internamente e chama ao fazer login
            if (tokenResponse?.access_token) {
              capturaAuthSuccess(
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

    // se o cliente não inicializou, tenta a cada 500ms até conseguir (tempo de download da lib do google)
    if (!initClient()) {
      const timer = setInterval(() => {
        if (initClient()) clearInterval(timer);
      }, 500);

      return () => clearInterval(timer);
    }
  }, [capturaLogout]); //garante que o efeito tenha acesso à versão mais recente da função capturaLogout


  // função de inicialização de login com google
  const loginComGoogle = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      console.error('Cliente Google não inicializado');
    }
  };

  // função para obter o token do calendário
  const getCalendarToken = useCallback(async () => {
    return accessToken;
  }, [accessToken]);

  // Retorno final
  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        carregando,
        loginComGoogle,
        capturaLogout: capturaLogout,
        getCalendarToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
