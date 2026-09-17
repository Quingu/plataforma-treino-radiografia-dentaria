export default function GerenciarTurmas({
  turmas,
  busca,
  aoBuscar,
  aoCriar,
  aoEditar,
  aoCopiarCodigo,
  aoExcluir,
}) {
  const turmasFiltradas = (turmas || []).filter((turma) =>
    turma.nome.toLocaleLowerCase().includes(busca.toLocaleLowerCase())
  );

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Turmas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Crie turmas e compartilhe o código de acesso com seus alunos.
          </p>
        </div>
        <button
          onClick={aoCriar}
          className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold"
        >
          + Nova Turma
        </button>
      </div>

      <input
        value={busca}
        onChange={(evento) => aoBuscar(evento.target.value)}
        placeholder="Buscar turma..."
        className="w-full max-w-md rounded-xl border border-slate-700 bg-[#111c2c] px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {turmasFiltradas.map((turma) => (
          <article
            key={turma.id}
            className="bg-[#111c2c] p-5 rounded-2xl border border-slate-800"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-bold">{turma.nome}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {turma.total_alunos || 0} alunos
                </p>
              </div>
              <button
                onClick={() => aoEditar(turma)}
                className="h-fit text-blue-400 text-sm"
              >
                Editar
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-blue-500/60 bg-blue-500/10 px-3 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200">
                  Código da turma
                </p>
                <p className="mt-1 font-mono text-lg font-bold tracking-[0.2em] text-white">
                  {turma.codigo_convite || '—'}
                </p>
              </div>
              <button
                disabled={!turma.codigo_convite}
                onClick={() => aoCopiarCodigo(turma.codigo_convite)}
                className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold hover:border-blue-400 disabled:opacity-40"
              >
                Copiar
              </button>
            </div>

            <button
              onClick={() => aoExcluir(turma.id)}
              className="mt-4 text-xs text-slate-400 hover:text-red-300"
            >
              Excluir turma
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}