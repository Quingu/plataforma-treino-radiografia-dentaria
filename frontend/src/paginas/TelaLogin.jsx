import React, { useState } from 'react';
import ModalEsqueceuSenha from './ModalEsqueceuSenha';

export default function TelaLogin({ aoNavegarParaCadastro, aoFazerLogin }) {
  
  // Login (E-mail e Senha)e 2FA 
  const [etapa, setEtapa] = useState(1);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const [codigo2FA, setCodigo2FA] = useState('');

  const [erro, setErro] = useState('');
  const [modalEsqueceuAberto, setModalEsqueceuAberto] = useState(false);

  // validação do email e senha
  const enviarFormulario = (evento) => {
    evento.preventDefault();
    setErro(''); 

    if (!email.trim()) {
      setErro('Por favor, insira o seu e-mail.');
      return;
    }
    
    if (!senha) {
      setErro('Por favor, insira a sua senha.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErro('Por favor, insira um e-mail válido.');
      return;
    }

    // authenticação de senha forte
    const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!regexSenhaForte.test(senha)) {
      setErro('Senha inválida. A senha cadastrada deve conter no mínimo 8 caracteres, incluindo letra maiúscula, número e caractere especial.');
      return;
    }

    setEtapa(2);
  };

  // validação da etapa 2FA
  const confirmar2FA = (evento) => {
    evento.preventDefault();
    setErro('');

    if (!codigo2FA.trim() || codigo2FA.length < 6) {
      setErro('Por favor, insira o código de verificação de 6 dígitos.');
      return;
    }

    aoFazerLogin({ email, senha, codigo2FA });
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white grid grid-cols-1 lg:grid-cols-12 select-none">
      
      {/* Texto e apresentação do site */}
      <div className="lg:col-span-7 bg-gradient-to-br from-[#101927] via-[#152338] to-[#0d131d] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
            <span className="font-black text-blue-500 text-xl">RD</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-blue-500 tracking-tight">RadioDent</h1>
            <p className="text-xs text-slate-400">Treino & Diagnóstico Radiográfico</p>
          </div>
        </div>

        <div className="my-12 lg:my-0 space-y-6 max-w-lg">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider">
            {etapa === 1 ? 'Plataforma Acadêmica' : 'Segurança em Duas Etapas'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            {etapa === 1 ? (
              <>Aprimore suas habilidades em <span className="text-blue-500">radiografia dentária</span>.</>
            ) : (
              <>Confirme sua <span className="text-blue-500">identidade</span> no sistema.</>
            )}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {etapa === 1 
              ? 'Simule análises, treine interpretações de laudos e eleve o nível do seu aprendizado prático com ferramentas interativas.'
              : `Enviamos um código de acesso de 6 dígitos para o e-mail ${email}. Insira-o abaixo para concluir o login.`
            }
          </p>
        </div>
        <div></div>
      </div>

      {/* Formulario de Login / 2FA */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 lg:p-12 bg-[#0d131d]">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {etapa === 1 ? 'Acesse sua conta' : 'Autenticação 2FA'}
            </h3>
            <p className="text-slate-400 text-sm">
              {etapa === 1 
                ? 'Insira seus dados abaixo para entrar no sistema' 
                : 'Digite o código de 6 dígitos enviado ao seu e-mail'}
            </p>
          </div>

          {/* Quando aparece o erro */}
          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-center">
              <div>{erro}</div>
            </div>
          )}

          {etapa === 1 ? (
            /* ETAPA 1: EMAIL E SENHA */
            <form onSubmit={enviarFormulario} noValidate className="space-y-5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">E-mail</label>
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12"
                  />
                  
                  {/* olho de ver a senha */}
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                  >
                    {mostrarSenha ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setModalEsqueceuAberto(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-all font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors active:scale-[0.99] cursor-pointer"
              >
                Entrar na Plataforma
              </button>
            </form>
          ) : (
            /* ETAPA 2: CÓDIGO 2FA */
            <form onSubmit={confirmar2FA} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Código de Autenticação (6 dígitos)
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={codigo2FA}
                  onChange={(e) => setCodigo2FA(e.target.value)}
                  className="w-full text-center tracking-[0.4em] text-2xl font-mono py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-blue-400 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Não recebeu o código?</span>
                <button
                  type="button"
                  onClick={() => alert("Novo código enviado para seu e-mail!")}
                  className="text-blue-400 hover:underline hover:text-blue-300 font-medium cursor-pointer"
                >
                  Reenviar código
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors active:scale-[0.99] cursor-pointer"
                >
                  Confirmar e Acessar
                </button>

                <button
                  type="button"
                  onClick={() => { setEtapa(1); setErro(''); }}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center block"
                >
                  ← Voltar para e-mail e senha
                </button>
              </div>
            </form>
          )}

          <div className="pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
            Ainda não tem uma conta?{" "}
            <button
              onClick={aoNavegarParaCadastro}
              className="text-blue-400 font-semibold hover:text-blue-300 hover:underline cursor-pointer transition-colors"
            >
              Cadastre-se
            </button>
          </div>
        </div>
      </div>

      {/* Esqueci senha */}
      {modalEsqueceuAberto && (
        <ModalEsqueceuSenha aoFechar={() => setModalEsqueceuAberto(false)} />
      )}
    </div>
  );
}