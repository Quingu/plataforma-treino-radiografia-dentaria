export default function StatusMensagem({ mensagem }) {
  if (!mensagem?.texto) return null;

  const erro = mensagem.tipo === 'erro';

  return (
    <div 
      className={`p-3 rounded-xl border text-sm ${
        erro 
          ? 'bg-red-500/10 border-red-500/30 text-red-300' 
          : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
      }`}
    >
      {mensagem.texto}
    </div>
  );
}