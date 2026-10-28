import CartaoMetrica from '../comum/CartaoMetrica';
import StatusMensagem from '../comum/StatusMensagem';
import TabelaVazia from '../comum/TabelaVazia';
import DashboardFiltros from './DashboardFiltros';
import {
  CartaoGrafico,
  GraficoAtividade,
  GraficoBarras,
  GraficoDistribuicao,
  SemDados,
} from './DashboardGraficos';
import {
  formatarData,
  formatarNumero,
  formatarPercentual,
} from '../../utils/formatadores';

const ROTULOS_TIPO = {
  radiografia_2d: 'Radiografia 2D',
  modelo_3d: 'Modelo 3D',
};

const ROTULOS_GRANULARIDADE = {
  dia: 'Visão diária',
  semana: 'Visão semanal',
  mes: 'Visão mensal',
};

function descreverTurma(turma) {
  return [
    `${turma.turma_nome}`,
    `${formatarPercentual(turma.taxa_acerto)} de acerto`,
    `${formatarNumero(turma.total_resolucoes)} resoluções`,
    `${turma.alunos_participantes} de ${turma.total_alunos} alunos participaram`,
  ].join(' · ');
}

function descreverTarefa(tarefa) {
  return [
    tarefa.caso_clinico_titulo,
    ROTULOS_TIPO[tarefa.tipo] || tarefa.tipo,
    `${formatarPercentual(tarefa.taxa_acerto)} de acerto`,
    `${formatarNumero(tarefa.total_resolucoes)} resoluções`,
    `${formatarNumero(tarefa.total_acertos)} acertos`,
    `${tarefa.alunos_participantes} alunos participaram`,
  ].join(' · ');
}

