import React from 'react';
import { BrowserRouter , Routes , Route, Navigate  } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PaginaLogin } from './pages/login/PaginaLogin'; 
import { PaginaPainel } from './pages/painel/PaginaPainel'; 
import { PaginaRotina } from './pages/home/PaginaRotina';
import { RotaProtegida } from './components'; 
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PaginaLogin />} />
          
          <Route 
            path="/painel" 
            element={
              <RotaProtegida> 

                <PaginaPainel /> 

              </RotaProtegida>
            } 
          />
          
          <Route 
            path="/routine" 
            element={
              <RotaProtegida> 

                <PaginaRotina /> 
                
              </RotaProtegida>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;