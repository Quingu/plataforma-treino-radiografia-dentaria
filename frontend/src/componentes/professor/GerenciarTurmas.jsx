export default function GerenciarTurmas({ turmas, aoCriar, aoEditar }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Turmas</h2>
        <button onClick={aoCriar} className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold">+ Nova Turma</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {turmas.map(turma => (
          <article key={turma.id} className="bg-[#111c2c] p-5 rounded-2xl border border-slate-800 flex justify-between">
            <div>
              <h3 className="font-bold">{turma.nome}</h3>
              <p className="text-sm text-slate-400">{turma.codigo}</p>
            </div>
            <button onClick={() => aoEditar(turma)} className="text-blue-400 text-sm">Editar</button>
          </article>
        ))}
      </div>
    </section>
  );
}