export default function DashboardProfessor({
  nome,
  dados,
  carregando,
  erro,
  filtros,
  intervalo,
  temFiltrosAtivos,
  limiteRecentes,
  aoAlterarLimiteRecentes,
  aoMudarFiltro,
  aoLimparFiltros,
  aoRecarregar,
}) {
  if (!dados) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Olá, Prof. {nome}!</h2>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe o desempenho das suas turmas e atividades.
          </p>
        </div>

        {erro ? (
          <div className="space-y-3">
            <StatusMensagem mensagem={{ tipo: 'erro', texto: erro }} />
            <button
              type="button"
              onClick={aoRecarregar}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-400 hover:text-white"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700/80 bg-[#111c2c] p-8 text-center text-sm text-slate-400">
            Carregando dados da dashboard...
          </div>
        )}
      </section>
    );
  }

  const metricas = dados.metricas || {};
  const atividade = dados.atividade_por_periodo || [];
  const porTurma = dados.desempenho_por_turma || [];
  const porTarefa = dados.desempenho_por_tarefa || [];
  const tarefasRecentes = dados.tarefas_recentes || [];
  const opcoes = dados.opcoes || { turmas: [], alunos: [] };
  const filtrosAplicados = dados.filtros_aplicados || {};
  const totalResolucoes = Number(metricas.total_resolucoes) || 0;
  const totalAcertos = Number(metricas.total_acertos) || 0;

  const itensTurma = porTurma.map((turma) => ({
    id: turma.turma_id,
    rotulo: turma.turma_nome,
    taxa: turma.taxa_acerto,
    total: turma.total_resolucoes,
    detalhe: `${formatarNumero(turma.total_resolucoes)} resoluções · ${turma.alunos_participantes} de ${turma.total_alunos} alunos participaram`,
    descricao: descreverTurma(turma),
    selecionado: String(filtros.turmaId) === String(turma.turma_id),
  }));

  const itensTarefa = porTarefa.map((tarefa) => ({
    id: tarefa.tarefa_id,
    rotulo: tarefa.caso_clinico_titulo,
    subrotulo: `${tarefa.turma_nome} · ${ROTULOS_TIPO[tarefa.tipo] || tarefa.tipo}`,
    taxa: tarefa.taxa_acerto,
    total: tarefa.total_resolucoes,
    detalhe: `${formatarNumero(tarefa.total_resolucoes)} resoluções · ${formatarNumero(tarefa.total_acertos)} acertos · ${tarefa.alunos_participantes} alunos`,
    descricao: descreverTarefa(tarefa),
  }));

  const aoClicarTurma = (turmaId) => {
    const jaSelecionada = String(filtros.turmaId) === String(turmaId);
    aoMudarFiltro('turmaId', jaSelecionada ? '' : String(turmaId));
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Olá, Prof. {nome}!
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Resumo consolidado das suas turmas, tarefas e respostas dos alunos.
          </p>
        </div>
      </div>

      <DashboardFiltros
        filtros={filtros}
        opcoes={opcoes}
        intervalo={intervalo}
        carregando={carregando}
        temFiltrosAtivos={temFiltrosAtivos}
        aoMudarFiltro={aoMudarFiltro}
        aoLimparFiltros={aoLimparFiltros}
        aoRecarregar={aoRecarregar}
      />

      {erro && (
        <StatusMensagem
          mensagem={{
            tipo: 'erro',
            texto: `${erro} Os números exibidos podem estar desatualizados.`,
          }}
        />
      )}

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ${
          carregando ? 'opacity-70 transition-opacity' : ''
        }`}
        aria-busy={carregando}
      >
        <CartaoMetrica
          titulo="Alunos participantes"
          valor={formatarNumero(metricas.alunos_participantes)}
          descricao={`de ${formatarNumero(metricas.total_alunos)} alunos matriculados`}
        />
        <CartaoMetrica
          titulo="Resoluções realizadas"
          valor={formatarNumero(metricas.total_resolucoes)}
          descricao="Submissões registradas no período"
        />
        <CartaoMetrica
          titulo="Taxa de acerto"
          valor={formatarPercentual(metricas.taxa_acerto)}
          descricao={`${formatarNumero(metricas.total_acertos)} resoluções corretas`}
        />
        <CartaoMetrica
          titulo="Participação"
          valor={formatarPercentual(metricas.taxa_participacao)}
          descricao="Alunos que resolveram ao menos uma tarefa"
        />
        <CartaoMetrica
          titulo="Turmas ativas"
          valor={formatarNumero(metricas.total_turmas)}
          descricao="Turmas consideradas nos filtros"
        />
        <CartaoMetrica
          titulo="Alunos matriculados"
          valor={formatarNumero(metricas.total_alunos)}
          descricao="Alunos nas turmas filtradas"
        />
        <CartaoMetrica
          titulo="Tarefas criadas"
          valor={formatarNumero(metricas.total_tarefas)}
          descricao="Tarefas criadas no período selecionado"
        />
        <CartaoMetrica
          titulo="Tarefas com respostas"
          valor={formatarNumero(metricas.total_tarefas_com_resolucao)}
          descricao="Tarefas que receberam ao menos uma resolução"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CartaoGrafico
            titulo="Atividade ao longo do tempo"
            descricao="Quantidade de resoluções registradas em cada período."
            etiqueta={
              ROTULOS_GRANULARIDADE[filtrosAplicados.granularidade] ||
              'Visão do período'
            }
          >
            <GraficoAtividade serie={atividade} />
          </CartaoGrafico>
        </div>

        <CartaoGrafico
          titulo="Distribuição de acertos"
          descricao="Proporção entre respostas corretas e incorretas."
          etiqueta="Corretas x incorretas"
        >
          <GraficoDistribuicao
            acertos={totalAcertos}
            erros={totalResolucoes - totalAcertos}
          />
        </CartaoGrafico>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CartaoGrafico
          titulo="Desempenho por turma"
          descricao="Taxa de acerto e participação. Clique em uma turma para filtrar."
          etiqueta={`${porTurma.length} turma(s)`}
        >
          {totalResolucoes === 0 ? (
            <SemDados texto="Nenhuma resolução nas turmas filtradas." />
          ) : (
            <GraficoBarras
              itens={itensTurma}
              aoSelecionar={aoClicarTurma}
              vazio="Nenhuma turma encontrada."
            />
          )}
        </CartaoGrafico>

        <CartaoGrafico
          titulo="Desempenho por tarefa"
          descricao="Atividades com mais resoluções no recorte, com acertos e participação."
          etiqueta={
            metricas.total_tarefas_com_resolucao > porTarefa.length
              ? `${porTarefa.length} de ${metricas.total_tarefas_com_resolucao}`
              : `${porTarefa.length} tarefa(s)`
          }
        >
          {totalResolucoes === 0 ? (
            <SemDados texto="Nenhuma tarefa resolvida no período." />
          ) : (
            <GraficoBarras
              itens={itensTarefa}
              vazio="Nenhuma tarefa resolvida no período."
            />
          )}
        </CartaoGrafico>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-white">
              Tarefas recentes
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Tarefas criadas no período selecionado, com o volume de respostas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Exibindo {tarefasRecentes.length} de{' '}
              {formatarNumero(metricas.total_tarefas)} tarefa(s).
            </p>
            <label htmlFor="limite-tarefas" className="sr-only">
              Quantidade de tarefas recentes
            </label>
            <select
              id="limite-tarefas"
              value={limiteRecentes}
              onChange={(evento) =>
                aoAlterarLimiteRecentes(Number(evento.target.value))
              }
              className="rounded-lg border border-slate-700 bg-[#0d131d] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
            >
              <option value={5}>5 tarefas</option>
              <option value={10}>10 tarefas</option>
              <option value={20}>20 tarefas</option>
            </select>
          </div>
        </div>

        {tarefasRecentes.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-[#111c2c] shadow-xl">
            <table className="w-full min-w-[760px] text-left text-sm text-slate-300">
              <thead className="border-b border-slate-700/80 bg-slate-800/50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Caso Clínico</th>
                  <th className="px-6 py-4 font-semibold">Turma</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Resoluções</th>
                  <th className="px-6 py-4 font-semibold">Acerto</th>
                  <th className="px-6 py-4 font-semibold">Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tarefasRecentes.map((tarefa) => (
                  <tr
                    key={tarefa.id}
                    className="transition-colors hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {tarefa.caso_clinico_titulo || `Tarefa #${tarefa.id}`}
                    </td>
                    <td className="px-6 py-4">
                      {tarefa.turma_nome || 'Turma não informada'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {ROTULOS_TIPO[tarefa.tipo] || tarefa.tipo}
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      {formatarNumero(tarefa.total_resolucoes)}
                    </td>
                    <td className="px-6 py-4 tabular-nums">
                      {tarefa.total_resolucoes
                        ? formatarPercentual(tarefa.taxa_acerto)
                        : '—'}
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
          <div className="rounded-2xl border border-slate-700/80 bg-[#111c2c]">
            <TabelaVazia texto="Nenhuma tarefa criada no período e filtros selecionados." />
          </div>
        )}
      </div>
    </section>
  );
}
