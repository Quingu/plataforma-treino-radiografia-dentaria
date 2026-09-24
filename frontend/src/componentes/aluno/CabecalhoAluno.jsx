import LogoMarca from '../LogoMarca';
import MenuPerfil from '../perfil/MenuPerfil';

export default function CabecalhoAluno({
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
  aoSolicitarSair,
}) {
  const abas = [
    ['dashboard', 'Dashboard'],
    ['turmas', 'Turmas'],
    ['tarefas', 'Tarefas'],
  ];

  return (
    <header className="bg-[#101726] border-b border-slate-800/80 px-8 py-4 flex items-center justify-between relative z-30">
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={() => aoMudarAba('dashboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <LogoMarca tamanho="sm" />

          <div className="text-left">
            <h1 className="text-base font-bold text-white">
              RadioDent
            </h1>

            <p className="text-[10px] font-semibold text-blue-400 uppercase">
              Treino Radiográfico
            </p>
          </div>
        </button>

        <nav className="hidden md:flex gap-7">
          {abas.map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => aoMudarAba(valor)}
              className={`px-4 py-5 text-sm font-bold border-b-2 ${
                abaAtual === valor
                  ? 'text-white border-blue-500'
                  : 'text-slate-400 border-transparent'
              }`}
            >
              {texto}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={aoAlternarMenu}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {nome}
            </p>

            <p className="text-[10px] font-bold text-white">
              ALUNO
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold overflow-hidden">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto do aluno"
                className="w-full h-full object-cover"
              />
            ) : (
              iniciais
            )}
          </div>
        </button>

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