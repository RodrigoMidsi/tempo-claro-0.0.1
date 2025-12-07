/**
 * Login Manager
 * Gerencia a lógica de autenticação e redirecionamento
 */

export const loginManager = {
  /**
   * Verifica se o usuário já está autenticado e o redireciona
   */
  handleUserRedirect(user, isLoading, navigate) {
    if (user && !isLoading) {
      navigate('/routine'); // <--- CORRIGIDO: Redireciona para Rotinas
    }
  },

  isPageLoading(isLoading) {
    return isLoading;
  },
};