import React, { useEffect, useMemo, useState, useRef } from 'react';
import LogoMarca from '../componentes/LogoMarca';
import BotaoOlhoSenha from '../componentes/BotaoOlhoSenha';
import { criarCasoClinico, criarTurma, listarCasosClinicos, listarTarefas, listarTurmas, resolverUrlImagem } from '../services/api';

export default function HomeProfessor({ usuario, aoSair }) {
  const [abaAtual, setAbaAtual] = useState('dashboard');
  const [turmas, setTurmas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [casos, setCasos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erroDados, setErroDados] = useState('');

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalAlunosAberto, setModalAlunosAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modoPerfil, setModoPerfil] = useState('perfil');
  const [confirmarSalvarPerfil, setConfirmarSalvarPerfil] = useState(false);
  const [confirmarExcluirConta, setConfirmarExcluirConta] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [dadosProfessor, setDadosProfessor] = useState({
    nomeCompleto: usuario?.nome || usuario?.nomeCompleto || 'Professor',
    email: usuario?.email || '',
    fotoUrl: null,
    novaSenha: '',
    confirmarSenha: ''
  });

  const fileInputRef = useRef(null);
  const radiografiaInputRef = useRef(null);

  const [nomeTurma, setNomeTurma] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [buscaImagem, setBuscaImagem] = useState('');
  const [fonteImagem, setFonteImagem] = useState('todos');
  const [categoriaImagem, setCategoriaImagem] = useState('todos');
  const [casoSelecionadoId, setCasoSelecionadoId] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const alunosExemplo = [
    { id: 1, nome: 'Ana Beatriz Souza', email: 'ana.souza@email.com' },
    { id: 2, nome: 'Lucas Gabriel Lima', email: 'lucas.lima@email.com' },
    { id: 3, nome: 'Matheus Oliveira', email: 'matheus.o@email.com' }
  ];

  const carregarDadosProfessor = async () => {
    setCarregandoDados(true);
    setErroDados('');

    try {
      const [turmasApi, tarefasApi, casosApi] = await Promise.all([
        listarTurmas(),
        listarTarefas(),
        listarCasosClinicos(),
      ]);

      setTurmas(turmasApi.map((turma) => ({
        ...turma,
        codigo: turma.codigo_convite || turma.codigo || '',
        disciplina: turma.disciplina || 'Radiologia Odontológica',
        qtdAlunos: turma.qtdAlunos || turma.total_alunos || 0,
        atividadesAtivas: turma.atividadesAtivas || turma.total_tarefas || 0,
        mostrarRedefinir: false,
      })));
      setTarefas(tarefasApi);
      setCasos(casosApi);
    } catch (err) {
      setErroDados(err.message || 'Não foi possível carregar os dados do professor.');
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    carregarDadosProfessor();
  }, []);

  const mapaCasos = useMemo(() => {
    return casos.reduce((mapa, caso) => {
      mapa[caso.id] = caso;
      return mapa;
    }, {});
  }, [casos]);

  const tarefasRecentes = useMemo(() => {
    return [...tarefas]
      .sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))
      .slice(0, 5);
  }, [tarefas]);

  const metricas = useMemo(() => ([
    ['Turmas Ativas', turmas.length, 'Total cadastrado na plataforma', 'T'],
    ['Tarefas Pendentes', tarefas.length, 'Aguardando acompanhamento', 'P'],
    ['Casos Cadastrados', casos.length, 'Casos disponíveis para treino', 'C'],
    ['Precisão Média', '0%', 'Será calculada pelas resoluções', '%'],
  ]), [turmas, tarefas, casos]);

  const filtrosFonte = [
    ['todos', 'Todos'],
    ['tufs', 'Tufs Database'],
    ['kaggle', 'Kaggle'],
  ];

  const filtrosCategoria = [
    ['todos', 'Todas'],
    ['dentes_retidos', 'Dentes Retidos'],
    ['implantes', 'Implantes'],
    ['patologias', 'Patologias'],
    ['panoramica_normal', 'Panorâmicas Normais'],
  ];

  const identificarFonte = (caso) => {
    const texto = `${caso.titulo || ''} ${caso.descricao || ''}`.toLowerCase();
    if (texto.includes('tufs')) return 'Tufs Database';
    if (texto.includes('kaggle')) return 'Kaggle Radiology';
    return 'Arquivo próprio';
  };

  const identificarCategoria = (caso) => {
    const texto = `${caso.titulo || ''} ${caso.descricao || ''} ${caso.regiao_anatomica || ''}`.toLowerCase();
    if (texto.includes('retido') || texto.includes('incluso')) return 'Dentes Retidos';
    if (texto.includes('implante')) return 'Implantes';
    if (texto.includes('patologia') || texto.includes('lesão') || texto.includes('lesao') || texto.includes('cárie') || texto.includes('carie')) return 'Patologias';
    return 'Panorâmica Normal';
  };

  const casosFiltrados = useMemo(() => {
    const termo = buscaImagem.trim().toLowerCase();

    return casos.filter((caso) => {
      const texto = `${caso.id || ''} ${caso.titulo || ''} ${caso.descricao || ''} ${caso.regiao_anatomica || ''}`.toLowerCase();
      const fonte = identificarFonte(caso).toLowerCase();
      const categoria = identificarCategoria(caso).toLowerCase();

      const bateBusca = !termo || texto.includes(termo);
      const bateFonte = fonteImagem === 'todos' || fonte.includes(fonteImagem);
      const categoriaNormalizada = categoria.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
      const bateCategoria = categoriaImagem === 'todos' || categoriaNormalizada === categoriaImagem;

      return bateBusca && bateFonte && bateCategoria;
    });
  }, [buscaImagem, categoriaImagem, casos, fonteImagem]);

  const primeiroNome = dadosProfessor.nomeCompleto.split(' ')[0] || 'Professor';

  const formatarData = (valor) => {
    if (!valor) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(valor));
  };

  const abrirModalPerfil = (modo) => {
    setModoPerfil(modo);
    setModalPerfilAberto(true);
    setMenuPerfilAberto(false);
  };

  const handleUploadFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const urlTemp = URL.createObjectURL(file);
      setDadosProfessor(prev => ({ ...prev, fotoUrl: urlTemp }));
    }
  };

  const handleUploadRadiografia = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnviandoImagem(true);

    try {
      const nomeArquivo = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const casoCriado = await criarCasoClinico({
        titulo: nomeArquivo || 'Radiografia enviada',
        descricao: 'Arquivo enviado pelo professor.',
        regiaoAnatomica: 'geral',
        imagem: file,
      });

      setCasos(prev => [casoCriado, ...prev]);
      setCasoSelecionadoId(casoCriado.id);
    } catch (err) {
      alert(err.message || 'Não foi possível enviar a radiografia.');
    } finally {
      setEnviandoImagem(false);
      e.target.value = '';
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

  const handleCriarTurma = async (e) => {
    e.preventDefault();
    if (!nomeTurma.trim()) return;

    try {
      const turmaCriada = await criarTurma({ nome: nomeTurma });
      const novaTurma = {
        ...turmaCriada,
        disciplina: disciplina || 'Radiologia Odontológica',
        codigo: turmaCriada.codigo_convite || turmaCriada.codigo || '',
        qtdAlunos: 0,
        atividadesAtivas: 0,
        mostrarRedefinir: false
      };

      setTurmas([novaTurma, ...turmas]);
      setNomeTurma('');
      setDisciplina('');
      setModalCriarAberto(false);
    } catch (err) {
      alert(err.message || 'Não foi possível criar a turma.');
    }
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

  const renderAba = (aba, texto) => (
    <button
      type="button"
      onClick={() => setAbaAtual(aba)}
      className={`h-full px-2 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${abaAtual === aba ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
      {texto}
    </button>
  );

  const renderFiltro = (ativo, texto, aoClicar) => (
    <button
      type="button"
      onClick={aoClicar}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${ativo ? 'bg-blue-500 text-slate-950 border-blue-300' : 'bg-[#162236] text-slate-300 border-transparent hover:bg-slate-700/70'}`}
    >
      {texto}
    </button>
  );

  const renderTabelaTarefas = (lista, mostrarTurma = false) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-700/70">
            <th className="pb-4 font-semibold">Tarefa</th>
            {mostrarTurma && <th className="pb-4 font-semibold">Turma</th>}
            <th className="pb-4 font-semibold">Data</th>
            <th className="pb-4 font-semibold">Status</th>
            {!mostrarTurma && <th className="pb-4 font-semibold text-right">Ação</th>}
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={mostrarTurma ? 4 : 4} className="py-8 text-center text-slate-400">
                Nenhuma tarefa cadastrada ainda.
              </td>
            </tr>
          ) : (
            lista.map((tarefa) => (
              <tr key={tarefa.id} className="border-b border-slate-800/90 last:border-b-0">
                <td className="py-4 font-semibold text-white">{mapaCasos[tarefa.caso_clinico]?.titulo || tarefa.instrucoes || 'Tarefa sem título'}</td>
                {mostrarTurma && <td className="py-4 text-slate-300">{turmas.find(t => t.id === tarefa.turma)?.nome || 'Turma vinculada'}</td>}
                <td className="py-4 text-blue-200">{formatarData(tarefa.criado_em)}</td>
                <td className="py-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 text-xs font-bold">Pendente</span>
                </td>
                {!mostrarTurma && (
                  <td className="py-4 text-right">
                    <button type="button" className="px-4 py-1.5 rounded-lg border border-slate-700 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer">
                      Abrir
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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

          <nav className="hidden md:flex items-center gap-7 h-full">
            {renderAba('dashboard', 'Dashboard')}
            {renderAba('tarefas', 'Tarefas')}
            {renderAba('turmas', 'Turmas')}
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
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Alterar Foto
              </button>
              <button
                onClick={() => {
                  abrirModalPerfil('perfil');
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Editar Perfil
              </button>

              <button
                onClick={() => {
                  abrirModalPerfil('senha');
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              >
                Trocar Senha
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
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUploadFoto}
            className="hidden"
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10">
        <div className="md:hidden grid grid-cols-3 gap-2 mb-6 bg-[#101726] border border-slate-800 rounded-xl p-1.5">
          {renderAba('dashboard', 'Dashboard')}
          {renderAba('tarefas', 'Tarefas')}
          {renderAba('turmas', 'Turmas')}
        </div>

        {erroDados && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {erroDados}
          </div>
        )}

        {abaAtual === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Olá, {primeiroNome}</h2>
              <p className="text-sm text-slate-400 mt-2">Aqui está o resumo das suas atividades na plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {metricas.map(([titulo, valor, detalhe, marcador]) => (
                <div key={titulo} className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 min-h-36 flex items-start justify-between">
                  <div className="space-y-6">
                    <p className="text-sm text-slate-300">{titulo}</p>
                    <div>
                      <p className="text-3xl font-black text-white">{carregandoDados ? '...' : valor}</p>
                      <p className="text-xs text-blue-300 mt-2">{detalhe}</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold">
                    {marcador}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-7">
                <h3 className="text-base font-bold text-white">Tarefas Recentes</h3>
                <button type="button" onClick={() => setAbaAtual('tarefas')} className="text-sm text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Ver todas
                </button>
              </div>
              {renderTabelaTarefas(tarefasRecentes)}
            </div>
          </div>
        )}

        {abaAtual === 'tarefas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Tarefas</h2>
              <p className="text-sm text-slate-400 mt-1">Escolha uma radiografia da biblioteca para definir o gabarito da tarefa.</p>
            </div>

            <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <input
                  type="search"
                  placeholder="Buscar por ID ou tag..."
                  value={buscaImagem}
                  onChange={(e) => setBuscaImagem(e.target.value)}
                  className="w-full lg:max-w-md px-4 py-3 bg-[#101927] border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />

                <button
                  type="button"
                  onClick={() => radiografiaInputRef.current?.click()}
                  disabled={enviandoImagem}
                  className="px-5 py-3 bg-[#0d131d] border border-slate-600/80 hover:border-blue-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {enviandoImagem ? 'Enviando arquivo...' : 'Fazer upload de arquivo próprio'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={radiografiaInputRef}
                  onChange={handleUploadRadiografia}
                  className="hidden"
                />
              </div>

              <div className="border-t border-slate-700/70 pt-4 flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300">Fonte:</span>
                  {filtrosFonte.map(([valor, texto]) => (
                    <React.Fragment key={valor}>
                      {renderFiltro(fonteImagem === valor, texto, () => setFonteImagem(valor))}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300">Categoria:</span>
                  {filtrosCategoria.map(([valor, texto]) => (
                    <React.Fragment key={valor}>
                      {renderFiltro(categoriaImagem === valor, texto, () => setCategoriaImagem(valor))}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-700/70 pt-5">
                {casosFiltrados.length === 0 ? (
                  <div className="min-h-64 flex items-center justify-center text-center text-sm text-slate-400">
                    Nenhuma radiografia encontrada com os filtros selecionados.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {casosFiltrados.map((caso) => {
                      const selecionado = casoSelecionadoId === caso.id;
                      const imagemUrl = resolverUrlImagem(caso.imagem_url || caso.imagem);

                      return (
                        <button
                          type="button"
                          key={caso.id}
                          onClick={() => setCasoSelecionadoId(caso.id)}
                          className={`group overflow-hidden rounded-2xl border text-left bg-[#0b1019] transition-all cursor-pointer ${selecionado ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-600'}`}
                        >
                          <div className="relative aspect-[16/9] bg-slate-900">
                            {imagemUrl && (
                              <img
                                src={imagemUrl}
                                alt={caso.titulo}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                                className={`w-full h-full object-cover transition-all ${selecionado ? 'opacity-45' : 'group-hover:opacity-80'}`}
                              />
                            )}
                            <div className={`${imagemUrl ? 'hidden' : ''} w-full h-full flex items-center justify-center text-slate-500 text-sm`}>
                              Imagem não carregada
                            </div>

                            {selecionado && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
                                <span className="px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-xs font-semibold">
                                  Imagem selecionada
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-white text-sm">{caso.titulo || `Caso ${String(caso.id).slice(0, 8)}`}</h3>
                              <p className="text-xs text-blue-200 mt-1">Origem: {identificarFonte(caso)}</p>
                            </div>
                            <span className="text-xs text-blue-200 whitespace-nowrap">{identificarCategoria(caso)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {abaAtual === 'turmas' && (
          turmas.length === 0 ? (
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
          )
        )}
      </main>

      {modalPerfilAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{modoPerfil === 'senha' ? 'Trocar Senha' : 'Editar Perfil'}</h3>
              <button onClick={() => setModalPerfilAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>

            <form onSubmit={handleValidarPerfil} className="space-y-4">
              <div className={`flex flex-col items-center gap-3 ${modoPerfil === 'senha' ? 'hidden' : ''}`}>
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

              <div className={modoPerfil === 'senha' ? 'hidden' : ''}>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={dadosProfessor.nomeCompleto}
                  onChange={(e) => setDadosProfessor({ ...dadosProfessor, nomeCompleto: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className={modoPerfil === 'perfil' ? 'hidden' : ''}>
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

              <div className={modoPerfil === 'perfil' ? 'hidden' : ''}>
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
