import React, { useState, useContext } from 'react';
import { FaMoon, FaSun, FaChartBar, FaSignOutAlt, FaPlus, FaEdit, FaCalendarCheck, FaTrash, FaTasks, FaClock, FaInbox } from 'react-icons/fa';
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

  // estados da página de rotina
  const [routines, setRoutines] = useState(() => {
    const loaded = routineManager.carregaRotinasDoStorage(); // carrega rotinas do storage
    return routineManager.ordenaRotinaPorData(loaded); // ordena rotinas ao carregar a página
  });

  const [showForm, mostraForm] = useState(false); // controla exibição, quando false mostra lista quando true mostra formulário
  const [editingRoutine, editaRotina] = useState(null); // rotina que está sendo editada
  const [syncStatus, sincronizaStatus] = useState(null); // status da sincronização com Google Calendar

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
    sincronizaStatus({ status: 'loading', message: 'Conectando ao Google Calendar...' });

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
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            <button className="btn-dashboard" onClick={() => navigate('/dashboard')}> 
              <FaChartBar /> Dashboard  
            </button>

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
                  <FaSignOutAlt /> Sair
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
                <FaPlus /> Nova Rotina
              </button>            
            </div>

            <div className="routines-list">
              {routines.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FaInbox />
                  </div>
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
                      <span className="info-item">  
                        <FaTasks /> {routine.tasks.length} tarefas
                      </span>
                      <span className="info-item">
                        <FaClock /> {routineManager.calculaTotalDeHotas(routine.tasks)}/dia
                      </span>
                    </div>

                    <div className="routine-actions">
                      <button className="btn-action btn-edit" onClick={() => editarRotina(routine)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="btn-action btn-export" onClick={() => exportarParaGoogle(routine)}>
                        <FaCalendarCheck /> Exportar
                      </button>
                      <button className="btn-action btn-delete" onClick={() => deletaRotina(routine.id)}>
                        <FaTrash />
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