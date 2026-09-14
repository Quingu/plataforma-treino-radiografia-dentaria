export function formatarData(valor) {
  if (!valor) return 'Sem data';
  
  return new Intl.DateTimeFormat('pt-BR').format(new Date(valor));
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