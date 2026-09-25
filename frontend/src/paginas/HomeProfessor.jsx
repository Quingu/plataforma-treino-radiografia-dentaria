import { useState } from 'react';
import CabecalhoProfessor from '../componentes/professor/CabecalhoProfessor';
import DashboardProfessor from '../componentes/professor/DashboardProfessor';
import GerenciarTurmas from '../componentes/professor/GerenciarTurmas';
import BibliotecaRadiografias from '../componentes/professor/BibliotecaRadiografias';
import EstudioCriarTarefa from '../componentes/professor/EstudioCriarTarefa';
import ModalCriarTurma from '../componentes/professor/ModalCriarTurma';
import ModalEditarTurma from '../componentes/professor/ModalEditarTurma';
import ModalUploadRadiografia from '../componentes/professor/ModalUploadRadiografia';
import ModalPerfil from '../componentes/perfil/ModalPerfil';
import ModalConfirmacao from '../componentes/comum/ModalConfirmacao';
import StatusMensagem from '../componentes/comum/StatusMensagem';

import useDadosProfessor from '../hooks/useDadosProfessor';
import useGestaoTurmas from '../hooks/useGestaoTurmas';
import useBibliotecaRadiografias from '../hooks/useBibliotecaRadiografias';
import useCriacaoTarefa from '../hooks/useCriacaoTarefa';
import usePerfilUsuario from '../hooks/usePerfilUsuario';
import { obterIniciais } from '../utils/formatadores';

export default function HomeProfessor({ usuario, aoSair, aoIrParaPrivacidade }) {
  // Controle básico de abas e menus da página
  const [abaAtual, setAbaAtual] = useState('dashboard');
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [confirmarSair, setConfirmarSair] = useState(false);

  // instancia dos hooks que isolam as regras de negócio e chamadas à API
  const perfil = usePerfilUsuario(usuario);
  const dados = useDadosProfessor();
  const gestaoTurmas = useGestaoTurmas();
  const biblioteca = useBibliotecaRadiografias();
  const criacaoTarefa = useCriacaoTarefa(gestaoTurmas.turmas);

  const nomeProfessor = perfil.dados.nome || 'Professor';

  // Se o professor selecionou uma radiografia para criar uma tarefa, 
  if (criacaoTarefa.radiografiaSelecionada) {
    return (
      <EstudioCriarTarefa 
        radiografia={criacaoTarefa.radiografiaSelecionada}
        desenho={criacaoTarefa.desenho}
        detalhes={criacaoTarefa.detalhesTarefa}
        aoMudarDetalhes={criacaoTarefa.setDetalhesTarefa}
        aoCancelar={criacaoTarefa.cancelarCriacao} 
        aoSalvar={criacaoTarefa.salvarTarefa} 
        salvando={criacaoTarefa.salvando}
        mensagem={criacaoTarefa.mensagem}
        turmas={criacaoTarefa.turmas}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col font-sans select-none">
      <CabecalhoProfessor 
        abaAtual={abaAtual} 
        aoMudarAba={setAbaAtual} 
        nome={nomeProfessor}
        email={perfil.dados.email}
        fotoUrl={perfil.dados.fotoUrl}
        iniciais={obterIniciais(nomeProfessor) || 'PR'}
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
          aoIrParaPrivacidade();
        }}
        aoSolicitarSair={() => {
          setMenuPerfil(false);
          setConfirmarSair(true);
        }}
      />

      <main className="w-full max-w-7xl mx-auto px-6 py-8 flex-1">
        {dados.carregando && <p className="text-slate-400">Carregando dados...</p>}
        
        {!dados.carregando && dados.erro && (
          <StatusMensagem mensagem={{ tipo: 'erro', texto: dados.erro }} />
        )}

        {!dados.carregando && !dados.erro && abaAtual === 'dashboard' && (
          <DashboardProfessor 
            nome={nomeProfessor.split(' ')[0]}
            metricas={dados.metricas} 
            tarefasRecentes={dados.recentes}
          />
        )}
        
        {!dados.carregando && !dados.erro && abaAtual === 'turmas' && (
          <GerenciarTurmas 
            turmas={gestaoTurmas.turmas}
            busca={gestaoTurmas.busca}
            aoBuscar={gestaoTurmas.setBusca}
            aoCriar={() => gestaoTurmas.setModalCriar(true)} 
            aoEditar={gestaoTurmas.abrirEdicao}
            aoCopiarCodigo={gestaoTurmas.copiarCodigo}
            aoExcluir={gestaoTurmas.excluirTurma}
          />
        )}
        
        {!dados.carregando && !dados.erro && abaAtual === 'biblioteca' && (
          <BibliotecaRadiografias 
            radiografias={biblioteca.filtradas}
            busca={biblioteca.busca}
            aoBuscar={biblioteca.setBusca}
            aoFazerUpload={() => biblioteca.setModalUpload(true)} 
            aoCriarTarefa={criacaoTarefa.iniciarCriacao} 
            aoExcluir={biblioteca.excluirRadiografia}
          />
        )}
      </main>

      {/* Modais de Turmas */}
      <ModalCriarTurma 
        aberto={gestaoTurmas.modalCriar} 
        salvando={gestaoTurmas.salvando}
        mensagem={gestaoTurmas.mensagem}
        aoFechar={() => gestaoTurmas.setModalCriar(false)} 
        aoSalvar={gestaoTurmas.salvarNovaTurma}
      />
      {gestaoTurmas.mensagem && !gestaoTurmas.modalCriar && !gestaoTurmas.modalEditar && (
        <div className="fixed bottom-5 right-5 z-40"><StatusMensagem mensagem={gestaoTurmas.mensagem} /></div>
      )}
      
      <ModalEditarTurma 
        aberto={gestaoTurmas.modalEditar} 
        turma={gestaoTurmas.turmaSelecionada}
        salvando={gestaoTurmas.salvando}
        mensagem={gestaoTurmas.mensagem}
        aoFechar={() => gestaoTurmas.setModalEditar(false)} 
        aoSalvar={gestaoTurmas.salvarEdicaoTurma}
      />

      {/* Modal de Upload de Radiografia */}
      <ModalUploadRadiografia 
        aberto={biblioteca.modalUpload} 
        salvando={biblioteca.salvando}
        mensagem={biblioteca.mensagem}
        aoFechar={() => biblioteca.setModalUpload(false)} 
        aoSalvar={biblioteca.realizarUpload}
      />

      {/* Modais Padrão (Perfil e Confirmação de Saída) */}
      <ModalPerfil
        aberto={perfil.aberto}
        modo={perfil.modo}
        dados={perfil.dados}
        iniciais={obterIniciais(nomeProfessor) || 'PR'}
        mensagem={perfil.mensagem}
        salvando={perfil.salvando}
        fotoInputRef={perfil.fotoInputRef}
        aoFechar={() => perfil.setAberto(false)}
        aoEnviar={perfil.solicitar}
        aoAlterarDados={perfil.alterar}
        aoEscolherFoto={perfil.escolherFoto}
      />

      <ModalConfirmacao
        aberto={perfil.confirmar}
        titulo="Salvar alteração"
        texto="Deseja salvar essa alteração em seu perfil?"
        aoCancelar={() => perfil.setConfirmar(false)}
        aoConfirmar={perfil.salvar}
      />

      <ModalConfirmacao
        aberto={confirmarSair}
        titulo="Sair da conta"
        texto="Deseja realmente sair da sua conta de professor?"
        aoCancelar={() => setConfirmarSair(false)}
        aoConfirmar={aoSair}
      />
    </div>
  );
}
