const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

export async function cadastrarUsuario({ nome, email, password, tipo }) {
  return requisicao('/auth/registro/', {
    method: 'POST',
    body: JSON.stringify({ nome, email, password, tipo }),
  });
}

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
