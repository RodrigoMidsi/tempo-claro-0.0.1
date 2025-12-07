import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { routineManager } from '../manager/routineManager';
import { googleCalendarManager } from '../manager/googleCalendarManager'; // Importado
import RoutineForm from '../components/Routine/RoutineForm';
import '../styles/RoutinePage.css';

export const RoutinePage = () => {
  // Pegamos o accessToken aqui
  const { user, accessToken, handleLogout } = useAuth();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    const loaded = routineManager.loadRoutinesFromStorage();
    const sorted = routineManager.sortRoutinesByDate(loaded, 'asc');
    setRoutines(sorted);
  };

  const handleRoutineCreated = (routine) => {
    loadRoutines();
    setShowForm(false);
    setEditingRoutine(null);
  };

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setShowForm(true);
  };

  const handleDeleteRoutine = (routineId) => {
    if (window.confirm('Tem certeza que deseja deletar esta rotina?')) {
      routineManager.deleteRoutineFromStorage(routineId);
      loadRoutines();
    }
  };

  // Função de exportação REAL
  const handleExportToGoogle = async (routine) => {
    if (!accessToken) {
      alert("Você precisa fazer login novamente para obter permissão do calendário.");
      return;
    }

    try {
      setSyncStatus({ status: 'loading', message: 'Conectando ao Google Calendar...' });

      // Chama o manager passando a rotina e o token
      const result = await googleCalendarManager.syncRoutineToCalendar(routine, accessToken);

      if (result.success) {
        setSyncStatus({
          status: 'success',
          message: result.message,
        });
        
        // Abre o calendário após 1.5s
        setTimeout(() => {
          googleCalendarManager.openGoogleCalendar(result.calendarId);
        }, 1500);

      } else {
        throw new Error(result.error || 'Erro na sincronização');
      }

      // Limpa msg após 5s
      setTimeout(() => setSyncStatus(null), 5000);

    } catch (error) {
      console.error(error);
      setSyncStatus({
        status: 'error',
        message: `❌ Erro: ${error.message}`,
      });
    }
  };

  const filteredRoutines = routineManager.filterRoutinesByStatus(routines, filterStatus);
  const totalDuration = (routine) => routineManager.calculateTotalDuration(routine.tasks);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="routine-page-container">
      <header className="routine-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          <div className="header-actions">
            <button 
              className="btn-dashboard" 
              onClick={() => navigate('/dashboard')}
              title="Ver Dashboard"
            >
              📊 Dashboard
            </button>
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
        </div>
      </header>

      <main className="routine-main">
        {showForm ? (
          <div className="form-section-wrapper">
            <button
              className="btn-back"
              onClick={() => {
                setShowForm(false);
                setEditingRoutine(null);
              }}
            >
              ← Voltar
            </button>
            <RoutineForm
              onRoutineCreated={handleRoutineCreated}
              editingRoutine={editingRoutine}
            />
          </div>
        ) : (
          <div className="routines-section">
            {syncStatus && (
              <div className={`sync-status sync-${syncStatus.status}`}>
                {syncStatus.message}
              </div>
            )}

            <div className="top-bar">
              <button
                className="btn-new-routine"
                onClick={() => setShowForm(true)}
              >
                ➕ Nova Rotina
              </button>

              <div className="filters">
                <button
                  className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('active')}
                >
                  Ativas
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'future' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('future')}
                >
                  Futuras
                </button>
              </div>
            </div>

            <div className="routines-list">
              {filteredRoutines.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <h3>Nenhuma rotina encontrada</h3>
                  <button className="btn-create" onClick={() => setShowForm(true)}>
                    ➕ Criar Rotina
                  </button>
                </div>
              ) : (
                filteredRoutines.map(routine => (
                  <div
                    key={routine.id}
                    className="routine-card"
                    style={{ borderLeftColor: routine.color }}
                  >
                    <div className="routine-header-card">
                      <div className="routine-title">
                        <h3>📅 {routine.name}</h3>
                        <span className="routine-dates">
                           Início: {new Date(routine.startDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="routine-info">
                      <span className="info-item">🎯 {routine.tasks.length} tarefas</span>
                      <span className="info-item">⏱️ {totalDuration(routine)}/dia</span>
                    </div>

                    <div className="routine-actions">
                      <button className="btn-action btn-edit" onClick={() => handleEditRoutine(routine)}>
                        ✏️ Editar
                      </button>
                      <button className="btn-action btn-export" onClick={() => handleExportToGoogle(routine)}>
                        📅 Exportar
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDeleteRoutine(routine.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};