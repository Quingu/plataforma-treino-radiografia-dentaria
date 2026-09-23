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
    <div className="absolute right-0 mt-2 w-52 bg-[#121b2b] border border-slate-700/80 rounded-xl shadow-2xl z-40 py-2 text-xs">
      <div className="px-4 py-2 border-b border-slate-800">
        <p className="font-semibold text-white truncate">{nome}</p>
        <p className="text-[10px] text-slate-400 truncate">{email}</p>
      </div>
      
      <button 
        onClick={aoEditar} 
        className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 cursor-pointer"
      >
        Editar perfil
      </button>
      
      <button 
        onClick={aoTrocarSenha} 
        className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 cursor-pointer"
      >
        Trocar senha
      </button>

      <button
        type="button"
        onClick={aoAbrirPrivacidade}
        className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-800 cursor-pointer"
      >
        Privacidade e meus dados
      </button>
      
      <button 
        onClick={aoSair} 
        className="w-full px-4 py-2 text-left text-red-300 hover:bg-slate-800 cursor-pointer"
      >
        Sair
      </button>
    </div>
  );
}
