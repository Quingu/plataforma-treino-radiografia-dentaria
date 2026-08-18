import React, { useState } from 'react';

export default function MinhasTurmas() {
  const [alertaCopiado, setAlertaCopiado] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [modalRedefinir, setModalRedefinir] = useState(null);

  const [turmas, setTurmas] = useState([
    {
      id: 1,
      nome: 'Radiologia Odontológica - 4º Semestre',
      alunos: 32,
      tarefas: 5,
      codigo: 'RAD-7X9P'
    },
    {
      id: 2,
      nome: 'Anatomia Dental & Imaginologia - 3º Sem',
      alunos: 28,
      tarefas: 3,
      codigo: 'ANA-3Y2K'
    },
    {
      id: 3,
      nome: 'Patologia Bucomaxilofacial - 5º Sem',
      alunos: 0,
      tarefas: 0,
      codigo: 'PAT-9M4L'
    }
  ]);

  // Copiar Código e mostrar notificação flutuante
  const handleCopiar = (turma) => {
    navigator.clipboard.writeText(turma.codigo);
    setAlertaCopiado(`Código ${turma.codigo} da turma "${turma.nome}" copiado!`);
    setTimeout(() => setAlertaCopiado(null), 3000);
  };

  // Gerar um código novo
  const handleGerarNovoCodigo = (id) => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const novoCodigo = `${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}-${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}`;

    setTurmas(turmas.map(t => t.id === id ? { ...t, codigo: novoCodigo } : t));
    setModalRedefinir(null);
    setMenuAbertoId(null);
  };

  const totalAlunos = turmas.reduce((acc, t) => acc + t.alunos, 0);
  const totalTarefas = turmas.reduce((acc, t) => acc + t.tarefas, 0);

  return (
    <div className="min-h-screen bg-[#0d131d] text-white p-6 lg:p-10 font-sans relative">
      
      {/* Toast Notificação de Código Copiado */}
      {alertaCopiado && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">✓</span>
          <span>{alertaCopiado}</span>
        </div>
      )}

      {/* Topo / Header */}
      <header className="flex items-center justify-between pb-8 border-b border-slate-800/80 mb-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center font-black text-blue-500 text-lg">
              RD
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-500 tracking-tight leading-none">RadioDent</h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Painel do Professor</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button className="text-slate-400 hover:text-white transition-colors">Dashboard</button>
            <button className="text-blue-400 font-semibold border-b-2 border-blue-500 pb-1">Minhas Turmas</button>
            <button className="text-slate-400 hover:text-white transition-colors">Tarefas & Exames</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">Prof. Dr. Carlos Mendes</p>
            <p className="text-xs text-slate-400">Radiologia Odontológica</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-bold text-blue-400 text-sm">
            CM
          </div>
        </div>
      </header>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#141d2b] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg text-xl font-bold">🏫</div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total de Turmas</p>
            <p className="text-xl font-bold text-white">{turmas.length}</p>
          </div>
        </div>
        <div className="bg-[#141d2b] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-xl font-bold">👥</div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Alunos Matriculados</p>
            <p className="text-xl font-bold text-white">{totalAlunos}</p>
          </div>
        </div>
        <div className="bg-[#141d2b] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg text-xl font-bold">📋</div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tarefas em Andamento</p>
            <p className="text-xl font-bold text-white">{totalTarefas}</p>
          </div>
        </div>
      </div>

      {/* Titulo + Botão Criar Turma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Minhas Turmas</h2>
          <p className="text-sm text-slate-400">Gerencie o acesso dos alunos e acompanhe as atividades</p>
        </div>

        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer">
          <span className="text-lg leading-none">+</span> Nova Turma
        </button>
      </div>

      {/* Grid das Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.map((turma) => (
          <div key={turma.id} className="bg-[#141d2b] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl relative">
            
            <div>
              {/* Header do Card + Menu de Opções */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-white leading-snug">{turma.nome}</h3>
                
                <div className="relative">
                  <button 
                    onClick={() => setMenuAbertoId(menuAbertoId === turma.id ? null : turma.id)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    ⚙️
                  </button>

                  {/* Menu Pop-over de Opções */}
                  {menuAbertoId === turma.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1c283a] border border-slate-700 rounded-xl shadow-2xl z-20 py-1 text-xs">
                      <button 
                        onClick={() => { setModalRedefinir(turma.id); setMenuAbertoId(null); }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 font-semibold flex items-center gap-2"
                      >
                        ⚠️ Redefinir Código
                      </button>
                      <button 
                        onClick={() => alert(`Editar ${turma.nome}`)}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700/50 flex items-center gap-2"
                      >
                        ✏️ Editar Turma
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações da Turma */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                <span className="flex items-center gap-1.5">
                  👤 {turma.alunos} Alunos
                </span>
                <span className="flex items-center gap-1.5">
                  📝 {turma.tarefas} Tarefas
                </span>
              </div>

              {/* Bloco de Código de Acesso Interativo */}
              <div 
                onClick={() => handleCopiar(turma)}
                className="bg-[#0b1019] border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer transition-all group mb-4"
              >
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">
                  Código de Acesso (Clique p/ copiar)
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold text-blue-400 tracking-wider group-hover:scale-105 transition-transform">
                    {turma.codigo}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400">📋</span>
                </div>
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => alert(`Entrando na turma: ${turma.nome}`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/10"
              >
                Entrar na Turma →
              </button>
              
              <button
                onClick={() => handleCopiar(turma)}
                className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-all cursor-pointer border border-slate-700/40"
              >
                Copiar Código
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Modal para confirmar geração de novo código */}
      {modalRedefinir && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141d2b] border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center text-xl mx-auto font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-white">Gerar novo código?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O código atual deixará de funcionar imediatamente. Novos alunos precisarão do novo código para entrar.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalRedefinir(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleGerarNovoCodigo(modalRedefinir)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Confirmar e Gerar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}