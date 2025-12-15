/**
 * RoutinePageManager
 * Gerencia toda a lógica de estado e handlers da página de rotinas
 */

import { routineManager } from '../../components/Forms/routineManager';
import { googleCalendarManager } from './googleCalendarManager';
import { uiManager } from './uiManager';

export const routinePageManager = {
  /**
   * Carrega rotinas ordenadas
   * @param {string} sortOrder - 'asc' ou 'desc'
   * @returns {Array} - rotinas carregadas e ordenadas
   */
  loadAndSortRoutines(sortOrder = 'asc') {
    const loaded = routineManager.loadRoutinesFromStorage();
    return routineManager.sortRoutinesByDate(loaded, sortOrder);
  },

  /**
   * Processa criação/atualização de rotina
   * @returns {Object} - estado atualizado
   */
  handleRoutineCreated() {
    const routines = this.loadAndSortRoutines();
    return {
      routines,
      showForm: false,
      editingRoutine: null,
    };
  },

  /**
   * Processa edição de rotina
   * @param {Object} routine - rotina a editar
   * @returns {Object} - estado atualizado
   */
  handleEditRoutine(routine) {
    return {
      editingRoutine: routine,
      showForm: true,
    };
  },

  /**
   * Processa deleção de rotina com confirmação
   * @param {string} routineId - ID da rotina a deletar
   * @returns {Object} - estado atualizado ou null
   */
  handleDeleteRoutine(routineId) {
    const message = 'Tem certeza que deseja deletar esta rotina?';
    
    if (uiManager.showConfirmDialog(message)) {
      routineManager.deleteRoutineFromStorage(routineId);
      const routines = this.loadAndSortRoutines();
      return { routines };
    }
    return null;
  },

  /**
   * Processa exportação de rotina para Google Calendar
   * @param {Object} routine - rotina a exportar
   * @param {string} accessToken - token de acesso
   * @returns {Promise<Object>} - resultado da operação
   */
  async handleExportToGoogle(routine, accessToken) {
    if (!accessToken) {
      uiManager.showAlert('Você precisa fazer login novamente para obter permissão do calendário.');
      return { success: false, error: 'Sem token de acesso' };
    }

    try {
      const result = await googleCalendarManager.syncRoutineToCalendar(routine, accessToken);

      if (result.success) {
        // Abre o calendário após 1.5s
        setTimeout(() => {
          googleCalendarManager.openGoogleCalendar(result.calendarId);
        }, 1500);

        return {
          success: true,
          status: 'success',
          message: result.message,
        };
      } else {
        throw new Error(result.error || 'Erro na sincronização');
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        status: 'error',
        message: `❌ Erro: ${error.message}`,
      };
    }
  },

  /**
   * Filtra rotinas baseado no status
   * @param {Array} routines - lista de rotinas
   * @param {string} filterStatus - status do filtro ('active', 'future')
   * @returns {Array} - rotinas filtradas
   */
  filterRoutines(routines, filterStatus) {
    return routineManager.filterRoutinesByStatus(routines, filterStatus);
  },

  /**
   * Calcula duração total de uma rotina
   * @param {Object} routine - rotina
   * @returns {string} - duração formatada
   */
  calculateDuration(routine) {
    return routineManager.calculateTotalDuration(routine.tasks);
  },

  /**
   * Processa voltar do formulário
   * @returns {Object} - estado atualizado
   */
  handleBackFromForm() {
    return {
      showForm: false,
      editingRoutine: null,
    };
  },

  /**
   * Processa mudança de filtro
   * @param {string} filterStatus - novo filtro
   * @returns {Object} - estado atualizado
   */
  handleFilterChange(filterStatus) {
    return { filterStatus };
  },

  /**
   * Processa abertura do formulário
   * @returns {Object} - estado atualizado
   */
  handleOpenForm() {
    return { showForm: true };
  },
};
