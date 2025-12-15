/**
 * UIManager
 * Gerencia lógica de navegação e comportamentos comuns de UI
 */

export const uiManager = {
  /**
   * Redireciona para uma página baseada em condições
   * @param {Function} navigate - função navigate do react-router
   * @param {string} path - caminho para navegar
   */
  navigateTo(navigate, path) {
    if (navigate && path) {
      navigate(path);
    }
  },

  /**
   * Redireciona para login quando não autenticado
   * @param {Object} user - usuário do contexto
   * @param {boolean} isLoading - se está carregando
   * @param {Function} navigate - função navigate
   */
  redirectIfNotAuthenticated(user, isLoading, navigate) {
    if (user && !isLoading) {
      return true; // Autenticado
    }
    return false;
  },

  /**
   * Redireciona para home quando já autenticado
   * @param {Object} user - usuário do contexto
   * @param {boolean} isLoading - se está carregando
   * @param {Function} navigate - função navigate
   * @param {string} redirectPath - para onde redirecionar
   */
  redirectIfAuthenticated(user, isLoading, navigate, redirectPath = '/routine') {
    if (user && !isLoading) {
      navigate(redirectPath);
    }
  },

  /**
   * Processa logout do usuário
   * @param {Function} handleLogout - função de logout do contexto
   * @param {Function} navigate - função navigate
   * @param {string} redirectPath - para onde redirecionar após logout
   */
  processLogout(handleLogout, navigate, redirectPath = '/login') {
    handleLogout();
    this.navigateTo(navigate, redirectPath);
  },

  /**
   * Exibe uma confirmação ao usuário
   * @param {string} message - mensagem de confirmação
   * @returns {boolean} - se foi confirmado
   */
  showConfirmDialog(message) {
    return window.confirm(message);
  },

  /**
   * Exibe um alerta ao usuário
   * @param {string} message - mensagem do alerta
   */
  showAlert(message) {
    alert(message);
  },
};
