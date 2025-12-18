import React, { useState } from 'react';
import { FaPlus, FaTimes, FaSave, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle, FaClipboardList, FaTasks, FaClock, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { routineManager } from '../../service/routineManager';
import './RoutineForm.css';

const RoutineForm = ({ onRoutineCreated, editingRoutine = null }) => {
  const [routine, setRoutine] = useState(
    editingRoutine || routineManager.criaRotinaModel()
  );
  const [currentTask, setCurrentTask] = useState(routineManager.criaTarefaModel());
  const [errors, setErrors] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleRoutineChange = (e) => {
    const { name, value } = e.target;
    setRoutine(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors([]);
  };

  const handleTaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const dayValue = name.replace('day_', '');
      setCurrentTask(prev => ({
        ...prev,
        daysOfWeek: checked
          ? [...prev.daysOfWeek, dayValue]
          : prev.daysOfWeek.filter(d => d !== dayValue),
      }));
    } else {
      setCurrentTask(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addTask = () => {
    if (!currentTask.title.trim()) {
      setErrors(['Digite o título da tarefa']);
      return;
    }

    if (currentTask.startTime >= currentTask.endTime) {
      setErrors(['Hora de fim deve ser depois do início']);
      return;
    }

    const newTasks = [
      ...routine.tasks,
      {
        id: Date.now(),
        ...currentTask,
        title: currentTask.title.trim(),
        description: currentTask.description.trim(),
      }
    ];

    setRoutine(prev => ({
      ...prev,
      tasks: newTasks,
    }));

    setCurrentTask(routineManager.criaTarefaModel());
    setErrors([]);
    
    // Verificar conflitos
    const foundConflicts = routineManager.verificaConflitoDeHora(newTasks);
    setConflicts(foundConflicts);
  };

  const removeTask = (taskId) => {
    const newTasks = routine.tasks.filter(t => t.id !== taskId);
    setRoutine(prev => ({
      ...prev,
      tasks: newTasks,
    }));

    const foundConflicts = routineManager.verificaConflitoDeHora(newTasks);
    setConflicts(foundConflicts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = routineManager.validaRotina(routine);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onRoutineCreated(routine);
    setRoutine(routineManager.criaRotinaModel());
    setCurrentTask(routineManager.criaTarefaModel());
    setErrors([]);
    setConflicts([]);
  };

  const totalDuration = routineManager.calculaTotalDeHotas(routine.tasks);

  const daysOfWeek = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  const daysLabels = {
    segunda: 'Seg',
    terça: 'Ter',
    quarta: 'Qua',
    quinta: 'Qui',
    sexta: 'Sex',
    sábado: 'Sab',
    domingo: 'Dom',
  };

  return (
    <div className="routine-form-container">
      <div className="routine-form-card">
        <h2>{editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}</h2>
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error, idx) => (
              <div key={idx} 
                className="error-message">
                <FaExclamationCircle /> 
                {error}
              </div>
            ))}
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="form-warnings">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="warning-message">
                <FaExclamationTriangle /> {conflict.message}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Seção de Informações da Rotina */}
          <div className="form-section">
            <h3>
              <FaClipboardList /> Informações da Rotina
            </h3>
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

            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={routine.description}
                onChange={handleRoutineChange}
                placeholder="Descreva sua rotina..."
                maxLength="200"
                rows="3"
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recurrence">Tipo de Recorrência</label>
                <select
                  id="recurrence"
                  name="recurrence"
                  value={routine.recurrence}
                  onChange={handleRoutineChange}
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                  <option value="once">Uma única vez</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="color">Cor da Rotina</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={routine.color}
                  onChange={handleRoutineChange}
                />
              </div>
            </div>
          </div>

          {/* Seção de Tarefas */}
          <div className="form-section">
            <h3>
              <FaTasks /> Tarefas da Rotina
            </h3>
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

              <div className="form-group">
                <label htmlFor="taskDescription">Descrição</label>
                <input
                  type="text"
                  id="taskDescription"
                  name="description"
                  value={currentTask.description}
                  onChange={handleTaskChange}
                  placeholder="Detalhes da tarefa"
                  maxLength="100"
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

              {/* Dias da Semana */}
              <div className="days-selector">
                <label>Dias da Semana</label>
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

              <button
                type="button"
                className="btn-add-task"
                onClick={addTask}
              >
                <FaPlus /> Adicionar Tarefa
              </button>
            </div>

            {/* Lista de Tarefas */}
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
                        <FaClock /> 
                        {task.startTime} - {task.endTime}
                      </span>
                      <span className="task-days">
                        <FaCalendarAlt /> {task.daysOfWeek.map(d => daysLabels[d]).join(', ')}
                      </span>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
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

          {/* Botões de Ação */}
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

        {/* Preview Timeline */}
        {showPreview && routine.tasks.length > 0 && (
          <div className="timeline-preview">
            <h4><FaClock /> Preview da Timeline</h4>
            {daysOfWeek.map(day => {
              const tasksForDay = routine.tasks.filter(t =>
                t.daysOfWeek.includes(day)
              );

              if (tasksForDay.length === 0) return null;

              const sortedTasks = [...tasksForDay].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              );

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
