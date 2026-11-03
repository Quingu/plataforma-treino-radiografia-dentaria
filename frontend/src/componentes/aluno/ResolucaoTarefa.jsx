import { useCallback, useEffect, useRef, useState } from 'react';
import StatusMensagem from '../comum/StatusMensagem';
import ModalConfirmacao from '../comum/ModalConfirmacao';
import { obterCasoClinico, resolverUrlImagem } from '../../services/api';

function urlDaTarefa(tarefa) {
  return resolverUrlImagem(
    tarefa.caso_clinico_imagem_url || tarefa.imagem_url || ''
  );
}

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
  const [imagemUrl, setImagemUrl] = useState(() => urlDaTarefa(tarefa));
  const [carregandoImagem, setCarregandoImagem] = useState(() =>
    Boolean(urlDaTarefa(tarefa))
  );
  const [erroImagem, setErroImagem] = useState(false);
  const [renovandoUrl, setRenovandoUrl] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  // Evita entrar em laço de renovação: cada URL nova ganha no máximo uma
  // tentativa automática.
  const jaRenovouRef = useRef(false);

  // Identidade da tarefa exibida. Só reinicia o estado da imagem quando outra
  // tarefa é aberta; na primeira renderização não mexe em nada (a imagem pode
  // já estar no cache e o evento de load já ter disparado).
  const identidade = `${tarefa.id}-${
    tarefa.caso_clinico_imagem_url || tarefa.imagem_url || ''
  }`;
  const identidadeRef = useRef(identidade);

  useEffect(() => {
    if (identidadeRef.current === identidade) {
      return;
    }

    identidadeRef.current = identidade;

    const url = urlDaTarefa(tarefa);
    setImagemUrl(url);
    setCarregandoImagem(Boolean(url));
    setErroImagem(false);
    setRenovandoUrl(false);
    setTentativa(0);
    jaRenovouRef.current = false;
  }, [identidade, tarefa]);

  // A URL assinada do ScaLeway expira. Se a imagem falhar, pedimos ao backend
  // uma URL nova e tentamos de novo automaticamente.
  const renovarUrl = useCallback(async () => {
    setErroImagem(false);
    setCarregandoImagem(true);
    setRenovandoUrl(true);

    try {
      const caso = await obterCasoClinico(tarefa.caso_clinico);
      const novaUrl = resolverUrlImagem(caso?.imagem_url || '');

      if (!novaUrl) {
        setCarregandoImagem(false);
        setErroImagem(true);
        return;
      }

      setImagemUrl(novaUrl);
      setTentativa((valor) => valor + 1);
    } catch {
      setCarregandoImagem(false);
      setErroImagem(true);
    } finally {
      setRenovandoUrl(false);
    }
  }, [tarefa.caso_clinico]);

  const aoFalharImagem = () => {
    setCarregandoImagem(false);

    if (!jaRenovouRef.current && tarefa.caso_clinico) {
      jaRenovouRef.current = true;
      renovarUrl();
      return;
    }

    setErroImagem(true);
  };

  const tentarNovamente = () => {
    jaRenovouRef.current = false;
    renovarUrl();
  };

  // Se a imagem já estiver no cache (pré-carregamento), o onLoad pode disparar
  // antes do React ligar o evento. Nesse caso liberamos o spinner na montagem.
  const aoMontarImagem = (elemento) => {
    if (elemento?.complete && elemento.naturalWidth > 0) {
      setCarregandoImagem(false);
    }
  };

  const imagemPronta = Boolean(imagemUrl) && !carregandoImagem && !erroImagem;
  const aguardandoImagem = carregandoImagem || renovandoUrl;

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
            onPointerDown={imagemPronta ? aoIniciar : undefined}
            onPointerMove={imagemPronta ? aoAtualizar : undefined}
            onPointerUp={imagemPronta ? aoFinalizar : undefined}
            onPointerLeave={imagemPronta ? aoFinalizar : undefined}
            aria-busy={aguardandoImagem}
            className={`relative overflow-hidden rounded-xl border border-slate-800 bg-black ${
              imagemPronta ? 'cursor-crosshair' : 'cursor-default'
            } ${imagemPronta ? '' : 'min-h-[50vh]'}`}
          >
            {imagemUrl ? (
              <>
                <img
                  key={`${imagemUrl}-${tentativa}`}
                  ref={aoMontarImagem}
                  src={imagemUrl}
                  alt={tarefa.caso_clinico_titulo}
                  draggable="false"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setCarregandoImagem(false)}
                  onError={aoFalharImagem}
                  className={`w-full max-h-[72vh] object-contain pointer-events-none transition-opacity duration-300 ${
                    imagemPronta ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {aguardandoImagem && (
                  <div
                    role="status"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400"
                  >
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />

                    <span className="text-sm">
                      Carregando radiografia...
                    </span>
                  </div>
                )}

                {erroImagem && !aguardandoImagem && (
                  <div
                    role="alert"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-slate-300"
                  >
                    <p className="text-sm">
                      Não foi possível carregar a radiografia.
                    </p>

                    <button
                      type="button"
                      onClick={tentarNovamente}
                      disabled={renovandoUrl}
                      className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {renovandoUrl
                        ? 'Tentando novamente...'
                        : 'Tentar novamente'}
                    </button>
                  </div>
                )}
              </>
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
