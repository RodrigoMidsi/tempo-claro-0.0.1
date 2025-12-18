import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // CORREÇÃO: Nome correto do export
import { BotaoLoginGoogle } from '../../components/auth/BotaoLoginGoogle'; // CORREÇÃO: Nome correto do componente
import { CarregadorSpinner } from '../../components/Common/CarregadorSpinner'; // CORREÇÃO: Nome correto do componente
import './PaginaLogin.css';

export const PaginaLogin = () => {
  // CORREÇÃO: Desestruturação deve bater com o value do Provider (user, carregando)
  const { user, carregando } = useContext(AuthContext); 
  const navegar = useNavigate();

  useEffect(() => {
    // Se não está carregando e tem usuário, manda pra rotina
    if (!carregando && user) {
      navegar('/routine');
    }
  }, [user, carregando, navegar]);

  if (carregando) {
    return <CarregadorSpinner />;
  }

  return (
    <div className="container-login">
      <div className="cartao-login">
        <div className="cabecalho-login">
          <h1>TEMPO-CLARO</h1>
          <p>Bem-vindo ao nosso aplicativo</p>
        </div>

        <div className="area-conteudo">
          <p className="descricao-login">
            Faça login para acessar suas rotinas e calendário.
          </p>
          <div>
            <BotaoLoginGoogle />
          </div>
        </div>

        <div className="rodape-login">
          <p className="termos-login">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/termos">Termos de Serviço</a> e{' '}
            <a href="/privacidade">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};