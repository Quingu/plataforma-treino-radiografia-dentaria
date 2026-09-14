export default function ModalEntrarTurma({
  aberto,
  codigo,
  mensagem,
  enviando,
  aoFechar,
  aoMudarCodigo,
  aoEnviar,
}) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Entrar em turma
            </h3>

            <p className="text-sm text-slate-400">
              Informe o código enviado pelo professor.
            </p>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="text-slate-400 hover:text-white cursor-pointer"
            aria-label="Fechar modal"
          >
            x
          </button>
        </div>

        <form
          onSubmit={aoEnviar}
          className="space-y-4"
        >
          <input
            type="text"
            value={codigo}
            onChange={(event) => {
              aoMudarCodigo(event.target.value.toUpperCase());
            }}
            placeholder="Ex.: RD78X2"
            className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700 rounded-xl text-white"
            autoFocus
          />

          {mensagem && (
            <p className="text-xs text-red-300">
              {mensagem}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={aoFechar}
              className="w-1/2 py-3 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={enviando || !codigo.trim()}
              className="w-1/2 py-3 bg-blue-600 text-white rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}