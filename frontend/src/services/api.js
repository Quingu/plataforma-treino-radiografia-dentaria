const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Tokens ficam exclusivamente em cookies HttpOnly; o JavaScript nunca os le.
function salvarTokens() {}

function limparTokens() {
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

function lerCookie(nome) {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${nome}=`))
    ?.split('=')[1];
}

async function garantirCsrf() {
  if (lerCookie('csrftoken')) return;
  await fetch(`${API_URL}/auth/csrf/`, { credentials: 'include' });
}

// Centraliza as respostas da API para mostrar erros mais claros na tela.
async function requisicao(caminho, opcoes = {}) {
  let resposta;

  try {
    if (!['GET', 'HEAD', 'OPTIONS'].includes((opcoes.method || 'GET').toUpperCase())) {
      await garantirCsrf();
    }
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(lerCookie('csrftoken') ? { 'X-CSRFToken': lerCookie('csrftoken') } : {}),
        ...opcoes.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  }

  return lerResposta(resposta);
}

// A autenticacao e enviada automaticamente pelo cookie HttpOnly.
async function requisicaoAutenticada(caminho, opcoes = {}) {
  return requisicao(caminho, opcoes);
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
      credentials: 'include',
      headers: {
        ...(lerCookie('csrftoken') ? { 'X-CSRFToken': lerCookie('csrftoken') } : {}),
      },
      body: formulario,
    });
  } catch {
    throw new Error('Não foi possível atualizar o perfil. Tente novamente em instantes.');
  }

  return lerResposta(resposta);
}
export async function cadastrarUsuario({ nome, email, password, tipo, aceitouTermos, versaoTermos, versaoPrivacidade }) {
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

// Login normal; se tiver 2FA, o token definitivo só vem depois do código.
export async function loginUsuario({ email, password }) {
  const dados = await requisicao('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return dados;
}

export async function concluirLogin2FA({ codigo }) {
  const dados = await requisicao('/auth/login/2fa/', {
    method: 'POST',
    body: JSON.stringify({ codigo }),
  });
  return dados;
}

export async function obterPerfil() {
  return requisicaoAutenticada('/auth/perfil/');
}

export async function logoutUsuario() {
  try {
    await requisicao('/auth/logout/', { method: 'POST' });
  } finally {
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
    await garantirCsrf();
    resposta = await fetch(`${API_URL}/radiografias/casos-clinicos/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(lerCookie('csrftoken') ? { 'X-CSRFToken': lerCookie('csrftoken') } : {}),
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
  logoutUsuario,
  marcar2FAPendente,
  obterPerfil,
  requisicaoAutenticada,
  salvarUsuario,
  tem2FAPendente,
  temSessaoSalva,
};
