import React, { useContext } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardManager } from './dashboardManager';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dashData = dashboardManager.getDashboardData();

  const handleLogoutClick = () => {
    dashboardManager.handleLogout(handleLogout, navigate);
  };

  const handleNavigateToRoutine = () => {
    dashboardManager.navigateToRoutines(navigate);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>{dashData.title}</h1>
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
            <h2>{dashData.welcomeTitle}</h2>
            <p>{dashData.welcomeDescription}</p>
          </div>
          <div className="nav-buttons">
            <button className="btn-routine" onClick={handleNavigateToRoutine} style={{padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
              {dashData.routinesButtonText}
            </button>
          </div>
        </div>
        
        {/* Placeholder para estatísticas futuras baseadas em Rotinas */}
        <div className="stats-grid">
           <div className="empty-state">
            <p>{dashData.placeholderMessage}</p>
           </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {dashData.copyrightYear} TEMPO-CLARO. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};