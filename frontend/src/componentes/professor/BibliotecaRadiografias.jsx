import { useState } from 'react';
import SeletorModelo3D from './SeletorModelo3D';

export default function BibliotecaRadiografias({
  radiografias,
  busca,
  aoBuscar,
  aoFazerUpload,
  aoCriarTarefa,
  aoExcluir,
}) {
  const [somente3D, setSomente3D] = useState(false);

  const listaRadiografias = Array.isArray(radiografias) ? radiografias : [];
  const listaExibida = somente3D
    ? listaRadiografias.filter(
        (rx) => rx.ehModelo3D || rx.tipo_midia === 'modelo_3d',
      )
    : listaRadiografias;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Biblioteca Clínica</h2>
        <p className="mt-1 text-sm text-slate-400">
          Selecione uma radiografia ou modelo 3D para criar uma tarefa.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#111c2c] p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder="Buscar por título ou região..."
          className="w-full rounded-xl border border-slate-700 bg-[#0c1320] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 sm:max-w-md"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSomente3D(false)}
            className={`rounded-xl px-4 py-3 text-xs font-bold ${
              somente3D
                ? 'bg-[#162236] text-slate-300'
                : 'bg-blue-600 text-white'
            }`}
          >
            Radiografias 2D
          </button>
          <button
            type="button"
            onClick={() => setSomente3D(true)}
            className={`rounded-xl px-4 py-3 text-xs font-bold ${
              somente3D
                ? 'bg-blue-600 text-white'
                : 'bg-[#162236] text-slate-300'
            }`}
          >
            Modelos 3D
          </button>
          <button
            onClick={aoFazerUpload}
            className="shrink-0 rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 hover:border-blue-500"
          >
            Upload de radiografia
          </button>
        </div>
      </div>

      {somente3D ? (
        <SeletorModelo3D
          modelos={listaExibida}
          aoSelecionar={aoCriarTarefa}
          aoExcluir={aoExcluir}
        />
      ) : listaExibida.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
          Nenhuma radiografia encontrada na biblioteca.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listaExibida.map((rx) => {
            const eh3D = rx.ehModelo3D || rx.tipo_midia === 'modelo_3d';

            return (
              <article
                key={rx.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111c2c]"
              >
                {eh3D ? (
                  <div className="flex h-52 flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0b1220] via-[#101d31] to-[#0b1220]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 text-lg font-black text-sky-300">
                      3D
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-slate-500">
                      Modelo GLB
                    </span>
                  </div>
                ) : rx.url ? (
                  <img
                    src={rx.url}
                    alt={rx.titulo}
                    className="h-52 w-full bg-slate-950 object-cover"
                  />
                ) : (
                  <div className="h-52 bg-slate-950" />
                )}
                <div className="p-4">
                  <p className="truncate text-sm font-bold">{rx.titulo}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {rx.regiao_anatomica ||
                      (eh3D ? 'Modelo 3D' : 'Radiografia clínica')}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => aoCriarTarefa(rx)}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold hover:bg-blue-500"
                    >
                      {eh3D ? 'Criar atividade 3D' : 'Criar tarefa'}
                    </button>
                    <button
                      onClick={() => aoExcluir(rx.id)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-red-500 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
