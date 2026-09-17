export default function BibliotecaRadiografias({
  radiografias,
  busca,
  aoBuscar,
  aoFazerUpload,
  aoCriarTarefa,
  aoExcluir,
}) {
  const listaRadiografias = Array.isArray(radiografias) ? radiografias : [];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Biblioteca Clínica</h2>
        <p className="mt-1 text-sm text-slate-400">
          Selecione uma radiografia para criar uma tarefa para suas turmas.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#111c2c] p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder="Buscar por título ou região..."
          className="w-full rounded-xl border border-slate-700 bg-[#0c1320] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 sm:max-w-md"
        />
        <button
          onClick={aoFazerUpload}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold hover:bg-blue-500"
        >
          Fazer upload de radiografia
        </button>
      </div>

      {listaRadiografias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
          Nenhuma radiografia encontrada na biblioteca.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listaRadiografias.map((rx) => (
            <article
              key={rx.id}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111c2c]"
            >
              {rx.url ? (
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
                  {rx.regiao_anatomica || 'Radiografia clínica'}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => aoCriarTarefa(rx)}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold hover:bg-blue-500"
                  >
                    Criar tarefa
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
          ))}
        </div>
      )}
    </section>
  );
}