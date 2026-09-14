export default function TabelaVazia({ texto = 'Nenhum item encontrado.' }) {
  return (
    <div className="min-h-52 flex items-center justify-center text-center text-sm text-slate-400">
      {texto}
    </div>
  );
}