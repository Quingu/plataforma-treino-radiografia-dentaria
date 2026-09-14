import CartaoMetrica from '../comum/CartaoMetrica';
import TabelaVazia from '../comum/TabelaVazia';
import { formatarData } from '../../utils/formatadores';

export default function DashboardAluno({
  nome,
  metricas,
  tarefasRecentes,
  aoAbrirTarefa,
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">
          Olá, {nome}
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Acompanhe seu desempenho e suas atividades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricas.map(([titulo, valor, descricao]) => (
          <CartaoMetrica
            key={titulo}
            titulo={titulo}
            valor={valor}
            descricao={descricao}
          />
        ))}
      </div>

      <section className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4">
          Tarefas recentes
        </h3>

        {tarefasRecentes.length ? (
          <div className="space-y-3">
            {tarefasRecentes.map((tarefa) => (
              <button
                key={tarefa.id}
                type="button"
                onClick={() => aoAbrirTarefa(tarefa)}
                className="w-full flex justify-between text-left border-b border-slate-800 pb-3 cursor-pointer"
              >
                <span className="text-sm text-white">
                  {tarefa.caso_clinico_titulo || 'Tarefa sem título'}

                  <small className="block text-slate-400 mt-1">
                    {formatarData(tarefa.criado_em)}
                  </small>
                </span>

                <span
                  className={
                    tarefa.resolvida
                      ? 'text-emerald-300 text-xs'
                      : 'text-yellow-300 text-xs'
                  }
                >
                  {tarefa.resolvida ? 'Concluído' : 'Pendente'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <TabelaVazia texto="Nenhuma tarefa encontrada." />
        )}
      </section>
    </div>
  );
}