import MenuPerfil from '../perfil/MenuPerfil';

export default function CabecalhoProfessor({ 
  abaAtual, 
  aoMudarAba, 
  nome, 
  email,
  fotoUrl, 
  iniciais, 
  menuAberto,
  aoAlternarMenu,
  aoEditarPerfil,
  aoTrocarSenha,
  aoAbrirPrivacidade,
  aoSolicitarSair
}) {
  return (
    <header className="flex justify-between items-center px-8 py-5 bg-[#111c2c] border-b border-slate-800 relative z-30">
      <div className="flex gap-8">
        <button 
          onClick={() => aoMudarAba('dashboard')} 
          className={`font-semibold cursor-pointer transition-colors ${
            abaAtual === 'dashboard' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard
        </button>
        
        <button 
          onClick={() => aoMudarAba('turmas')} 
          className={`font-semibold cursor-pointer transition-colors ${
            abaAtual === 'turmas' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Turmas
        </button>
        
        <button 
          onClick={() => aoMudarAba('biblioteca')} 
          className={`font-semibold cursor-pointer transition-colors ${
            abaAtual === 'biblioteca' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Biblioteca
        </button>
      </div>

      <div className="relative">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={aoAlternarMenu}
        >
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {nome}
          </span>
          
          <div className="w-10 h-10 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center overflow-hidden text-sm font-bold border-2 border-transparent group-hover:border-blue-400 transition-all">
            {fotoUrl ? (
              <img src={fotoUrl} alt={`Foto de ${nome}`} className="w-full h-full object-cover" />
            ) : (
              iniciais
            )}
          </div>
        </div>

        <MenuPerfil 
          aberto={menuAberto}
          nome={nome}
          email={email}
          aoEditar={aoEditarPerfil}
          aoTrocarSenha={aoTrocarSenha}
          aoAbrirPrivacidade={aoAbrirPrivacidade}
          aoSair={aoSolicitarSair}
        />
      </div>
    </header>
  );
}