import React, { useState } from 'react';
import { 
  FaPlus, 
  FaSave, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle, 
  FaClipboardList, 
  FaTasks, 
  FaClock, 
  FaCalendarAlt, 
  FaTrash 
} from 'react-icons/fa';
import { routineManager } from '../../service/routineManager';
import './RoutineForm.css';

const RoutineForm = ({ onRoutineCreated, editingRoutine = null }) => {
  // Inicializa estado limpando a recorrência (assume 'weekly' padrão)
  const [routine, setRoutine] = useState(
    editingRoutine || { ...routineManager.criaRotinaModel(), recurrence: 'weekly' }
  );
  
  const [currentTask, setCurrentTask] = useState(routineManager.criaTarefaModel());
  const [errors, setErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // --- Handlers de Mudança de Input ---

  const handleRoutineChange = (e) => {
    const { name, value } = e.target;
    setRoutine(prev => ({ ...prev, [name]: value }));
    setErrors([]);
  };

  const handleTaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Lógica para os dias da semana
      const dayValue = name.replace('day_', '');
      setCurrentTask(prev => ({
        ...prev,
        daysOfWeek: checked
          ? [...prev.daysOfWeek, dayValue]
          : prev.daysOfWeek.filter(d => d !== dayValue),
      }));
    } else {
      // Lógica para inputs normais
      setCurrentTask(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Ações Principais ---

  const addTask = () => {
    // Validações da Tarefa
    if (!currentTask.title.trim()) {
      setErrors(['Digite o título da tarefa']);
      return;
    }

    if (currentTask.startTime >= currentTask.endTime) {
      setErrors(['Hora de fim deve ser depois do início']);
      return;
    }

    if (currentTask.daysOfWeek.length === 0) {
      setErrors(['Selecione pelo menos um dia da semana']);
      return;
    }

    // Cria a nova lista de tarefas
    const newTasks = [
      ...routine.tasks,
      {
        id: Date.now(),
        ...currentTask,
        title: currentTask.title.trim(),
      }
    ];

    // Atualiza o estado
    setRoutine(prev => ({ ...prev, tasks: newTasks }));
    setCurrentTask(routineManager.criaTarefaModel()); // Limpa o form da tarefa
    setErrors([]);
  };

  const removeTask = (taskId) => {
    const newTasks = routine.tasks.filter(t => t.id !== taskId);
    setRoutine(prev => ({ ...prev, tasks: newTasks }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação final da Rotina
    const validationErrors = routineManager.validaRotina(routine);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Salva a rotina (Recorrência fixa em 'weekly' pois usamos dias da semana)
    onRoutineCreated({ ...routine, recurrence: 'weekly' });
    
    // Reseta o formulário
    setRoutine(routineManager.criaRotinaModel());
    setCurrentTask(routineManager.criaTarefaModel());
    setErrors([]);
  };

  // --- Cálculos e Utilitários ---

  const totalDuration = routineManager.calculaTotalDeHotas(routine.tasks);

  const daysOfWeek = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  const daysLabels = {
    segunda: 'Seg', terça: 'Ter', quarta: 'Qua', quinta: 'Qui',
    sexta: 'Sex', sábado: 'Sab', domingo: 'Dom',
  };

  // --- Renderização ---

  return (
    <div className="routine-form-container">
      <div className="routine-form-card">
        <h2>{editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}</h2>

        {/* Exibição de Erros */}
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error, idx) => (
              <div key={idx} className="error-message">
                <FaExclamationCircle /> {error}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* 1. Informações Básicas */}
          <div className="form-section">
            <h3><FaClipboardList /> Informações da Rotina</h3>

            <div className="form-group">
              <label htmlFor="name">Nome da Rotina *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={routine.name}
                onChange={handleRoutineChange}
                placeholder="Ex: Rotina Matinal"
                maxLength="50"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Data de Início *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={routine.startDate}
                  onChange={handleRoutineChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Data de Fim *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={routine.endDate}
                  onChange={handleRoutineChange}
                />
              </div>
            </div>

            <div className="form-group">
                <label htmlFor="color">Cor da Rotina</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={routine.color}
                  onChange={handleRoutineChange}
                  style={{ height: '40px', cursor: 'pointer' }}
                />
            </div>
          </div>

          {/* 2. Adicionar Tarefas */}
          <div className="form-section">
            <h3><FaTasks /> Tarefas da Rotina</h3>

            <div className="task-input-group">
              <div className="form-group">
                <label htmlFor="taskTitle">Título da Tarefa *</label>
                <input
                  type="text"
                  id="taskTitle"
                  name="title"
                  value={currentTask.title}
                  onChange={handleTaskChange}
                  placeholder="Ex: Exercício matinal"
                  maxLength="50"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taskStart">Hora de Início *</label>
                  <input
                    type="time"
                    id="taskStart"
                    name="startTime"
                    value={currentTask.startTime}
                    onChange={handleTaskChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taskEnd">Hora de Fim *</label>
                  <input
                    type="time"
                    id="taskEnd"
                    name="endTime"
                    value={currentTask.endTime}
                    onChange={handleTaskChange}
                  />
                </div>
              </div>

              <div className="days-selector">
                <label>Dias da Semana *</label>
                <div className="days-grid">
                  {daysOfWeek.map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        name={`day_${day}`}
                        checked={currentTask.daysOfWeek.includes(day)}
                        onChange={handleTaskChange}
                      />
                      <span>{daysLabels[day]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" className="btn-add-task" onClick={addTask}>
                <FaPlus /> Adicionar Tarefa
              </button>
            </div>

            {/* Lista de Tarefas Adicionadas */}
            <div className="tasks-list">
              <h4>Tarefas Adicionadas ({routine.tasks.length})</h4>
              {routine.tasks.length === 0 ? (
                <p className="no-tasks">Nenhuma tarefa adicionada ainda</p>
              ) : (
                routine.tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <strong>{task.title}</strong>
                      <span className="task-time">
                        <FaClock /> {task.startTime} - {task.endTime}
                      </span>
                      <span className="task-days">
                        <FaCalendarAlt /> {task.daysOfWeek.map(d => daysLabels[d]).join(', ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-task"
                      onClick={() => removeTask(task.id)}
                      title="Remover tarefa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>

            {routine.tasks.length > 0 && (
              <div className="task-summary">
                <p><FaClock /> Duração Total: <strong>{totalDuration}</strong></p>
              </div>
            )}
          </div>

          {/* Botões de Ação do Formulário */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-preview"
              onClick={() => setShowPreview(!showPreview)}
              disabled={routine.tasks.length === 0}
            >
              {showPreview ? <FaEyeSlash /> : <FaEye />} 
              {showPreview ? 'Fechar' : 'Visualizar'} Timeline
            </button>
            <button type="submit" className="btn-save-routine">
              <FaSave /> Salvar Rotina
            </button>
          </div>
        </form>

        {/* Visualização da Timeline */}
        {showPreview && routine.tasks.length > 0 && (
          <div className="timeline-preview">
            <h4><FaClock /> Preview da Timeline</h4>
            {daysOfWeek.map(day => {
              const tasksForDay = routine.tasks.filter(t => t.daysOfWeek.includes(day));
              if (tasksForDay.length === 0) return null;
              
              // Ordena tarefas por horário
              const sortedTasks = [...tasksForDay].sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={day} className="day-timeline">
                  <h5>{daysLabels[day].toUpperCase()}</h5>
                  {sortedTasks.map(task => (
                    <div key={task.id} className="timeline-item">
                      <span className="timeline-time">{task.startTime} - {task.endTime}</span>
                      <div className="timeline-task" style={{ borderLeftColor: routine.color }}>
                        {task.title}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineForm;