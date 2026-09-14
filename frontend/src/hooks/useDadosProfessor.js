import { useState, useEffect } from 'react';
import { listarTurmas, listarTarefas } from '../services/api';

export default function useDadosProfessor() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [metricas, setMetricas] = useState({ totalTurmas: 0, totalAlunos: 0, tarefasAtivas: 0 });

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        // Lógica de fetch de métricas iniciais
        setCarregando(false);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar dados do professor.');
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  return { metricas, carregando, erro };
}