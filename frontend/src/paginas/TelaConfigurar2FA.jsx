import React, { useEffect, useState } from 'react';
import LogoMarca from '../componentes/LogoMarca';
import { configurar2FA, verificar2FA } from '../services/api';

export default function TelaConfigurar2FA({ usuario, aoConfirmar, aoVoltar }) {
  const [dados2FA, setDados2FA] = useState(null);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    async function carregarConfiguracao() {
      try {
        const dados = await configurar2FA();
        setDados2FA(dados);
      } catch (err) {
        setErro(err.message || 'Não foi possível preparar a autenticação em duas etapas.');
      } finally {
        setCarregando(false);
      }
    }

    carregarConfiguracao();
  }, []);

  const copiarChave = async () => {
    if (!dados2FA?.chave_secreta) return;
    await navigator.clipboard.writeText(dados2FA.chave_secreta);
  };

  const confirmarCodigo = async (evento) => {
    evento.preventDefault();
    setErro('');

    if (!codigo.trim() || codigo.length < 6) {
      setErro('Digite o código de 6 dígitos do Google Authenticator.');
      return;
    }

    setVerificando(true);

    try {
      await verificar2FA(codigo);
      aoConfirmar();
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado. Tente novamente.');
    } finally {
      setVerificando(false);
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
            Segurança da Conta
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Configure sua <span className="text-blue-500">autenticação</span>.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Use o Google Authenticator para proteger seu acesso antes de entrar na plataforma.
          </p>
        </div>
        <div></div>
      </div>

      <div className="lg:col-span-5 flex items-center justify-center p-8 lg:p-12 bg-[#0d131d]">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Autenticação em duas etapas</h3>
            <p className="text-slate-400 text-sm">
              {usuario?.email ? `Conta: ${usuario.email}` : 'Vincule sua conta ao aplicativo autenticador.'}
            </p>
          </div>

          {erro && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="p-5 bg-[#141d2b] border border-slate-800 rounded-xl text-sm text-slate-300">
              Preparando autenticação...
            </div>
          ) : (
            <form onSubmit={confirmarCodigo} className="space-y-5" noValidate>
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  No Google Authenticator, escolha a opção de inserir uma chave de configuração e use o código abaixo.
                </p>

                <div className="bg-[#141d2b] border border-slate-700/80 rounded-xl p-4">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-2">
                    Chave de configuração
                  </span>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-blue-300 text-sm break-all">{dados2FA?.chave_secreta}</code>
                    <button
                      type="button"
                      onClick={copiarChave}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Código do Google Authenticator
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  disabled={verificando}
                  className="w-full text-center tracking-[0.4em] text-2xl font-mono py-3.5 bg-[#141d2b] border border-slate-700/80 rounded-xl text-blue-400 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={verificando}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {verificando ? 'Verificando...' : 'Confirmar e Acessar'}
              </button>

              <button
                type="button"
                onClick={aoVoltar}
                disabled={verificando}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Voltar para o login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
