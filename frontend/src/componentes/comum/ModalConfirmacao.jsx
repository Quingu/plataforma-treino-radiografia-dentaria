export default function ModalConfirmacao({ aberto, titulo, texto, aoCancelar, aoConfirmar, textoConfirmar = 'Sim' }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
      <div className="bg-[#121b2b] border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
        <h3 className="text-lg font-bold text-white">{titulo}</h3>
        <p className="text-sm text-slate-300">{texto}</p>
        
        <div className="flex gap-3 pt-2">
          <button 
            type="button" 
            onClick={aoCancelar} 
            className="w-1/2 py-3 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Não
          </button>
          
          <button 
            type="button" 
            onClick={aoConfirmar} 
            className="w-1/2 py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}