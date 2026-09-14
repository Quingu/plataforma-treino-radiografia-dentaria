export default function BibliotecaRadiografias({ radiografias, aoFazerUpload, aoCriarTarefa }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Biblioteca Clínica</h2>
        <button onClick={aoFazerUpload} className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold">Upload de Rx</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {radiografias.map(rx => (
          <div key={rx.id} className="bg-[#111c2c] rounded-xl overflow-hidden border border-slate-800">
            <img src={rx.url} alt={rx.titulo} className="w-full h-32 object-cover" />
            <div className="p-3">
              <p className="text-sm font-bold truncate">{rx.titulo}</p>
              <button onClick={() => aoCriarTarefa(rx)} className="mt-2 w-full bg-slate-800 py-2 rounded-lg text-xs font-semibold">Criar Tarefa</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}