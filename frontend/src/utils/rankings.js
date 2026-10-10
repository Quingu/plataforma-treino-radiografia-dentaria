// Mapeamento explícito entre a classe oficial do backend e a bandeira.
// Nunca montar o nome do arquivo a partir do texto da API.
const BANDEIRAS = {
  Cobre: '/imagens/rankings/Bandeira-Cobre.png',
  Ferro: '/imagens/rankings/Bandeira-Ferro.png',
  Bronze: '/imagens/rankings/Bandeira-Bronze.png',
  Ouro: '/imagens/rankings/Bandeira-Ouro.png',
  Platina: '/imagens/rankings/Bandeira-Platina.png',
  Diamante: '/imagens/rankings/Bandeira-Diamante.png',
  Mestre: '/imagens/rankings/Bandeira-Mestre.png',
  'Grão-Mestre': '/imagens/rankings/Bandeira-GMestre.png',
  Supremo: '/imagens/rankings/Bandeira-Supremo.png',
  Imortal: '/imagens/rankings/Bandeira-Imortal.png',
};

export const XP_POR_NIVEL = 100;
export const BANDEIRA_PADRAO = BANDEIRAS.Cobre;

function normalizarClasse(classe) {
  return String(classe || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const BANDEIRAS_NORMALIZADAS = Object.fromEntries(
  Object.entries(BANDEIRAS).map(([classe, imagem]) => [
    normalizarClasse(classe),
    imagem,
  ]),
);

export function obterBandeiraClasse(classe) {
  return BANDEIRAS_NORMALIZADAS[normalizarClasse(classe)] || BANDEIRA_PADRAO;
}

export function calcularPercentualNivel(progressoNivel) {
  const progresso = Number(progressoNivel) || 0;
  return Math.min(100, Math.max(0, (progresso / XP_POR_NIVEL) * 100));
}
