import React, { useState } from 'react';
import TelaLogin from './paginas/TelaLogin';
import TelaCadastro from './paginas/TelaCadastro';

export default function App() {
  // Estado para controlar qual tela está ativa: 'login' ou 'cadastro'
  const [telaAtual, setTelaAtual] = useState('login');

  // Função para tratar quando o usuário tentar fazer login
  const lidarComLogin = (dadosLogin) => {
    console.log("Tentando logar com:", dadosLogin);
    // Aqui no futuro faremos a chamada para a sua API / Backend
  };

  // Função para tratar quando o cadastro for concluído
  const lidarComCadastro = (dadosCadastro) => {
    console.log("Cadastro realizado com sucesso:", dadosCadastro);
    alert(`Conta de ${dadosCadastro.tipoUsuario} criada com sucesso! Faça login para continuar.`);
    setTelaAtual('login'); // Volta automaticamente para a tela de login
  };

  return (
    <div className="w-full min-h-screen bg-[#0d131d]">
      {/* Renders condicionais dependendo da tela ativa */}
      {telaAtual === 'login' && (
        <TelaLogin
          aoNavegarParaCadastro={() => setTelaAtual('cadastro')}
          aoFazerLogin={lidarComLogin}
        />
      )}

      {telaAtual === 'cadastro' && (
        <TelaCadastro
          aoNavegarParaLogin={() => setTelaAtual('login')}
          aoConcluirCadastro={lidarComCadastro}
        />
      )}
    </div>
  );
}