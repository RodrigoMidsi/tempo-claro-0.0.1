import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardPage.css';

export const DashboardPage = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const handleNavigateToRoutine = () => {
    navigate('/routine');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          <div className="user-info">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            )}
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <button onClick={handleLogoutClick} className="logout-btn">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Bem-vindo ao Tempo-Claro</h2>
            <p>Gerencie suas rotinas e sincronize com o Google Calendar.</p>
          </div>
          <div className="nav-buttons">
            <button className="btn-routine" onClick={handleNavigateToRoutine} style={{padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
              📅 Gerenciar Minhas Rotinas
            </button>
          </div>
        </div>
        
        {/* Placeholder para estatísticas futuras baseadas em Rotinas */}
        <div className="stats-grid">
           <div className="empty-state">
            <p>Vá para a página de Rotinas para começar a organizar seu tempo.</p>
           </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 TEMPO-CLARO. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};