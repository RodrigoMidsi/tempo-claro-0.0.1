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

  /** Calcula duração total das tarefas em horas e minutos */
  calculaTotalDeHotas(tarefasList) {
    let totalMinutes = 0;

    tarefasList.forEach(tarefa => {
      const [horaInicio, horaFinal] = tarefa.startTime.split(':').map(Number); // converter para números
      const [horaFinal2, minutoFinal] = tarefa.endTime.split(':').map(Number); 

      const startTotalMin = horaInicio * 60 + horaFinal; // converte tudo para minutos
      const endTotalMin = horaFinal2 * 60 + minutoFinal; 
      totalMinutes += endTotalMin - startTotalMin; // acumula diferença em minutos
    });

    const horas = Math.floor(totalMinutes / 60); // calcula horas inteiras
    const minutos = totalMinutes % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  },

  salvarRotinaNoStorage(routine) { // salva rotina no localStorage
    try {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]'); // carrega rotinas
      
      const RotinaIndex = routines.findIndex(r => r.id === routine.id); // verifica se já existe
      if (RotinaIndex >= 0) { // atualiza rotina existente
        routines[RotinaIndex] = routine;
      } else { // adiciona nova rotina
        routines.push(routine);
      }
      
      localStorage.setItem('routines', JSON.stringify(routines)); // salva de volta no storage
      return true;
    } catch (erro) {
      console.error('Erro ao salvar rotina:', erro);
      return false;
    }
  },

  /** Carrega rotinas do localStorage e entrega uma Array de rotinas */
  carregaRotinasDoStorage() {
    try {
      return JSON.parse(localStorage.getItem('routines') || '[]');
    } catch (erro) {
      console.error('Erro ao carregar rotinas:', erro);
      return [];
    }
  },

  deletaRotinaDoStorage(routineId) {
    try {
      const routines = JSON.parse(localStorage.getItem('routines') || '[]'); // carrega rotinas ou array vazio
      const routinesFiltrada = routines.filter(r => r.id !== routineId); // filtra removendo a rotina com o ID fornecido
      localStorage.setItem('routines', JSON.stringify(routinesFiltrada)); // salva de volta o array filtrado
      return true;
    } catch (erro) {
      console.error('Erro ao deletar rotina:', erro);
      return false;
    }
  },



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

  /** Ordena rotinas por data de início */
  ordenaRotinaPorData(routines) {
    return [...routines].sort((a, b) => { // copia para evitar mutação da original
      const dateA = new Date(a.startDate); // converte para objeto Date para comparação
      const dateB = new Date(b.startDate); 
      return dateA - dateB; // ordena ascendente pela regra do sort que o menor vem primeiro
    });
  },
};
