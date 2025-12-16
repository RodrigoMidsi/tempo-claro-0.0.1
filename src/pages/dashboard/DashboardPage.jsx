import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/context/ThemeContext'; // Importando o tema
import { routineManager } from '../../components/Forms/routineManager';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme(); // Hook do tema
  const navigate = useNavigate();

  // Estado para armazenar as estatísticas
  const [stats, setStats] = useState({
    routinesCount: 0,
    activeRoutines: 0,
    totalTasks: 0,
    totalDuration: '0min'
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    try {
      const routines = routineManager.loadRoutinesFromStorage();
      
      let totalTasks = 0;
      let activeRoutines = 0;
      let totalDurationMinutes = 0;

      routines.forEach(routine => {
        if (routine.isActive) {
          activeRoutines++;
          totalTasks += routine.tasks.length;

          routine.tasks.forEach(task => {
            const [startH, startM] = task.startTime.split(':').map(Number);
            const [endH, endM] = task.endTime.split(':').map(Number);
            totalDurationMinutes += (endH * 60 + endM) - (startH * 60 + startM);
          });
        }
      });

      const hours = Math.floor(totalDurationMinutes / 60);
      const minutes = totalDurationMinutes % 60;
      const formattedDuration = hours === 0 ? `${minutes}min` : `${hours}h ${minutes}min`;

      setStats({
        routinesCount: routines.length,
        activeRoutines,
        totalTasks,
        totalDuration: formattedDuration
      });

    } catch (error) {
      console.error("Erro ao carregar estatísticas", error);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* HEADER PADRONIZADO (IGUAL AO ROUTINE PAGE) */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          
          <div className="header-actions">
             {/* Botão de Tema */}
            <button 
              className="btn-theme" 
              onClick={toggleTheme}
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                fontSize: '1.2rem',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Navegação para Rotinas */}
            <button 
              className="btn-nav" 
              onClick={() => navigate('/routine')}
            >
              📅 Rotinas
            </button>
            
            <div className="user-info">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="user-avatar" />
              )}
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <button onClick={handleLogoutClick} className="logout-btn">
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Bem-vindo ao Tempo-Claro</h2>
            <p>Gerencie suas rotinas e sincronize com o Google Calendar.</p>
          </div>
          {/* Botão extra de ação rápida */}
          <div className="nav-buttons">
            <button 
              className="btn-action-primary" 
              onClick={() => navigate('/routine')}
            >
              Começar Agora
            </button>
          </div>
        </div>
        
        <div className="stats-grid">
           <div className="stat-card stat-total">
             <div className="stat-header">
               <h3>Total de Rotinas</h3>
               <span className="stat-icon">📚</span>
             </div>
             <div className="stat-value">{stats.routinesCount}</div>
             <p className="stat-description">Rotinas cadastradas</p>
           </div>

           <div className="stat-card stat-completed">
             <div className="stat-header">
               <h3>Em Atividade</h3>
               <span className="stat-icon">⚡</span>
             </div>
             <div className="stat-value">{stats.activeRoutines}</div>
             <p className="stat-description">Rotinas em execução hoje</p>
           </div>

           <div className="stat-card stat-inprogress">
             <div className="stat-header">
               <h3>Tarefas Diárias</h3>
               <span className="stat-icon">✅</span>
             </div>
             <div className="stat-value">{stats.totalTasks}</div>
             <p className="stat-description">Ações programadas</p>
           </div>

           <div className="stat-card stat-pending">
             <div className="stat-header">
               <h3>Tempo Alocado</h3>
               <span className="stat-icon">⏱️</span>
             </div>
             <div className="stat-value" style={{fontSize: '28px'}}>{stats.totalDuration}</div>
             <p className="stat-description">Duração total diária</p>
           </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} TEMPO-CLARO. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};