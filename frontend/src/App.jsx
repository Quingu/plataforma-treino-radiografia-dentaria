import React, { useState } from 'react';
import TelaLogin from './paginas/TelaLogin';
import TelaCadastro from './paginas/TelaCadastro';
import HomeProfessor from './paginas/HomeProfessor';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('LOGIN');
  const [usuario, setUsuario] = useState(null);

  const handleLoginSucesso = (dadosLogin) => {
    setUsuario({
      email: dadosLogin.email,
      tipoUsuario: dadosLogin.tipoUsuario || dadosLogin.perfil || 'professor'
    });
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
