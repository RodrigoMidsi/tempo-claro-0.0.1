import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext'; // Ajuste o caminho se necessário
import { useNavigate } from 'react-router-dom';
import { routineManager } from '../../components/Forms/routineManager'; // Importamos o gerenciador de rotinas existente
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para armazenar as estatísticas
  const [stats, setStats] = useState({
    routinesCount: 0,
    activeRoutines: 0,
    totalTasks: 0,
    totalDuration: '0min'
  });

  // Carrega as estatísticas assim que a página abre
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

          // Calcula o tempo total dessa rotina
          routine.tasks.forEach(task => {
            const [startH, startM] = task.startTime.split(':').map(Number);
            const [endH, endM] = task.endTime.split(':').map(Number);
            // Diferença em minutos
            totalDurationMinutes += (endH * 60 + endM) - (startH * 60 + startM);
          });
        }
      });

      // Formatação bonita de horas/minutos
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

  // Funções de Navegação Diretas
  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
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
            <button 
              className="btn-routine" 
              onClick={() => navigate('/routine')}
            >
              📅 Gerenciar Minhas Rotinas
            </button>
          </div>
        </div>
        
        {/* Grid de Estatísticas (Agora preenchido dinamicamente) */}
        <div className="stats-grid">
           {/* Card 1: Total de Rotinas */}
           <div className="stat-card stat-total">
             <div className="stat-header">
               <h3>Total de Rotinas</h3>
               <span className="stat-icon">📚</span>
             </div>
             <div className="stat-value">{stats.routinesCount}</div>
             <p className="stat-description">Rotinas cadastradas</p>
           </div>

           {/* Card 2: Rotinas Ativas */}
           <div className="stat-card stat-completed">
             <div className="stat-header">
               <h3>Em Atividade</h3>
               <span className="stat-icon">⚡</span>
             </div>
             <div className="stat-value">{stats.activeRoutines}</div>
             <p className="stat-description">Rotinas em execução hoje</p>
           </div>

           {/* Card 3: Total de Tarefas */}
           <div className="stat-card stat-inprogress">
             <div className="stat-header">
               <h3>Tarefas Diárias</h3>
               <span className="stat-icon">✅</span>
             </div>
             <div className="stat-value">{stats.totalTasks}</div>
             <p className="stat-description">Ações programadas</p>
           </div>

           {/* Card 4: Tempo Total */}
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