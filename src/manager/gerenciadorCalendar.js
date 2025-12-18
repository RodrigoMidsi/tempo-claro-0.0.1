export const gerenciadorCalendar = {

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


      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => iniciarClienteGapi();
      script.onerror = () => rejeitar(new Error('Falha ao carregar script do Google API'));
      document.body.appendChild(script);
    });
  },


  async sincronizarRotina(rotina, tokenAcesso) {
    try {
      if (!window.gapi || !window.gapi.client) {
        await this.inicializarApi();
      }
      // Define o token para a requisição
      window.gapi.client.setToken({ access_token: tokenAcesso });
      // criar o calendário 
      const idCalendario = await this.criarCalendarioRotinas();

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

      // Enviar rotina para o Google
      const resultados = { sucesso: 0, falhas: 0, erros: [] };

      for (const evento of eventosParaCriar) {
        try {
          await window.gapi.client.calendar.events.insert({ // insere no calendario
            calendarId: idCalendario,
            resource: evento,
          });
          resultados.sucesso++;
        } catch (erro) {
          console.error('Erro ao criar evento:', evento.summary, erro);
          resultados.falhas++;
          resultados.erros.push(erro.message);
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
      
      const calendarioExistente = calendarios.find( 
        cal => cal.summary === 'TEMPO-CLARO Rotinas'
      );

      if (calendarioExistente) { 
        return calendarioExistente.id;
      }

      const novoCalendario = await window.gapi.client.calendar.calendars.insert({  
        resource: {
          summary: 'TEMPO-CLARO Rotinas',
          description: 'Rotinas criadas pelo app TempoClaro',
          timeZone: 'America/Sao_Paulo',
        },
      });

      return novoCalendario.result.id; 
    } catch (erro) {
      console.error("Erro detalhado do Google:", erro);
      throw new Error(`Erro no Google Calendar: ${erro.message}`);
    }
  },


  gerarDatasEventos(dataInicio, dataFim, diasSemana) {
    const datas = [];
    
    // forçar a data a ser UTC 
    const inicio = new Date(`${dataInicio}T00:00:00Z`);
    const fim = new Date(`${dataFim}T00:00:00Z`);

    const mapaDiasNumero = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 
      'quinta': 4, 'sexta': 5, 'sábado': 6
    };

    const diasSelecionadosNumeros = diasSemana.map(dia => mapaDiasNumero[dia.toLowerCase()]);

    let atual = new Date(inicio);

    while (atual <= fim) {
      const diaDaSemana = atual.getUTCDay();

      if (diasSelecionadosNumeros.includes(diaDaSemana)) {
        datas.push(atual.toISOString().split('T')[0]);
      }
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
      '#667eea': '1',
      '#764ba2': '2',
      '#10b981': '3',
      '#f59e0b': '4',
      '#ef4444': '5',
    };
    return mapaCores[corHex] || '3';
  },

  construirMensagemResultado(resultado) {
    if (resultado.falhas === 0) return `${resultado.sucessos} eventos sincronizados!`;
    if (resultado.sucessos === 0) return `Erro: ${resultado.erros[0]}`;
    return `${resultado.sucessos} Erro: ${resultado.falhas}`;
  },

  abrirGoogleCalendar(idCalendario) {
    const url = idCalendario 
      ? `https://calendar.google.com/calendar/u/0/r?cid=${idCalendario}` 
      : 'https://calendar.google.com';
    window.open(url, '_blank');
  }
};