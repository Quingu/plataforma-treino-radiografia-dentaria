import React, { useState } from 'react';
import ModalTermos from './ModalTermos'; 

export default function TelaCadastro({ aoNavegarParaLogin, aoConcluirCadastro }) {
  
  /*Preenche os campos de cadastro, validação e envio para o backend*/

  const [tipoUsuario, setTipoUsuario] = useState('aluno');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);


  /*Validar e Cadastro*/
  const validarEEnviar = (evento) => {
    evento.preventDefault();
    setErro('');

    if (!nomeCompleto.trim()) {
      setErro('Por favor, preencha o seu nome completo.');
      return;
    }

    if (!email.trim()) {
      setErro('Por favor, preencha o seu e-mail.');
      return;
    }

    if (!senha) {
      setErro('Por favor, insira uma senha.');
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

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos e Políticas para continuar.');
      return;
    }

    aoConcluirCadastro({
      tipoUsuario,
      nomeCompleto,
      email,
      senha
    });
  };


  return (
    <div className="min-h-screen bg-[#0d131d] text-white grid grid-cols-1 lg:grid-cols-12 select-none">
      
      {/*
      Apresentação do site esquerdo
      */}
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
            Crie sua Conta
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Junte-se à nossa <span className="text-blue-500">comunidade acadêmica</span>.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Seja você aluno ou professor, o RadioDent oferece o ambiente ideal para simulações radiográficas.
          </p>
        </div>
        <div></div>
      </div>


      {/*
        Cadastro 
      */}
      <div className="lg:col-span-6 flex items-center justify-center p-8 lg:p-12 bg-[#0d131d]">
        <div className="w-full max-w-md space-y-6">
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Cadastre-se</h3>
            <p className="text-slate-400 text-sm">Escolha seu perfil e preencha os dados abaixo</p>
          </div>

          {/* Alerta de erro*/}
          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-center">
              <div>{erro}</div>
            </div>
          )}

          {/*Aluno / Professor*/}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#141d2b] border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => { setTipoUsuario('aluno'); setErro(''); }}
              className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${tipoUsuario === 'aluno' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <span>Sou Aluno</span>
            </button>
            <button
              type="button"
              onClick={() => { setTipoUsuario('professor'); setErro(''); }}
              className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${tipoUsuario === 'professor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <span>Sou Professor</span>
            </button>
          </div>

          <form onSubmit={validarEEnviar} className="space-y-4" noValidate>
            
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nome Completo</label>
              <input type="text" placeholder="Ex: Gabriel Silva" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {tipoUsuario === 'professor' ? 'E-mail Institucional' : 'E-mail'}
              </label>
              <input type="email" placeholder={tipoUsuario === 'professor' ? 'professor@faculdade.edu.br' : 'seu.email@exemplo.com'} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              {tipoUsuario === 'professor' && (
                <p className="text-[11px] text-slate-400 mt-1">Utilize o e-mail fornecido pela sua instituição de ensino.</p>
              )}
            </div>

            {/*Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* confirmação a senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Senha</label>
                <div className="relative">
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12" 
                  />
                  
                  {/* Olhinho para ver a senha */}
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

              {/* Confirma de Senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirmar</label>
                <div className="relative">
                  <input 
                    type={mostrarConfirmarSenha ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                    className="w-full px-4 py-3 bg-[#141d2b] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-12" 
                  />
                  
                  {/* olhinho de ver senha */}
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={mostrarConfirmarSenha ? "Ocultar senha" : "Ver senha"}
                  >
                    {mostrarConfirmarSenha ? (
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
            </div>

            {/* Checkbox de Termos */}
            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" id="aceitouTermos" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-700 bg-[#141d2b] text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="aceitouTermos" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                Li e concordo com os{' '}
                <button type="button" onClick={() => setModalAberto(true)} className="text-blue-400 hover:underline hover:text-blue-300 font-medium cursor-pointer">
                  Termos, Política de Privacidade e Cookies
                </button>.
              </label>
            </div>

            <button type="submit" disabled={!aceitouTermos} className={`w-full py-3.5 font-semibold rounded-xl text-sm transition-all cursor-pointer ${aceitouTermos ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              Concluir Cadastro
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-sm text-slate-400">
            Já possui uma conta?{" "}
            <button onClick={aoNavegarParaLogin} className="text-blue-400 font-semibold hover:text-blue-300 hover:underline cursor-pointer">Faça Login</button>
          </div>
        </div>
      </div>

      {/* Termos */}
      {modalAberto && (
        <ModalTermos aoFechar={() => setModalAberto(false)} />
      )}

    </div>
  );
}