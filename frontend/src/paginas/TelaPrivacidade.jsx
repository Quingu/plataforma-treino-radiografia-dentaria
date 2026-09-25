import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { exportarMeusDados, solicitarDireitoTitular } from '../services/api';

const ABAS = [
  {
    id: 'politica',
    titulo: 'Política de Privacidade',
    arquivo: 'politica-de-privacidade.md',
    versao: '1.0',
    atualizacao: '22/09/2026',
  },
  {
    id: 'termos',
    titulo: 'Termos de Uso',
    arquivo: 'termos-de-uso.md',
    versao: '1.0',
    atualizacao: '22/09/2026',
  },
  {
    id: 'lgpd',
    titulo: 'Informações LGPD',
    arquivo: 'lgpd.md',
    versao: '1.0',
    atualizacao: '22/09/2026',
  },
];

const ACOES_DIREITO = [
  {
    tipo: 'correcao',
    titulo: 'Solicitar correção',
    descricao: 'Corrigir dados incompletos, inexatos ou desatualizados.',
  },
  {
    tipo: 'exclusao',
    titulo: 'Solicitar exclusão',
    descricao: 'Excluir seus dados pessoais da plataforma.',
  },
  {
    tipo: 'restricao',
    titulo: 'Solicitar restrição',
    descricao: 'Restringir o tratamento dos seus dados.',
  },
  {
    tipo: 'revogacao',
    titulo: 'Revogar consentimento',
    descricao: 'Revogar consentimentos previamente concedidos.',
  },
];

const componentesMarkdown = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-blue-400 mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300 mb-3">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-300 mb-3">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  a: ({ children, href }) => (
    <span className="text-slate-300">
      {children}
      {href ? ` (${href})` : ''}
    </span>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm text-slate-300 border border-slate-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-700 bg-slate-800 px-3 py-2 text-left font-semibold text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-700 px-3 py-2">{children}</td>
  ),
  hr: () => <hr className="border-slate-800 my-5" />,
};

export default function TelaPrivacidade({ autenticado = false, aoVoltar }) {
  const [abaAtual, setAbaAtual] = useState('politica');
  const [conteudo, setConteudo] = useState('');
  const [carregandoDoc, setCarregandoDoc] = useState(true);
  const [erroDoc, setErroDoc] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const aba = ABAS.find((item) => item.id === abaAtual);

  useEffect(() => {
    let ativo = true;
    setCarregandoDoc(true);
    setErroDoc('');

    fetch(`/documentos/${aba.arquivo}`)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar o documento.');
        }
        return resposta.text();
      })
      .then((texto) => {
        if (ativo) {
          setConteudo(texto);
          setCarregandoDoc(false);
        }
      })
      .catch(() => {
        if (ativo) {
          setErroDoc('Não foi possível carregar o documento. Tente novamente.');
          setCarregandoDoc(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [aba]);

  const enviarSolicitacao = async (tipo) => {
    setMensagem({ tipo: '', texto: '' });
    setEnviando(tipo);

    try {
      await solicitarDireitoTitular(tipo, descricao.trim());
      setMensagem({
        tipo: 'sucesso',
        texto: 'Solicitação registrada. O suporte vai analisar e responder.',
      });
      setDescricao('');
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível registrar a solicitação.',
      });
    } finally {
      setEnviando('');
    }
  };

  const exportarDados = async () => {
    setMensagem({ tipo: '', texto: '' });
    setEnviando('exportacao');

    try {
      const dados = await exportarMeusDados();
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'meus-dados-radiodent.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMensagem({ tipo: 'sucesso', texto: 'Arquivo de dados baixado.' });
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível exportar os dados.',
      });
    } finally {
      setEnviando('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131d] text-white flex flex-col select-none">
      <header className="border-b border-slate-800">
        <div className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            type="button"
            onClick={aoVoltar}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-xl font-bold">Privacidade e meus dados</h1>
            <p className="text-xs text-slate-400">
              Documentos, versão e exercício dos seus direitos de titular.
            </p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-6 py-8 flex-1 space-y-8">
        <nav className="flex flex-wrap gap-2" aria-label="Documentos">
          {ABAS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAbaAtual(item.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                item.id === abaAtual
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#141d2b] text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.titulo}
            </button>
          ))}
        </nav>

        <section className="rounded-2xl border border-slate-700/80 bg-[#101927] p-6">
          <p className="text-xs text-slate-500 mb-4">
            Versão {aba.versao} — atualizado em {aba.atualizacao}
          </p>
          {carregandoDoc && (
            <p className="text-sm text-slate-400">Carregando documento...</p>
          )}
          {!carregandoDoc && erroDoc && (
            <p className="text-sm text-red-400">{erroDoc}</p>
          )}
          {!carregandoDoc && !erroDoc && (
            <ReactMarkdown components={componentesMarkdown}>
              {conteudo}
            </ReactMarkdown>
          )}
        </section>

        <section className="rounded-2xl border border-slate-700/80 bg-[#101927] p-6">
          <h2 className="text-lg font-bold">Meus direitos e solicitações</h2>
          <p className="mt-1 text-sm text-slate-400">
            Exporte seus dados ou registre uma solicitação para o suporte.
          </p>

          {!autenticado ? (
            <div className="mt-4 rounded-xl border border-slate-700 bg-[#0d131d] p-4 text-sm text-slate-300">
              Entre na sua conta para exportar dados ou fazer solicitações.
              <button
                type="button"
                onClick={aoVoltar}
                className="ml-2 text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={exportarDados}
                disabled={enviando === 'exportacao'}
                className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {enviando === 'exportacao'
                  ? 'Exportando...'
                  : 'Exportar meus dados'}
              </button>

              <div className="mt-6">
                <label
                  htmlFor="descricao-solicitacao"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                >
                  Detalhes da solicitação (opcional)
                </label>
                <textarea
                  id="descricao-solicitacao"
                  value={descricao}
                  onChange={(evento) => setDescricao(evento.target.value)}
                  rows={3}
                  placeholder="Descreva o que você precisa..."
                  className="w-full rounded-xl bg-[#141d2b] border border-slate-700/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ACOES_DIREITO.map((acao) => (
                  <div
                    key={acao.tipo}
                    className="rounded-xl border border-slate-700 p-4"
                  >
                    <p className="font-semibold text-white text-sm">
                      {acao.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {acao.descricao}
                    </p>
                    <button
                      type="button"
                      onClick={() => enviarSolicitacao(acao.tipo)}
                      disabled={Boolean(enviando)}
                      className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                    >
                      {enviando === acao.tipo ? 'Enviando...' : 'Solicitar'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {mensagem.texto && (
            <p
              className={`mt-4 text-sm ${
                mensagem.tipo === 'sucesso' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {mensagem.texto}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
