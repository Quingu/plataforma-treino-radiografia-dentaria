import { useState, useRef } from 'react';
import StatusMensagem from '../comum/StatusMensagem';

export default function ModalUploadRadiografia({ aberto, salvando, mensagem, aoFechar, aoSalvar }) {
  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const fileInputRef = useRef(null);

  if (!aberto) return null;

  const lidarComSelecaoArquivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!titulo) {
        // Sugere o nome do arquivo sem a extensão como título padrão
        const nomeLimpo = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitulo(nomeLimpo);
      }
    }
  };

  const lidarComEnvio = (e) => {
    e.preventDefault();
    if (arquivo && titulo.trim()) {
      aoSalvar({ titulo, arquivo });
    }
  };

  const limparEFechar = () => {
    setTitulo('');
    setArquivo(null);
    setPreviewUrl('');
    aoFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#121b2b] p-6 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">Upload de Radiografia</h3>
          <button onClick={limparEFechar} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <StatusMensagem mensagem={mensagem} />

        <form onSubmit={lidarComEnvio} className="space-y-4">
          
          {/* Área de Seleção de Imagem */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 rounded-xl p-4 bg-[#0c1320] text-center">
            {previewUrl ? (
              <div className="relative w-full h-36 rounded-lg overflow-hidden flex items-center justify-center bg-black/40 mb-2">
                <img src={previewUrl} alt="Pré-visualização" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="py-4 text-slate-400">
                <p className="text-xs">Nenhuma imagem selecionada</p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG ou JPEG</p>
              </div>
            )}

            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={lidarComSelecaoArquivo} 
              className="hidden"
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {arquivo ? 'Trocar imagem' : 'Selecionar arquivo'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título do Caso / Radiografia
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Radiografia Periapical - Elemento 36"
              className="w-full px-4 py-3 bg-[#0c1320] border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={limparEFechar} 
              className="w-1/2 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              disabled={salvando || !arquivo || !titulo.trim()} 
              className="w-1/2 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? 'Enviando...' : 'Fazer Upload'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}