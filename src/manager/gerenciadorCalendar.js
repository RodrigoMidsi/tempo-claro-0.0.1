/**
 * Google Calendar Manager
 * Gerencia a integração com Google Calendar API
 */

export const gerenciadorCalendar = {
  /**
   * Inicializa a API do Google Calendar de forma robusta
   */
  async inicializarApi() {
    return new Promise((resolver, rejeitar) => {
      // Função interna para inicializar o cliente quando o gapi estiver pronto
      const iniciarClienteGapi = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            resolver();
          } catch (erro) {
            rejeitar(erro);
          }
        });
      };

      // Cenário 1: gapi já existe
      if (window.gapi) {
        iniciarClienteGapi();
        return;
      }

      // Cenário 2: gapi não existe, precisamos carregar o script dinamicamente
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => iniciarClienteGapi();
      script.onerror = () => rejeitar(new Error('Falha ao carregar script do Google API'));
      document.body.appendChild(script);
    });
  },


  async sincronizarRotina(rotina, tokenAcesso) { // sincroniza rotina com Google Calendar
    try {
      if (!window.gapi || !window.gapi.client) {
        await this.inicializarApi();
      }
      // Define o token para a requisição
      window.gapi.client.setToken({ access_token: tokenAcesso });
      // criar o calendário "TEMPO-CLARO Rotinas"
      const idCalendario = await this.criarCalendarioRotinas();

      // 2. Gerar eventos baseados na recorrência
      const eventosParaCriar = [];
      
      for (const tarefa of rotina.tarefas) {
        const datas = this.gerarDatasEventos(
          rotina.dataInicio,
          rotina.dataFim,
          tarefa.diasSemana
        );

        for (const data of datas) {
          const payloadEvento = this.construirEventoCalendario(tarefa, data, rotina.cor);
          eventosParaCriar.push(payloadEvento);
        }
      }

      // 3. Enviar eventos para o Google
      const resultados = { sucesso: 0, falhas: 0, erros: [] };

      for (const evento of eventosParaCriar) {
        try {
          await window.gapi.client.calendar.events.insert({
            calendarId: idCalendario,
            resource: evento,
          });
          resultados.sucesso++;
        } catch (erro) {
          console.error('Erro ao criar evento:', evento.summary, erro);
          resultados.falhas++;
          resultados.erros.push(erro.message || 'Erro desconhecido');
        }
      }

      return {
        sucesso: resultados.falhas === 0,
        totalEventos: eventosParaCriar.length,
        sucessos: resultados.sucesso,
        falhas: resultados.falhas,
        idCalendario,
        mensagem: this.construirMensagemResultado(resultados),
      };

    } catch (erro) {
      console.error('Erro na sincronização:', erro);
      return {
        sucesso: false,
        erro: erro.message || 'Erro de conexão com Google Calendar',
      };
    }
  },


  async criarCalendarioRotinas() {
    try {
      const resposta = await window.gapi.client.calendar.calendarList.list();
      const calendarios = resposta.result.items || [];
      
      const calendarioExistente = calendarios.find( // verifica se já existe o calendário
        cal => cal.summary === 'TEMPO-CLARO Rotinas'
      );

      if (calendarioExistente) { // retorna o ID existente
        return calendarioExistente.id;
      }

      const novoCalendario = await window.gapi.client.calendar.calendars.insert({  // cria novo calendário
        resource: {
          summary: 'TEMPO-CLARO Rotinas',
          description: 'Rotinas criadas pelo app TempoClaro',
          timeZone: 'America/Sao_Paulo',
        },
      });

      return novoCalendario.result.id; // retorna o ID do novo calendário
    } catch (erro) {
      console.error("Erro detalhado do Google:", erro);
      throw new Error(`Erro no Google Calendar: ${erro.message}`);
    }
  },


  gerarDatasEventos(dataInicio, dataFim, diasSemana) {
    const datas = [];
    
    // TRUQUE: Adiciona 'T00:00:00Z' para forçar a data a ser interpretada como UTC (Zero Timezone).
    // Assim, "2025-12-05" vira exatamente "2025-12-05T00:00:00.000Z"
    // e não sofre subtração de fuso horário (-3h).
    const inicio = new Date(`${dataInicio}T00:00:00Z`);
    const fim = new Date(`${dataFim}T00:00:00Z`);

    const mapaDiasNumero = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 
      'quinta': 4, 'sexta': 5, 'sábado': 6
    };

    const diasSelecionadosNumeros = diasSemana.map(dia => mapaDiasNumero[dia.toLowerCase()]);

    let atual = new Date(inicio);

    while (atual <= fim) {
      // getUTCDay() garante que pegamos o dia da semana da data UTC, sem converter para local
      const diaDaSemana = atual.getUTCDay();

      if (diasSelecionadosNumeros.includes(diaDaSemana)) {
        // toISOString() sempre retorna em UTC, então "2025-12-05T00:00..." vira "2025-12-05"
        datas.push(atual.toISOString().split('T')[0]);
      }
      
      // Avança um dia em UTC
      atual.setUTCDate(atual.getUTCDate() + 1);
    }

    return datas;
  },

  construirEventoCalendario(tarefa, data, corRotina) {
    const [horaInicio, minutoInicio] = tarefa.horaInicio.split(':');
    const [horaFim, minutoFim] = tarefa.horaFim.split(':');

    return {
      summary: tarefa.titulo,
      start: {
        dateTime: `${data}T${horaInicio}:${minutoInicio}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: `${data}T${horaFim}:${minutoFim}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      colorId: this.mapearCorParaIdGoogle(corRotina),
    };
  },

  mapearCorParaIdGoogle(corHex) {
    const mapaCores = {
      '#667eea': '9', // Azul (Blueberry)
      '#764ba2': '3', // Roxo (Grape)
      '#10b981': '10', // Verde (Basil)
      '#f59e0b': '6', // Laranja (Tangerine)
      '#ef4444': '11', // Vermelho (Tomato)
    };
    return mapaCores[corHex] || '9';
  },

  construirMensagemResultado(resultado) {
    if (resultado.falhas === 0) return `✅ ${resultado.sucessos} eventos sincronizados!`;
    if (resultado.sucessos === 0) return `❌ Falha total. Erro: ${resultado.erros[0]}`;
    return `⚠️ Parcial: ${resultado.sucessos} ok, ${resultado.falhas} falhas.`;
  },

  abrirGoogleCalendar(idCalendario) {
    const url = idCalendario 
      ? `https://calendar.google.com/calendar/u/0/r?cid=${idCalendario}` 
      : 'https://calendar.google.com';
    window.open(url, '_blank');
  }
};