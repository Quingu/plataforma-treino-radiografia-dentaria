import {
  criarTarefa,
  listarCasosClinicos,
  listarTarefas,
  resolverTarefa,
} from './api';
import { MODO_PONTO_3D, normalizarPonto3D } from '../utils/tarefa3d';

export function listarModelos3D() {
  return listarCasosClinicos('modelo_3d');
}

export function listarTarefas3D() {
  return listarTarefas('modelo_3d');
}

export function criarAtividade3D({
  casoClinico,
  turma,
  titulo,
  instrucoes,
  gabarito,
}) {
  const instrucoesCompletas = [titulo?.trim(), instrucoes?.trim()]
    .filter(Boolean)
    .join('\n\n');

  return criarTarefa({
    caso_Clinico: casoClinico,
    turma,
    instrucoes: instrucoesCompletas,
    tipo: 'modelo_3d',
    gabarito,
  });
}

export function resolverAtividade3D(tarefaId, pontoLocal) {
  return resolverTarefa(tarefaId, {
    modo: MODO_PONTO_3D,
    ponto_local: normalizarPonto3D(pontoLocal),
  });
}
