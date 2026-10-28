export function formatarData(valor) {
  if (!valor) return 'Sem data';
  
  return new Intl.DateTimeFormat('pt-BR').format(new Date(valor));
}

const formatadorNumero = new Intl.NumberFormat('pt-BR');
const formatadorPercentual = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatarNumero(valor) {
  return formatadorNumero.format(Number(valor) || 0);
}

export function formatarPercentual(valor) {
  return `${formatadorPercentual.format(Number(valor) || 0)}%`;
}

export function formatarDataCurta(valor) {
  if (!valor) return '—';

  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(data);
}

export function formatarCodigoTurma(codigo = '') {
  return codigo.split('').join(' ');
}

export function obterIniciais(nome = '') {
  return nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}