import React, { useState } from 'react';
import BotaoOlhoSenha from '../componentes/BotaoOlhoSenha';
import { redefinirSenha, solicitarRecuperacaoSenha } from '../services/api';

export default function ModalEsqueceuSenha({ aoFechar }) {
  
  const [etapa, setEtapa] = useState('solicitar_email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const lidarComEnvioEmail = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErro('Por favor, informe um e-mail válido.');
      return;
    }

    setCarregando(true);

    try {
      await solicitarRecuperacaoSenha(email);
      setEtapa('nova_senha');
    } catch (err) {
      setErro(err.message || 'Erro ao conectar ao servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const lidarComSalvarSenha = async (e) => {
    e.preventDefault();
    setErro('');

    if (!token.trim()) {
      setErro('Informe o token recebido no e-mail de recuperação.');
      return;
    }

    if (!novaSenha) {
      setErro('Por favor, digite a nova senha.');
      return;
    }

    const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    
    if (!regexSenhaForte.test(novaSenha)) {
      setErro('A nova senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial (!@#$...).');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    setCarregando(true);

    try {
      await redefinirSenha({ token, novaPassword: novaSenha });

      setEtapa('sucesso');
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="bg-[#141d2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        <button 
          onClick={aoFechar}
          disabled={carregando}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 disabled:opacity-50 text-lg leading-none"
          title="Fechar"
        >
          x
        </button>

        {etapa === 'solicitar_email' && (
          <>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Esqueceu sua senha?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Digite seu e-mail cadastrado. Enviaremos as instruções para redefinir o seu acesso.
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
                  disabled={carregando}
                  className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
              </div>

              <button 
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar Instruções</span>
                )}
              </button>
            </form>
          </>
        )}

        {etapa === 'nova_senha' && (
          <>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center mb-4 text-blue-400 text-xs font-bold">
                SENHA
              </div>
              <h3 className="text-xl font-bold text-white">Criar Nova Senha</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enviamos as instruções para <span className="font-semibold text-white">{email}</span>. Informe o token recebido e escolha uma nova senha.
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
                  Token de Recuperação
                </label>
                <input
                  type="text"
                  placeholder="Cole aqui o token recebido"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={carregando}
                  className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    placeholder="••••••••"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={carregando}
                    className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all pr-12 disabled:opacity-50"
                  />
                  <BotaoOlhoSenha
                    visivel={mostrarSenha}
                    aoAlternar={() => setMostrarSenha(!mostrarSenha)}
                    disabled={carregando}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Mín. 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input 
                    type={mostrarConfirmarSenha ? "text" : "password"} 
                    placeholder="••••••••"
                    value={confirmarNovaSenha}
                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    disabled={carregando}
                    className="w-full px-4 py-3 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all pr-12 disabled:opacity-50"
                  />
                  <BotaoOlhoSenha
                    visivel={mostrarConfirmarSenha}
                    aoAlternar={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    disabled={carregando}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={carregando}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redefinindo...</span>
                  </>
                ) : (
                  <span>Redefinir Senha</span>
                )}
              </button>
            </form>
          </>
        )}

        {etapa === 'sucesso' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-sm font-bold">
              OK
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
