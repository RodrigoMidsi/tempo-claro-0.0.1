import React, { useState } from 'react';
import { 
  FaPlus, 
  FaSave, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle, 
  FaClipboardList, 
  FaTasks, 
  FaClock, 
  FaCalendarAlt, 
  FaTrash 
} from 'react-icons/fa';
import { gerenciadorRotinas } from '../../manager/gerenciadorRotinas';
import './FormularioRotina.css'; 

const FormularioRotina = ({ aoCriarRotina, rotinaEmEdicao = null }) => {
  const [rotina, setRotina] = useState(
    rotinaEmEdicao || { ...gerenciadorRotinas.criarModeloRotina(), recorrencia: 'semanal' }
  );
  
  const [tarefaAtual, setTarefaAtual] = useState(gerenciadorRotinas.criarModeloTarefa());
  const [erros, setErros] = useState([]);
  const [mostrarPrevisualizacao, setMostrarPrevisualizacao] = useState(false);

  const manipularMudancaRotina = (e) => {
    const { name, value } = e.target;
    setRotina(prev => ({ ...prev, [name]: value }));
    setErros([]);
  };

  const manipularMudancaTarefa = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const valorDia = name.replace('dia_', '');
      setTarefaAtual(prev => ({
        ...prev,
        diasSemana: checked
          ? [...prev.diasSemana, valorDia]
          : prev.diasSemana.filter(d => d !== valorDia),
      }));
    } else {
      setTarefaAtual(prev => ({ ...prev, [name]: value }));
    }
  };

  const adicionarTarefa = () => {

    // @audit-ok - 3.1 validação de formulário
    if (!tarefaAtual.titulo.trim()) {
      setErros(['Digite o título da tarefa']);
      return;
    }

    if (tarefaAtual.horaInicio >= tarefaAtual.horaFim) {
      setErros(['Hora de fim deve ser depois do início']);
      return;
    }

    if (tarefaAtual.diasSemana.length === 0) {
      setErros(['Selecione pelo menos um dia da semana']);
      return;
    }

    const novasTarefas = [
      ...rotina.tarefas,
      {
        id: Date.now(),
        ...tarefaAtual,
        titulo: tarefaAtual.titulo.trim(),
      }
    ];

    // Atualiza o estado da rotina e limpa o form da tarefa
    setRotina(prev => ({ ...prev, tarefas: novasTarefas }));
    setTarefaAtual(gerenciadorRotinas.criarModeloTarefa()); 
    setErros([]);
  };

  const removerTarefa = (idTarefa) => {
    const novasTarefas = rotina.tarefas.filter(t => t.id !== idTarefa);
    setRotina(prev => ({ ...prev, tarefas: novasTarefas }));
  };

  const manipularEnvio = (e) => {
    e.preventDefault();
    
    // Validação final
    const errosValidacao = gerenciadorRotinas.validarRotina(rotina);
    if (errosValidacao.length > 0) {
      setErros(errosValidacao);
      return;
    }

    aoCriarRotina({ ...rotina, recorrencia: 'semanal' });
    
    // Reseta o formulário se for uma criação nova
    if (!rotinaEmEdicao) {
        setRotina(gerenciadorRotinas.criarModeloRotina());
        setTarefaAtual(gerenciadorRotinas.criarModeloTarefa());
    }
    setErros([]);
  };

  // Utilitários
  const duracaoTotal = gerenciadorRotinas.calcularTotalHoras(rotina.tarefas);
  const diasDaSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  const rotulosDias = {segunda: 'Seg', terça: 'Ter', quarta: 'Qua', quinta: 'Qui', sexta: 'Sex', sábado: 'Sab', domingo: 'Dom', };

  return (
    <div className="container-formulario-rotina">
      <div className="cartao-formulario-rotina">
        <h2>{rotinaEmEdicao ? 'Editar Rotina' : 'Nova Rotina'}</h2>

        {erros.length > 0 && (
          <div className="erros-formulario">
            {erros.map((erro, idx) => (
              <div key={idx} className="mensagem-erro">
                <FaExclamationCircle /> {erro}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={manipularEnvio}>
                    <div className="secao-formulario">
            <h3><FaClipboardList /> Informações da Rotina</h3>

            <div className="grupo-formulario">
              <label htmlFor="nome">Nome da Rotina *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={rotina.nome}
                onChange={manipularMudancaRotina}
                placeholder="Ex: Rotina Matinal"
                maxLength="50"
              />
            </div>

            <div className="linha-formulario">
              <div className="grupo-formulario">
                <label htmlFor="dataInicio">Data de Início *</label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  value={rotina.dataInicio}
                  onChange={manipularMudancaRotina}
                />
              </div>

              <div className="grupo-formulario">
                <label htmlFor="dataFim">Data de Fim *</label>
                <input
                  type="date"
                  id="dataFim"
                  name="dataFim"
                  value={rotina.dataFim}
                  onChange={manipularMudancaRotina}
                />
              </div>
            </div>

            <div className="grupo-formulario">
                <label htmlFor="cor">Cor da Rotina</label>
                <input
                  type="color"
                  id="cor"
                  name="cor"
                  value={rotina.cor}
                  onChange={manipularMudancaRotina}
                  style={{ height: '40px', cursor: 'pointer' }}
                />
            </div>
          </div>

          <div className="secao-formulario">
            <h3><FaTasks /> Tarefas da Rotina</h3>

            <div className="grupo-entrada-tarefa">
              <div className="grupo-formulario">
                <label htmlFor="tituloTarefa">Título da Tarefa *</label>
                <input
                  type="text"
                  id="tituloTarefa"
                  name="titulo"
                  value={tarefaAtual.titulo}
                  onChange={manipularMudancaTarefa}
                  placeholder="Ex: Exercício matinal"
                  maxLength="50"
                />
              </div>

              <div className="linha-formulario">
                <div className="grupo-formulario">
                  <label htmlFor="horaInicio">Hora de Início *</label>
                  <input
                    type="time"
                    id="horaInicio"
                    name="horaInicio"
                    value={tarefaAtual.horaInicio}
                    onChange={manipularMudancaTarefa}
                  />
                </div>

                <div className="grupo-formulario">
                  <label htmlFor="horaFim">Hora de Fim *</label>
                  <input
                    type="time"
                    id="horaFim"
                    name="horaFim"
                    value={tarefaAtual.horaFim}
                    onChange={manipularMudancaTarefa}
                  />
                </div>
              </div>

              <div className="seletor-dias">
                <label>Dias da Semana *</label>
                <div className="grade-dias">
                  {diasDaSemana.map(dia => (
                    <label key={dia} className="checkbox-dia">
                      <input
                        type="checkbox"
                        name={`dia_${dia}`}
                        checked={tarefaAtual.diasSemana.includes(dia)}
                        onChange={manipularMudancaTarefa}
                      />
                      <span>{rotulosDias[dia]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="button" className="botao-adicionar-tarefa" onClick={adicionarTarefa}>
                <FaPlus /> Adicionar Tarefa
              </button>
            </div>

            <div className="lista-tarefas">
              <h4>Tarefas Adicionadas ({rotina.tarefas.length})</h4>
              {rotina.tarefas.length === 0 ? (
                <p className="sem-tarefas">Nenhuma tarefa adicionada ainda</p>
              ) : (
                rotina.tarefas.map(tarefa => (
                  <div key={tarefa.id} className="item-tarefa">
                    <div className="info-tarefa">
                      <strong>{tarefa.titulo}</strong>
                      <span className="tempo-tarefa">
                        <FaClock /> {tarefa.horaInicio} - {tarefa.horaFim}
                      </span>
                      <span className="dias-tarefa">
                        <FaCalendarAlt /> {tarefa.diasSemana.map(d => rotulosDias[d]).join(', ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="botao-remover-tarefa"
                      onClick={() => removerTarefa(tarefa.id)}
                      title="Remover tarefa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>

            {rotina.tarefas.length > 0 && (
              <div className="resumo-tarefa">
                <p><FaClock /> Duração Total: <strong>{duracaoTotal}</strong></p>
              </div>
            )}
          </div>

          <div className="acoes-formulario">
            <button
              type="button"
              className="botao-visualizar"
              onClick={() => setMostrarPrevisualizacao(!mostrarPrevisualizacao)}
              disabled={rotina.tarefas.length === 0}
            >
              {mostrarPrevisualizacao ? <FaEyeSlash /> : <FaEye />} 
              {mostrarPrevisualizacao ? 'Fechar' : 'Visualizar'} Timeline
            </button>
            <button type="submit" className="botao-salvar-rotina">
              <FaSave /> Salvar Rotina
            </button>
          </div>
        </form>

        {mostrarPrevisualizacao && rotina.tarefas.length > 0 && (
          <div className="timeline-previsualizacao">
            <h4><FaClock /> Preview da Timeline</h4>
            {diasDaSemana.map(dia => {
              const tarefasDoDia = rotina.tarefas.filter(t => t.diasSemana.includes(dia));
              if (tarefasDoDia.length === 0) return null;
              
              const tarefasOrdenadas = [...tarefasDoDia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

              return (
                <div key={dia} className="dia-timeline">
                  <h5>{rotulosDias[dia].toUpperCase()}</h5>
                  {tarefasOrdenadas.map(tarefa => (
                    <div key={tarefa.id} className="item-timeline">
                      <span className="tempo-timeline">{tarefa.horaInicio} - {tarefa.horaFim}</span>
                      <div className="tarefa-timeline" style={{ borderLeftColor: rotina.cor }}>
                        {tarefa.titulo}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioRotina;