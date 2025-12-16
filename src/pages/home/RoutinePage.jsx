import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/context/AuthContext';
// Importamos a lógica de negócios direta (ajuste o caminho se necessário)
import { routineManager } from '../../components/Forms/routineManager'; 
import { googleCalendarManager } from './googleCalendarManager';
import { RoutineForm } from '../../components'; // index.js exporta isso
import './RoutinePage.css';

export const RoutinePage = () => {
  const { user, accessToken, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estados Locais
  const [routines, setRoutines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active'); // active, future
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Carregar rotinas ao iniciar
  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = () => {
    const loaded = routineManager.loadRoutinesFromStorage();
    const sorted = routineManager.sortRoutinesByDate(loaded, 'asc');
    setRoutines(sorted);
  };

  // --- Handlers de Ação ---

  const handleRoutineSaved = (routine) => {
    loadRoutines(); // Recarrega a lista
    setShowForm(false);
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (routineId) => {
    // Uso direto do confirm nativo (sem uiManager)
    if (window.confirm('Tem certeza que deseja deletar esta rotina?')) {
      routineManager.deleteRoutineFromStorage(routineId);
      loadRoutines();
    }
  };

  const handleEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setShowForm(true);
  };

  const handleExportToGoogle = async (routine) => {
    setSyncStatus({ status: 'loading', message: 'Conectando ao Google Calendar...' });

    if (!accessToken) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }
    
    const result = await googleCalendarManager.syncRoutineToCalendar(routine, accessToken);
    
    if (result.success) {
      setSyncStatus({ status: 'success', message: result.message });
      // Abre o calendário após 1.5s
      setTimeout(() => {
        googleCalendarManager.openGoogleCalendar(result.calendarId);
        setSyncStatus(null);
      }, 1500);
    } else {
      setSyncStatus({ status: 'error', message: result.message || 'Erro na sincronização' });
    }
  };

  // --- Filtros e Renderização ---

  const filteredRoutines = routineManager.filterRoutinesByStatus(routines, filterStatus);

  return (
    <div className="routine-page-container">
      {/* Header Fixo */}
      <header className="routine-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          <div className="header-actions">
            <button 
              className="btn-dashboard" 
              onClick={() => navigate('/dashboard')}
            >
              📊 Dashboard
            </button>
            
            <div className="user-info">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="user-avatar" />
              )}
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <button 
                  onClick={() => {
                    handleLogout();
                    navigate('/login');
                  }} 
                  className="logout-btn"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="routine-main">
        {showForm ? (
          // VISÃO: Formulário
          <div className="form-section-wrapper">
            <button
              className="btn-back"
              onClick={() => {
                setShowForm(false);
                setEditingRoutine(null);
              }}
            >
              ← Voltar para Lista
            </button>
            {/* Passamos a função de callback quando salvar */}
            <RoutineForm
              onRoutineCreated={handleRoutineSaved}
              editingRoutine={editingRoutine}
            />
          </div>
        ) : (
          // VISÃO: Lista de Rotinas
          <div className="routines-section">
            
            {/* Feedback de Sincronização */}
            {syncStatus && (
              <div className={`sync-status sync-${syncStatus.status}`}>
                {syncStatus.message}
              </div>
            )}

            {/* Barra de Ferramentas */}
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

            {/* Grid de Cards */}
            <div className="routines-list">
              {filteredRoutines.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <h3>Nenhuma rotina encontrada</h3>
                  <p>Que tal criar uma nova rotina para organizar seu dia?</p>
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
                        <h3>{routine.name}</h3>
                        <span className="routine-dates">
                           Início: {new Date(routine.startDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="routine-info">
                      <span className="info-item">🎯 {routine.tasks.length} tarefas</span>
                      <span className="info-item">
                        ⏱️ {routineManager.calculateTotalDuration(routine.tasks)}/dia
                      </span>
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