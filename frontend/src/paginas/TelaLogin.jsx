import React, { useState } from 'react';
import ModalEsqueceuSenha from './ModalEsqueceuSenha';
import LogoMarca from '../componentes/LogoMarca';
import BotaoOlhoSenha from '../componentes/BotaoOlhoSenha';
import { concluirLogin2FA, limparTokens, loginUsuario } from '../services/api';

export default function TelaLogin({ aoNavegarParaCadastro, aoFazerLogin }) {
  const [etapa, setEtapa] = useState(1);

  const [tipoUsuario, setTipoUsuario] = useState('aluno');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  const [codigo2FA, setCodigo2FA] = useState('');
  const [tokenTemporario, setTokenTemporario] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modalEsqueceuAberto, setModalEsqueceuAberto] = useState(false);

  const perfilSelecionado = tipoUsuario === 'professor' ? 'Professor' : 'Aluno';

  // Confere se o perfil escolhido bate com o cadastro do e-mail.
  const validarPerfilSelecionado = (dados) => {
    const perfilBackend = String(dados?.usuario?.perfil || dados?.perfil || '').toLowerCase();

    if (perfilBackend && perfilBackend !== tipoUsuario) {
      limparTokens();
      setErro(`Este e-mail está cadastrado como ${perfilBackend}. Selecione o perfil correto para continuar.`);
      return false;
    }

    return true;
  };

  // Primeira etapa do login: e-mail, senha e validação do perfil.
  const enviarFormulario = async (evento) => {
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

    setCarregando(true);

    try {
      const dados = await loginUsuario({ email, password: senha });

      if (!validarPerfilSelecionado(dados)) return;

      if (dados.requer_2fa) {
        setTokenTemporario(dados.token_temporario);
        setEtapa(2);
        return;
      }

      aoFazerLogin({
        email,
        perfil: tipoUsuario,
        requerConfiguracao2FA: true,
        ...dados,
      });
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar. Confira seus dados e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Segunda etapa quando a conta já tem autenticador configurado.
  const confirmar2FA = async (evento) => {
    evento.preventDefault();
    setErro('');

    if (!codigo2FA.trim() || codigo2FA.length < 6) {
      setErro('Por favor, insira o código de verificação de 6 dígitos.');
      return;
    }

    setCarregando(true);

    try {
      const dados = await concluirLogin2FA({
        codigo: codigo2FA,
        tokenTemporario,
      });

      aoFazerLogin({
        email,
        perfil: tipoUsuario,
        ...dados,
      });
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white grid grid-cols-1 lg:grid-cols-12 select-none">
      
      <div className="lg:col-span-7 bg-gradient-to-br from-[#101927] via-[#152338] to-[#0d131d] p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        <div className="flex items-center gap-3">
          <LogoMarca />
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
              : `Abra seu aplicativo autenticador e informe o código de 6 dígitos da conta ${email}.`
            }
          </p>
        </div>
        <div></div>
      </div>

      <div className="lg:col-span-5 flex items-center justify-center p-8 lg:p-12 bg-[#0d131d]">
        <div className="w-full max-w-md space-y-8">
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {etapa === 1 ? 'Bem-vindo de volta' : 'Autenticação 2FA'}
            </h3>
            <p className="text-slate-400 text-sm">
              {etapa === 1 
                ? 'Entre com sua conta para acessar a plataforma'
                : 'Digite o código de 6 dígitos do seu autenticador'}
            </p>
          </div>

          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-center">
              <div>{erro}</div>
            </div>
          )}

          {etapa === 1 ? (
            <form onSubmit={enviarFormulario} noValidate className="space-y-5">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#141d2b] border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setTipoUsuario('professor'); setErro(''); }}
                  disabled={carregando}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 ${tipoUsuario === 'professor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Professor
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoUsuario('aluno'); setErro(''); }}
                  disabled={carregando}
                  className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 ${tipoUsuario === 'aluno' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Aluno
                </button>
              </div>

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
                  <BotaoOlhoSenha
                    visivel={mostrarSenha}
                    aoAlternar={() => setMostrarSenha(!mostrarSenha)}
                    disabled={carregando}
                  />
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
                disabled={carregando}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {carregando ? 'Entrando...' : `Entrar como ${perfilSelecionado}`}
              </button>
            </form>
          ) : (
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
                  disabled={carregando}
                  className="w-full text-center tracking-[0.4em] text-2xl font-mono py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-blue-400 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Código gerado pelo aplicativo autenticador.</span>
                <button
                  type="button"
                  onClick={() => setErro('Use o código atual do seu aplicativo autenticador.')}
                  disabled={carregando}
                  className="text-blue-400 hover:underline hover:text-blue-300 font-medium cursor-pointer"
                >
                  Preciso de ajuda
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {carregando ? 'Verificando...' : 'Confirmar e Acessar'}
                </button>

                <button
                  type="button"
                  onClick={() => { setEtapa(1); setErro(''); }}
                  disabled={carregando}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center block"
                >
                  Voltar para e-mail e senha
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

      {modalEsqueceuAberto && (
        <ModalEsqueceuSenha aoFechar={() => setModalEsqueceuAberto(false)} />
      )}
    </div>
  );
}
