import CartaoMetrica from '../comum/CartaoMetrica';
import TabelaVazia from '../comum/TabelaVazia';
import { formatarData } from '../../utils/formatadores';

export default function DashboardProfessor({ nome, metricas, tarefasRecentes = [] }) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Olá, Prof. {nome}!</h2>
        <p className="text-slate-400 mt-1 text-sm">Aqui está o resumo geral das suas turmas e atividades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CartaoMetrica 
          titulo="Turmas Ativas" 
          valor={metricas?.totalTurmas || 0} 
          descricao="Turmas que você gerencia" 
        />
        <CartaoMetrica 
          titulo="Total de Alunos" 
          valor={metricas?.totalAlunos || 0} 
          descricao="Alunos matriculados" 
        />
        <CartaoMetrica 
          titulo="Tarefas Criadas" 
          valor={metricas?.tarefasAtivas || 0} 
          descricao="Casos clínicos ativos" 
        />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">Últimas Tarefas Criadas</h3>
        
        {tarefasRecentes.length > 0 ? (
          <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-700/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Caso Clínico</th>
                  <th className="px-6 py-4 font-semibold">Turma Destino</th>
                  <th className="px-6 py-4 font-semibold">Data de Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tarefasRecentes.map((tarefa) => (
                  <tr key={tarefa.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {tarefa.caso_clinico_titulo || `Tarefa #${tarefa.id}`}
                    </td>
                    <td className="px-6 py-4">
                      {tarefa.turma_nome || 'Turma não informada'}
                    </td>
                    <td className="px-6 py-4">
                      {formatarData(tarefa.criado_em)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl">
            <TabelaVazia texto="Você ainda não criou nenhuma tarefa recente." />
          </div>
        )}
      </div>
    </section>
  );
}