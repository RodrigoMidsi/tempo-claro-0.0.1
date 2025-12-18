export const routineManager = {

  // Cria estrutura inicial de rotina
  criaRotinaModel() {
    return {
      id: Date.now(),
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      recurrence: 'diario', 
      color: '#667eea',
      tasks: [],
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  },

  // Cria estrutura inicial de tarefa
  criaTarefaModel() {
    return {
      id: Date.now(),
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      daysOfWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    };
  },

  // Valida os dados de uma rotina
  validaRotina(rotina) {
    const erro = [];

    if (!rotina.name.trim()) {
      erro.push('Nome da rotina é obrigatório');
    }

    if (!rotina.startDate) {
      erro.push('Data de início é obrigatória');
    }

    if (!rotina.endDate) {
      erro.push('Data de fim é obrigatória');
    }

    if (rotina.startDate && rotina.endDate) {
      const start = new Date(rotina.startDate);
      const end = new Date(rotina.endDate);
      if (start >= end) {
        erro.push('Data de fim deve ser depois da data de início');
      }
    }

    if (rotina.tasks.length === 0) {
      erro.push('Adicione pelo menos uma tarefa');
    }

    rotina.tasks.forEach((task, idx) => {
      if (!task.title.trim()) {
        erro.push(`Tarefa ${idx + 1}: título obrigatório`);
      }
      if (task.startTime >= task.endTime) {
        erro.push(`Tarefa ${idx + 1}: hora de fim deve ser depois do início`);
      }
    });

    return erro;
  },

  // Detecta conflitos entre tarefas em uma rotina
  // CORREÇÃO: Mudei o parametro 'rotina' para 'tarefas' para o loop funcionar corretamente
  verificaConflitoDeHora(tarefas) {
    const conflitos = [];

    for (let i = 0; i < tarefas.length; i++) {
      for (let j = i + 1; j < tarefas.length; j++) {
        const rotina1 = tarefas[i];
        const rotina2 = tarefas[j];

        // Verificar se compartilham dias
        const commonDays = rotina1.daysOfWeek.filter(day =>
          rotina2.daysOfWeek.includes(day)
        );

        if (commonDays.length > 0) {
          // Verificar sobreposição de horário
          if (rotina1.startTime < rotina2.endTime && rotina2.startTime < rotina1.endTime) {
            conflitos.push({
              task1: rotina1.title,
              task2: rotina2.title,
              days: commonDays,
              message: `"${rotina1.title}" conflita com "${rotina2.title}" em ${commonDays.join(', ')}`,
            });
          }
        }
      }
    }

    return conflitos;
  },

  /** Calcula duração total das tarefas em horas e minutos */
  calculaTotalDeHotas(tarefasList) {
    let totalMinutes = 0;

    tarefasList.forEach(tarefa => {
      // CORREÇÃO: Arrumei os nomes das variáveis para a matemática bater
      const [horaInicio, minInicio] = tarefa.startTime.split(':').map(Number); 
      const [horaFim, minFim] = tarefa.endTime.split(':').map(Number); 

      const startTotalMin = horaInicio * 60 + minInicio; // converte tudo para minutos
      const endTotalMin = horaFim * 60 + minFim; 
      
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

  // Carrega rotinas do localStorage e entrega uma Array de rotinas
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

  /** Ordena rotinas por data de início */
  ordenaRotinaPorData(routines) {
    return [...routines].sort((a, b) => { // copia para evitar mutação da original
      const dateA = new Date(a.startDate); // converte para objeto Date para comparação
      const dateB = new Date(b.startDate); 
      return dateA - dateB; // ordena ascendente pela regra do sort que o menor vem primeiro
    });
  },
};