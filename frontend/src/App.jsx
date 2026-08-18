import React, { useState } from 'react';
import TelaLogin from './paginas/TelaLogin';
import TelaCadastro from './paginas/TelaCadastro';
import HomeProfessor from './paginas/HomeProfessor';

export default function App() {
  // Telas possíveis: 'LOGIN' | 'CADASTRO' | 'HOME'
  const [telaAtual, setTelaAtual] = useState('LOGIN');
  const [usuario, setUsuario] = useState(null);

  // Executado após passar do e-mail/senha + 2FA no TelaLogin
  const handleLoginSucesso = (dadosLogin) => {
    // Define o tipo de usuário (por padrão professor para testes)
    setUsuario({
      email: dadosLogin.email,
      tipoUsuario: 'professor'
    });
    setTelaAtual('HOME');
  };

  const handleCadastroSucesso = (dadosUsuario) => {
    setUsuario(dadosUsuario);
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
          aoConcluirCadastro={handleCadastroSucesso}
        />
      )}

      {telaAtual === 'HOME' && (
        <HomeProfessor
          usuario={usuario}
          aoSair={() => setTelaAtual('LOGIN')}
        />
      )}
    </div>
  );
}