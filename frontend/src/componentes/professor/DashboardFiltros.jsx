import { formatarDataCurta } from '../../utils/formatadores';

const OPCOES_PERIODO = [
  { valor: '7', rotulo: 'Últimos 7 dias' },
  { valor: '30', rotulo: 'Últimos 30 dias' },
  { valor: '90', rotulo: 'Últimos 90 dias' },
  { valor: 'personalizado', rotulo: 'Período personalizado' },
];

const OPCOES_TIPO = [
  { valor: '', rotulo: 'Todos os tipos' },
  { valor: 'radiografia_2d', rotulo: 'Radiografia 2D' },
  { valor: 'modelo_3d', rotulo: 'Modelo 3D' },
];

const CLASSE_CAMPO =
  'w-full rounded-xl border border-slate-700 bg-[#0d131d] px-3 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-blue-500';

const CLASSE_ROTULO =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400';

export default function DashboardFiltros({
  filtros,
  opcoes,
  intervalo,
  carregando,
  temFiltrosAtivos,
  aoMudarFiltro,
  aoLimparFiltros,
  aoRecarregar,
}) {
  const turmas = opcoes?.turmas || [];
  const alunos = opcoes?.alunos || [];

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-[#111c2c] p-5 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Filtros do acompanhamento</h3>
          <p className="mt-1 text-xs text-slate-400">
            O período analisado vai de {formatarDataCurta(intervalo.dataInicio)} a{' '}
            {formatarDataCurta(intervalo.dataFim)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {carregando && (
            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-200">
              Atualizando...
            </span>
          )}
          <button
            type="button"
            onClick={aoRecarregar}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-400 hover:text-white"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="filtro-periodo" className={CLASSE_ROTULO}>
            Período
          </label>
          <select
            id="filtro-periodo"
            value={filtros.periodo}
            onChange={(evento) => aoMudarFiltro('periodo', evento.target.value)}
            className={CLASSE_CAMPO}
          >
            {OPCOES_PERIODO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-turma" className={CLASSE_ROTULO}>
            Turma
          </label>
          <select
            id="filtro-turma"
            value={filtros.turmaId}
            onChange={(evento) => aoMudarFiltro('turmaId', evento.target.value)}
            className={CLASSE_CAMPO}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-tipo" className={CLASSE_ROTULO}>
            Tipo de atividade
          </label>
          <select
            id="filtro-tipo"
            value={filtros.tipo}
            onChange={(evento) => aoMudarFiltro('tipo', evento.target.value)}
            className={CLASSE_CAMPO}
          >
            {OPCOES_TIPO.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-aluno" className={CLASSE_ROTULO}>
            Aluno
          </label>
          <select
            id="filtro-aluno"
            value={filtros.alunoId}
            onChange={(evento) => aoMudarFiltro('alunoId', evento.target.value)}
            className={CLASSE_CAMPO}
          >
            <option value="">Todos os alunos</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtros.periodo === 'personalizado' && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="filtro-data-inicio" className={CLASSE_ROTULO}>
              Data inicial
            </label>
            <input
              id="filtro-data-inicio"
              type="date"
              value={filtros.dataInicio}
              max={filtros.dataFim || undefined}
              onChange={(evento) =>
                aoMudarFiltro('dataInicio', evento.target.value)
              }
              className={CLASSE_CAMPO}
            />
          </div>

          <div>
            <label htmlFor="filtro-data-fim" className={CLASSE_ROTULO}>
              Data final
            </label>
            <input
              id="filtro-data-fim"
              type="date"
              value={filtros.dataFim}
              min={filtros.dataInicio || undefined}
              onChange={(evento) =>
                aoMudarFiltro('dataFim', evento.target.value)
              }
              className={CLASSE_CAMPO}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {filtros.turmaId && (
          <span className="rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-[11px] text-slate-200">
            Turma: {turmas.find((turma) => String(turma.id) === String(filtros.turmaId))?.nome || 'selecionada'}
          </span>
        )}
        {filtros.tipo && (
          <span className="rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-[11px] text-slate-200">
            Tipo: {filtros.tipo === 'modelo_3d' ? 'Modelo 3D' : 'Radiografia 2D'}
          </span>
        )}
        {filtros.alunoId && (
          <span className="rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-[11px] text-slate-200">
            Aluno: {alunos.find((aluno) => String(aluno.id) === String(filtros.alunoId))?.nome || 'selecionado'}
          </span>
        )}

        {temFiltrosAtivos && (
          <button
            type="button"
            onClick={aoLimparFiltros}
            className="rounded-full border border-blue-500/40 px-3 py-1 text-[11px] font-semibold text-blue-200 transition-colors hover:border-blue-400 hover:text-white"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </section>
  );
}
