import StatusMensagem from '../comum/StatusMensagem';

export default function ModalPerfil({ 
  aberto, 
  modo, 
  dados, 
  iniciais, 
  mensagem, 
  salvando, 
  fotoInputRef, 
  aoFechar, 
  aoEnviar, 
  aoAlterarDados, 
  aoEscolherFoto 
}) {
  if (!aberto) return null;

  const senha = modo === 'senha';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              {senha ? 'Trocar senha' : 'Editar perfil'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {senha ? 'Defina uma nova senha de acesso.' : 'Atualize seu nome e sua foto.'}
            </p>
          </div>
          <button onClick={aoFechar} className="text-slate-400 cursor-pointer">
            x
          </button>
        </div>

        <StatusMensagem mensagem={mensagem} />

        <form onSubmit={aoEnviar} className="space-y-4">
          {!senha ? (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center overflow-hidden text-xl font-bold">
                  {dados.fotoUrl ? (
                    <img src={dados.fotoUrl} alt="Foto do aluno" className="w-full h-full object-cover" />
                  ) : (
                    iniciais
                  )}
                </div>
                
                <input 
                  ref={fotoInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={aoEscolherFoto} 
                  className="hidden"
                />
                
                <button 
                  type="button" 
                  onClick={() => fotoInputRef.current?.click()} 
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 cursor-pointer"
                >
                  Alterar foto
                </button>
              </div>
              
              <Campo 
                rotulo="Nome completo" 
                valor={dados.nome} 
                aoMudar={(nome) => aoAlterarDados({ nome })}
              />
            </>
          ) : (
            <>
              <Campo 
                rotulo="Nova senha" 
                tipo="password" 
                valor={dados.novaSenha} 
                aoMudar={(novaSenha) => aoAlterarDados({ novaSenha })}
              />
              <Campo 
                rotulo="Confirmar nova senha" 
                tipo="password" 
                valor={dados.confirmarSenha} 
                aoMudar={(confirmarSenha) => aoAlterarDados({ confirmarSenha })}
              />
            </>
          )}

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={aoFechar} 
              className="w-1/2 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Cancelar
            </button>
            <button 
              disabled={salvando} 
              className="w-1/2 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl disabled:opacity-40"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

function Campo({ rotulo, tipo = 'text', valor, aoMudar }) { 
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
        {rotulo}
      </label>
      <input 
        type={tipo} 
        value={valor} 
        onChange={(e) => aoMudar(e.target.value)} 
        className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm"
      />
    </div>
  ); 
}