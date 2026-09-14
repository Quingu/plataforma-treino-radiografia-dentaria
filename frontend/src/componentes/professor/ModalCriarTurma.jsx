import { useState, useEffect } from 'react';
import StatusMensagem from '../comum/StatusMensagem';

export default function ModalCriarTurma({ aberto, salvando, mensagem, aoFechar, aoSalvar }) {
  const [nome, setNome] = useState('');

  // Limpa o campo de texto toda vez que o modal for aberto
  useEffect(() => {
    if (aberto) setNome('');
  }, [aberto]);

  if (!aberto) return null;

  const lidarComEnvio = (e) => {
    e.preventDefault();
    if (nome.trim()) {
      aoSalvar(nome);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121b2b] p-6 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Nova Turma</h3>
        <p className="text-sm text-slate-400 mb-4">
          Crie uma turma para agrupar seus alunos e distribuir tarefas.
        </p>
        
        <StatusMensagem mensagem={mensagem} />

        <form onSubmit={lidarComEnvio} className="space-y-5 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome da Turma
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Radiologia Odontológica - Turma A"
              className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={aoFechar} 
              className="w-1/2 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              disabled={salvando || !nome.trim()} 
              className="w-1/2 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}