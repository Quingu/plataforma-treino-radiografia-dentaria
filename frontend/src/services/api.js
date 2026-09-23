const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

// O JavaScript nunca lê tokens JWT.
// A sessão é enviada automaticamente pelos cookies HttpOnly.
function limparTokens() {
  localStorage.removeItem('radiodent_usuario');
  localStorage.removeItem('radiodent_2fa_pendente');
}

function salvarUsuario(usuario) {
  localStorage.setItem('radiodent_usuario', JSON.stringify(usuario));
}

function buscarUsuarioSalvo() {
  const usuario = localStorage.getItem('radiodent_usuario');

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario);
  } catch {
    limparTokens();
    return null;
  }
}

function temSessaoSalva() {
  return Boolean(buscarUsuarioSalvo());
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
  let dados = {};

  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    if (!resposta.ok) {
      throw new Error('O servidor retornou uma resposta inválida.');
    }
  }

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

/*
 * O cookie csrftoken pertence ao domínio da API no Render.
 * Por isso, document.cookie do frontend no Vercel não consegue lê-lo.
 *
 * O endpoint /auth/csrf/ retorna o token no JSON. O valor fica
 * somente em memória e é enviado como X-CSRFToken nas ações mutáveis.
 */
let csrfToken = null;

async function garantirCsrf() {
  if (csrfToken) {
    return csrfToken;
  }

  let resposta;

  try {
    resposta = await fetch(`${API_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new Error('Não foi possível iniciar a proteção CSRF.');
  }

  const dados = await lerResposta(resposta);

  if (!dados.csrfToken) {
    throw new Error('O servidor não forneceu o token CSRF.');
  }

  csrfToken = dados.csrfToken;
  return csrfToken;
}

function metodoExigeCsrf(metodo = 'GET') {
  return !['GET', 'HEAD', 'OPTIONS'].includes(metodo.toUpperCase());
}

// Centraliza todas as requisições JSON.
async function requisicao(caminho, opcoes = {}) {
  const metodo = (opcoes.method || 'GET').toUpperCase();

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...opcoes.headers,
  };

  if (metodoExigeCsrf(metodo)) {
    headers['X-CSRFToken'] = await garantirCsrf();
  }

  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      method: metodo,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Tente novamente em instantes.',
    );
  }

  return lerResposta(resposta);
}

// A autenticação é enviada automaticamente pelos cookies HttpOnly.
async function requisicaoAutenticada(caminho, opcoes = {}) {
  return requisicao(caminho, opcoes);
}

export async function atualizarPerfil({ nome, novaPassword, fotoPerfil }) {
  const formulario = new FormData();

  if (nome !== undefined) {
    formulario.append('nome', nome);
  }

  if (novaPassword) {
    formulario.append('nova_password', novaPassword);
  }

  if (fotoPerfil) {
    formulario.append('foto_perfil', fotoPerfil);
  }

  const tokenCsrf = await garantirCsrf();

  let resposta;

  try {
    resposta = await fetch(`${API_URL}/auth/perfil/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-CSRFToken': tokenCsrf,
      },
      body: formulario,
    });
  } catch {
    throw new Error(
      'Não foi possível atualizar o perfil. Tente novamente em instantes.',
    );
  }

  return lerResposta(resposta);
}

export async function cadastrarUsuario({
  nome,
  email,
  password,
  tipo,
  aceitouTermos,
  versaoTermos,
  versaoPrivacidade,
}) {
  return requisicao('/auth/registro/', {
    method: 'POST',
    body: JSON.stringify({
      nome,
      email,
      password,
      tipo,
      aceitou_termos: aceitouTermos,
      versao_termos: versaoTermos,
      versao_privacidade: versaoPrivacidade,
    }),
  });
}

// Não usar fetch diretamente no componente de login.
export async function loginUsuario({ email, password }) {
  return requisicao('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function concluirLogin2FA({ codigo }) {
  return requisicao('/auth/login/2fa/', {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  });
}

export async function obterPerfil() {
  return requisicaoAutenticada('/auth/perfil/');
}

export async function logoutUsuario() {
  try {
    await requisicao('/auth/logout/', {
      method: 'POST',
    });
  } finally {
    csrfToken = null;
    limparTokens();
  }
}

export async function exportarMeusDados() {
  return requisicaoAutenticada('/auth/dados/exportar/');
}

export async function solicitarDireitoTitular(tipo, descricao = '') {
  return requisicaoAutenticada('/auth/dados/solicitacoes/', {
    method: 'POST',
    body: JSON.stringify({ tipo, descricao }),
  });
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

export async function entrarTurmaComCodigo(codigo) {
  return requisicaoAutenticada('/turmas/entrar/', {
    method: 'POST',
    body: JSON.stringify({
      codigo_convite: codigo,
    }),
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

export async function criarTarefa({
  casoClinico,
  turma,
  instrucoes,
  coordenadasGabarito,
}) {
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

export async function resolverTarefa(id, coordenadasSubmetidas) {
  return requisicaoAutenticada(`/tarefas/tarefas/${id}/resolver/`, {
    method: 'POST',
    body: JSON.stringify({
      coordenadas_submetidas: coordenadasSubmetidas,
    }),
  });
}

export async function listarCasosClinicos() {
  const dados = await requisicaoAutenticada('/radiografias/casos-clinicos/');
  return Array.isArray(dados) ? dados : dados.results || [];
}

export async function criarCasoClinico({
  titulo,
  descricao,
  regiaoAnatomica,
  imagem,
}) {
  const formulario = new FormData();

  formulario.append('titulo', titulo);
  formulario.append('descricao', descricao);
  formulario.append('regiao_anatomica', regiaoAnatomica);
  formulario.append('imagem', imagem);

  const tokenCsrf = await garantirCsrf();

  let resposta;

  try {
    resposta = await fetch(`${API_URL}/radiografias/casos-clinicos/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-CSRFToken': tokenCsrf,
      },
      body: formulario,
    });
  } catch {
    throw new Error(
      'Não foi possível enviar o arquivo. Tente novamente em instantes.',
    );
  }

  return lerResposta(resposta);
}

export async function excluirCasoClinico(id) {
  return requisicaoAutenticada(`/radiografias/radiografias/${id}/`, {
    method: 'DELETE',
  });
}

export function resolverUrlImagem(caminho) {
  if (!caminho) {
    return '';
  }

  if (caminho.startsWith('http')) {
    return caminho;
  }

  if (caminho.startsWith('/')) {
    return `${BASE_URL}${caminho}`;
  }

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