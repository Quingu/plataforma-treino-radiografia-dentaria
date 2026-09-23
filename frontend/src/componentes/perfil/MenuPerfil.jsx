export default function MenuPerfil({
  aberto,
  nome,
  email,
  aoEditar,
  aoTrocarSenha,
  aoAbrirPrivacidade,
  aoSair,
}) {
  if (!aberto) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700/80 bg-[#111c2c] py-2 text-slate-200 shadow-2xl z-50">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="truncate text-sm font-bold text-white">{nome}</p>
        <p className="truncate text-xs text-slate-400">{email}</p>
      </div>

      <div className="py-1">
        <button
          type="button"
          onClick={aoEditar}
          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/60"
        >
          Editar Perfil
        </button>

        <button
          type="button"
          onClick={aoTrocarSenha}
          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/60"
        >
          Alterar Senha
        </button>

        <button
          type="button"
          onClick={aoAbrirPrivacidade}
          className="w-full cursor-pointer px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/60"
        >
          Privacidade e meus dados
        </button>
      </div>

      <div className="border-t border-slate-800 pt-1">
        <button
          type="button"
          onClick={aoSair}
          className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}