import React, { useEffect, useState } from 'react';
import TelaLogin from './paginas/TelaLogin';
import TelaCadastro from './paginas/TelaCadastro';
import TelaConfigurar2FA from './paginas/TelaConfigurar2FA';
import TelaPrivacidade from './paginas/TelaPrivacidade';
import HomeAluno from './paginas/HomeAluno';
import HomeProfessor from './paginas/HomeProfessor';
import ModalTermos from './paginas/ModalTermos';
import {
  aceitarTermos,
  buscarUsuarioSalvo,
  logoutUsuario,
  marcar2FAPendente,
  obterTermos,
  salvarUsuario,
  tem2FAPendente,
  temSessaoSalva,
} from './services/api';

const ROTA_PRIVACIDADE = '/privacidade';

function telaInicial() {
  if (window.location.pathname === ROTA_PRIVACIDADE) return 'PRIVACIDADE';
  if (!temSessaoSalva()) return 'LOGIN';
  return tem2FAPendente() ? 'CONFIGURAR_2FA' : 'HOME';
}

export default function App() {
  const [usuario, setUsuario] = useState(() => buscarUsuarioSalvo());
  const [telaAtual, setTelaAtual] = useState(telaInicial);
  const [origemPrivacidade, setOrigemPrivacidade] = useState(null);
  // Guarda o perfil escolhido no login para abrir o cadastro já nele.
  const [tipoCadastro, setTipoCadastro] = useState('aluno');
  const [termosInfo, setTermosInfo] = useState(null);
  const [aceitePendente, setAceitePendente] = useState(false);
  const [processandoAceite, setProcessandoAceite] = useState(false);
  const [erroTermos, setErroTermos] = useState('');

  // Sincroniza a tela com a URL (navegação do navegador e acesso direto).
  useEffect(() => {
    const sincronizarComUrl = () => {
      if (window.location.pathname === ROTA_PRIVACIDADE) {
        setTelaAtual('PRIVACIDADE');
      } else {
        setTelaAtual((atual) =>
          atual === 'PRIVACIDADE' ? telaInicial() : atual,
        );
      }
    };

    window.addEventListener('popstate', sincronizarComUrl);
    return () => window.removeEventListener('popstate', sincronizarComUrl);
  }, []);

  useEffect(() => {
    if (!usuario || telaAtual !== 'HOME') {
      return undefined;
    }

    let ativo = true;

    obterTermos()
      .then((dados) => {
        if (!ativo) return;
        setTermosInfo(dados);
        setAceitePendente(Boolean(dados.aceite_pendente));
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, [usuario, telaAtual]);

  const irParaPrivacidade = () => {
    setOrigemPrivacidade((origem) =>
      telaAtual === 'PRIVACIDADE' ? origem : telaAtual,
    );
    window.history.pushState({}, '', ROTA_PRIVACIDADE);
    setTelaAtual('PRIVACIDADE');
  };

  const voltarPrivacidade = () => {
    const destino =
      origemPrivacidade && origemPrivacidade !== 'PRIVACIDADE'
        ? origemPrivacidade
        : telaInicial();
    window.history.pushState({}, '', '/');
    setTelaAtual(destino);
  };

  const handleLoginSucesso = (dadosLogin) => {
    const dadosUsuario = dadosLogin.usuario || dadosLogin;
    const usuarioLogado = {
      id: dadosUsuario.id,
      nome: dadosUsuario.nome || dadosLogin.nomeCompleto,
      email: dadosUsuario.email || dadosLogin.email,
      perfil: dadosUsuario.perfil || dadosUsuario.tipoUsuario || dadosLogin.perfil || dadosLogin.tipoUsuario || 'aluno',
      foto_perfil_url: dadosUsuario.foto_perfil_url || dadosUsuario.fotoUrl || '',
    };

    salvarUsuario(usuarioLogado);
    marcar2FAPendente(Boolean(dadosLogin.requerConfiguracao2FA));
    setUsuario(usuarioLogado);
    setAceitePendente(false);
    setErroTermos('');
    setTelaAtual(dadosLogin.requerConfiguracao2FA ? 'CONFIGURAR_2FA' : 'HOME');
  };

  const handleSair = async () => {
    await logoutUsuario();
    setUsuario(null);
    setTelaAtual('LOGIN');
    setAceitePendente(false);
    setTermosInfo(null);
    setErroTermos('');
  };

  const handle2FAConfigurado = () => {
    marcar2FAPendente(false);
    setTelaAtual('HOME');
  };

  const handleAceitarTermos = async () => {
    setErroTermos('');
    setProcessandoAceite(true);

    try {
      const dados = await aceitarTermos();
      setTermosInfo(dados);
      setAceitePendente(false);
    } catch (erro) {
      setErroTermos(erro.message);
    } finally {
      setProcessandoAceite(false);
    }
  };

  const perfilUsuario = String(usuario?.perfil || usuario?.tipoUsuario || '').toLowerCase();

  return (
    <div className="min-h-screen bg-[#0d131d] text-white">
      {telaAtual === 'LOGIN' && (
        <TelaLogin
          aoNavegarParaCadastro={(tipo) => {
            setTipoCadastro(tipo === 'professor' ? 'professor' : 'aluno');
            setTelaAtual('CADASTRO');
          }}
          aoFazerLogin={handleLoginSucesso}
          aoAbrirPrivacidade={irParaPrivacidade}
        />
      )}

      {telaAtual === 'CADASTRO' && (
        <TelaCadastro
          aoNavegarParaLogin={() => setTelaAtual('LOGIN')}
          aoConcluirCadastro={handleLoginSucesso}
          aoAbrirPrivacidade={irParaPrivacidade}
          tipoInicial={tipoCadastro}
        />
      )}

      {telaAtual === 'CONFIGURAR_2FA' && (
        <TelaConfigurar2FA
          usuario={usuario}
          aoConfirmar={handle2FAConfigurado}
          aoVoltar={handleSair}
        />
      )}

      {telaAtual === 'PRIVACIDADE' && (
        <TelaPrivacidade
          autenticado={Boolean(usuario)}
          aoVoltar={voltarPrivacidade}
        />
      )}

      {telaAtual === 'HOME' && (
        perfilUsuario === 'professor' ? (
          <HomeProfessor
            usuario={usuario}
            aoSair={handleSair}
            aoIrParaPrivacidade={irParaPrivacidade}
          />
        ) : (
          <HomeAluno
            usuario={usuario}
            aoSair={handleSair}
            aoIrParaPrivacidade={irParaPrivacidade}
          />
        )
      )}

      {aceitePendente && usuario && (
        <ModalTermos
          modoAceite
          versao={termosInfo?.versao_termos || '1.0'}
          erro={erroTermos}
          processando={processandoAceite}
          aoAceitar={handleAceitarTermos}
          aoFechar={handleSair}
        />
      )}
    </div>
  );
}
