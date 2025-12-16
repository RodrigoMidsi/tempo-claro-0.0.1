/**
 * Google Calendar Manager
 * Gerencia a integração com Google Calendar API
 */

export const googleCalendarManager = {
  /**
   * Inicializa a API do Google Calendar de forma robusta
   */
  async initializeCalendarAPI() {
    return new Promise((resolve, reject) => {
      // Função interna para inicializar o cliente quando o gapi estiver pronto
      const initGapiClient = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };

      // Cenário 1: gapi já existe
      if (window.gapi) {
        initGapiClient();
        return;
      }

      // Cenário 2: gapi não existe, precisamos carregar o script dinamicamente
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => initGapiClient();
      script.onerror = () => reject(new Error('Falha ao carregar script do Google API'));
      document.body.appendChild(script);
    });
  },

  /**
   * Sincroniza rotina com Google Calendar
   * @param {Object} routine - Rotina estruturada
   * @param {string} accessToken - Token de acesso do usuário logado
   */
  async syncRoutineToCalendar(routine, accessToken) {
    try {
      if (!accessToken) {
        throw new Error('Token de acesso inválido. Por favor, faça login novamente.');
      }

      // AQUI ESTAVA O ERRO: Verificamos se window.gapi existe antes de acessar .client
      if (!window.gapi || !window.gapi.client) {
        await this.initializeCalendarAPI();
      }

      // Define o token para a requisição
      window.gapi.client.setToken({ access_token: accessToken });

      // 1. Obter ou criar o calendário "TEMPO-CLARO Rotinas"
      const calendarId = await this.getOrCreateRoutineCalendar();

      // 2. Gerar eventos baseados na recorrência
      const eventsToCreate = [];
      
      for (const task of routine.tasks) {
        const dates = this.generateEventDates(
          routine.startDate,
          routine.endDate,
          routine.recurrence,
          task.daysOfWeek
        );

        for (const date of dates) {
          const eventPayload = this.buildCalendarEvent(task, date, routine.color);
          eventsToCreate.push(eventPayload);
        }
      }

      // 3. Enviar eventos para o Google
      const results = { successful: 0, failed: 0, errors: [] };

      for (const event of eventsToCreate) {
        try {
          await window.gapi.client.calendar.events.insert({
            calendarId: calendarId,
            resource: event,
          });
          results.successful++;
        } catch (err) {
          console.error('Erro ao criar evento:', event.summary, err);
          results.failed++;
          results.errors.push(err.message || 'Erro desconhecido');
        }
      }

      return {
        success: results.failed === 0,
        totalEvents: eventsToCreate.length,
        successful: results.successful,
        failed: results.failed,
        calendarId,
        message: this.buildResultMessage(results),
      };

    } catch (error) {
      console.error('Erro na sincronização:', error);
      return {
        success: false,
        error: error.message || 'Erro de conexão com Google Calendar',
      };
    }
  },

  // --- Funções Auxiliares (Mantidas iguais) ---

  async getOrCreateRoutineCalendar() {
    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      const calendars = response.result.items || [];
      
      const existingCalendar = calendars.find(
        cal => cal.summary === 'TEMPO-CLARO Rotinas'
      );

      if (existingCalendar) {
        return existingCalendar.id;
      }

      const newCalendar = await window.gapi.client.calendar.calendars.insert({
        resource: {
          summary: 'TEMPO-CLARO Rotinas',
          description: 'Rotinas criadas pelo app TempoClaro',
          timeZone: 'America/Sao_Paulo',
        },
      });

      return newCalendar.result.id;
    } catch (error) {
      throw new Error('Falha ao acessar calendário. Verifique se deu permissão.');
    }
  },

  generateEventDates(startDate, endDate, recurrence, daysOfWeek) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ajuste de fuso para garantir cálculo correto de dias
    start.setHours(12,0,0,0);
    end.setHours(12,0,0,0);

    const dayNumberMap = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 
      'quinta': 4, 'sexta': 5, 'sábado': 6
    };

    const selectedDayNumbers = daysOfWeek.map(day => dayNumberMap[day.toLowerCase()]);

    let current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();

      if (recurrence === 'once') {
        dates.push(current.toISOString().split('T')[0]);
        break;
      }

      if (recurrence === 'daily' || selectedDayNumbers.includes(dayOfWeek)) {
        dates.push(current.toISOString().split('T')[0]);
      }
      
      current.setDate(current.getDate() + 1);
    }

    return dates;
  },

  buildCalendarEvent(task, date, routineColor) {
    const [startHour, startMin] = task.startTime.split(':');
    const [endHour, endMin] = task.endTime.split(':');

    return {
      summary: task.title,
      description: task.description || '',
      start: {
        dateTime: `${date}T${startHour}:${startMin}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: `${date}T${endHour}:${endMin}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      colorId: this.mapColorToGoogleColorId(routineColor),
    };
  },

  mapColorToGoogleColorId(hexColor) {
    const colorMap = {
      '#667eea': '9', // Azul (Blueberry)
      '#764ba2': '3', // Roxo (Grape)
      '#10b981': '10', // Verde (Basil)
      '#f59e0b': '6', // Laranja (Tangerine)
      '#ef4444': '11', // Vermelho (Tomato)
    };
    return colorMap[hexColor] || '9';
  },

  buildResultMessage(result) {
    if (result.failed === 0) return `✅ ${result.successful} eventos sincronizados!`;
    if (result.successful === 0) return `❌ Falha total. Erro: ${result.errors[0]}`;
    return `⚠️ Parcial: ${result.successful} ok, ${result.failed} falhas.`;
  },

  openGoogleCalendar(calendarId) {
    const url = calendarId 
      ? `https://calendar.google.com/calendar/u/0/r?cid=${calendarId}` 
      : 'https://calendar.google.com';
    window.open(url, '_blank');
  }
};