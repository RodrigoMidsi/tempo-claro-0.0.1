/**
 * Routine Manager
 * Gerencia a lógica de rotinas estruturadas
 */

export const routineManager = {
  /**
   * Cria estrutura inicial de rotina
   * @returns {Object} Rotina vazia
   */
  createEmptyRoutine() {
    return {
      id: Date.now(),
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      recurrence: 'daily', // daily, weekly, monthly, once
      color: '#667eea',
      tasks: [],
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  },

  /**
   * Cria tarefa vazia
   * @returns {Object} Tarefa vazia
   */
  createEmptyTask() {
    return {
      id: Date.now(),
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      daysOfWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    };
  },

  /**
   * Valida rotina completa
   * @param {Object} routine - Rotina a validar
   * @returns {Array} Array de erros
   */
  validateRoutine(routine) {
    const errors = [];

    if (!routine.name.trim()) {
      errors.push('Nome da rotina é obrigatório');
    }

    if (!routine.startDate) {
      errors.push('Data de início é obrigatória');
    }

    if (!routine.endDate) {
      errors.push('Data de fim é obrigatória');
    }

    if (routine.startDate && routine.endDate) {
      const start = new Date(routine.startDate);
      const end = new Date(routine.endDate);
      if (start >= end) {
        errors.push('Data de fim deve ser depois da data de início');
      }
    }

    if (routine.tasks.length === 0) {
      errors.push('Adicione pelo menos uma tarefa');
    }

    routine.tasks.forEach((task, idx) => {
      if (!task.title.trim()) {
        errors.push(`Tarefa ${idx + 1}: título obrigatório`);
      }
      if (task.startTime >= task.endTime) {
        errors.push(`Tarefa ${idx + 1}: hora de fim deve ser depois do início`);
      }
    });

    return errors;
  },

  /**
   * Detecta conflitos de horário
   * @param {Array} tasks - Lista de tarefas
   * @returns {Array} Array com conflitos encontrados
   */
  detectConflicts(tasks) {
    const conflicts = [];

    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];

        // Verificar se compartilham dias
        const commonDays = task1.daysOfWeek.filter(day =>
          task2.daysOfWeek.includes(day)
        );

        if (commonDays.length > 0) {
          // Verificar sobreposição de horário
          if (task1.startTime < task2.endTime && task2.startTime < task1.endTime) {
            conflicts.push({
              task1: task1.title,
              task2: task2.title,
              days: commonDays,
              message: `"${task1.title}" conflita com "${task2.title}" em ${commonDays.join(', ')}`,
            });
          }
        }
      }
    }

    return conflicts;
  },

  /**
   * Calcula duração total de tarefas
   * @param {Array} tasks - Lista de tarefas
   * @returns {string} Duração formatada (ex: "2h 30min")
   */
  calculateTotalDuration(tasks) {
    let totalMinutes = 0;

    tasks.forEach(task => {
      const [startHour, startMin] = task.startTime.split(':').map(Number);
      const [endHour, endMin] = task.endTime.split(':').map(Number);

      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      totalMinutes += endTotalMin - startTotalMin;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  },

  /**
   * Salva rotina no localStorage
   * @param {Object} routine - Rotina a salvar
   */
  saveRoutineToStorage(routine) {
    try {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      
      // Se tem ID, atualiza; senão, adiciona
      const existingIndex = routines.findIndex(r => r.id === routine.id);
      if (existingIndex >= 0) {
        routines[existingIndex] = routine;
      } else {
        routines.push(routine);
      }
      
      localStorage.setItem('routines', JSON.stringify(routines));
      return true;
    } catch (err) {
      console.error('Erro ao salvar rotina:', err);
      return false;
    }
  },

  /**
   * Carrega rotinas do localStorage
   * @returns {Array} Array de rotinas
   */
  loadRoutinesFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('routines') || '[]');
    } catch (err) {
      console.error('Erro ao carregar rotinas:', err);
      return [];
    }
  },

  /**
   * Deleta rotina do localStorage
   * @param {number} routineId - ID da rotina
   */
  deleteRoutineFromStorage(routineId) {
    try {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]');
      const filtered = routines.filter(r => r.id !== routineId);
      localStorage.setItem('routines', JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Erro ao deletar rotina:', err);
      return false;
    }
  },

  /**
   * Converte rotina para eventos do Google Calendar
   * @param {Object} routine - Rotina a converter
   * @returns {Array} Array de eventos
   */
  convertToGoogleCalendarEvents(routine) {
    const events = [];
    const dayMap = {
      segunda: 'MO',
      terça: 'TU',
      quarta: 'WE',
      quinta: 'TH',
      sexta: 'FR',
      sábado: 'SA',
      domingo: 'SU',
    };

    routine.tasks.forEach(task => {
      const startDate = new Date(routine.startDate);
      const endDate = new Date(routine.endDate);

      if (routine.recurrence === 'once') {
        // Evento único
        events.push({
          summary: task.title,
          description: task.description,
          start: {
            dateTime: `${routine.startDate}T${task.startTime}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: `${routine.startDate}T${task.endTime}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          colorId: this.mapColorToGoogleColor(routine.color),
        });
      } else {
        // Eventos recorrentes
        const rruleDays = task.daysOfWeek
          .map(day => dayMap[day])
          .filter(Boolean)
          .join(',');

        events.push({
          summary: task.title,
          description: task.description,
          start: {
            dateTime: `${routine.startDate}T${task.startTime}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: `${routine.startDate}T${task.endTime}:00`,
            timeZone: 'America/Sao_Paulo',
          },
          recurrence: [
            `RRULE:FREQ=${this.mapRecurrenceType(routine.recurrence)};BYDAY=${rruleDays};UNTIL=${endDate
              .toISOString()
              .replace(/[-:]/g, '')
              .split('T')[0]}T235959Z`,
          ],
          colorId: this.mapColorToGoogleColor(routine.color),
        });
      }
    });

    return events;
  },

  /**
   * Mapeia tipo de recorrência para RRULE
   * @param {string} recurrence - Tipo de recorrência
   * @returns {string} Tipo RRULE
   */
  mapRecurrenceType(recurrence) {
    const map = {
      daily: 'DAILY',
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
    };
    return map[recurrence] || 'DAILY';
  },

  /**
   * Mapeia cor para ID do Google Calendar
   * @param {string} color - Cor em hex
   * @returns {string} ID da cor no Google Calendar
   */
  mapColorToGoogleColor(color) {
    // Google Calendar colors: 1=azul claro, 2=azul escuro, 3=turquesa, etc
    const colorMap = {
      '#667eea': '1', // Azul (padrão)
      '#764ba2': '2', // Roxo
      '#10b981': '3', // Verde
      '#f59e0b': '4', // Laranja
      '#ef4444': '5', // Vermelho
    };
    return colorMap[color] || '1';
  },

  /**
   * Filtra rotinas por status
   * @param {Array} routines - Lista de rotinas
   * @param {string} status - 'active', 'past', 'future'
   * @returns {Array} Rotinas filtradas
   */
  filterRoutinesByStatus(routines, status) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return routines.filter(routine => {
      const start = new Date(routine.startDate);
      const end = new Date(routine.endDate);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (status === 'active') {
        return start <= today && today <= end && routine.isActive;
      } else if (status === 'past') {
        return end < today;
      } else if (status === 'future') {
        return start > today;
      }
      return true;
    });
  },

  /**
   * Ordena rotinas por data
   * @param {Array} routines - Lista de rotinas
   * @param {string} order - 'asc' ou 'desc'
   * @returns {Array} Rotinas ordenadas
   */
  sortRoutinesByDate(routines, order = 'asc') {
    return [...routines].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  },
};
