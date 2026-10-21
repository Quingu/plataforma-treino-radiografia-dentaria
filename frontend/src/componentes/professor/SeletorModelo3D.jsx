export default function SeletorModelo3D({
  modelos,
  aoSelecionar,
  aoExcluir,
}) {
  const lista = Array.isArray(modelos) ? modelos : [];

  if (!lista.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
        Nenhum modelo 3D encontrado na biblioteca.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {lista.map((modelo) => (
        <article
          key={modelo.id}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111c2c]"
        >
          <div className="flex h-52 flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0b1220] via-[#101d31] to-[#0b1220]">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 text-xl font-black text-sky-300">
              3D
            </span>
            <span className="text-[11px] uppercase tracking-widest text-slate-500">
              Modelo GLB
            </span>
          </div>

          <div className="p-4">
            <p className="truncate text-sm font-bold">{modelo.titulo}</p>
            <p className="mt-1 text-xs text-slate-400">
              {modelo.regiao_anatomica || 'Modelo 3D clínico'}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => aoSelecionar(modelo)}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold hover:bg-blue-500"
              >
                Criar atividade 3D
              </button>
              <button
                type="button"
                onClick={() => aoExcluir(modelo.id)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-red-500 hover:text-red-300"
              >
                Excluir
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
