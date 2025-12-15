/**
 * Dashboard Manager
 * Gerencia estatísticas baseadas nas Rotinas e lógica do dashboard
 */

import { routineManager } from '../../components/Forms/routineManager';
import { uiManager } from '../home/uiManager';

export const dashboardManager = {
  /**
   * Carrega dados e calcula estatísticas das rotinas
   */
  loadStats() {
    try {
      const routines = routineManager.loadRoutinesFromStorage();
      
      // Inicializa contadores
      let totalTasks = 0;
      let activeRoutines = 0;
      let totalDurationMinutes = 0;
      
      routines.forEach(routine => {
        if (routine.isActive) {
          activeRoutines++;
          totalTasks += routine.tasks.length;
          
          // Calcula duração total de todas as tarefas da rotina
          routine.tasks.forEach(task => {
            const [startH, startM] = task.startTime.split(':').map(Number);
            const [endH, endM] = task.endTime.split(':').map(Number);
            totalDurationMinutes += (endH * 60 + endM) - (startH * 60 + startM);
          });
        }
      });

      return {
        routinesCount: routines.length,
        activeRoutines,
        totalTasks, // Total de tarefas dentro das rotinas ativas
        totalDuration: this.formatDuration(totalDurationMinutes)
      };
    } catch (err) {
      console.error('Erro ao calcular stats:', err);
      return { routinesCount: 0, activeRoutines: 0, totalTasks: 0, totalDuration: '0h' };
    }
  },

  /**
   * Processa logout do usuário no dashboard
   * @param {Function} handleLogout - função de logout do contexto
   * @param {Function} navigate - função navigate do react-router
   */
  handleLogout(handleLogout, navigate) {
    uiManager.processLogout(handleLogout, navigate, '/login');
  },

  /**
   * Navega para página de rotinas
   * @param {Function} navigate - função navigate
   */
  navigateToRoutines(navigate) {
    uiManager.navigateTo(navigate, '/routine');
  },

  /**
   * Retorna dados para renderização do dashboard
   * @returns {Object} - dados do dashboard
   */
  getDashboardData() {
    return {
      title: 'TEMPO-CLARO',
      welcomeTitle: 'Bem-vindo ao Tempo-Claro',
      welcomeDescription: 'Gerencie suas rotinas e sincronize com o Google Calendar.',
      routinesButtonText: '📅 Gerenciar Minhas Rotinas',
      copyrightYear: new Date().getFullYear(),
      placeholderMessage: 'Vá para a página de Rotinas para começar a organizar seu tempo.',
    };
  },

  formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}min`;
    return `${hours}h ${minutes}min`;
  },

  handleLogout(handleLogout, navigate) {
    handleLogout();
    navigate('/login');
  }
};