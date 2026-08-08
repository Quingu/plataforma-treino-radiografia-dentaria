import React, { useState } from 'react';

export default function ModalEsqueceuSenha({ aoFechar }) {
  // Etapas: 'solicitar_email' -> 'digitar_codigo' -> 'nova_senha' -> 'sucesso'
  const [etapa, setEtapa] = useState('solicitar_email');
  
  const [email, setEmail] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erro, setErro] = useState('');

  // 1. Enviar o código para o e-mail
  const lidarComEnvioEmail = (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !email.includes('@')) {
      setErro('Por favor, informe um e-mail válido.');
      return;
    }

    // Aqui entraria a chamada para o backend (ex: POST /api/esqueci-senha)
    console.log('Código de recuperação enviado para:', email);
    
    // Avança para a etapa de digitar o código recebido
    setEtapa('digitar_codigo');
  };

  // 2. Validar o código digitado
  const lidarComValidarCodigo = (e) => {
    e.preventDefault();
    setErro('');

    if (!codigoDigitado.trim() || codigoDigitado.length < 6) {
      setErro('Digite o código completo de 6 dígitos enviado por e-mail.');
      return;
    }

    // Avança para definir a nova senha
    setEtapa('nova_senha');
  };

  // 3. Salvar a nova senha
  const lidarComSalvarSenha = (e) => {
    e.preventDefault();
    setErro('');

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Aqui entraria a chamada para o backend atualizar a senha
    console.log('Senha redefinida com sucesso para o e-mail:', email);
    
    setEtapa('sucesso');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="bg-[#141d2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Botão de Fechar */}
        <button 
          onClick={aoFechar}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* ETAPA 1: Solicitar E-mail */}
        {etapa === 'solicitar_email' && (
          <>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Esqueceu sua senha?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Digite seu e-mail cadastrado. Enviaremos um código de verificação para redefinir o seu acesso.
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComEnvioEmail} className="space-y-4">
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

        {/* ETAPA 2: Digitar o Código */}
        {etapa === 'digitar_codigo' && (
          <>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-xl mb-4">
                📩
              </div>
              <h3 className="text-xl font-bold text-white">Verifique seu e-mail</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enviamos um código de 6 dígitos para <span className="font-semibold text-white">{email}</span>. Insira-o abaixo:
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComValidarCodigo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de Verificação
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="123456"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value)}
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

        {/* ETAPA 3: Nova Senha */}
        {etapa === 'nova_senha' && (
          <>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-bold text-white">Criar Nova Senha</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Insira sua nova senha de acesso à plataforma RadioDent.
              </p>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {erro}
              </div>
            )}

            <form onSubmit={lidarComSalvarSenha} className="space-y-4">
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

        {/* ETAPA 4: Sucesso Final */}
        {etapa === 'sucesso' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mx-auto text-emerald-400">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Senha alterada com sucesso!</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
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