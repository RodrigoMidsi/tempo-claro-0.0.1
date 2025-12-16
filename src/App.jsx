import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/login/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RoutinePage } from './pages/routine/RoutinePage';
import { ProtectedRoute } from './components';
import './App.css';

function App() {
  return (

    // @audit-ok - 5.9 Navegação funcional e modular: Router rederizador de rotas
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute> <DashboardPage /> </ProtectedRoute>} />
          <Route path="/routine" element={<ProtectedRoute> <RoutinePage /> </ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;