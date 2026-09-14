import { useState, useEffect } from 'react';
import StatusMensagem from '../comum/StatusMensagem';

export default function ModalEditarTurma({ aberto, turma, salvando, mensagem, aoFechar, aoSalvar }) {
  const [nome, setNome] = useState('');

  // Preenche o campo com o nome da turma que está sendo editada
  useEffect(() => {
    if (aberto && turma) {
      setNome(turma.nome || '');
    }
  }, [aberto, turma]);

  if (!aberto) return null;

  const lidarComEnvio = (e) => {
    e.preventDefault();
    if (nome.trim() && nome !== turma?.nome) {
      aoSalvar(nome);
    } else {
      aoFechar(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121b2b] p-6 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Editar Turma</h3>
        <p className="text-sm text-slate-400 mb-4">
          Altere o nome da turma selecionada.
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
              {salvando ? 'Salvando' : 'Salvar Alteração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}