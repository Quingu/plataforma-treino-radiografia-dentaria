import React, { useState } from 'react';

// URL base da API (Quando o Gustavo te passar a URL do Render, você troca aqui)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function ModalEsqueceuSenha({ aoFechar }) {
  
  /* Dados do usuário para redefinir a senha */
  const [etapa, setEtapa] = useState('solicitar_email');
  const [email, setEmail] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  /* Olhinho de ver senha */
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  /* Estados de erro e carregamento (Feedback visual) */
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  /* FUNÇÕES DE NAVEGAÇÃO E VALIDAÇÃO */

  // ETAPA 1: Enviar Código por E-mail (RF-REC-01)
  const lidarComEnvioEmail = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErro('Por favor, informe um e-mail válido.');
      return;
    }

    setCarregando(true);

    try {
      /* Chamada Fetch preparada para a API do Django:
        const resposta = await fetch(`${API_URL}/usuarios/recuperar-senha/solicitar/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.mensagem || 'E-mail não encontrado na base de dados.');
        }
      */

      // Simulação de delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEtapa('digitar_codigo');
    } catch (err) {
      setErro(err.message || 'Erro ao conectar ao servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Validar Código de 6 Dígitos (RF-REC-02 / RF-REC-04)
  const lidarComValidarCodigo = async (e) => {
    e.preventDefault();
    setErro('');

    if (!codigoDigitado.trim() || codigoDigitado.length < 6) {
      setErro('Digite o código completo de 6 dígitos enviado por e-mail.');
      return;
    }

    setCarregando(true);

    try {
      /* Chamada Fetch preparada para validar o token no Django:
        const resposta = await fetch(`${API_URL}/usuarios/recuperar-senha/validar-token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, codigo: codigoDigitado })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.mensagem || 'Código inválido ou expirado.');
        }
      */

      // Simulação de delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEtapa('nova_senha');
    } catch (err) {
      setErro(err.message || 'Código incorreto ou expirado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 3: Salvar Nova Senha Cumprindo a Regra RN-05 (RF-REC-03)
  const lidarComSalvarSenha = async (e) => {
    e.preventDefault();
    setErro('');

    if (!novaSenha) {
      setErro('Por favor, digite a nova senha.');
      return;
    }

    /* REQUISITO RN-05: Validação da Senha Segura (8+ chars, maiúscula, número e símbolo) */
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
      /* Chamada Fetch preparada para redefinir no Django:
        const resposta = await fetch(`${API_URL}/usuarios/recuperar-senha/redefinir/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, codigo: codigoDigitado, nova_senha: novaSenha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(dados.mensagem || 'Falha ao redefinir a senha.');
        }
      */

      // Simulação de delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1200));

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
        
        {/* Fechar Modal */}
        <button 
          onClick={aoFechar}
          disabled={carregando}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 disabled:opacity-50"
          title="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* SOLICITAR E-MAIL */}
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
                  <span>Enviar Código por E-mail</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* DIGITAR O CÓDIGO */}
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
                  onChange={(e) => setCodigoDigitado(e.target.value.replace(/\D/g, ''))}
                  disabled={carregando}
                  className="w-full px-4 py-3.5 bg-[#0d131d] border border-slate-700/80 rounded-xl text-white text-center tracking-widest text-lg font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
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
                    <span>Validando...</span>
                  </>
                ) : (
                  <span>Validar Código</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* NOVA SENHA */}
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
              
              {/* Campo Nova Senha */}
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
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Mín. 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.</p>
              </div>

              {/* Campo Confirmar Nova Senha */}
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
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {mostrarConfirmarSenha ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    )}
                  </button>
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

        {/* SUCESSO FINAL */}
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