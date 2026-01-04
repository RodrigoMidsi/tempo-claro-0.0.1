export const gerenciadorRotinas = {

  // Cria objeto vazio de rotina
  criarModeloRotina() {
    return {
      id: Date.now(),
      nome: '',
      dataInicio: '',
      dataFim: '',
      cor: '#667eea',
      tarefas: [],
      criadoEm: new Date().toISOString(),
    };
  },

  // Cria estrutura inicial de tarefa
  criarModeloTarefa() {
    return {
      id: Date.now(),
      titulo: '',
      horaInicio: '09:00',
      horaFim: '10:00',
      diasSemana: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    };
  },

  // Valida os dados de uma rotina
  // @audit-ok 5.4 - JavaScript Interativo
  validarRotina(rotina) {
    const erros = [];

    if (!rotina.nome.trim()) {
      erros.push('Nome da rotina é obrigatório');
    }

    if (!rotina.dataInicio) {
      erros.push('Data de início é obrigatória');
    }

    if (!rotina.dataFim) {
      erros.push('Data de fim é obrigatória');
    }

    if (rotina.dataInicio && rotina.dataFim) {
      const inicio = new Date(rotina.dataInicio);
      const fim = new Date(rotina.dataFim);
      if (inicio >= fim) {
        erros.push('Data de fim deve ser depois da data de início');
      }
    }

    if (rotina.tarefas.length === 0) {
      erros.push('Adicione pelo menos uma tarefa');
    }

    rotina.tarefas.forEach((tarefa, idx) => {
      if (!tarefa.titulo.trim()) {
        erros.push(`Tarefa ${idx + 1}: título obrigatório`);
      }
      if (tarefa.horaInicio >= tarefa.horaFim) {
        erros.push(`Tarefa ${idx + 1}: hora de fim deve ser depois do início`);
      }
    });

    return erros;
  },

  /** Calcula horas total das tarefas */
  calcularTotalHoras(listaTarefas) {
    let totalMinutos = 0;

    listaTarefas.forEach(tarefa => {
      const [horaInicio, minInicio] = tarefa.horaInicio.split(':').map(Number); 
      const [horaFim, minFim] = tarefa.horaFim.split(':').map(Number); 

      const inicioTotalMin = horaInicio * 60 + minInicio; 
      const fimTotalMin = horaFim * 60 + minFim; 
      
      totalMinutos += fimTotalMin - inicioTotalMin;
    });

    const horas = Math.floor(totalMinutos / 60); 
    const minutos = totalMinutos % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  },

  salvarRotina(rotina) { // salva rotina no localStorage
    try {
      const rotinas = JSON.parse(localStorage.getItem('rotinas') || '[]'); // carrega rotinas
      
      const indiceRotina = rotinas.findIndex(r => r.id === rotina.id); // verifica se já existe
      if (indiceRotina >= 0) { // atualiza rotina existente
        rotinas[indiceRotina] = rotina;
      } else { // adiciona nova rotina
        rotinas.push(rotina);
      }
      
      localStorage.setItem('rotinas', JSON.stringify(rotinas)); // salva de volta no storage
      return true;
      // @audit-ok 5.5 Validações e Feedbacks
    } catch (erro) {
      console.error('Erro ao salvar rotina:', erro);
      return false;
    }
  },

  // Carrega rotinas do localStorage e entrega uma Array de rotinas
  carregarRotinas() {
    try {
      const dados = JSON.parse(localStorage.getItem('rotinas') || '[]');
      return dados.map(dado => ({
        id: dado.id,
        nome: dado.nome,
        dataInicio: dado.dataInicio,
        dataFim: dado.dataFim,
        cor: dado.cor,
        tarefas: 
        (dado.tarefas || []).map(t => 
          ({
            id: t.id,
            titulo: t.titulo,
            horaInicio: t.horaInicio,
            horaFim: t.horaFim,
            diasSemana: t.diasSemana
        })),
        criadoEm: dado.criadoEm
      }));
    } catch (erro) {
      // @audit-ok 5.5 Validações e Feedbacks
      console.error('Erro ao carregar rotinas:', erro);
      return [];
    }
  },

  deletarRotina(idRotina) {
    try {
      const rotinas = JSON.parse(localStorage.getItem('rotinas') || '[]'); // carrega rotinas ou array vazio
      // @audit-ok 5.4 - JavaScript Interativo
      const rotinasFiltradas = rotinas.filter(r => r.id !== idRotina); // filtra removendo a rotina com o ID fornecido
      localStorage.setItem('rotinas', JSON.stringify(rotinasFiltradas)); // salva de volta o array filtrado
      return true;
    } catch (erro) {
      console.error('Erro ao deletar rotina:', erro);
      return false;
    }
  },

  /** Ordena rotinas por data de início */
  ordenarRotinasPorData(rotinas) {
    return [...rotinas].sort((a, b) => { 
      const dataA = new Date(a.dataInicio); 
      const dataB = new Date(b.dataInicio); 
      return dataA - dataB; 
    });
  },



  // @audit-info Atualizado para usar as chaves em português (tarefas, titulo, horaInicio)

  gerarTextoCompartilhamento(rotina) {
    // Correção 1: Usar 'rotina.tarefas' e o método correto 'calcularTotalHoras'
    const totalHoras = this.calcularTotalHoras(rotina.tarefas);
    
    // Correção 2: Usar 'rotina.dataInicio'
    const dataInicio = new Date(rotina.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR');
    
    let texto = `📅 *ROTINA: ${rotina.nome.toUpperCase()}*\n`;
    texto += `⏳ Duração: ${totalHoras}/dia\n`;
    texto += `🚀 Início: ${dataInicio}\n\n`;
    texto += `📋 *TAREFAS:*\n`;

    // Correção 3: Iterar sobre 'tarefas' e usar 'titulo', 'horaInicio', 'horaFim'
    rotina.tarefas.forEach(tarefa => {
      texto += `▪️ *${tarefa.titulo}* (${tarefa.horaInicio} - ${tarefa.horaFim})\n`;
    });

    texto += `\n✨ _Gerado por TempoClaro App_`;
    return texto;
  },
};