import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/useAuth';
import { routinePageManager } from './routinePageManager';
import { uiManager } from './uiManager';
import { RoutineForm } from '../../components';
import './RoutinePage.css';

export const RoutinePage = () => {
  const { user, accessToken, handleLogout } = useAuth();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Carrega rotinas ao montar
  useEffect(() => {
    const loaded = routinePageManager.loadAndSortRoutines();
    setRoutines(loaded);
  }, []);

  // Handlers usando routinePageManager
  const handleRoutineCreated = (routine) => {
    const state = routinePageManager.handleRoutineCreated();
    setRoutines(state.routines);
    setShowForm(state.showForm);
    setEditingRoutine(state.editingRoutine);
  };

  const handleEditRoutine = (routine) => {
    const state = routinePageManager.handleEditRoutine(routine);
    setEditingRoutine(state.editingRoutine);
    setShowForm(state.showForm);
  };

  const handleDeleteRoutine = (routineId) => {
    const result = routinePageManager.handleDeleteRoutine(routineId);
    if (result) {
      setRoutines(result.routines);
    }
  };

  const handleExportToGoogle = async (routine) => {
    setSyncStatus({ status: 'loading', message: 'Conectando ao Google Calendar...' });
    
    const result = await routinePageManager.handleExportToGoogle(routine, accessToken);
    
    if (result.success) {
      setSyncStatus({
        status: 'success',
        message: result.message,
      });
      setTimeout(() => setSyncStatus(null), 5000);
    } else {
      setSyncStatus({
        status: 'error',
        message: result.message,
      });
    }
  };

  const handleLogoutClick = () => {
    uiManager.processLogout(handleLogout, navigate, '/login');
  };

  const handleBackFromForm = () => {
    const state = routinePageManager.handleBackFromForm();
    setShowForm(state.showForm);
    setEditingRoutine(state.editingRoutine);
  };

  const handleFilterChange = (newFilter) => {
    const state = routinePageManager.handleFilterChange(newFilter);
    setFilterStatus(state.filterStatus);
  };

  const filteredRoutines = routinePageManager.filterRoutines(routines, filterStatus);

  return (
    <div className="routine-page-container">
      <header className="routine-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          <div className="header-actions">
            <button 
              className="btn-dashboard" 
              onClick={() => uiManager.navigateTo(navigate, '/dashboard')}
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
              onClick={handleBackFromForm}
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
                  onClick={() => handleFilterChange('active')}
                >
                  Ativas
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'future' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('future')}
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
                      <span className="info-item">⏱️ {routinePageManager.calculateDuration(routine)}/dia</span>
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