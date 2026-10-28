import { useId, useMemo, useState } from 'react';
import {
  formatarDataCurta,
  formatarNumero,
  formatarPercentual,
} from '../../utils/formatadores';

const CORES_TAXA = {
  alta: 'bg-emerald-400',
  media: 'bg-amber-400',
  baixa: 'bg-red-400',
  vazia: 'bg-slate-600',
};

function corDaTaxa(taxa, total) {
  if (!total) return CORES_TAXA.vazia;
  if (taxa >= 70) return CORES_TAXA.alta;
  if (taxa >= 50) return CORES_TAXA.media;
  return CORES_TAXA.baixa;
}

export function CartaoGrafico({ titulo, descricao, etiqueta, children }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-700/80 bg-[#111c2c] p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{titulo}</h3>
          {descricao && (
            <p className="mt-1 text-xs text-slate-400">{descricao}</p>
          )}
        </div>
        {etiqueta && (
          <span className="shrink-0 rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            {etiqueta}
          </span>
        )}
      </div>

      <div className="flex-1">{children}</div>
    </article>
  );
}

export function SemDados({ texto = 'Nenhuma resolução no período selecionado.' }) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/20 px-4 text-center text-sm text-slate-400">
      {texto}
    </div>
  );
}

export function GraficoAtividade({ serie = [] }) {
  const [indiceAtivo, setIndiceAtivo] = useState(null);
  const idGradiente = useId();

  const total = useMemo(
    () =>
      serie.reduce(
        (soma, item) => soma + (Number(item.total_resolucoes) || 0),
        0,
      ),
    [serie],
  );

  if (!serie.length || total === 0) {
    return <SemDados texto="Nenhuma atividade registrada no período." />;
  }

  const largura = 640;
  const altura = 240;
  const margem = { top: 18, right: 18, bottom: 34, left: 42 };
  const larguraPlot = largura - margem.left - margem.right;
  const alturaPlot = altura - margem.top - margem.bottom;

  const bruto = Math.max(
    ...serie.map((item) => Number(item.total_resolucoes) || 0),
    1,
  );
  const maximo = Math.ceil(bruto / 4) * 4;

  const pontos = serie.map((item, indice) => {
    const x =
      serie.length === 1
        ? margem.left + larguraPlot / 2
        : margem.left + (indice / (serie.length - 1)) * larguraPlot;
    const y =
      margem.top +
      alturaPlot -
      ((Number(item.total_resolucoes) || 0) / maximo) * alturaPlot;

    return { ...item, x, y };
  });

  const linha = pontos
    .map((ponto, indice) => `${indice === 0 ? 'M' : 'L'} ${ponto.x} ${ponto.y}`)
    .join(' ');

  const area = `${linha} L ${pontos[pontos.length - 1].x} ${
    margem.top + alturaPlot
  } L ${pontos[0].x} ${margem.top + alturaPlot} Z`;

  const passoRotulo = Math.max(1, Math.ceil(serie.length / 6));
  const indicesRotulo = new Set([0, serie.length - 1]);
  for (let indice = 0; indice < serie.length; indice += passoRotulo) {
    indicesRotulo.add(indice);
  }

  const itemAtivo =
    indiceAtivo === null ? null : serie[indiceAtivo] || null;

  return (
    <div>
      <div className="mb-2 h-5 text-xs text-slate-300">
        {itemAtivo ? (
          <span>
            <strong className="text-white">
              {formatarDataCurta(itemAtivo.periodo)}
            </strong>
            {' · '}
            {formatarNumero(itemAtivo.total_resolucoes)} resoluções
            {' · '}
            {formatarPercentual(itemAtivo.taxa_acerto)} de acerto
          </span>
        ) : (
          <span className="text-slate-500">
            Total no período: {formatarNumero(total)} resoluções
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="w-full"
        role="img"
        aria-label="Resoluções ao longo do tempo"
        onMouseLeave={() => setIndiceAtivo(null)}
      >
        <defs>
          <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((fracao) => {
          const y = margem.top + alturaPlot - fracao * alturaPlot;

          return (
            <g key={fracao}>
              <line
                x1={margem.left}
                y1={y}
                x2={largura - margem.right}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={margem.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500 text-[10px]"
              >
                {Math.round(maximo * fracao)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${idGradiente})`} />
        <path
          d={linha}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pontos.map((ponto, indice) => (
          <g key={ponto.periodo}>
            <title>
              {`${formatarDataCurta(ponto.periodo)}: ${formatarNumero(
                ponto.total_resolucoes,
              )} resoluções, ${formatarPercentual(ponto.taxa_acerto)} de acerto`}
            </title>
            <circle
              cx={ponto.x}
              cy={ponto.y}
              r="12"
              fill="transparent"
              onMouseEnter={() => setIndiceAtivo(indice)}
              onClick={() => setIndiceAtivo(indice)}
              className="cursor-pointer"
            />
            <circle
              cx={ponto.x}
              cy={ponto.y}
              r={indiceAtivo === indice ? 5 : 3.5}
              fill="#bfdbfe"
              stroke="#1d4ed8"
              strokeWidth="2"
              className="pointer-events-none transition-all"
            />
          </g>
        ))}

        {pontos.map((ponto, indice) => {
          if (!indicesRotulo.has(indice)) return null;

          return (
            <text
              key={`rotulo-${ponto.periodo}`}
              x={ponto.x}
              y={altura - 10}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {formatarDataCurta(ponto.periodo)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function GraficoDistribuicao({ acertos = 0, erros = 0 }) {
  const total = acertos + erros;
  const taxa = total ? (acertos / total) * 100 : 0;
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;

  if (!total) {
    return <SemDados texto="Sem resoluções para calcular a distribuição." />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2 sm:flex-row sm:justify-around">
      <div className="relative">
        <svg
          viewBox="0 0 140 140"
          className="h-36 w-36"
          role="img"
          aria-label={`${formatarPercentual(taxa)} de acertos`}
        >
          <circle
            cx="70"
            cy="70"
            r={raio}
            fill="none"
            stroke="#334155"
            strokeWidth="14"
          />
          <circle
            cx="70"
            cy="70"
            r={raio}
            fill="none"
            stroke="#34d399"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(taxa / 100) * circunferencia} ${circunferencia}`}
            transform="rotate(-90 70 70)"
          >
            <title>
              {`${formatarNumero(acertos)} acertos de ${formatarNumero(total)} resoluções`}
            </title>
          </circle>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {formatarPercentual(taxa)}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            acertos
          </span>
        </div>
      </div>

      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-2 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="flex-1">Corretas</span>
          <strong className="tabular-nums text-white">
            {formatarNumero(acertos)}
          </strong>
        </li>
        <li className="flex items-center gap-2 text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span className="flex-1">Incorretas</span>
          <strong className="tabular-nums text-white">
            {formatarNumero(erros)}
          </strong>
        </li>
        <li className="border-t border-slate-700/70 pt-3 text-xs text-slate-400">
          {formatarNumero(total)} resoluções no recorte
        </li>
      </ul>
    </div>
  );
}

function BarraDesempenho({ item, aoSelecionar, selecionado }) {
  const taxa = Math.max(0, Math.min(100, Number(item.taxa) || 0));
  const total = Number(item.total) || 0;

  const conteudo = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium text-slate-100">
          {item.rotulo}
        </span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-white">
          {total ? formatarPercentual(taxa) : '—'}
        </span>
      </div>

      {item.subrotulo && (
        <p className="truncate text-[11px] text-slate-400">{item.subrotulo}</p>
      )}

      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800"
        title={item.descricao}
      >
        <div
          className={`h-full rounded-full transition-all ${corDaTaxa(taxa, total)}`}
          style={{ width: `${total ? taxa : 0}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">{item.detalhe}</p>
    </>
  );

  if (!aoSelecionar) {
    return <div className="rounded-xl px-2 py-2">{conteudo}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => aoSelecionar(item.id)}
      aria-pressed={selecionado}
      title={item.descricao}
      className={`w-full rounded-xl border px-2 py-2 text-left transition-colors ${
        selecionado
          ? 'border-blue-400/60 bg-blue-500/10'
          : 'border-transparent hover:border-slate-600 hover:bg-slate-800/40'
      }`}
    >
      {conteudo}
      {selecionado && (
        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-300">
          Filtro ativo
        </span>
      )}
    </button>
  );
}

export function GraficoBarras({ itens = [], aoSelecionar, vazio }) {
  if (!itens.length) {
    return <SemDados texto={vazio} />;
  }

  return (
    <div className="space-y-1.5">
      {itens.map((item) => (
        <BarraDesempenho
          key={item.id}
          item={item}
          aoSelecionar={aoSelecionar}
          selecionado={Boolean(item.selecionado)}
        />
      ))}
    </div>
  );
}
