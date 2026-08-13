import React, { useState } from 'react';

export default function ModalEsqueceuSenha({ aoFechar }) {
  
  /*Dados do usuario para redefinir a senha */

  const [etapa, setEtapa] = useState('solicitar_email');
  const [email, setEmail] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erro, setErro] = useState('');

  /* FUNÇÕES DE NAVEGAÇÃO E VALIDAÇÃO*/
  const lidarComEnvioEmail = (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !email.includes('@')) {
      setErro('Por favor, informe um e-mail válido.');
      return;
    }

    console.log('Código de recuperação enviado para:', email);
    setEtapa('digitar_codigo');
  };

  const lidarComValidarCodigo = (e) => {
    e.preventDefault();
    setErro('');

    if (!codigoDigitado.trim() || codigoDigitado.length < 6) {
      setErro('Digite o código completo de 6 dígitos enviado por e-mail.');
      return;
    }

    setEtapa('nova_senha');
  };

  const lidarComSalvarSenha = (e) => {
    e.preventDefault();
    setErro('');

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    console.log('Senha redefinida com sucesso para o e-mail:', email);
    
    setEtapa('sucesso');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="bg-[#141d2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/*Fechar Modal */}
        <button 
          onClick={aoFechar}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          title="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/*SOLICITAR E-MAIL*/}
        {etapa === 'solicitar_email' && (
          <>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Esqueceu sua senha?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Digite seu e-mail cadastrado. Enviaremos um código de verificação para redefinir o seu acesso.
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-center">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComEnvioEmail} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail de Acesso
                </label>
                <input 
                  type="email" 
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Enviar Código por E-mail
              </button>
            </form>
          </>
        )}

        {/*DIGITAR O CÓDIGO*/}
        {etapa === 'digitar_codigo' && (
          <>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Verifique seu e-mail</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enviamos um código de 6 dígitos para <span className="font-semibold text-white">{email}</span>. Insira-o abaixo:
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-center">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComValidarCodigo} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de Verificação
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="123456"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value.replace(/\D/g, ''))} // Permite apenas números
                  className="w-full px-4 py-3.5 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white text-center tracking-widest text-lg font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Validar Código
              </button>
            </form>
          </>
        )}

        {/*NOVA SENHA*/}
        {etapa === 'nova_senha' && (
          <>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Criar Nova Senha</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Insira sua nova senha de acesso à plataforma RadioDent.
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-center">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComSalvarSenha} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nova Senha (mín. 6 caracteres)
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Redefinir Senha
              </button>
            </form>
          </>
        )}

        {/*SUCESSO FINAL*/}
        {etapa === 'sucesso' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Senha alterada com sucesso!</h3>
            <p className="text-slate-300 text-xs leading-relaxed px-4">
              Sua senha foi redefinida. Agora você já pode entrar na plataforma utilizando suas novas credenciais.
            </p>
            <button 
              onClick={aoFechar}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer mt-4"
            >
              Ir para o Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}