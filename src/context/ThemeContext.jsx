import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Cria o contexto
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Lê do localStorage ou usa 'light' como padrão
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // 2. Atualiza o atributo data-theme no HTML
    document.documentElement.setAttribute('data-theme', theme);
    // 3. Salva a preferência
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para facilitar o uso
export const useTheme = () => useContext(ThemeContext);