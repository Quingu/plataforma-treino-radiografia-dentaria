import React, { useEffect, useMemo, useRef, useState } from 'react';
import LogoMarca from '../componentes/LogoMarca';
import { atualizarPerfil, entrarTurmaComCodigo, listarTarefas, listarTurmas, resolverTarefa, resolverUrlImagem, salvarUsuario } from '../services/api';

export default function HomeAluno({ usuario, aoSair }) {
  const [abaAtual, setAbaAtual] = useState('dashboard');
  const [turmas, setTurmas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erroDados, setErroDados] = useState('');
  const [modalEntrarTurma, setModalEntrarTurma] = useState(false);
  const [codigoTurma, setCodigoTurma] = useState('');
  const [entrandoTurma, setEntrandoTurma] = useState(false);
  const [mensagemTurma, setMensagemTurma] = useState('');
  const [buscaTarefa, setBuscaTarefa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [tarefaAberta, setTarefaAberta] = useState(null);
  const [marcacao, setMarcacao] = useState(null);
  const [desenhoInicio, setDesenhoInicio] = useState(null);
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [confirmarEnviarResposta, setConfirmarEnviarResposta] = useState(false);
  const [mensagemResposta, setMensagemResposta] = useState({ tipo: '', texto: '' });
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modoPerfil, setModoPerfil] = useState('perfil');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [mensagemPerfil, setMensagemPerfil] = useState({ tipo: '', texto: '' });
  const [confirmarSalvarPerfil, setConfirmarSalvarPerfil] = useState(false);
  const [confirmarSair, setConfirmarSair] = useState(false);
  const [dadosAluno, setDadosAluno] = useState({
    nome: usuario?.nome || usuario?.nomeCompleto || 'Aluno',
    email: usuario?.email || '',
    fotoUrl: usuario?.foto_perfil_url || usuario?.fotoUrl || '',
    novaSenha: '',
    confirmarSenha: '',
    fotoArquivo: null,
  });
  const imagemRespostaRef = useRef(null);
  const fotoInputRef = useRef(null);

  const nomeAluno = dadosAluno.nome || 'Aluno';
  const primeiroNome = nomeAluno.split(' ')[0] || 'Aluno';
  const iniciais = nomeAluno
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Carrega turmas e tarefas que aparecem no dashboard do aluno.
  const carregarDadosAluno = async () => {
    setCarregandoDados(true);
    setErroDados('');

    try {
      const [turmasApi, tarefasApi] = await Promise.all([listarTurmas(), listarTarefas()]);

      setTurmas(turmasApi.map((turma) => ({
        ...turma,
        codigo: turma.codigo_convite || turma.codigo || '',
        qtdAlunos: turma.total_alunos || 0,
        atividadesAtivas: turma.total_tarefas || 0,
      })));
      setTarefas(tarefasApi);
    } catch (err) {
      setErroDados(err.message || 'Não foi possível carregar seus dados.');
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    carregarDadosAluno();
  }, []);

  const tarefasPendentes = useMemo(() => tarefas.filter((tarefa) => !tarefa.resolvida), [tarefas]);
  const tarefasConcluidas = useMemo(() => tarefas.filter((tarefa) => tarefa.resolvida), [tarefas]);

  const precisaoMedia = useMemo(() => {
    const resolvidas = tarefas.filter((tarefa) => typeof tarefa.acertou === 'boolean');
    if (!resolvidas.length) return '0%';
    const acertos = resolvidas.filter((tarefa) => tarefa.acertou).length;
    return `${Math.round((acertos / resolvidas.length) * 100)}%`;
  }, [tarefas]);

  const tarefasRecentes = useMemo(() => (
    [...tarefas]
      .sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))
      .slice(0, 5)
  ), [tarefas]);

  const tarefasFiltradas = useMemo(() => {
    const termo = buscaTarefa.trim().toLowerCase();

    return tarefas.filter((tarefa) => {
      const texto = `${tarefa.id || ''} ${tarefa.caso_clinico_titulo || ''} ${tarefa.turma_nome || ''} ${tarefa.instrucoes || ''}`.toLowerCase();
      const bateBusca = !termo || texto.includes(termo);
      const bateStatus = filtroStatus === 'todas' || (filtroStatus === 'pendentes' && !tarefa.resolvida) || (filtroStatus === 'concluidas' && tarefa.resolvida);
      return bateBusca && bateStatus;
    });
  }, [buscaTarefa, filtroStatus, tarefas]);

  const metricas = [
    ['Turmas Ativas', turmas.length, 'Turmas em que você está matriculado'],
    ['Tarefas Pendentes', tarefasPendentes.length, 'Aguardando sua resolução'],
    ['Tarefas Concluídas', tarefasConcluidas.length, 'Atividades já enviadas'],
    ['Precisão Média', precisaoMedia, 'Será calculada pelas resoluções'],
  ];

  const formatarData = (valor) => {
    if (!valor) return 'Sem data';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(valor));
  };

  const formatarCodigoTurma = (codigo = '') => codigo.split('').join(' ');

  const renderAba = (valor, texto) => (
    <button
      type="button"
      onClick={() => setAbaAtual(valor)}
      className={`px-4 py-5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${abaAtual === valor ? 'text-white border-blue-500' : 'text-slate-400 border-transparent hover:text-white'}`}
    >
      {texto}
    </button>
  );

  const renderFiltro = (valor, texto) => (
    <button
      type="button"
      onClick={() => setFiltroStatus(valor)}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${filtroStatus === valor ? 'bg-blue-500 text-slate-950 border-blue-300' : 'bg-[#162236] text-slate-300 border-transparent hover:bg-slate-700/70'}`}
    >
      {texto}
    </button>
  );

  const abrirModalEntrarTurma = () => {
    setCodigoTurma('');
    setMensagemTurma('');
    setModalEntrarTurma(true);
  };

  // Entrada na turma pelo código recebido do professor.
  const handleEntrarTurma = async (e) => {
    e.preventDefault();
    const codigo = codigoTurma.trim().toUpperCase();
    if (!codigo) return;

    setEntrandoTurma(true);
    setMensagemTurma('');

    try {
      const turma = await entrarTurmaComCodigo(codigo);
      setTurmas((prev) => {
        const jaExiste = prev.some((item) => item.id === turma.id);
        if (jaExiste) return prev;
        return [{
          ...turma,
          codigo: turma.codigo_convite || turma.codigo || '',
          qtdAlunos: turma.total_alunos || 0,
          atividadesAtivas: turma.total_tarefas || 0,
        }, ...prev];
      });
      setCodigoTurma('');
      setModalEntrarTurma(false);
      const tarefasAtualizadas = await listarTarefas();
      setTarefas(tarefasAtualizadas);
    } catch (err) {
      setMensagemTurma(err.message || 'Não foi possível entrar na turma.');
    } finally {
      setEntrandoTurma(false);
    }
  };

  const abrirTarefa = (tarefa) => {
    setTarefaAberta(tarefa);
    setMarcacao(null);
    setDesenhoInicio(null);
    setMensagemResposta({ tipo: '', texto: '' });
  };

  const voltarTarefas = () => {
    setTarefaAberta(null);
    setMarcacao(null);
    setDesenhoInicio(null);
    setConfirmarEnviarResposta(false);
    setMensagemResposta({ tipo: '', texto: '' });
  };

  // Converte o clique na radiografia para porcentagem da imagem.
  const pegarPontoDaImagem = (e) => {
    const rect = imagemRespostaRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  };

  const iniciarDesenho = (e) => {
    const ponto = pegarPontoDaImagem(e);
    if (!ponto) return;
    setDesenhoInicio(ponto);
    setMarcacao({ x: ponto.x, y: ponto.y, width: 0, height: 0 });
  };

  const atualizarDesenho = (e) => {
    if (!desenhoInicio) return;
    const ponto = pegarPontoDaImagem(e);
    if (!ponto) return;

    setMarcacao({
      x: Math.min(desenhoInicio.x, ponto.x),
      y: Math.min(desenhoInicio.y, ponto.y),
      width: Math.abs(ponto.x - desenhoInicio.x),
      height: Math.abs(ponto.y - desenhoInicio.y),
    });
  };

  const finalizarDesenho = () => setDesenhoInicio(null);

  const limparMarcacao = () => {
    setMarcacao(null);
    setDesenhoInicio(null);
  };

  // Antes de enviar, pede confirmação porque a resposta fica registrada.
  const solicitarEnviarResposta = () => {
    if (!tarefaAberta || !marcacao?.width || !marcacao?.height || tarefaAberta.resolvida) return;
    setMensagemResposta({ tipo: '', texto: '' });
    setConfirmarEnviarResposta(true);
  };

  const handleEnviarResposta = async () => {
    if (!tarefaAberta || !marcacao?.width || !marcacao?.height) return;

    setConfirmarEnviarResposta(false);
    setEnviandoResposta(true);

    try {
      const resposta = await resolverTarefa(tarefaAberta.id, {
        x: Number(marcacao.x.toFixed(2)),
        y: Number(marcacao.y.toFixed(2)),
        width: Number(marcacao.width.toFixed(2)),
        height: Number(marcacao.height.toFixed(2)),
      });

      const tarefaAtualizada = { ...tarefaAberta, resolvida: true, acertou: resposta.acertou };
      setTarefaAberta(tarefaAtualizada);
      setTarefas((prev) => prev.map((tarefa) => (
        tarefa.id === tarefaAberta.id ? tarefaAtualizada : tarefa
      )));
      setMensagemResposta({
        tipo: resposta.acertou ? 'sucesso' : 'aviso',
        texto: resposta.acertou ? 'Resposta enviada. Você acertou a marcação.' : 'Resposta enviada. Revise esse conteúdo depois.',
      });
      setAbaAtual('dashboard');
    } catch (err) {
      setMensagemResposta({ tipo: 'erro', texto: err.message || 'Não foi possível enviar sua resposta.' });
    } finally {
      setEnviandoResposta(false);
    }
  };

  const abrirModalPerfil = (modo) => {
    setModoPerfil(modo);
    setMensagemPerfil({ tipo: '', texto: '' });
    setMenuPerfilAberto(false);
    setModalPerfilAberto(true);
  };

  const handleEscolherFoto = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setDadosAluno((prev) => ({
      ...prev,
      fotoArquivo: arquivo,
      fotoUrl: URL.createObjectURL(arquivo),
    }));
    abrirModalPerfil('perfil');
  };

  const solicitarSalvarPerfil = (e) => {
    e.preventDefault();

    if (modoPerfil === 'senha' && dadosAluno.novaSenha !== dadosAluno.confirmarSenha) {
      setMensagemPerfil({ tipo: 'erro', texto: 'As senhas não conferem.' });
      return;
    }

    setMensagemPerfil({ tipo: '', texto: '' });
    setConfirmarSalvarPerfil(true);
  };

  // Salva alterações do perfil e atualiza o usuário guardado no navegador.
  const handleSalvarPerfil = async () => {
    setConfirmarSalvarPerfil(false);
    setSalvandoPerfil(true);

    try {
      const perfilAtualizado = await atualizarPerfil({
        nome: dadosAluno.nome,
        novaPassword: modoPerfil === 'senha' ? dadosAluno.novaSenha : '',
        fotoPerfil: dadosAluno.fotoArquivo,
      });

      const usuarioAtualizado = {
        ...usuario,
        nome: perfilAtualizado.nome,
        email: perfilAtualizado.email,
        perfil: perfilAtualizado.perfil,
        foto_perfil_url: perfilAtualizado.foto_perfil_url,
      };

      salvarUsuario(usuarioAtualizado);
      setDadosAluno((prev) => ({
        ...prev,
        nome: perfilAtualizado.nome || prev.nome,
        email: perfilAtualizado.email || prev.email,
        fotoUrl: perfilAtualizado.foto_perfil_url || prev.fotoUrl,
        novaSenha: '',
        confirmarSenha: '',
        fotoArquivo: null,
      }));
      setMensagemPerfil({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso.' });
    } catch (err) {
      setMensagemPerfil({ tipo: 'erro', texto: err.message || 'Não foi possível atualizar o perfil.' });
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const renderTabelaTarefas = (lista) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-700/70">
            <th className="pb-4 font-semibold">Tarefa</th>
            <th className="pb-4 font-semibold">Data</th>
            <th className="pb-4 font-semibold">Status</th>
            <th className="pb-4 font-semibold text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400">Nenhuma tarefa encontrada.</td>
            </tr>
          ) : (
            lista.map((tarefa) => (
              <tr key={tarefa.id} className="border-b border-slate-800/90 last:border-b-0">
                <td className="py-4 font-semibold text-white">{tarefa.caso_clinico_titulo || 'Tarefa sem título'}</td>
                <td className="py-4 text-blue-200">{formatarData(tarefa.criado_em)}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${tarefa.resolvida ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'}`}>
                    {tarefa.resolvida ? 'Concluído' : 'Pendente'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button type="button" onClick={() => abrirTarefa(tarefa)} className="px-4 py-1.5 rounded-lg border border-slate-700 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer">
                    Abrir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (tarefaAberta) {
    const imagemUrl = resolverUrlImagem(tarefaAberta.caso_clinico_imagem_url || tarefaAberta.imagem_url || '');

    return (
      <div className="min-h-screen bg-[#0d131d] text-white font-sans">
        <header className="bg-[#101726] border-b border-slate-800/80 px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <button type="button" onClick={voltarTarefas} className="flex items-center gap-3 text-white font-bold text-lg cursor-pointer hover:text-blue-300">
            <span className="text-2xl leading-none">←</span>
            <span>Resolver tarefa</span>
          </button>
          <span className="px-4 py-2 rounded-lg bg-[#182234] text-slate-400 text-sm font-semibold">{tarefaAberta.resolvida ? 'Já respondida' : 'Resposta não enviada'}</span>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-[1fr_360px] min-h-[calc(100vh-73px)]">
          <section className="p-6 lg:p-8 space-y-5">
            <p className="text-sm text-slate-400">Clique e arraste sobre a radiografia para marcar sua resposta.</p>
            <div
              ref={imagemRespostaRef}
              onPointerDown={iniciarDesenho}
              onPointerMove={atualizarDesenho}
              onPointerUp={finalizarDesenho}
              onPointerLeave={finalizarDesenho}
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-black cursor-crosshair"
            >
              {imagemUrl ? (
                <img src={imagemUrl} alt={tarefaAberta.caso_clinico_titulo} draggable="false" className="w-full max-h-[72vh] object-contain select-none pointer-events-none" />
              ) : (
                <div className="h-[60vh] flex items-center justify-center text-slate-500">Imagem não carregada</div>
              )}

              {marcacao && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20"
                  style={{ left: `${marcacao.x}%`, top: `${marcacao.y}%`, width: `${marcacao.width}%`, height: `${marcacao.height}%` }}
                />
              )}
            </div>
          </section>

          <aside className="bg-[#111c2c] border-t xl:border-t-0 xl:border-l border-slate-800 p-6 lg:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Dados da tarefa</h2>
              <p className="text-xs text-slate-400 mt-1">{tarefaAberta.turma_nome}</p>
            </div>

            <div className="bg-[#0c1320] border border-slate-700/80 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 mb-2">Radiografia</p>
              <p className="text-sm font-semibold text-white">{tarefaAberta.caso_clinico_titulo}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">Instruções</p>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#0c1320] border border-slate-700/80 rounded-xl p-4 whitespace-pre-line">{tarefaAberta.instrucoes}</p>
            </div>

            <div className="bg-[#0c1320] border border-slate-700/80 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-white">Sua marcação</h3>
              {marcacao?.width && marcacao?.height ? (
                <p className="text-sm text-slate-300">Eixo X: {marcacao.x.toFixed(1)}% a {(marcacao.x + marcacao.width).toFixed(1)}% | Eixo Y: {marcacao.y.toFixed(1)}% a {(marcacao.y + marcacao.height).toFixed(1)}%</p>
              ) : (
                <p className="text-sm text-slate-400">Nenhuma área marcada.</p>
              )}
            </div>

            {mensagemResposta.texto && (
              <div className={`p-3 rounded-xl border text-sm ${mensagemResposta.tipo === 'erro' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'}`}>
                {mensagemResposta.texto}
              </div>
            )}

            <button type="button" onClick={limparMarcacao} className="w-full py-3 bg-[#0d131d] border border-slate-700 hover:border-blue-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer">Limpar marcação</button>
            <button type="button" onClick={solicitarEnviarResposta} disabled={enviandoResposta || tarefaAberta.resolvida || !marcacao?.width || !marcacao?.height} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {enviandoResposta ? 'Enviando resposta...' : 'Enviar resposta'}
            </button>
          </aside>
        </main>
        {confirmarEnviarResposta && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
            <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
              <h3 className="text-lg font-bold text-white">Enviar resposta</h3>
              <p className="text-sm text-slate-300 leading-relaxed">Após confirmar, não será possível alterar a resposta desta tarefa.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setConfirmarEnviarResposta(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Não</button>
                <button type="button" onClick={handleEnviarResposta} className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Sim</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col font-sans select-none">
      <header className="bg-[#101726] border-b border-slate-800/80 px-8 py-4 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-8">
          <button type="button" onClick={() => setAbaAtual('dashboard')} className="flex items-center gap-3 cursor-pointer text-left">
            <LogoMarca tamanho="sm" />
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">RadioDent</h1>
              <p className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase mt-0.5">Treino Radiográfico</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-7 h-full">
            {renderAba('dashboard', 'Dashboard')}
            {renderAba('turmas', 'Turmas')}
            {renderAba('tarefas', 'Tarefas')}
          </nav>
        </div>

        <div className="relative">
          <button type="button" onClick={() => setMenuPerfilAberto(!menuPerfilAberto)} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left focus:outline-none">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{nomeAluno}</p>
              <p className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#1a2536] text-[10px] font-bold text-white">ALUNO</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold overflow-hidden">
              {dadosAluno.fotoUrl ? <img src={dadosAluno.fotoUrl} alt="Foto do aluno" className="w-full h-full object-cover" /> : (iniciais || 'AL')}
            </div>
          </button>

          {menuPerfilAberto && (
            <div className="absolute right-0 mt-2 w-52 bg-[#121b2b] border border-slate-700/80 rounded-xl shadow-2xl z-40 py-2 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-semibold text-white truncate">{nomeAluno}</p>
                <p className="text-[10px] text-slate-400 truncate">{dadosAluno.email}</p>
              </div>
              <button type="button" onClick={() => fotoInputRef.current?.click()} className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">Alterar Foto</button>
              <button type="button" onClick={() => abrirModalPerfil('perfil')} className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">Editar Perfil</button>
              <button type="button" onClick={() => abrirModalPerfil('senha')} className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer">Trocar Senha</button>
              <div className="border-t border-slate-800 my-1"></div>
              <button type="button" onClick={() => { setMenuPerfilAberto(false); setConfirmarSair(true); }} className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer">Sair</button>
            </div>
          )}
          <input type="file" accept="image/*" ref={fotoInputRef} onChange={handleEscolherFoto} className="hidden" />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10">
        <div className="md:hidden grid grid-cols-3 gap-2 mb-6 bg-[#101726] border border-slate-800 rounded-xl p-1.5">
          {renderAba('dashboard', 'Dashboard')}
          {renderAba('turmas', 'Turmas')}
          {renderAba('tarefas', 'Tarefas')}
        </div>

        {erroDados && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{erroDados}</div>}

        {abaAtual === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-white">Olá, {primeiroNome}</h2>
              <p className="text-sm text-slate-400 mt-2">Aqui está o resumo das suas atividades na plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {metricas.map(([titulo, valor, detalhe]) => (
                <div key={titulo} className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 min-h-36">
                  <div className="space-y-6">
                    <p className="text-sm text-slate-300">{titulo}</p>
                    <div>
                      <p className="text-3xl font-black text-white">{carregandoDados ? '...' : valor}</p>
                      <p className="text-xs text-blue-300 mt-2">{detalhe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-7">
                <h3 className="text-base font-bold text-white">Tarefas Recentes</h3>
                <button type="button" onClick={() => setAbaAtual('tarefas')} className="text-sm text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">Ver todas</button>
              </div>
              {renderTabelaTarefas(tarefasRecentes)}
            </div>
          </div>
        )}

        {abaAtual === 'turmas' && (
          <div className="relative min-h-[62vh] pb-24 space-y-7">
            <div>
              <h2 className="text-2xl font-bold text-white">Turmas</h2>
              <p className="text-sm text-slate-400 mt-2">Turmas em que você ingressou. Use um código para entrar em outra.</p>
            </div>

            {turmas.length === 0 ? (
              <div className="min-h-80 flex items-center justify-center text-center text-sm text-slate-400 border border-slate-800 rounded-2xl bg-[#111c2c]">Nenhuma turma vinculada ainda.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {turmas.map((turma) => (
                  <article key={turma.id} className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 min-h-52 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white leading-snug">{turma.nome}</h3>
                          <p className="text-sm text-slate-400 mt-4">Prof. {turma.professor_nome || 'Professor'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#1a2536] text-xs font-bold text-white">2026.2</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-blue-400 mb-4">
                        <span className="text-lg leading-none">+</span>
                        <span>{turma.qtdAlunos} alunos</span>
                      </div>
                    </div>

                    <div className="border border-dashed border-blue-500/60 bg-[#0b1019]/70 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Código da turma</span>
                        <span className="text-lg font-mono font-black text-white tracking-widest">{formatarCodigoTurma(turma.codigo)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <button type="button" onClick={abrirModalEntrarTurma} className="fixed right-8 bottom-8 px-6 py-4 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm shadow-2xl shadow-blue-900/40 flex items-center gap-3 cursor-pointer z-20">
              <span className="text-xl leading-none">+</span>
              <span>Entrar em Turma</span>
            </button>
          </div>
        )}

        {abaAtual === 'tarefas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Tarefas</h2>
              <p className="text-sm text-slate-400 mt-1">Escolha a radiografia da tarefa que deseja resolver.</p>
            </div>

            <div className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <input
                  type="search"
                  placeholder="Buscar por ID ou tag..."
                  value={buscaTarefa}
                  onChange={(e) => setBuscaTarefa(e.target.value)}
                  className="w-full lg:max-w-md px-4 py-3 bg-[#101927] border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="border-t border-slate-700/70 pt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-300">Status:</span>
                {renderFiltro('todas', 'Todas')}
                {renderFiltro('pendentes', 'Pendentes')}
                {renderFiltro('concluidas', 'Concluídas')}
              </div>

              <div className="border-t border-slate-700/70 pt-5">
                {tarefasFiltradas.length === 0 ? (
                  <div className="min-h-64 flex items-center justify-center text-center text-sm text-slate-400">Nenhuma tarefa encontrada.</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {tarefasFiltradas.map((tarefa) => {
                      const imagemUrl = resolverUrlImagem(tarefa.caso_clinico_imagem_url || tarefa.imagem_url || '');

                      return (
                        <button type="button" key={tarefa.id} onClick={() => abrirTarefa(tarefa)} className="group overflow-hidden rounded-2xl border text-left bg-[#0b1019] border-slate-800 hover:border-blue-500 transition-all cursor-pointer">
                          <div className="relative aspect-[16/9] bg-slate-900">
                            {imagemUrl ? (
                              <img src={imagemUrl} alt={tarefa.caso_clinico_titulo} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Imagem não carregada</div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/40 transition-opacity">
                              <span className="px-4 py-2 rounded-xl bg-blue-500 text-slate-950 text-xs font-semibold">Abrir tarefa</span>
                            </div>
                          </div>

                          <div className="p-4 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-white text-sm">{tarefa.caso_clinico_titulo || 'Tarefa sem título'}</h3>
                              <p className="text-xs text-blue-200 mt-1">Turma: {tarefa.turma_nome || 'Turma vinculada'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tarefa.resolvida ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'}`}>{tarefa.resolvida ? 'Concluído' : 'Pendente'}</span>
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
      </main>

      {modalEntrarTurma && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Entrar em turma</h3>
                <p className="text-sm text-slate-400 mt-1">Informe o código enviado pelo professor.</p>
              </div>
              <button type="button" onClick={() => setModalEntrarTurma(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>

            <form onSubmit={handleEntrarTurma} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Código da turma</label>
                <input
                  type="text"
                  value={codigoTurma}
                  onChange={(e) => setCodigoTurma(e.target.value.toUpperCase())}
                  placeholder="Ex.: RD78X2"
                  className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                  autoFocus
                />
                {mensagemTurma && <p className="text-xs text-red-300 mt-2">{mensagemTurma}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalEntrarTurma(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={entrandoTurma || !codigoTurma.trim()} className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">{entrandoTurma ? 'Entrando...' : 'Entrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modalPerfilAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{modoPerfil === 'senha' ? 'Trocar senha' : 'Editar perfil'}</h3>
                <p className="text-sm text-slate-400 mt-1">{modoPerfil === 'senha' ? 'Defina uma nova senha de acesso.' : 'Atualize seu nome e sua foto.'}</p>
              </div>
              <button type="button" onClick={() => setModalPerfilAberto(false)} className="text-slate-400 hover:text-white text-sm cursor-pointer">x</button>
            </div>

            {mensagemPerfil.texto && (
              <div className={`p-3 rounded-xl border text-sm ${mensagemPerfil.tipo === 'erro' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'}`}>
                {mensagemPerfil.texto}
              </div>
            )}

            <form onSubmit={solicitarSalvarPerfil} className="space-y-4">
              {modoPerfil === 'perfil' ? (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center overflow-hidden text-xl font-bold">
                      {dadosAluno.fotoUrl ? <img src={dadosAluno.fotoUrl} alt="Foto do aluno" className="w-full h-full object-cover" /> : (iniciais || 'AL')}
                    </div>
                    <button type="button" onClick={() => fotoInputRef.current?.click()} className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 hover:border-blue-500 cursor-pointer">Alterar foto</button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome completo</label>
                    <input type="text" value={dadosAluno.nome} onChange={(e) => setDadosAluno({ ...dadosAluno, nome: e.target.value })} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nova senha</label>
                    <input type="password" value={dadosAluno.novaSenha} onChange={(e) => setDadosAluno({ ...dadosAluno, novaSenha: e.target.value })} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirmar nova senha</label>
                    <input type="password" value={dadosAluno.confirmarSenha} onChange={(e) => setDadosAluno({ ...dadosAluno, confirmarSenha: e.target.value })} className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalPerfilAberto(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={salvandoPerfil} className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">{salvandoPerfil ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmarSalvarPerfil && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Salvar alteração</h3>
            <p className="text-sm text-slate-300">Deseja salvar essa alteração?</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setConfirmarSalvarPerfil(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Não</button>
              <button type="button" onClick={handleSalvarPerfil} className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Sim</button>
            </div>
          </div>
        </div>
      )}

      {confirmarSair && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white">Sair da conta</h3>
            <p className="text-sm text-slate-300">Deseja sair da conta?</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setConfirmarSair(false)} className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer">Não</button>
              <button type="button" onClick={aoSair} className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer">Sim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
