export function formatarStatusTarefa(resolvida, acertou) {
  if (!resolvida) return 'Pendente';
  return acertou ? 'Concluída (Acerto)' : 'Concluída (Revisar)';
}

export function ordenarTarefasPorData(tarefas = []) {
  return [...tarefas].sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0));
}

export function filtrarTarefasPorBusca(tarefas = [], termo = '') {
  const busca = termo.trim().toLowerCase();
  if (!busca) return tarefas;

  return tarefas.filter(t => {
    const texto = `${t.id || ''} ${t.caso_clinico_titulo || ''} ${t.turma_nome || ''} ${t.instrucoes || ''}`.toLowerCase();
    return texto.includes(busca);
  });
}