const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Guarda a sessão do usuário depois do login.
function salvarTokens(dados) {
  if (dados?.access) localStorage.setItem('radiodent_access', dados.access);
  if (dados?.refresh) localStorage.setItem('radiodent_refresh', dados.refresh);
}

function limparTokens() {
  localStorage.removeItem('radiodent_access');
  localStorage.removeItem('radiodent_refresh');
  localStorage.removeItem('radiodent_usuario');
  localStorage.removeItem('radiodent_2fa_pendente');
}

function salvarUsuario(usuario) {
  localStorage.setItem('radiodent_usuario', JSON.stringify(usuario));
}

function buscarUsuarioSalvo() {
  const usuario = localStorage.getItem('radiodent_usuario');
  if (!usuario) return null;

  try {
    return JSON.parse(usuario);
  } catch {
    limparTokens();
    return null;
  }
}

function buscarToken() {
  return localStorage.getItem('radiodent_access');
}

function temSessaoSalva() {
  return Boolean(buscarToken() && buscarUsuarioSalvo());
}

function marcar2FAPendente(pendente) {
  if (pendente) {
    localStorage.setItem('radiodent_2fa_pendente', 'true');
    return;
  }

  localStorage.removeItem('radiodent_2fa_pendente');
}

function tem2FAPendente() {
  return localStorage.getItem('radiodent_2fa_pendente') === 'true';
}

async function lerResposta(resposta) {
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : {};

  if (!resposta.ok) {
    const mensagem =
      dados?.mensagem ||
      dados?.detail ||
      dados?.erro ||
      Object.values(dados).flat().join(' ') ||
      'Não foi possível completar a operação.';

    throw new Error(mensagem);
  }

  return dados;
}

// Centraliza as respostas da API para mostrar erros mais claros na tela.
async function requisicao(caminho, opcoes = {}) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  }

  return lerResposta(resposta);
}

// Usa o token salvo nas rotas que precisam de usuário logado.
async function requisicaoAutenticada(caminho, opcoes = {}) {
  const token = localStorage.getItem('radiodent_access');

  return requisicao(caminho, {
    ...opcoes,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      ...opcoes.headers,
    },
  });
}

// Atualiza nome, senha ou foto quando o aluno/professor edita o perfil.
export async function atualizarPerfil({ nome, novaPassword, fotoPerfil }) {
  const formulario = new FormData();
  if (nome !== undefined) formulario.append('nome', nome);
  if (novaPassword) formulario.append('nova_password', novaPassword);
  if (fotoPerfil) formulario.append('foto_perfil', fotoPerfil);

  let resposta;

  try {
    resposta = await fetch(`${API_URL}/auth/perfil/`, {
      method: 'PATCH',
      headers: {
        Authorization: buscarToken() ? `Bearer ${buscarToken()}` : '',
      },
      body: formulario,
    });
  } catch {
    throw new Error('Não foi possível atualizar o perfil. Tente novamente em instantes.');
  }

  return lerResposta(resposta);
}
export async function cadastrarUsuario({ nome, email, password, tipo }) {
  return requisicao('/auth/registro/', {
    method: 'POST',
    body: JSON.stringify({ nome, email, password, tipo }),
  });
}

// Login normal; se tiver 2FA, o token definitivo só vem depois do código.
export async function loginUsuario({ email, password }) {
  const dados = await requisicao('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!dados.requer_2fa) salvarTokens(dados);

  return dados;
}

export async function concluirLogin2FA({ codigo, tokenTemporario }) {
  const dados = await requisicao('/auth/login/2fa/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenTemporario}`,
    },
    body: JSON.stringify({ codigo }),
  });

  salvarTokens(dados);
  return dados;
}

export async function configurar2FA() {
  return requisicaoAutenticada('/auth/2fa/configurar/', {
    method: 'POST',
  });
}

export async function verificar2FA(codigo) {
  return requisicaoAutenticada('/auth/2fa/verificar/', {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  });
}

export async function solicitarRecuperacaoSenha(email) {
  return requisicao('/auth/recuperar-senha/solicitar/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function redefinirSenha({ token, novaPassword }) {
  return requisicao('/auth/recuperar-senha/redefinir/', {
    method: 'POST',
    body: JSON.stringify({
      token,
      nova_password: novaPassword,
    }),
  });
}

export async function listarTurmas() {
  const dados = await requisicaoAutenticada('/turmas/');
  return Array.isArray(dados) ? dados : dados.results || [];
}

export async function criarTurma({ nome }) {
  return requisicaoAutenticada('/turmas/', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
}

// O aluno usa o código enviado pelo professor para entrar na turma.
export async function entrarTurmaComCodigo(codigo) {
  return requisicaoAutenticada('/turmas/entrar/', {
    method: 'POST',
    body: JSON.stringify({ codigo_convite: codigo }),
  });
}
export async function editarTurma(id, { nome }) {
  return requisicaoAutenticada(`/turmas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ nome }),
  });
}

export async function excluirTurma(id) {
  return requisicaoAutenticada(`/turmas/${id}/`, {
    method: 'DELETE',
  });
}

export async function listarTarefas() {
  const dados = await requisicaoAutenticada('/tarefas/tarefas/');
  return Array.isArray(dados) ? dados : dados.results || [];
}

export async function criarTarefa({ casoClinico, turma, instrucoes, coordenadasGabarito }) {
  return requisicaoAutenticada('/tarefas/tarefas/', {
    method: 'POST',
    body: JSON.stringify({
      caso_clinico: casoClinico,
      turma,
      instrucoes,
      coordenadas_gabarito: coordenadasGabarito,
    }),
  });
}

// Envia a marcação feita pelo aluno para o backend conferir o gabarito.
export async function resolverTarefa(id, coordenadasSubmetidas) {
  return requisicaoAutenticada(`/tarefas/tarefas/${id}/resolver/`, {
    method: 'POST',
    body: JSON.stringify({ coordenadas_submetidas: coordenadasSubmetidas }),
  });
}
export async function listarCasosClinicos() {
  const dados = await requisicaoAutenticada('/radiografias/casos-clinicos/');
  return Array.isArray(dados) ? dados : dados.results || [];
}

export async function criarCasoClinico({ titulo, descricao, regiaoAnatomica, imagem }) {
  const formulario = new FormData();
  formulario.append('titulo', titulo);
  formulario.append('descricao', descricao);
  formulario.append('regiao_anatomica', regiaoAnatomica);
  formulario.append('imagem', imagem);

  let resposta;

  try {
    resposta = await fetch(`${API_URL}/radiografias/casos-clinicos/`, {
      method: 'POST',
      headers: {
        Authorization: buscarToken() ? `Bearer ${buscarToken()}` : '',
      },
      body: formulario,
    });
  } catch {
    throw new Error('Não foi possível enviar o arquivo. Tente novamente em instantes.');
  }

  return lerResposta(resposta);
}

export async function excluirCasoClinico(id) {
  return requisicaoAutenticada(`/radiografias/radiografias/${id}/`, {
    method: 'DELETE',
  });
}

// Ajusta o caminho da imagem para funcionar tanto local quanto no Render/Vercel.
export function resolverUrlImagem(caminho) {
  if (!caminho) return '';
  if (caminho.startsWith('http')) return caminho;
  if (caminho.startsWith('/')) return `${BASE_URL}${caminho}`;
  return `${BASE_URL}/media/${caminho}`;
}

export {
  API_URL,
  buscarUsuarioSalvo,
  limparTokens,
  marcar2FAPendente,
  requisicaoAutenticada,
  salvarUsuario,
  tem2FAPendente,
  temSessaoSalva,
};
