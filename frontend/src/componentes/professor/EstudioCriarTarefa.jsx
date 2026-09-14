import StatusMensagem from '../comum/StatusMensagem';

export default function EstudioCriarTarefa({ 
  radiografia, 
  desenho, 
  detalhes, 
  aoMudarDetalhes, 
  aoCancelar, 
  aoSalvar, 
  salvando, 
  mensagem 
}) {
  if (!radiografia) return null;

  return (
    <section className="flex flex-col min-h-screen bg-[#0d131d] p-6 lg:p-8 animate-fade-in select-none">
      
      {/* Cabeçalho do Estúdio */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Estúdio de Criação de Tarefa</h2>
          <p className="text-slate-400 text-sm mt-1">
            Demarque a área correta na imagem e defina as instruções para os alunos.
          </p>
        </div>
        <button 
          onClick={aoCancelar} 
          className="text-slate-400 hover:text-white transition-colors cursor-pointer font-semibold"
        >
          Sair do Estúdio
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Lado Esquerdo: Área de Desenho (Canvas) */}
        <div className="flex-1 bg-[#111c2c] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          
          <div
            ref={desenho.imagemRef}
            className="relative inline-block cursor-crosshair shadow-2xl rounded-xl overflow-hidden"
            onMouseDown={desenho.iniciar}
            onMouseMove={desenho.atualizar}
            onMouseUp={desenho.finalizar}
            onMouseLeave={desenho.finalizar}
            style={{ touchAction: 'none' }} // Evita scroll em telas touch enquanto desenha
          >
            <img
              src={radiografia.url || radiografia.imagem}
              alt={radiografia.titulo || 'Radiografia selecionada'}
              className="max-w-full h-auto max-h-[65vh] object-contain pointer-events-none"
              draggable={false}
            />
            
            {/* Renderização do retângulo desenhado */}
            {desenho.marcacao && (
              <div
                className="absolute border-2 border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-75"
                style={{
                  left: `${desenho.marcacao.x}%`,
                  top: `${desenho.marcacao.y}%`,
                  width: `${desenho.marcacao.width}%`,
                  height: `${desenho.marcacao.height}%`,
                }}
              />
            )}
          </div>

          <div className="mt-6 flex justify-center w-full">
            <button
              type="button"
              onClick={desenho.limpar}
              className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors cursor-pointer px-4 py-2 border border-slate-700/50 rounded-lg"
            >
              Apagar e refazer marcação
            </button>
          </div>
        </div>

        {/* Lado Direito: Formulário da Tarefa */}
        <div className="lg:w-[400px] bg-[#111c2c] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 h-fit">
          <h3 className="text-lg font-bold text-white border-b border-slate-700/80 pb-3">
            Dados da Avaliação
          </h3>

          <StatusMensagem mensagem={mensagem} />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título da Tarefa
            </label>
            <input
              type="text"
              value={detalhes.titulo || ''}
              onChange={(e) => aoMudarDetalhes({ ...detalhes, titulo: e.target.value })}
              placeholder="Ex: Identificar Cárie no Dente 46"
              className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Instruções para o Aluno
            </label>
            <textarea
              value={detalhes.instrucoes || ''}
              onChange={(e) => aoMudarDetalhes({ ...detalhes, instrucoes: e.target.value })}
              placeholder="Descreva o que o aluno deve procurar ou diagnosticar..."
              rows={5}
              className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={aoCancelar}
              className="w-1/2 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={aoSalvar}
              disabled={salvando || !desenho.marcacao?.width || !detalhes.titulo}
              className="w-1/2 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando' : 'Salvar Tarefa'}
            </button>
          </div>
          
          {(!desenho.marcacao?.width) && (
            <p className="text-[10px] text-center text-red-400 mt-1">
              * Demarque a área na imagem para salvar.
            </p>
          )}
        </div>

      </div>
    </section>
  );
}