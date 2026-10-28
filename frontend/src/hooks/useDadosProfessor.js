import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { obterDashboardProfessor } from '../services/api';

const PERIODO_PADRAO = '30';
const LIMITE_RECENTES_PADRAO = 10;

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function calcularIntervalo(periodo) {
  const dias = Number(periodo) || 30;
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(fim.getDate() - (dias - 1));

  return {
    dataInicio: formatarDataISO(inicio),
    dataFim: formatarDataISO(fim),
  };
}

function criarFiltrosIniciais() {
  const intervalo = calcularIntervalo(PERIODO_PADRAO);

  return {
    periodo: PERIODO_PADRAO,
    dataInicio: intervalo.dataInicio,
    dataFim: intervalo.dataFim,
    turmaId: '',
    tipo: '',
    alunoId: '',
  };
}

export default function useDadosProfessor() {
  const [filtros, setFiltros] = useState(criarFiltrosIniciais);
  const [limiteRecentes, setLimiteRecentes] = useState(LIMITE_RECENTES_PADRAO);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const ultimaRequisicao = useRef(0);

  const intervalo = useMemo(() => {
    if (filtros.periodo === 'personalizado') {
      const padrao = calcularIntervalo(PERIODO_PADRAO);

      return {
        dataInicio: filtros.dataInicio || padrao.dataInicio,
        dataFim: filtros.dataFim || padrao.dataFim,
      };
    }

    return calcularIntervalo(filtros.periodo);
  }, [filtros.periodo, filtros.dataInicio, filtros.dataFim]);

  const parametros = useMemo(
    () => ({
      data_inicio: intervalo.dataInicio,
      data_fim: intervalo.dataFim,
      turma_id: filtros.turmaId,
      tipo: filtros.tipo,
      aluno_id: filtros.alunoId,
      limite: limiteRecentes,
    }),
    [
      intervalo.dataInicio,
      intervalo.dataFim,
      filtros.turmaId,
      filtros.tipo,
      filtros.alunoId,
      limiteRecentes,
    ],
  );

  const carregar = useCallback(async () => {
    const identificador = ultimaRequisicao.current + 1;
    ultimaRequisicao.current = identificador;

    setCarregando(true);
    setErro('');

    try {
      const resposta = await obterDashboardProfessor(parametros);

      // Ignora respostas antigas quando os filtros mudam rapidamente.
      if (identificador === ultimaRequisicao.current) {
        setDados(resposta);
      }
    } catch (falha) {
      if (identificador === ultimaRequisicao.current) {
        setErro(
          falha.message || 'Não foi possível carregar os dados da dashboard.',
        );
      }
    } finally {
      if (identificador === ultimaRequisicao.current) {
        setCarregando(false);
      }
    }
  }, [parametros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizarFiltro = useCallback((campo, valor) => {
    setFiltros((atuais) => {
      if (campo === 'periodo') {
        if (valor === 'personalizado') {
          return { ...atuais, periodo: valor };
        }

        const novoIntervalo = calcularIntervalo(valor);

        return {
          ...atuais,
          periodo: valor,
          dataInicio: novoIntervalo.dataInicio,
          dataFim: novoIntervalo.dataFim,
        };
      }

      // Evita enviar uma combinação de turma e aluno incompatível.
      if (campo === 'turmaId') {
        return { ...atuais, turmaId: valor, alunoId: '' };
      }

      return { ...atuais, [campo]: valor };
    });
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros(criarFiltrosIniciais());
  }, []);

  const temFiltrosAtivos = Boolean(
    filtros.turmaId || filtros.tipo || filtros.alunoId,
  );

  return {
    dados,
    carregando,
    erro,
    filtros,
    intervalo,
    temFiltrosAtivos,
    limiteRecentes,
    alterarLimiteRecentes: setLimiteRecentes,
    atualizarFiltro,
    limparFiltros,
    recarregar: carregar,
  };
}
