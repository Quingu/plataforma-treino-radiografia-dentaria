import { useEffect, useState } from 'react';
import StatusMensagem from '../comum/StatusMensagem';
import ModalConfirmacao from '../comum/ModalConfirmacao';
import VisualizadorModelo3D from '../comum/VisualizadorModelo3D';
import { resolverAtividade3D } from '../../services/tarefas3d';
import { obterCasoClinico } from '../../services/api';
import { formatarPonto3D, pontoValido } from '../../utils/tarefa3d';

export default function ResolucaoTarefa3D({
  tarefa,
  aoVoltar,
  aoResolvido,
}) {
  const [ponto, setPonto] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [urlModelo, setUrlModelo] = useState(
    tarefa?.caso_clinico_modelo_3d_url || '',
  );

  useEffect(() => {
    let ativo = true;

    if (!tarefa?.caso_clinico) {
      return undefined;
    }

    obterCasoClinico(tarefa.caso_clinico)
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
  }, [tarefa?.caso_clinico]);

  if (!tarefa) {
    return null;
  }

  const jaResolvida = Boolean(tarefa.resolvida) || Boolean(resultado);

  const enviar = async () => {
    if (!pontoValido(ponto) || jaResolvida) {
      return;
    }

    setConfirmar(false);
    setEnviando(true);
    setMensagem(null);

    try {
      const resposta = await resolverAtividade3D(tarefa.id, ponto);
      setResultado(resposta);
      setMensagem({
        tipo: resposta.acertou ? 'sucesso' : 'aviso',
        texto: resposta.feedback || 'Resposta enviada.',
      });

      if (aoResolvido) {
        aoResolvido(resposta);
      }
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível enviar sua resposta.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white">
      <header className="flex items-center justify-between bg-[#101726] px-6 py-4">
        <button
          type="button"
          onClick={aoVoltar}
          className="cursor-pointer font-bold"
        >
          ← Resolver tarefa 3D
        </button>

        <span className="text-sm text-slate-400">
          {jaResolvida ? 'Atividade respondida' : 'Resposta não enviada'}
        </span>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
        <section className="p-6">
          <VisualizadorModelo3D
            url={urlModelo}
            pontoLocal={ponto}
            aoSelecionar={setPonto}
            desabilitado={enviando || jaResolvida}
            altura="h-[72vh]"
          />
        </section>

        <aside className="space-y-5 bg-[#111c2c] p-6">
          <div>
            <h2 className="text-lg font-bold">{tarefa.caso_clinico_titulo}</h2>
            <p className="mt-1 text-xs text-slate-400">{tarefa.turma_nome}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">Instruções</p>
            <p className="whitespace-pre-line text-sm text-slate-300">
              {tarefa.instrucoes}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-[#0c1320] p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Sua marcação
            </p>
            <p className="mt-1 font-mono text-xs text-sky-300">
              {formatarPonto3D(ponto)}
            </p>
          </div>

          <StatusMensagem mensagem={mensagem} />

          {resultado?.nome_estrutura && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              Estrutura: {resultado.nome_estrutura}
            </div>
          )}

          <button
            type="button"
            onClick={() => setPonto(null)}
            disabled={enviando || jaResolvida}
            className="w-full cursor-pointer rounded-xl border border-slate-700 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar marcação
          </button>

          <button
            type="button"
            onClick={() => setConfirmar(true)}
            disabled={enviando || jaResolvida || !pontoValido(ponto)}
            className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {enviando
              ? 'Enviando resposta...'
              : jaResolvida
                ? 'Resposta enviada'
                : 'Enviar resposta'}
          </button>
        </aside>
      </main>

      <ModalConfirmacao
        aberto={confirmar}
        titulo="Enviar resposta"
        texto="Após confirmar, não será possível alterar a resposta desta tarefa."
        aoCancelar={() => setConfirmar(false)}
        aoConfirmar={enviar}
      />
    </div>
  );
}
