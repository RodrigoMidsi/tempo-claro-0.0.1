import React from 'react';
import { BrowserRouter as Roteador, Routes as Rotas, Route as Rota, Navigate as Navegar } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PaginaLogin } from './pages/login/PaginaLogin'; // CORREÇÃO: Importar PaginaLogin
import { PaginaPainel } from './pages/dashboard/PaginaPainel'; // CORREÇÃO: Importar PaginaPainel
import { PaginaRotina } from './pages/routine/PaginaRotina'; // CORREÇÃO: Importar PaginaRotina
import { RotaProtegida } from './components'; // Pega do index.js corrigido acima
import './App.css';

function App() {
  return (
    <Roteador>
      <AuthProvider>
        <Rotas>
          {/* Rotas apontando para os componentes renomeados */}
          <Rota path="/login" element={<PaginaLogin />} />
          
          <Rota 
            path="/dashboard" 
            element={
              <RotaProtegida> 
                <PaginaPainel /> 
              </RotaProtegida>
            } 
          />
          
          <Rota 
            path="/routine" 
            element={
              <RotaProtegida> 
                <PaginaRotina /> 
              </RotaProtegida>
            } 
          />
          
          <Rota path="/" element={<Navegar to="/login" replace />} />
        </Rotas>
      </AuthProvider>
    </Roteador>
  );
}

export default App;