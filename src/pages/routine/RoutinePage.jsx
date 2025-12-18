import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; 
import { routineManager } from '../../service/routineManager';
import { googleCalendarManager } from '../../service/googleCalendarManager';
import { RoutineForm } from '../../components';
import './RoutinePage.css';

export const RoutinePage = () => {
  // variáveis contexto, tema e navegação
  const { user, accessToken, capturaLogout } = useContext(AuthContext);
  const { theme, botaoThema } = useTheme(); 
  const navigate = useNavigate();

  // estados locais
  const [routines, setRoutines] = useState([]); // Array de rotinas
  const [showForm, mostraForm] = useState(false); // controla exibição, quando false mostra lista quando true mostra formulário
  const [editingRoutine, editaRotina] = useState(null); // rotina que está sendo editada
  const [syncStatus, sincronizaStatus] = useState(null); // status da sincronização com Google Calendar

  useEffect(() => { // executa ao montar o componente  
    carregaRotinas();
  }, []);
  
  const carregaRotinas = () => { // para carregar as rotinas e ordenar elas de forma crescente
    const loaded = routineManager.carregaRotinasDoStorage(); 
    const ordena = routineManager.ordenaRotinaPorData(loaded);
    setRoutines(ordena);
  };

const salvaRotina = (routine) => { // salva rotina 
    routineManager.salvarRotinaNoStorage(routine); 
    carregaRotinas();
    mostraForm(false);
    editaRotina(null);
  };

  const deletaRotina = (routineId) => { // deleta rotina após confirmação do usuário
    if (window.confirm('Tem certeza que deseja deletar esta rotina?')) {
      routineManager.deletaRotinaDoStorage(routineId);
      carregaRotinas();
    }
  };

  const editarRotina = (routine) => { // abre formulário para editar rotina
    editaRotina(routine);
    mostraForm(true);
  };

  const exportarParaGoogle = async (routine) => { // exporta rotina para Google Calendar
    sincronizaStatus({ status: 'loading', message: 'Conectando ao Google Calendarario...' });

    if (!accessToken) { // valida token de acesso
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    const result = await googleCalendarManager.sincronizaRotinaParaGoogle(routine, accessToken); // chama serviço de sincronização

    if (result.success) { 
      sincronizaStatus({ status: 'success', message: result.message });
      setTimeout(() => {  sincronizaStatus(null);  }, 1500);
    } else {
      sincronizaStatus({ status: 'error', message: result.message || 'Erro na sincronização' });
    }
  };

return (
    <div className="routine-page-container">
      <header className="routine-header">
        <div className="header-content">
          <h1>TEMPO-CLARO</h1>
          <div className="header-actions">
            
            <button
              className="btn-theme"
              onClick={botaoThema}
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                fontSize: '1.2rem',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            > {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button className="btn-dashboard" onClick={() => navigate('/dashboard')}> 📊 Dashboard  </button>

            <div className="user-info">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="user-avatar" />
              )}
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <button
                  onClick={() => {
                    capturaLogout();
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
          <div className="form-section-wrapper">
            <button
              className="btn-back"
              onClick={() => {
                mostraForm(false);
                editaRotina(null);
              }}
            >
              ← Voltar para Lista
            </button>
            <RoutineForm
              onRoutineCreated={salvaRotina}
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
                onClick={() => mostraForm(true)}
              >
                ➕ Nova Rotina
              </button>

              {/* REMOVIDO: A div className="filters" com os botões foi apagada aqui */}
            
            </div>

            <div className="routines-list">
              {/* ALTERADO: De "filteredRoutines" para "routines" */}
              {routines.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-icon">📭</p>
                  <h3>Nenhuma rotina encontrada</h3>
                  <p>Que tal criar uma nova rotina para organizar seu dia?</p>
                </div>
              ) : (
                routines.map(routine => (
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
                        ⏱️ {routineManager.calculaTotalDeHotas(routine.tasks)}/dia
                      </span>
                    </div>

                    <div className="routine-actions">
                      <button className="btn-action btn-edit" onClick={() => editarRotina(routine)}>
                        ✏️ Editar
                      </button>
                      <button className="btn-action btn-export" onClick={() => exportarParaGoogle(routine)}>
                        📅 Exportar
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deletaRotina(routine.id)}>
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