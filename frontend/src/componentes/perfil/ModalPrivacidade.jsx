const DOCUMENTOS = [
  {
    titulo: 'Termos de Uso',
    descricao: 'Regras para utilização da plataforma.',
    arquivo: 'TERMOS_DE_USO.md',
  },
  {
    titulo: 'Política de Privacidade',
    descricao: 'Como os dados pessoais são tratados.',
    arquivo: 'POLITICA_DE_PRIVACIDADE.md',
  },
  {
    titulo: 'Informações LGPD',
    descricao: 'Direitos do titular e medidas de proteção adotadas.',
    arquivo: 'LGPD.md',
  },
];

const URL_DOCUMENTOS =
  'https://github.com/Quingu/plataforma-treino-radiografia-dentaria/blob/entrega2809/docs/';

export default function ModalPrivacidade({ aberto, aoFechar }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="titulo-privacidade"
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#101927] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-800 p-6">
          <div>
            <h2 id="titulo-privacidade" className="text-xl font-bold text-white">
              Privacidade e meus dados
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Consulte os documentos e exerça seus direitos de titular.
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="space-y-3 p-6">
          {DOCUMENTOS.map((documento) => (
            <a
              key={documento.arquivo}
              href={`${URL_DOCUMENTOS}${documento.arquivo}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-slate-700 p-4 transition-colors hover:border-blue-500 hover:bg-slate-800/60"
            >
              <p className="font-semibold text-blue-400">{documento.titulo}</p>
              <p className="mt-1 text-sm text-slate-400">{documento.descricao}</p>
            </a>
          ))}
        </div>

        <footer className="border-t border-slate-800 p-5 text-right">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>
  );
}
