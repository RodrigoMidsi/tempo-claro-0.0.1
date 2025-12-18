import React, { useState, useContext } from 'react';
import { FaMoon, FaSun, FaChartBar, FaSignOutAlt, FaPlus, FaEdit, FaCalendarCheck, FaTrash, FaTasks, FaClock, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; 
import { gerenciadorRotinas } from '../../manager/gerenciadorRotinas';
import { gerenciadorCalendar } from '../../manager/gerenciadorCalendar';
import { FormularioRotina } from '../../components'; 
import './PaginaRotina.css';

export const PaginaRotina = () => {
  const { user, accessToken, capturaLogout } = useContext(AuthContext);
  const { theme, alternarTema } = useTheme(); // CORREÇÃO: useTheme retorna { alternarTema }, não toggleTheme
  const navegar = useNavigate();

  const [rotinas, setRotinas] = useState(() => {
    const carregadas = gerenciadorRotinas.carregarRotinas();
    return gerenciadorRotinas.ordenarRotinasPorData(carregadas);
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [rotinaEmEdicao, setRotinaEmEdicao] = useState(null);
  const [statusSincronizacao, setStatusSincronizacao] = useState(null);

  const atualizarListaRotinas = () => {
    const carregadas = gerenciadorRotinas.carregarRotinas(); 
    const ordenadas = gerenciadorRotinas.ordenarRotinasPorData(carregadas);
    setRotinas(ordenadas);
  };

  const salvarRotina = (rotina) => {
    gerenciadorRotinas.salvarRotina(rotina); 
    atualizarListaRotinas();
    setMostrarFormulario(false);
    setRotinaEmEdicao(null);
  };

  const deletarRotina = (idRotina) => {
    if (window.confirm('Tem certeza que deseja deletar esta rotina?')) {
      gerenciadorRotinas.deletarRotina(idRotina);
      atualizarListaRotinas();
    }
  };

  const iniciarEdicao = (rotina) => {
    setRotinaEmEdicao(rotina);
    setMostrarFormulario(true);
  };

  const exportarParaGoogle = async (rotina) => {
    setStatusSincronizacao({ status: 'carregando', mensagem: 'Conectando ao Google...' });

    if (!accessToken) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    const resultado = await gerenciadorCalendar.sincronizarRotina(rotina, accessToken);

    if (resultado.sucesso) { 
      setStatusSincronizacao({ status: 'sucesso', mensagem: resultado.mensagem });
      setTimeout(() => {  setStatusSincronizacao(null);  }, 1500);
    } else {
      setStatusSincronizacao({ status: 'erro', mensagem: resultado.mensagem || 'Erro na sincronização' });
    }
  };

  return (
    <div className="container-pagina-rotina">
      <header className="cabecalho-rotina">
        <div className="conteudo-cabecalho">
          <h1>TEMPO-CLARO</h1>
          <div className="acoes-cabecalho">

            <button 
              className="botao-tema" 
              onClick={alternarTema} // Usando nome correto do contexto
              title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            <button className="botao-painel" onClick={() => navegar('/painel')}> 
              <FaChartBar /> Dashboard  
            </button>

            <div className="info-usuario">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="avatar-usuario" />
              )}
              <div className="detalhes-usuario">
                <p className="nome-usuario">{user?.name}</p>
                <button
                  onClick={() => {
                    capturaLogout();
                    navegar('/login');
                  }}
                  className="botao-sair"
                >
                  <FaSignOutAlt /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="principal-rotina">
        {mostrarFormulario ? (
          <div className="wrapper-secao-formulario">
            <button
              className="botao-voltar"
              onClick={() => {
                setMostrarFormulario(false);
                setRotinaEmEdicao(null);
              }}
            >
              ← Voltar para Lista
            </button>
            <FormularioRotina
              aoCriarRotina={salvarRotina}
              rotinaEmEdicao={rotinaEmEdicao}
            />
          </div>
        ) : (
          <div className="secao-rotinas">
            {statusSincronizacao && (
              <div className={`status-sincronizacao sinc-${statusSincronizacao.status}`}>
                {statusSincronizacao.mensagem}
              </div>
            )}

            <div className="barra-topo">
              <button
                className="botao-nova-rotina"
                onClick={() => setMostrarFormulario(true)}
              >
                <FaPlus /> Nova Rotina
              </button>            
            </div>

            <div className="lista-rotinas">
              {rotinas.length === 0 ? (
                <div className="estado-vazio">
                  <div className="icone-vazio">
                    <FaInbox />
                  </div>
                  <h3>Nenhuma rotina encontrada</h3>
                  <p>Que tal criar uma nova rotina para organizar seu dia?</p>
                </div>
              ) : (
                rotinas.map(rotina => (
                  <div
                    key={rotina.id}
                    className="cartao-rotina"
                    style={{ borderLeftColor: rotina.cor }}
                  >
                    <div className="cabecalho-cartao-rotina">
                      <div className="titulo-rotina">
                        <h3>{rotina.nome}</h3>
                        <span className="datas-rotina">
                          Início: {new Date(rotina.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="info-rotina">
                      <span className="item-info">  
                        <FaTasks /> {rotina.tarefas.length} tarefas
                      </span>
                      <span className="item-info">
                        <FaClock /> {gerenciadorRotinas.calcularTotalHoras(rotina.tarefas)}/dia
                      </span>
                    </div>

                    <div className="acoes-rotina">
                      <button className="botao-acao botao-editar" onClick={() => iniciarEdicao(rotina)}>
                        <FaEdit /> Editar
                      </button>
                      <button className="botao-acao botao-exportar" onClick={() => exportarParaGoogle(rotina)}>
                        <FaCalendarCheck /> Exportar
                      </button>
                      <button className="botao-acao botao-deletar" onClick={() => deletarRotina(rotina.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};