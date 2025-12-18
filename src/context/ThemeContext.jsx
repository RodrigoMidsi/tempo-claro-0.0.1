import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState(localStorage.getItem('theme') || 'light');

  /* Lembrete: roda na primeira renderização e quando esta função anônima
  [alguma coisa] mudar, execute essa função, nesse caso o [theme]. */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    /* setAttribute põe <html data-theme="tema dark ou light"> para mudar o css*/
    localStorage.setItem('theme', tema);
  }, [tema]);

  /* botão */
  const alternarTema = () => {
    setTema((atual) => (atual === 'light' ? 'dark' : 'light'));
  };

  /* entrega para todo app o theme e botaoThema para o botão */
  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook: export const { theme, setTheme } = useTheme();
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);