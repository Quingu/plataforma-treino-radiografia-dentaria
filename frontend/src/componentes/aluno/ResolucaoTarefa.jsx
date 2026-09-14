import StatusMensagem from '../comum/StatusMensagem';
import ModalConfirmacao from '../comum/ModalConfirmacao';
import { resolverUrlImagem } from '../../services/api';

export default function ResolucaoTarefa({
  tarefa,
  imagemRef,
  marcacao,
  mensagem,
  enviando,
  confirmar,
  aoVoltar,
  aoIniciar,
  aoAtualizar,
  aoFinalizar,
  aoLimpar,
  aoSolicitarEnviar,
  aoCancelarConfirmacao,
  aoConfirmar,
}) {
  const imagemUrl = resolverUrlImagem(
    tarefa.caso_clinico_imagem_url || tarefa.imagem_url || ''
  );

  return (
    <div className="min-h-screen bg-[#0d131d] text-white">
      <header className="bg-[#101726] px-6 py-4 flex justify-between">
        <button
          type="button"
          onClick={aoVoltar}
          className="font-bold cursor-pointer"
        >
          ← Resolver tarefa
        </button>

        <span className="text-slate-400 text-sm">
          {tarefa.resolvida
            ? 'Já respondida'
            : 'Resposta não enviada'}
        </span>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
        <section className="p-6">
          <div
            ref={imagemRef}
            onPointerDown={aoIniciar}
            onPointerMove={aoAtualizar}
            onPointerUp={aoFinalizar}
            onPointerLeave={aoFinalizar}
            className="relative overflow-hidden rounded-xl border border-slate-800 bg-black cursor-crosshair"
          >
            {imagemUrl ? (
              <img
                src={imagemUrl}
                alt={tarefa.caso_clinico_titulo}
                draggable="false"
                className="w-full max-h-[72vh] object-contain pointer-events-none"
              />
            ) : (
              <div className="h-[60vh] flex items-center justify-center text-slate-500">
                Imagem não carregada
              </div>
            )}

            {marcacao && (
              <div
                className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20"
                style={{
                  left: `${marcacao.x}%`,
                  top: `${marcacao.y}%`,
                  width: `${marcacao.width}%`,
                  height: `${marcacao.height}%`,
                }}
              />
            )}
          </div>
        </section>

        <aside className="bg-[#111c2c] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold">
              {tarefa.caso_clinico_titulo}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {tarefa.turma_nome}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-300 mb-2">
              Instruções
            </p>

            <p className="text-sm text-slate-300 whitespace-pre-line">
              {tarefa.instrucoes}
            </p>
          </div>

          <StatusMensagem mensagem={mensagem} />

          <button
            type="button"
            onClick={aoLimpar}
            className="w-full py-3 border border-slate-700 rounded-xl cursor-pointer"
          >
            Limpar marcação
          </button>

          <button
            type="button"
            onClick={aoSolicitarEnviar}
            disabled={
              enviando ||
              tarefa.resolvida ||
              !marcacao?.width ||
              !marcacao?.height
            }
            className="w-full py-3 bg-blue-600 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enviando
              ? 'Enviando resposta...'
              : 'Enviar resposta'}
          </button>
        </aside>
      </main>

      <ModalConfirmacao
        aberto={confirmar}
        titulo="Enviar resposta"
        texto="Após confirmar, não será possível alterar a resposta desta tarefa."
        aoCancelar={aoCancelarConfirmacao}
        aoConfirmar={aoConfirmar}
      />
    </div>
  );
}