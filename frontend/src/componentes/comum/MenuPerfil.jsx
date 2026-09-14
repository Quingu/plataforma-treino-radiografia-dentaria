export default function MenuPerfil({ aberto, nome, email, aoEditar, aoTrocarSenha, aoSair }) {
  if (!aberto) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-[#111c2c] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-slate-200">
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-sm font-bold text-white truncate">{nome}</p>
        <p className="text-xs text-slate-400 truncate">{email}</p>
      </div>
      
      <div className="py-1">
        <button 
          onClick={aoEditar} 
          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300"
        >
          Editar Perfil
        </button>
        <button 
          onClick={aoTrocarSenha} 
          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300"
        >
          Alterar Senha
        </button>
      </div>

      <div className="border-t border-slate-800 pt-1">
        <button 
          onClick={aoSair} 
          className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer font-semibold"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}