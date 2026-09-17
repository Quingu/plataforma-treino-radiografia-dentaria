import { useState, useEffect } from 'react';
import { listarTurmas, criarTurma, editarTurma, excluirTurma as excluirTurmaApi } from '../services/api';

export default function useGestaoTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const carregarTurmas = async () => {
    try {
      const dados = await listarTurmas();
      setTurmas(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar turmas", erro);
      setTurmas([]);
    }
  };

  useEffect(() => { carregarTurmas(); }, []);

  const abrirEdicao = (turma) => {
    setTurmaSelecionada(turma);
    setModalEditar(true);
  };


  const salvarNovaTurma = async (nome) => {
    setSalvando(true);
    setMensagem(null);
    try {
      const novaTurma = await criarTurma({ nome });
      
      setTurmas((atuais) => [novaTurma, ...atuais]);
      
      setMensagem({ tipo: 'sucesso', texto: `Turma criada! Código de convite: ${novaTurma.codigo_convite}` });
      
      setTimeout(() => {
        setModalCriar(false);
        setMensagem(null);
      }, 6000);
      
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message || 'Erro ao criar turma' });
    } finally {
      setSalvando(false);
    }
  };
  
  const salvarEdicaoTurma = async (nome) => {
    if (!turmaSelecionada) return;
    setSalvando(true);
    setMensagem(null);
    try {
      const atualizada = await editarTurma(turmaSelecionada.id, { nome });
      setTurmas((atuais) => atuais.map((turma) => turma.id === atualizada.id ? atualizada : turma));
      setModalEditar(false);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message || 'Erro ao editar turma.' });
    } finally {
      setSalvando(false);
    }
  };

  const copiarCodigo = async (codigo) => {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setMensagem({ tipo: 'sucesso', texto: 'Código de convite copiado.' });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível copiar o código.' });
    }
  };

  const excluirTurma = async (id) => {
    if (!window.confirm('Deseja excluir esta turma? Esta ação não pode ser desfeita.')) return;
    try {
      await excluirTurmaApi(id);
      setTurmas((atuais) => atuais.filter((turma) => turma.id !== id));
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message || 'Não foi possível excluir a turma.' });
    }
  };

  return { 
    turmas, 
    busca, 
    setBusca,
    carregarTurmas, 
    modalCriar, 
    setModalCriar, 
    modalEditar, 
    setModalEditar, 
    turmaSelecionada, 
    abrirEdicao,
    salvando,
    mensagem,
    salvarNovaTurma,
    salvarEdicaoTurma,
    copiarCodigo,
    excluirTurma
  };
}
