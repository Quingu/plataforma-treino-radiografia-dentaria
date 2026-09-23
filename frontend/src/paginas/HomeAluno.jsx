import { useState } from 'react';
import CabecalhoAluno from '../componentes/aluno/CabecalhoAluno';
import DashboardAluno from '../componentes/aluno/DashboardAluno';
import ListaTarefasAluno from '../componentes/aluno/ListaTarefasAluno';
import ModalEntrarTurma from '../componentes/aluno/ModalEntrarTurma';
import ResolucaoTarefa from '../componentes/aluno/ResolucaoTarefa';
import ModalPerfil from '../componentes/perfil/ModalPerfil';
import ModalPrivacidade from '../componentes/perfil/ModalPrivacidade';
import ModalConfirmacao from '../componentes/comum/ModalConfirmacao';
import StatusMensagem from '../componentes/comum/StatusMensagem';
import useDadosAluno from '../hooks/useDadosAluno';
import useDesenhoMarcacao from '../hooks/useDesenhoMarcacao';
import usePerfilUsuario from '../hooks/usePerfilUsuario';
import { resolverTarefa } from '../services/api';
import { obterIniciais } from '../utils/formatadores';

export default function HomeAluno({ usuario, aoSair }) {
  const [abaAtual, setAbaAtual] = useState('dashboard');
  const [tarefaAberta, setTarefaAberta] = useState(null);
  const [modalEntrar, setModalEntrar] = useState(false);
  const [codigoTurma, setCodigoTurma] = useState('');
  const [mensagemTurma, setMensagemTurma] = useState('');
  const [entrandoTurma, setEntrandoTurma] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [confirmarSair, setConfirmarSair] = useState(false);
  const [privacidadeAberta, setPrivacidadeAberta] = useState(false);
  const [confirmarResposta, setConfirmarResposta] = useState(false);
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [mensagemResposta, setMensagemResposta] = useState({ tipo: '', texto: '' });
  
  const dados = useDadosAluno();
  const desenho = useDesenhoMarcacao();
  const perfil = usePerfilUsuario(usuario);
  
  const nomeAluno = perfil.dados.nome || 'Aluno';
  
  const metricas = [
    ['Turmas Ativas', dados.turmas.length, 'Turmas em que você está matriculado'],
    ['Tarefas Pendentes', dados.pendentes.length, 'Aguardando sua resolução'],
    ['Tarefas Concluídas', dados.concluidas.length, 'Atividades já enviadas'],
    ['Precisão Média', dados.precisao, 'Será calculada pelas resoluções']
  ];

  const abrirTarefa = (tarefa) => {
    setTarefaAberta(tarefa);
    desenho.limpar();
    setMensagemResposta({ tipo: '', texto: '' });
  };

  const voltarTarefas = () => {
    setTarefaAberta(null);
    desenho.limpar();
    setConfirmarResposta(false);
    setMensagemResposta({ tipo: '', texto: '' });
  };

  const entrarTurma = async (evento) => {
    evento.preventDefault();
    const codigo = codigoTurma.trim().toUpperCase();
    if (!codigo) return;
    
    setEntrandoTurma(true);
    setMensagemTurma('');
    
    try {
      await dados.entrar(codigo);
      setCodigoTurma('');
      setModalEntrar(false);
    } catch (erro) {
      setMensagemTurma(erro.message || 'Não foi possível entrar na turma.');
    } finally {
      setEntrandoTurma(false);
    }
  };

  const enviarResposta = async () => {
    if (!tarefaAberta || !desenho.marcacao?.width || !desenho.marcacao?.height) return;
    
    setConfirmarResposta(false);
    setEnviandoResposta(true);
    
    try {
      const resposta = await resolverTarefa(tarefaAberta.id, {
        x: Number(desenho.marcacao.x.toFixed(2)),
        y: Number(desenho.marcacao.y.toFixed(2)),
        width: Number(desenho.marcacao.width.toFixed(2)),
        height: Number(desenho.marcacao.height.toFixed(2))
      });
      
      const atualizada = { ...tarefaAberta, resolvida: true, acertou: resposta.acertou };
      setTarefaAberta(atualizada);
      
      dados.setTarefas((anteriores) =>
        anteriores.map((tarefa) => (tarefa.id === atualizada.id ? atualizada : tarefa))
      );
      
      setMensagemResposta({
        tipo: resposta.acertou ? 'sucesso' : 'aviso',
        texto: resposta.acertou
          ? 'Resposta enviada. Você acertou a marcação.'
          : 'Resposta enviada. Revise esse conteúdo depois.'
      });
      
      setAbaAtual('dashboard');
    } catch (erro) {
      setMensagemResposta({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível enviar sua resposta.'
      });
    } finally {
      setEnviandoResposta(false);
    }
  };

  if (tarefaAberta) {
    return (
      <ResolucaoTarefa
        tarefa={tarefaAberta}
        imagemRef={desenho.imagemRef}
        marcacao={desenho.marcacao}
        mensagem={mensagemResposta}
        enviando={enviandoResposta}
        confirmar={confirmarResposta}
        aoVoltar={voltarTarefas}
        aoIniciar={desenho.iniciar}
        aoAtualizar={desenho.atualizar}
        aoFinalizar={desenho.finalizar}
        aoLimpar={desenho.limpar}
        aoSolicitarEnviar={() => setConfirmarResposta(true)}
        aoCancelarConfirmacao={() => setConfirmarResposta(false)}
        aoConfirmar={enviarResposta}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col font-sans select-none">
      <CabecalhoAluno
        abaAtual={abaAtual}
        aoMudarAba={setAbaAtual}
        nome={nomeAluno}
        email={perfil.dados.email}
        fotoUrl={perfil.dados.fotoUrl}
        iniciais={obterIniciais(nomeAluno) || 'AL'}
        menuAberto={menuPerfil}
        aoAlternarMenu={() => setMenuPerfil((aberto) => !aberto)}
        aoEditarPerfil={() => {
          setMenuPerfil(false);
          perfil.abrir('perfil');
        }}
        aoTrocarSenha={() => {
          setMenuPerfil(false);
          perfil.abrir('senha');
        }}
        aoAbrirPrivacidade={() => {
          setMenuPerfil(false);
          setPrivacidadeAberta(true);
        }}
        aoSolicitarSair={() => {
          setMenuPerfil(false);
          setConfirmarSair(true);
        }}
      />

      <main className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 flex-1">
        {dados.carregando && <p className="text-slate-400">Carregando dados...</p>}
        
        {!dados.carregando && dados.erro && (
          <StatusMensagem mensagem={{ tipo: 'erro', texto: dados.erro }} />
        )}
        
        {!dados.carregando && !dados.erro && abaAtual === 'dashboard' && (
          <DashboardAluno
            nome={nomeAluno.split(' ')[0]}
            metricas={metricas}
            tarefasRecentes={dados.recentes}
            aoAbrirTarefa={abrirTarefa}
          />
        )}
        
        {!dados.carregando && !dados.erro && abaAtual === 'turmas' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Minhas turmas</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {dados.turmas.map((turma) => (
                <article key={turma.id} className="bg-[#111c2c] border border-slate-700/80 rounded-2xl p-6">
                  <h3 className="font-bold">{turma.nome}</h3>
                  <p className="mt-4 text-sm text-slate-400">
                    Prof. {turma.professor_nome || 'Professor'}
                  </p>
                  <p className="mt-3 text-sm text-blue-400">
                    {turma.qtdAlunos} alunos
                  </p>
                </article>
              ))}
            </div>
            <button
              onClick={() => {
                setCodigoTurma('');
                setMensagemTurma('');
                setModalEntrar(true);
              }}
              className="fixed right-8 bottom-8 px-6 py-4 rounded-full bg-blue-500 text-slate-950 font-semibold"
            >
              + Entrar em Turma
            </button>
          </section>
        )}
        
        {!dados.carregando && !dados.erro && abaAtual === 'tarefas' && (
          <ListaTarefasAluno
            busca={dados.busca}
            filtro={dados.filtro}
            tarefas={dados.filtradas}
            aoBuscar={dados.setBusca}
            aoMudarFiltro={dados.setFiltro}
            aoAbrir={abrirTarefa}
          />
        )}
      </main>

      <ModalEntrarTurma
        aberto={modalEntrar}
        codigo={codigoTurma}
        mensagem={mensagemTurma}
        enviando={entrandoTurma}
        aoFechar={() => setModalEntrar(false)}
        aoMudarCodigo={setCodigoTurma}
        aoEnviar={entrarTurma}
      />

      <ModalPerfil
        aberto={perfil.aberto}
        modo={perfil.modo}
        dados={perfil.dados}
        iniciais={obterIniciais(nomeAluno) || 'AL'}
        mensagem={perfil.mensagem}
        salvando={perfil.salvando}
        fotoInputRef={perfil.fotoInputRef}
        aoFechar={() => perfil.setAberto(false)}
        aoEnviar={perfil.solicitar}
        aoAlterarDados={perfil.alterar}
        aoEscolherFoto={perfil.escolherFoto}
      />

      <ModalPrivacidade
        aberto={privacidadeAberta}
        aoFechar={() => setPrivacidadeAberta(false)}
      />

      <ModalConfirmacao
        aberto={perfil.confirmar}
        titulo="Salvar alteração"
        texto="Deseja salvar essa alteração?"
        aoCancelar={() => perfil.setConfirmar(false)}
        aoConfirmar={perfil.salvar}
      />

      <ModalConfirmacao
        aberto={confirmarSair}
        titulo="Sair da conta"
        texto="Deseja sair da conta?"
        aoCancelar={() => setConfirmarSair(false)}
        aoConfirmar={aoSair}
      />
    </div>
  );
}
