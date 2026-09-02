import React, { useState } from 'react';
import ModalTermos from './ModalTermos'; 
import { validarEmailPorPerfil } from '../utils/validacao';

// Endereço base da API backend (com fallback local)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function TelaCadastro({ aoNavegarParaLogin, aoConcluirCadastro }) {
  
  // Controle do fluxo: 1 = Formulário de dados | 2 = Código 2FA
  const [etapa, setEtapa] = useState(1);

  // Dados do formulário de cadastro
  const [tipoUsuario, setTipoUsuario] = useState('aluno');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Código digitado na etapa de segurança
  const [codigo2FA, setCodigo2FA] = useState('');

  const [modalAberto, setModalAberto] = useState(false);

  // Valida o formulário e envia os dados para liberar o 2FA
  const validarEAvancar2FA = async (evento) => {
    evento.preventDefault();
    setErro('');

    if (!nomeCompleto.trim()) {
      setErro('Por favor, preencha o seu nome completo.');
      return;
    }

    // Regras de e-mail específicas para aluno ou professor
    const erroEmail = validarEmailPorPerfil(email, tipoUsuario);
    if (erroEmail) {
      setErro(erroEmail);
      return;
    }

    if (!senha) {
      setErro('Por favor, insira uma senha.');
      return;
    }

    // Exige: mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial
    const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    
    if (!regexSenhaForte.test(senha)) {
      setErro('A senha deve ter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, um número e um caractere especial (!@#$...).');
      return;
    }

    if (!confirmarSenha) {
      setErro('Por favor, confirme a sua senha.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos e Políticas para continuar.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/usuarios/cadastro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_usuario: tipoUsuario,
          nome_completo: nomeCompleto,
          email: email,
          senha: senha,
          aceitou_termos: aceitouTermos
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Não foi possível cadastrar a conta.');
      }

      // verificação do codigo autheiticador
      setEtapa(2);
    } catch (err) {
      setErro(err.message || 'Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Confirmação do código enviado por e-mail 
  const validarEConcluirCadastro = async (evento) => {
    evento.preventDefault();
    setErro('');

    if (!codigo2FA.trim() || codigo2FA.length < 6) {
      setErro('Por favor, digite o código de 6 dígitos enviado para seu e-mail.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/usuarios/validar-2fa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          codigo_2fa: codigo2FA
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Código de verificação incorreto.');
      }

      aoConcluirCadastro({
        tipoUsuario,
        nomeCompleto,
        email,
        senha,
        codigo2FA,
        ...dados
      });
    } catch (err) {
      setErro(err.message || 'Código incorreto ou expirado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Reenvia o código de segurança para o e-mail do usuário
  const handleReenviarCodigo = async () => {
    setErro('');
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/usuarios/reenviar-2fa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Não foi possível reenviar o código.');
      }

      alert("Novo código enviado com sucesso para o seu e-mail!");
    } catch (err) {
      setErro(err.message || "Não foi possível reenviar o código. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white grid grid-cols-1 lg:grid-cols-12 select-none">
      
      {/* Lado Esquerdo - Apresentação */}
      <div className="lg:col-span-6 bg-gradient-to-br from-[#101927] via-[#152338] to-[#0d131d] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
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
            {etapa === 1 ? 'Crie sua Conta' : 'Verificação de Segurança'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            {etapa === 1 ? (
              <>Junte-se à nossa <span className="text-blue-500">comunidade acadêmica</span>.</>
            ) : (
              <>Confirme sua <span className="text-blue-500">identidade</span> em dois fatores.</>
            )}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {etapa === 1 
              ? 'Seja você aluno ou professor, o RadioDent oferece o ambiente ideal para simulações radiográficas.'
              : `Enviamos um código de verificação para o e-mail ${email || 'cadastrado'}. Digite-o para ativar sua conta.`
            }
          </p>
        </div>
        <div></div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="lg:col-span-6 flex items-center justify-center p-8 lg:p-12 bg-[#0d131d]">
        <div className="w-full max-w-md space-y-6">
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {etapa === 1 ? 'Cadastre-se' : 'Autenticação 2FA'}
            </h3>
            <p className="text-slate-400 text-sm">
              {etapa === 1 
                ? 'Escolha seu perfil e preencha os dados abaixo' 
                : 'Digite o código de 6 dígitos que você recebeu'}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-center">
              <div>{erro}</div>
            </div>
          )}

          {etapa === 1 ? (
            <>
              {/* Seleção do Perfil (Aluno / Professor) */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#141d2b] border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setTipoUsuario('aluno'); setErro(''); }}
                  disabled={carregando}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${tipoUsuario === 'aluno' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <span>Sou Aluno</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoUsuario('professor'); setErro(''); }}
                  disabled={carregando}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${tipoUsuario === 'professor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <span>Sou Professor</span>
                </button>
              </div>

              <form onSubmit={validarEAvancar2FA} className="space-y-4" noValidate>
                
                {/* Nome Completo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
                  <input type="text" placeholder="Ex: Gabriel Silva" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} disabled={carregando} className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {tipoUsuario === 'professor' ? 'E-mail Institucional' : 'E-mail'}
                  </label>
                  <input type="email" placeholder={tipoUsuario === 'professor' ? 'professor@faculdade.edu.br' : 'seu.email@exemplo.com'} value={email} onChange={(e) => setEmail(e.target.value)} disabled={carregando} className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" />
                  {tipoUsuario === 'professor' && (
                    <p className="text-[11px] text-slate-400 mt-1">Utilize o e-mail fornecido pela sua instituição de ensino.</p>
                  )}
                </div>

                {/* Senha e Confirmação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Senha</label>
                    <div className="relative">
                      <input 
                        type={mostrarSenha ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)} 
                        disabled={carregando}
                        className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12 disabled:opacity-50" 
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirmar</label>
                    <div className="relative">
                      <input 
                        type={mostrarConfirmarSenha ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={confirmarSenha} 
                        onChange={(e) => setConfirmarSenha(e.target.value)} 
                        disabled={carregando}
                        className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12 disabled:opacity-50" 
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
                </div>

                {/* Aceite dos Termos */}
                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="aceitouTermos" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} disabled={carregando} className="mt-1 h-4 w-4 rounded border-slate-700 bg-[#141d2b] text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <label htmlFor="aceitouTermos" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                    Li e concordo com os{' '}
                    <button type="button" onClick={() => setModalAberto(true)} className="text-blue-400 hover:underline hover:text-blue-300 font-medium cursor-pointer">
                      Termos, Política de Privacidade e Cookies
                    </button>.
                  </label>
                </div>

                {/* Botão de Envio */}
                <button 
                  type="submit" 
                  disabled={!aceitouTermos || carregando} 
                  className={`w-full py-3.5 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    aceitouTermos && !carregando 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {carregando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Concluir Cadastro</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* DIGITAR CÓDIGO 2FA --- */
            <form onSubmit={validarEConcluirCadastro} className="space-y-5" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Código de Autenticação
                </label>
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="000000" 
                  value={codigo2FA} 
                  onChange={(e) => setCodigo2FA(e.target.value)} 
                  disabled={carregando}
                  className="w-full text-center tracking-[0.4em] text-2xl font-mono py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-blue-400 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50" 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Não recebeu o código?</span>
                <button 
                  type="button" 
                  onClick={handleReenviarCodigo}
                  disabled={carregando}
                  className="text-blue-400 hover:underline hover:text-blue-300 font-medium cursor-pointer disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  type="submit" 
                  disabled={carregando}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {carregando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Verificar e Ativar Conta</span>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={() => { setEtapa(1); setErro(''); }}
                  disabled={carregando}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  ← Voltar para dados do cadastro
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center text-sm text-slate-400">
            Já possui uma conta?{" "}
            <button onClick={aoNavegarParaLogin} className="text-blue-400 font-semibold hover:text-blue-300 hover:underline cursor-pointer">Faça Login</button>
          </div>
        </div>
      </div>

      {/* Modal de Termos e Condições */}
      {modalAberto && (
        <ModalTermos aoFechar={() => setModalAberto(false)} />
      )}

    </div>
  );
}