import { useState, useEffect } from 'react';
import { listarTurmas, criarTurma } from '../services/api'; 

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
      
      setTurmas([novaTurma, ...turmas]);
      
      setMensagem({ tipo: 'sucesso', texto: `Turma criada! Código de convite: ${novaTurma.codigo}` });
      
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
  
  const salvarEdicaoTurma = async () => {};
  const copiarCodigo = () => {};
  const excluirTurma = async () => {};

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