import { resolverUrlImagem } from '../services/api';

// Guarda as URLs já baixadas para não repetir o download a cada clique.
const imagensPrecarregadas = new Set();

// Quantas radiografias baixar de antemão ao carregar a lista de tarefas.
const LIMITE_PRECARREGAMENTO = 6;

// Em conexões econômicas (modo de economia de dados do celular) não vale a
// pena gastar banda com imagens que o aluno talvez nem abra.
function economiaDeDadosAtiva() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return Boolean(navigator.connection?.saveData);
}

// Começa a baixar a imagem antes de ela ser exibida. Como a tarefa já traz
// a URL assinada, o navegador pode usar o mesmo cache quando o aluno abrir
// a atividade.
export function precarregarImagem(url) {
  if (!url || imagensPrecarregadas.has(url) || economiaDeDadosAtiva()) {
    return;
  }

  imagensPrecarregadas.add(url);

  const imagem = new Image();
  imagem.decoding = 'async';
  imagem.src = url;
}

// Versão que recebe a tarefa da lista e resolve a URL do caso clínico.
// Tarefas 3D não têm radiografia 2D para baixar.
export function precarregarImagemDaTarefa(tarefa) {
  if (!tarefa || tarefa.tipo === 'modelo_3d') {
    return;
  }

  const caminho = tarefa.caso_clinico_imagem_url || tarefa.imagem_url || '';
  precarregarImagem(resolverUrlImagem(caminho));
}

// Pré-carrega as tarefas 2D com maior chance de serem abertas: primeiro as
// pendentes, depois as mais recentes. Assim a imagem já está no cache quando
// o aluno clica.
export function precarregarImagensDasTarefas(
  tarefas = [],
  limite = LIMITE_PRECARREGAMENTO,
) {
  const candidatas = tarefas
    .filter(
      (tarefa) =>
        tarefa &&
        tarefa.tipo !== 'modelo_3d' &&
        (tarefa.caso_clinico_imagem_url || tarefa.imagem_url),
    )
    .sort((a, b) => {
      if (Boolean(a.resolvida) !== Boolean(b.resolvida)) {
        return a.resolvida ? 1 : -1;
      }

      return new Date(b.criado_em || 0) - new Date(a.criado_em || 0);
    })
    .slice(0, limite);

  candidatas.forEach(precarregarImagemDaTarefa);
}
