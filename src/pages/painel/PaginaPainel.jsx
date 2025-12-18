import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; 
import { gerenciadorRotinas } from '../../manager/gerenciadorRotinas';
import { FaMoon, FaSun, FaCalendarAlt, FaSignOutAlt, FaBook, FaBolt, FaCheckCircle, FaClock } from 'react-icons/fa';
import './PaginaPainel.css';

export const PaginaPainel = () => {
  const { user, capturaLogout } = useContext(AuthContext);
  const { theme, alternarTema } = useTheme(); 
  const navegar = useNavigate();

  // Estado para armazenar as estatísticas
  const [estatisticas, setEstatisticas] = useState({
    contagemRotinas: 0,
    rotinasAtivas: 0,
    totalTarefas: 0,
    duracaoTotal: '0min'
  });

  useEffect(() => {
    calcularEstatisticas();
  }, []);

  const calcularEstatisticas = () => {
    try {
      const rotinas = gerenciadorRotinas.carregarRotinas();

      let totalTarefas = 0;
      let rotinasAtivas = 0;
      let duracaoTotalMinutos = 0;

      rotinas.forEach(rotina => {
        // Lógica simplificada: Se a rotina existe, consideramos ativa para este exemplo
        // Se houver campo 'ativa' no futuro, adicionar: if (rotina.ativa)
        rotinasAtivas++;
        totalTarefas += rotina.tarefas.length;

        rotina.tarefas.forEach(tarefa => {
          const [horaInicio, minInicio] = tarefa.horaInicio.split(':').map(Number);
          const [horaFim, minFim] = tarefa.horaFim.split(':').map(Number);
          duracaoTotalMinutos += (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
        });
      });

      const horas = Math.floor(duracaoTotalMinutos / 60);
      const minutos = duracaoTotalMinutos % 60;
      const duracaoFormatada = horas === 0 ? `${minutos}min` : `${horas}h ${minutos}min`;

      setEstatisticas({
        contagemRotinas: rotinas.length,
        rotinasAtivas,
        totalTarefas,
        duracaoTotal: duracaoFormatada
      });

    } catch (erro) {
      console.error("Erro ao carregar estatísticas", erro);
    }
  };

  const capturaCliqueLogout = () => {
    capturaLogout();
    navegar('/login');
  };

  return (
    <div className="container-painel">
      {/* HEADER PADRONIZADO (IGUAL AO ROUTINE PAGE) */}
      <header className="cabecalho-painel">
        <div className="conteudo-cabecalho">
          <h1>TEMPO-CLARO</h1>

          <div className="acoes-cabecalho">
            {/* Botão de Tema */}
            <button
              className="botao-tema"
              onClick={alternarTema}
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
              style={{
                background: 'transparent',
                border: '1px solid var(--cor-borda)',
                fontSize: '1.2rem',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            {/* Navegação para Rotinas */}
            <button
              className="botao-nav"
              onClick={() => navegar('/routine')}
            >
              <FaCalendarAlt /> Rotinas
            </button>

            <div className="info-usuario">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="avatar-usuario" />
              )}
              <div className="detalhes-usuario">
                <p className="nome-usuario">{user?.name}</p>
                <button onClick={capturaCliqueLogout} className="botao-sair">
                  <FaSignOutAlt /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="principal-painel">

        <div className="grade-estatisticas">
          <div className="cartao-estatistica estatistica-total">
            <div className="cabecalho-estatistica">
              <h3>Total de Rotinas</h3>
              <span className="icone-estatistica"><FaBook /></span>
            </div>
            <div className="valor-estatistica">{estatisticas.contagemRotinas}</div>
            <p className="descricao-estatistica">Rotinas cadastradas</p>
          </div>

          <div className="cartao-estatistica estatistica-concluida">
            <div className="cabecalho-estatistica">
              <h3>Em Atividade</h3>
              <span className="icone-estatistica"><FaBolt /></span>
            </div>
            <div className="valor-estatistica">{estatisticas.rotinasAtivas}</div>
            <p className="descricao-estatistica">Rotinas em execução hoje</p>
          </div>

          <div className="cartao-estatistica estatistica-progresso">
            <div className="cabecalho-estatistica">
              <h3>Tarefas Diárias</h3>
              <span className="icone-estatistica"><FaCheckCircle /></span>
            </div>
            <div className="valor-estatistica">{estatisticas.totalTarefas}</div>
            <p className="descricao-estatistica">Ações programadas</p>
          </div>

          <div className="cartao-estatistica estatistica-pendente">
            <div className="cabecalho-estatistica">
              <h3>Tempo Alocado</h3>
              <span className="icone-estatistica"><FaClock /></span>
            </div>
            <div className="valor-estatistica" style={{ fontSize: '28px' }}>{estatisticas.duracaoTotal}</div>
            <p className="descricao-estatistica">Duração total diária</p>
          </div>
        </div>
      </main>
    </div>
  );
};