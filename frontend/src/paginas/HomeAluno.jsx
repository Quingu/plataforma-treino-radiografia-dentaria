import React from 'react';
import LogoMarca from '../componentes/LogoMarca';

export default function HomeAluno({ usuario, aoSair }) {
  const nomeAluno = usuario?.nome || usuario?.nomeCompleto || 'Aluno';
  const iniciais = nomeAluno
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col font-sans">
      <header className="bg-[#101726] border-b border-slate-800/80 px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMarca tamanho="sm" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">RadioDent</h1>
            <p className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase mt-0.5">Área do Aluno</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{nomeAluno}</p>
            <p className="text-xs text-slate-400">Aluno</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-blue-500/40 flex items-center justify-center text-slate-300 font-bold">
            {iniciais || 'AL'}
          </div>
          <button
            type="button"
            onClick={aoSair}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 lg:px-8 py-8">
        <section className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Painel do aluno</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Bem-vindo, {nomeAluno}</h2>
            <p className="text-slate-400 max-w-2xl">
              Suas turmas, tarefas e simulações radiográficas vão aparecer por aqui conforme forem liberadas pelos professores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="bg-[#121b2b] border border-slate-800 rounded-lg p-5">
              <p className="text-sm text-slate-400">Turmas vinculadas</p>
              <strong className="text-3xl text-white mt-3 block">0</strong>
            </article>
            <article className="bg-[#121b2b] border border-slate-800 rounded-lg p-5">
              <p className="text-sm text-slate-400">Tarefas pendentes</p>
              <strong className="text-3xl text-white mt-3 block">0</strong>
            </article>
            <article className="bg-[#121b2b] border border-slate-800 rounded-lg p-5">
              <p className="text-sm text-slate-400">Simulações concluídas</p>
              <strong className="text-3xl text-white mt-3 block">0</strong>
            </article>
          </div>

          <div className="bg-[#121b2b] border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-2">Próximas atividades</h3>
            <p className="text-sm text-slate-400">
              Nenhuma atividade foi encontrada para este aluno no momento.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
