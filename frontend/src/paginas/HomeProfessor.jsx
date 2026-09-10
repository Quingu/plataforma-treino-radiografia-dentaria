import React, { useState, useRef } from 'react';
import LogoMarca from '../componentes/LogoMarca';
import BotaoOlhoSenha from '../componentes/BotaoOlhoSenha';

export default function HomeProfessor({ usuario, aoSair }) {
  const [turmas, setTurmas] = useState([]);

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalAlunosAberto, setModalAlunosAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [confirmarSalvarPerfil, setConfirmarSalvarPerfil] = useState(false);
  const [confirmarExcluirConta, setConfirmarExcluirConta] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [dadosProfessor, setDadosProfessor] = useState({
    nomeCompleto: usuario?.nomeCompleto || 'Prof. Dr. Bruno Mendes',
    email: usuario?.email || 'b@umc.com.br',
    fotoUrl: null,
    novaSenha: '',
    confirmarSenha: ''
  });

  const fileInputRef = useRef(null);

  const [nomeTurma, setNomeTurma] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  // Dados temporários até ligar a listagem na API
  const alunosExemplo = [
    { id: 1, nome: 'Ana Beatriz Souza', email: 'ana.souza@email.com' },
    { id: 2, nome: 'Lucas Gabriel Lima', email: 'lucas.lima@email.com' },
    { id: 3, nome: 'Matheus Oliveira', email: 'matheus.o@email.com' }
  ];

  const handleUploadFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const urlTemp = URL.createObjectURL(file);
      setDadosProfessor(prev => ({ ...prev, fotoUrl: urlTemp }));
    }
  };

  const handleValidarPerfil = (e) => {
    e.preventDefault();
    if (dadosProfessor.novaSenha && dadosProfessor.novaSenha !== dadosProfessor.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    setConfirmarSalvarPerfil(true);
  };

  const handleConfirmarSalvarPerfil = () => {
    setConfirmarSalvarPerfil(false);
    setModalPerfilAberto(false);
    setDadosProfessor(prev => ({ ...prev, novaSenha: '', confirmarSenha: '' }));
  };

  const handleConfirmarExclusaoConta = () => {
    setConfirmarExcluirConta(false);
    setModalPerfilAberto(false);
    if (aoSair) aoSair();
  };

  const handleCopiar = (id, codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleGerarNovoCodigo = (id) => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const novoCodigo = `${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}-${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}`;

    setTurmas(turmas.map(t => t.id === id ? { ...t, codigo: novoCodigo, mostrarRedefinir: false } : t));
  };

  const handleCriarTurma = (e) => {
    e.preventDefault();
    if (!nomeTurma.trim()) return;

    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const codigoAcesso = `${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}${letras[Math.floor(Math.random()*26)]}-${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}${nums[Math.floor(Math.random()*10)]}${letras[Math.floor(Math.random()*26)]}`;

    const novaTurma = {
      id: Date.now(),
      nome: nomeTurma,
      disciplina: disciplina || 'Radiologia Odontológica',
      codigo: codigoAcesso,
      qtdAlunos: 0,
      atividadesAtivas: 0,
      mostrarRedefinir: false
    };

    setTurmas([...turmas, novaTurma]);
    setNomeTurma('');
    setDisciplina('');
    setModalCriarAberto(false);
  };

  const abrirEditar = (turma) => {
    setTurmaSelecionada(turma);
    setNomeTurma(turma.nome);
    setDisciplina(turma.disciplina);
    setModalEditarAberto(true);
    setMenuAbertoId(null);
  };

  const handleSalvarEdicao = (e) => {
    e.preventDefault();
    if (!nomeTurma.trim() || !turmaSelecionada) return;

    setTurmas(turmas.map(t => t.id === turmaSelecionada.id ? { ...t, nome: nomeTurma, disciplina } : t));
    setModalEditarAberto(false);
    setTurmaSelecionada(null);
    setNomeTurma('');
    setDisciplina('');
  };

  const toggleAlertaRedefinir = (id) => {
    setTurmas(turmas.map(t => t.id === id ? { ...t, mostrarRedefinir: !t.mostrarRedefinir } : t));
    setMenuAbertoId(null);
  };

  const abrirExcluir = (turma) => {
    setTurmaSelecionada(turma);
    setModalExcluirAberto(true);
    setMenuAbertoId(null);
  };

  const handleConfirmarExclusao = () => {
    if (turmaSelecionada) {
      setTurmas(turmas.filter(t => t.id !== turmaSelecionada.id));
      setModalExcluirAberto(false);
      setTurmaSelecionada(null);
    }
  };

  const abrirVerAlunos = (turma) => {
    setTurmaSelecionada(turma);
    setModalAlunosAberto(true);
    setMenuAbertoId(null);
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col font-sans select-none">
      
      <header className="bg-[#101726] border-b border-slate-800/80 px-8 py-4 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <LogoMarca tamanho="sm" />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">RadioDent</h1>
              <p className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase mt-0.5">Treino Radiográfico</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button className="text-slate-400 hover:text-white transition-colors">Dashboard</button>
            <button className="text-blue-400 font-semibold border-b-2 border-blue-500 pb-1">Minhas Turmas</button>
            <button className="text-slate-400 hover:text-white transition-colors">Tarefas</button>
          </nav>
        </div>

        <div className="relative">
          <button 
            onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{dadosProfessor.nomeCompleto}</p>
              <p className="text-xs text-slate-400">Professor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-blue-500/40 flex items-center justify-center text-slate-300 font-bold overflow-hidden relative select-none">
              {dadosProfessor.fotoUrl ? (
                <img src={dadosProfessor.fotoUrl} alt="Foto do Professor" draggable="false" className="w-full h-full object-cover pointer-events-none" />
              ) : (
                <span>{dadosProfessor.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
              )}
            </div>
          </button>

          {menuPerfilAberto && (
            <div className="absolute right-0 mt-2 w-52 bg-[#121b2b] border border-slate-700/80 rounded-xl shadow-2xl z-40 py-2 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-semibold text-white truncate">{dadosProfessor.nomeCompleto}</p>
                <p className="text-[10px] text-slate-400 truncate">{dadosProfessor.email}</p>
              </div>
              <button
                onClick={() => {
                  setModalPerfilAberto(true);
                  setMenuPerfilAberto(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Editar Perfil
              </button>

              <button
                onClick={() => {
                  setConfirmarExcluirConta(true);
                  setMenuPerfilAberto(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
              >
                Excluir Conta
              </button>

              <div className="border-t border-slate-800 my-1"></div>

              <button
                onClick={aoSair}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10">
        
        {turmas.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-[#141d2b] border border-slate-800 rounded-2xl p-12 max-w-lg w-full flex flex-col items-center text-center shadow-2xl">
              <div className="w-20 h-20 bg-[#0c1320] border border-slate-800 rounded-full flex items-center justify-center mb-6 text-blue-400 text-3xl font-bold">
                +
              </div>
              <h2 className="text-2xl font-bold text-white mb-6">Crie uma turma</h2>
              <button
                onClick={() => setModalCriarAberto(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <span className="text-lg leading-none">+</span>
                <span>Nova Turma</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Minhas Turmas</h2>
                <p className="text-sm text-slate-400 mt-1">Gerencie seus grupos de alunos e códigos de acesso</p>
              </div>
              <button
                onClick={() => setModalCriarAberto(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <span className="text-lg leading-none">+</span>
                <span>Nova Turma</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((item) => (
                <div key={item.id} className="bg-[#141d2b] border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl relative">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-bold text-white leading-snug">{item.nome}</h3>
                      <div className="relative">
                        <button 
                          onClick={() => setMenuAbertoId(menuAbertoId === item.id ? null : item.id)}
                          className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/40"
                          title="Opções da turma"
                        >
                          ...
                        </button>

                        {menuAbertoId === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-[#0e1622] border border-slate-700 rounded-xl shadow-2xl z-20 py-2 text-xs">
                            <button onClick={() => abrirEditar(item)} className="w-full px-4 py-2 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">Editar Turma</button>
                            <button onClick={() => abrirVerAlunos(item)} className="w-full px-4 py-2 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">Ver Alunos</button>
                            <button onClick={() => toggleAlertaRedefinir(item.id)} className="w-full px-4 py-2 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">{item.mostrarRedefinir ? 'Ocultar Alerta' : 'Alerta de Redefinição'}</button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button onClick={() => abrirExcluir(item)} className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer">Excluir Turma</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-5">
                      <span>{item.qtdAlunos} alunos</span>
                      <span>{item.atividadesAtivas} tarefas ativas</span>
                    </div>

                    <div className="bg-[#0b1019] border border-slate-800/90 rounded-xl p-4 text-center mb-4">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">CÓDIGO DE ACESSO</span>
                      <span className="text-2xl font-mono font-bold text-blue-400 tracking-wider">{item.codigo}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <button
                      onClick={() => handleCopiar(item.id, item.codigo)}
                      className="w-full py-2.5 bg-[#1a2536] hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer border border-slate-700/50"
                    >
                      {copiadoId === item.id ? <span className="text-emerald-400 font-bold">Código Copiado!</span> : <span>Copiar Código</span>}
                    </button>

                    {item.mostrarRedefinir && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-left space-y-2">
                        <div className="text-red-400 font-semibold text-xs">Redefinir Código</div>
                        <p className="text-[11px] text-slate-400 leading-tight">Use caso o código tenha vazado. O código anterior será invalidado imediatamente.</p>
                        <button onClick={() => handleGerarNovoCodigo(item.id)} className="w-full py-2 bg-red-500/90 hover:bg-red-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer">Gerar Novo Código</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {modalPerfilAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Editar Perfil</h3>
              <button onClick={() => setModalPerfilAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>

            <form onSubmit={handleValidarPerfil} className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-blue-500/50 flex items-center justify-center overflow-hidden relative select-none">
                  {dadosProfessor.fotoUrl ? (
                    <img src={dadosProfessor.fotoUrl} alt="Preview" draggable="false" className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <span className="text-xl font-bold text-slate-300">
                      {dadosProfessor.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleUploadFoto} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
                >
                  Alterar Foto
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={dadosProfessor.nomeCompleto}
                  onChange={(e) => setDadosProfessor({ ...dadosProfessor, nomeCompleto: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nova Senha</label>
                <div className="relative flex items-center">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Deixe em branco para manter a atual"
                    value={dadosProfessor.novaSenha}
                    onChange={(e) => setDadosProfessor({ ...dadosProfessor, novaSenha: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <BotaoOlhoSenha
                    visivel={mostrarSenha}
                    aoAlternar={() => setMostrarSenha(!mostrarSenha)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirmar Nova Senha</label>
                <div className="relative flex items-center">
                  <input
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={dadosProfessor.confirmarSenha}
                    onChange={(e) => setDadosProfessor({ ...dadosProfessor, confirmarSenha: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <BotaoOlhoSenha
                    visivel={mostrarConfirmarSenha}
                    aoAlternar={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalPerfilAberto(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Salvar Alterações</button>
              </div>
            </form>

            {confirmarSalvarPerfil && (
              <div className="absolute inset-0 bg-[#121b2b]/95 backdrop-blur-xs rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4 z-10">
                <h4 className="text-base font-bold text-white">Confirmar Alteração</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deseja realmente confirmar as alterações dos dados do seu perfil?
                </p>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmarSalvarPerfil(false)}
                    className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarSalvarPerfil}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Sim
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmarExcluirConta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-red-400">Excluir Conta</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza de que deseja excluir sua conta permanentemente? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setConfirmarExcluirConta(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Não
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusaoConta}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {modalCriarAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Nova Turma</h3>
              <button onClick={() => setModalCriarAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>
            <form onSubmit={handleCriarTurma} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome da Turma</label>
                <input type="text" required placeholder="Ex: Anatomia Dental & Imaginologia - 3º Sem" value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Disciplina / Módulo</label>
                <input type="text" placeholder="Ex: Radiologia II" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalCriarAberto(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Salvar Turma</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEditarAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Editar Turma</h3>
              <button onClick={() => setModalEditarAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome da Turma</label>
                <input type="text" required value={nomeTurma} onChange={(e) => setNomeTurma(e.target.value)} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Disciplina / Módulo</label>
                <input type="text" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalEditarAberto(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Atualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExcluirAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Excluir Turma</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tem certeza de que deseja excluir a turma <strong className="text-slate-200">{turmaSelecionada?.nome}</strong>? Esta ação não poderá ser desfeita.
            </p>
            <div className="pt-3 flex gap-3">
              <button type="button" onClick={() => setModalExcluirAberto(false)} className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
              <button type="button" onClick={handleConfirmarExclusao} className="w-1/2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {modalAlunosAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Alunos da Turma</h3>
                <p className="text-xs text-slate-400 mt-0.5">{turmaSelecionada?.nome}</p>
              </div>
              <button onClick={() => setModalAlunosAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {alunosExemplo.map((aluno) => (
                <div key={aluno.id} className="bg-[#0c1320] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{aluno.nome}</p>
                    <p className="text-[11px] text-slate-400">{aluno.email}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Ativo</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button type="button" onClick={() => setModalAlunosAberto(false)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
