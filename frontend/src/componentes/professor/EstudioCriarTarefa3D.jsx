import { useEffect, useState } from 'react';
import StatusMensagem from '../comum/StatusMensagem';
import VisualizadorModelo3D from '../comum/VisualizadorModelo3D';
import { criarAtividade3D } from '../../services/tarefas3d';
import { obterCasoClinico } from '../../services/api';
import {
  TOLERANCIA_MINIMA,
  TOLERANCIA_PADRAO,
  montarGabarito3D,
  pontoValido,
} from '../../utils/tarefa3d';

export default function EstudioCriarTarefa3D({
  caso,
  turmas = [],
  aoCancelar,
  aoConcluir,
}) {
  const [detalhes, setDetalhes] = useState({
    turmaId: '',
    titulo: caso?.titulo || '',
    instrucoes: '',
  });
  const [ponto, setPonto] = useState(null);
  const [nomeEstrutura, setNomeEstrutura] = useState('');
  const [malha, setMalha] = useState('');
  const [tolerancia, setTolerancia] = useState(String(TOLERANCIA_PADRAO));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [urlModelo, setUrlModelo] = useState(
    caso?.modeloUrl || caso?.modelo_3d_url || '',
  );

  // A URL assinada expira em 5 minutos; ao abrir o estúdio buscamos uma nova.
  useEffect(() => {
    let ativo = true;

    if (!caso?.id) {
      return undefined;
    }

    obterCasoClinico(caso.id)
      .then((dados) => {
        if (ativo && dados?.modelo_3d_url) {
          setUrlModelo(dados.modelo_3d_url);
        }
      })
      .catch(() => {
        // Mantém a URL recebida na listagem.
      });

    return () => {
      ativo = false;
    };
  }, [caso?.id]);

  if (!caso) {
    return null;
  }

  const alterarDetalhe = (campo, valor) => {
    setDetalhes((atuais) => ({ ...atuais, [campo]: valor }));
  };

  const salvar = async () => {
    const toleranciaNumero = Number(String(tolerancia).replace(',', '.'));

    if (!pontoValido(ponto)) {
      setMensagem({
        tipo: 'erro',
        texto: 'Clique no modelo para definir o ponto correto da estrutura.',
      });
      return;
    }

    if (!detalhes.turmaId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione a turma da atividade.' });
      return;
    }

    if (!detalhes.titulo.trim() || !detalhes.instrucoes.trim()) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe o título e as instruções da atividade.',
      });
      return;
    }

    if (!Number.isFinite(toleranciaNumero) || toleranciaNumero < TOLERANCIA_MINIMA) {
      setMensagem({
        tipo: 'erro',
        texto: `Informe uma tolerância maior ou igual a ${TOLERANCIA_MINIMA}.`,
      });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      await criarAtividade3D({
        casoClinico: caso.id,
        turma: detalhes.turmaId,
        titulo: detalhes.titulo,
        instrucoes: detalhes.instrucoes,
        gabarito: montarGabarito3D({
          ponto,
          tolerancia: toleranciaNumero,
          nomeEstrutura,
          malha,
        }),
      });

      setSalvo(true);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Atividade 3D criada com sucesso.',
      });
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível criar a atividade 3D.',
      });
    } finally {
      setSalvando(false);
    }
  };

  const concluir = aoConcluir || aoCancelar;

  return (
    <section className="flex min-h-screen flex-col bg-[#0d131d] p-6 select-none lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Criar atividade 3D</h2>
          <p className="mt-1 text-sm text-slate-400">
            Gire o modelo, clique na estrutura correta e defina a tolerância.
          </p>
        </div>
        <button
          type="button"
          onClick={aoCancelar}
          className="cursor-pointer font-semibold text-slate-400 transition-colors hover:text-white"
        >
          Sair do estúdio
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-8 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-slate-800 bg-[#111c2c] p-4">
          <VisualizadorModelo3D
            url={urlModelo}
            pontoLocal={ponto}
            aoSelecionar={setPonto}
            desabilitado={salvando || salvo}
            altura="h-[68vh]"
          />
        </div>

        <div className="flex h-fit flex-col gap-5 rounded-2xl border border-slate-800 bg-[#111c2c] p-6 lg:w-[400px]">
          <h3 className="border-b border-slate-700/80 pb-3 text-lg font-bold text-white">
            Dados da avaliação
          </h3>

          <div className="rounded-xl border border-slate-700/70 bg-[#0c1320] p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Modelo selecionado
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-100">
              {caso.titulo}
            </p>
          </div>

          <StatusMensagem mensagem={mensagem} />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Turma
            </label>
            <select
              value={detalhes.turmaId}
              onChange={(evento) => alterarDetalhe('turmaId', evento.target.value)}
              disabled={salvo}
              className="w-full rounded-xl border border-slate-700/80 bg-[#0c1320] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Título da atividade
            </label>
            <input
              type="text"
              value={detalhes.titulo}
              onChange={(evento) => alterarDetalhe('titulo', evento.target.value)}
              disabled={salvo}
              placeholder="Ex: Identificar a cúspide mesiovestibular"
              className="w-full rounded-xl border border-slate-700/80 bg-[#0c1320] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Instruções para o aluno
            </label>
            <textarea
              value={detalhes.instrucoes}
              onChange={(evento) => alterarDetalhe('instrucoes', evento.target.value)}
              disabled={salvo}
              rows={4}
              placeholder="Descreva o que o aluno deve localizar no modelo..."
              className="w-full resize-none rounded-xl border border-slate-700/80 bg-[#0c1320] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Nome da estrutura
              </label>
              <input
                type="text"
                value={nomeEstrutura}
                onChange={(evento) => setNomeEstrutura(evento.target.value)}
                disabled={salvo}
                placeholder="Ex: Cúspide MV"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0c1320] px-3 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Malha (opcional)
              </label>
              <input
                type="text"
                value={malha}
                onChange={(evento) => setMalha(evento.target.value)}
                disabled={salvo}
                placeholder="Ex: Crown"
                className="w-full rounded-xl border border-slate-700/80 bg-[#0c1320] px-3 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Tolerância (unidades locais do GLB)
            </label>
            <input
              type="number"
              min={TOLERANCIA_MINIMA}
              step="0.001"
              value={tolerancia}
              onChange={(evento) => setTolerancia(evento.target.value)}
              disabled={salvo}
              className="w-full rounded-xl border border-slate-700/80 bg-[#0c1320] px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              O ponto é gravado no espaço local do arquivo, não na tela.
            </p>
          </div>

          <div className="mt-2 flex gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={salvo ? concluir : aoCancelar}
              className="w-1/2 rounded-xl bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
            >
              {salvo ? 'Concluir' : 'Cancelar'}
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || salvo || !pontoValido(ponto)}
              className="w-1/2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {salvando ? 'Salvando...' : salvo ? 'Criada' : 'Salvar atividade'}
            </button>
          </div>

          {!pontoValido(ponto) && !salvo && (
            <p className="mt-1 text-center text-[10px] text-red-400">
              * Clique no modelo para marcar o ponto correto.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
