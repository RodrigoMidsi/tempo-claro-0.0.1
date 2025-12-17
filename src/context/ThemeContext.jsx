import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  /* Lembrete: roda na primeira renderização e quando esta função anônima
  [alguma coisa] mudar, execute essa função, nesse caso o [theme]. */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    /* setAttribute põe <html data-theme="tema dark ou light"> para mudar o css*/
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* botão */
  const botaoThema = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  /* entrega para todo app o theme e botaoThema para o botão */
  return (
    <ThemeContext.Provider value={{ theme, botaoThema }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook: export const { theme, setTheme } = useTheme();
export const useTheme = () => useContext(ThemeContext);