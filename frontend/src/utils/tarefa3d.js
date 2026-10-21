export const TIPO_MIDIA_MODELO_3D = 'modelo_3d';
export const MODO_PONTO_3D = 'ponto_3d';

export const TOLERANCIA_PADRAO = 0.03;
export const TOLERANCIA_MINIMA = 0.001;

export function pontoValido(ponto) {
  return Boolean(
    ponto &&
      Number.isFinite(Number(ponto.x)) &&
      Number.isFinite(Number(ponto.y)) &&
      Number.isFinite(Number(ponto.z)),
  );
}

export function normalizarPonto3D(ponto) {
  return {
    x: Number(Number(ponto.x).toFixed(5)),
    y: Number(Number(ponto.y).toFixed(5)),
    z: Number(Number(ponto.z).toFixed(5)),
  };
}

export function formatarPonto3D(ponto) {
  if (!pontoValido(ponto)) {
    return 'Nenhum ponto selecionado';
  }

  return `x ${Number(ponto.x).toFixed(4)} · y ${Number(ponto.y).toFixed(
    4,
  )} · z ${Number(ponto.z).toFixed(4)}`;
}

export function montarGabarito3D({
  ponto,
  tolerancia,
  nomeEstrutura,
  malha,
}) {
  return {
    versao: 1,
    modo: MODO_PONTO_3D,
    ponto_local: normalizarPonto3D(ponto),
    tolerancia: Number(tolerancia),
    ...(nomeEstrutura?.trim()
      ? { nome_estrutura: nomeEstrutura.trim() }
      : {}),
    ...(malha?.trim() ? { malha: malha.trim() } : {}),
  };
}
