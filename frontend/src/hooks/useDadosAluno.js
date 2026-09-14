import { useEffect, useMemo, useState } from 'react';
import { entrarTurmaComCodigo, listarTarefas, listarTurmas } from '../services/api';

const normalizarTurma = (turma) => ({
  ...turma,
  codigo: turma.codigo_convite || turma.codigo || '',
  qtdAlunos: turma.total_alunos || 0,
  atividadesAtivas: turma.total_tarefas || 0
});

export default function useDadosAluno() {
  const [turmas, setTurmas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');

  const carregar = async () => {
    setCarregando(true);
    setErro('');
    try {
      const [ts, trs] = await Promise.all([
        listarTurmas(),
        listarTarefas()
      ]);
      setTurmas(ts.map(normalizarTurma));
      setTarefas(trs);
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seus dados.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const pendentes = useMemo(() => 
    tarefas.filter(t => !t.resolvida), 
  [tarefas]);

  const concluidas = useMemo(() => 
    tarefas.filter(t => t.resolvida), 
  [tarefas]);

  const precisao = useMemo(() => {
    const r = tarefas.filter(t => typeof t.acertou === 'boolean');
    return r.length 
      ? `${Math.round((r.filter(t => t.acertou).length / r.length) * 100)}%` 
      : '0%';
  }, [tarefas]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    
    return tarefas.filter(t => {
      const texto = `${t.id || ''} ${t.caso_clinico_titulo || ''} ${t.turma_nome || ''} ${t.instrucoes || ''}`.toLowerCase();
      
      return (
        (!termo || texto.includes(termo)) &&
        (filtro === 'todas' || 
        (filtro === 'pendentes' && !t.resolvida) || 
        (filtro === 'concluidas' && t.resolvida))
      );
    });
  }, [tarefas, busca, filtro]);

  const entrar = async (codigo) => {
    const turma = await entrarTurmaComCodigo(codigo);
    
    setTurmas(prev => 
      prev.some(t => t.id === turma.id) 
        ? prev 
        : [normalizarTurma(turma), ...prev]
    );
    setTarefas(await listarTarefas());
  };

  return {
    turmas,
    tarefas,
    setTarefas,
    carregando,
    erro,
    busca,
    setBusca,
    filtro,
    setFiltro,
    filtradas,
    pendentes,
    concluidas,
    precisao,
    recentes: [...tarefas]
      .sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))
      .slice(0, 5),
    entrar
  };
}