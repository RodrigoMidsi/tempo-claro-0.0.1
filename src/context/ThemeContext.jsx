import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [tema, setTema] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // @audit-ok 5.4 - JavaScript Interativo
    document.documentElement.setAttribute('data-theme', tema); // @audit-ok 2.3 - Interatividade com JavaScript aplicando o tema sem reload de pagina
    localStorage.setItem('theme', tema);
  }, [tema]);

  /* botão */
  const alternarTema = () => {
    setTema((atual) => (atual === 'light' ? 'dark' : 'light'));
  };

  /* entrega global de tema e função de troca */
  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);