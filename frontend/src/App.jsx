import React, { useState } from 'react';
import TelaLogin from './paginas/TelaLogin';
import TelaCadastro from './paginas/TelaCadastro';
import TelaConfigurar2FA from './paginas/TelaConfigurar2FA';
import HomeProfessor from './paginas/HomeProfessor';
import {
  buscarUsuarioSalvo,
  limparTokens,
  marcar2FAPendente,
  salvarUsuario,
  tem2FAPendente,
  temSessaoSalva,
} from './services/api';

export default function App() {
  const [usuario, setUsuario] = useState(() => buscarUsuarioSalvo());
  const [telaAtual, setTelaAtual] = useState(() => {
    if (!temSessaoSalva()) return 'LOGIN';
    return tem2FAPendente() ? 'CONFIGURAR_2FA' : 'HOME';
  });

  const handleLoginSucesso = (dadosLogin) => {
    const usuarioLogado = {
      email: dadosLogin.email,
      tipoUsuario: dadosLogin.tipoUsuario || dadosLogin.perfil || 'professor'
    };

    salvarUsuario(usuarioLogado);
    marcar2FAPendente(Boolean(dadosLogin.requerConfiguracao2FA));
    setUsuario(usuarioLogado);
    setTelaAtual(dadosLogin.requerConfiguracao2FA ? 'CONFIGURAR_2FA' : 'HOME');
  };

  const handleSair = () => {
    limparTokens();
    setUsuario(null);
    setTelaAtual('LOGIN');
  };

  const handle2FAConfigurado = () => {
    marcar2FAPendente(false);
    setTelaAtual('HOME');
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white">
      {telaAtual === 'LOGIN' && (
        <TelaLogin
          aoNavegarParaCadastro={() => setTelaAtual('CADASTRO')}
          aoFazerLogin={handleLoginSucesso}
        />
      )}

      {telaAtual === 'CADASTRO' && (
        <TelaCadastro
          aoNavegarParaLogin={() => setTelaAtual('LOGIN')}
          aoConcluirCadastro={handleLoginSucesso}
        />
      )}

      {telaAtual === 'CONFIGURAR_2FA' && (
        <TelaConfigurar2FA
          usuario={usuario}
          aoConfirmar={handle2FAConfigurado}
          aoVoltar={handleSair}
        />
      )}

      {telaAtual === 'HOME' && (
        <HomeProfessor
          usuario={usuario}
          aoSair={handleSair}
        />
      )}
    </div>
  );
}
