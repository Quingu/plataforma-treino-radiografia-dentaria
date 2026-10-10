import {
  calcularPercentualNivel,
  obterBandeiraClasse,
  XP_POR_NIVEL,
} from '../../utils/rankings';

export default function PainelRankingAluno({ gamificacao, carregando }) {
  if (carregando) {
    return (
      <section className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
        <p className="text-sm text-slate-400">Carregando sua evolução...</p>
      </section>
    );
  }

  if (!gamificacao) {
    return (
      <section className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
        <p className="text-sm text-slate-400">
          Não foi possível carregar sua evolução agora. Suas tarefas continuam
          disponíveis abaixo.
        </p>
      </section>
    );
  }

  const percentual = gamificacao.nivel_maximo
    ? 100
    : calcularPercentualNivel(gamificacao.progresso_nivel);

  return (
    <section className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Seu desempenho
      </p>
      <h3 className="text-xl font-bold text-white mt-1">Minha evolução</h3>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-6">
        <img
          src={obterBandeiraClasse(gamificacao.classe)}
          alt={`Bandeira da classe ${gamificacao.classe}`}
          className="w-28 h-28 object-contain shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-sm text-slate-400">
              Classe atual{' '}
              <span className="text-lg font-bold text-white">
                {gamificacao.classe}
              </span>
            </p>
            <p className="text-sm text-slate-400">
              Nível{' '}
              <span className="font-bold text-white">
                {gamificacao.nivel}
              </span>
            </p>
            {gamificacao.posicao && (
              <p className="text-sm text-slate-400">
                Posição{' '}
                <span className="font-bold text-white">
                  #{gamificacao.posicao}
                </span>
              </p>
            )}
          </div>

          <p className="mt-2 text-sm font-semibold text-blue-400">
            {gamificacao.xp_total} XP acumulado
          </p>

          {gamificacao.nivel_maximo ? (
            <p className="mt-3 text-sm text-amber-300 font-semibold">
              Nível máximo alcançado. Você é Imortal!
            </p>
          ) : (
            <div className="mt-3">
              <div
                className="h-2.5 rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(percentual)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${percentual}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {gamificacao.progresso_nivel} / {XP_POR_NIVEL} XP — faltam{' '}
                {gamificacao.xp_para_proximo_nivel} XP para o próximo nível.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
