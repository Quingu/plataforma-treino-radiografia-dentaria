import { useState, useEffect } from 'react';
import { listarTurmas } from '../services/api';

export default function useGestaoTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);

  const carregarTurmas = async () => {
    const dados = await listarTurmas();
    setTurmas(dados);
  };

  useEffect(() => { carregarTurmas(); }, []);

  const abrirEdicao = (turma) => {
    setTurmaSelecionada(turma);
    setModalEditar(true);
  };

  return { turmas, carregarTurmas, modalCriar, setModalCriar, modalEditar, setModalEditar, turmaSelecionada, abrirEdicao };
}