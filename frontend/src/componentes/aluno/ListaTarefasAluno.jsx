import TabelaVazia from '../comum/TabelaVazia';

export default function ListaTarefasAluno({
  busca,
  filtro,
  tarefas,
  aoBuscar,
  aoMudarFiltro,
  aoAbrir,
}) {
  const filtros = [
    ['todas', 'Todas'],
    ['pendentes', 'Pendentes'],
    ['concluidas', 'Concluídas'],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Tarefas
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Escolha a radiografia da tarefa que deseja resolver.
        </p>
      </div>

      <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 space-y-5">
        <input
          type="search"
          placeholder="Buscar por ID ou tag..."
          value={busca}
          onChange={(event) => aoBuscar(event.target.value)}
          className="w-full lg:max-w-md px-4 py-3 bg-[#101927] border border-slate-700/80 rounded-xl text-white text-sm"
        />

        <div className="border-t border-slate-700/70 pt-4 flex gap-2">
          <span className="text-xs text-slate-300">
            Status:
          </span>

          {filtros.map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => aoMudarFiltro(valor)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                filtro === valor
                  ? 'bg-blue-500 text-slate-950'
                  : 'bg-[#162236] text-slate-300'
              }`}
            >
              {texto}
            </button>
          ))}
        </div>

        {tarefas.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {tarefas.map((tarefa) => (
              <button
                key={tarefa.id}
                type="button"
                onClick={() => aoAbrir(tarefa)}
                className="overflow-hidden rounded-2xl border text-left bg-[#0b1019] border-slate-800 hover:border-blue-500 cursor-pointer"
              >
                <div className="p-4 flex justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {tarefa.caso_clinico_titulo || 'Tarefa sem título'}
                    </h3>

                    <p className="text-xs text-blue-200 mt-1">
                      Turma: {tarefa.turma_nome || 'Turma vinculada'}
                    </p>
                  </div>

                  <span
                    className={
                      tarefa.resolvida
                        ? 'text-emerald-300 text-xs'
                        : 'text-yellow-300 text-xs'
                    }
                  >
                    {tarefa.resolvida ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <TabelaVazia texto="Nenhuma tarefa encontrada." />
        )}
      </div>
    </div>
  );
}