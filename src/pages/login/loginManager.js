/**
 * Login Manager
 * Gerencia a lógica de autenticação e redirecionamento na página de login
 */

import { uiManager } from '../home/uiManager';

export const loginManager = {
  /**
   * Processa efeitos de autenticação ao carregar a página
   * @param {Object} user - usuário do contexto
   * @param {boolean} isLoading - se está carregando
   * @param {Function} navigate - função navigate
   * @param {string} redirectPath - para onde redirecionar se autenticado
   */
  handleAuthCheck(user, isLoading, navigate, redirectPath = '/routine') {
    uiManager.redirectIfAuthenticated(user, isLoading, navigate, redirectPath);
  },

  /**
   * Verifica se o usuário já está autenticado e o redireciona (DEPRECATED - usar handleAuthCheck)
   */
  handleUserRedirect(user, isLoading, navigate) {
    this.handleAuthCheck(user, isLoading, navigate, '/routine');
  },

  /**
   * Retorna dados para renderização da página de login
   * @returns {Object} - dados da página de login
   */
  getLoginPageData() {
    return {
      appTitle: 'TEMPO-CLARO',
      welcomeText: 'Bem-vindo ao nosso aplicativo',
      loginDescription: 'Faça login para acessar o aplicativo',
      termsText: 'Ao fazer login, você concorda com nossos',
      termsLink: '/terms',
      termsLabel: 'Termos de Serviço',
      privacyLink: '/privacy',
      privacyLabel: 'Política de Privacidade',
      loginButtonText: 'Entrar',
    };
  },

  /**
   * Valida credenciais de email e senha
   * @param {string} email - email do usuário
   * @param {string} password - senha do usuário
   * @returns {Object} - objeto com erros (vazio se válido)
   */
  validateCredentials(email, password) {
    const errors = {};

    // Validar email
    if (!email) {
      errors.email = 'Email é obrigatório';
    } else if (email.trim() === '') {
      errors.email = 'Email não pode conter apenas espaços em branco';
    } else if (!this.isValidEmail(email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.trim() === '') {
      errors.password = 'Senha não pode conter apenas espaços em branco';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    return errors;
  },

  /**
   * Valida formato de email
   * @param {string} email - email a validar
   * @returns {boolean} - se é um email válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida se o estado de carregamento é válido para mostrar login
   * @param {boolean} isLoading - se está carregando
   * @returns {boolean} - se deve mostrar página de login
   */
  shouldShowLoginPage(isLoading) {
    return !isLoading;
  },

  isPageLoading(isLoading) {
    return isLoading;
  },
};