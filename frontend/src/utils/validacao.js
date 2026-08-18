export function validarEmailPorPerfil(email, tipoUsuario) {
  if (!email || !email.includes('@')) {
    return 'Por favor, insira um e-mail válido.';
  }

  const emailFormatado = email.trim().toLowerCase();

  if (tipoUsuario === 'professor') {
    const provedoresPessoais = [
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'yahoo.com',
      'yahoo.com.br',
      'icloud.com',
      'aol.com',
      'bol.com.br',
      'uol.com.br',
      'terra.com.br',
      'live.com'
    ];

    const dominios = emailFormatado.split('@');
    const dominioDigitado = dominios[dominios.length - 1];

    if (provedoresPessoais.includes(dominioDigitado)) {
      return 'Professores devem utilizar um e-mail institucional (não são aceitos e-mails pessoais como Gmail, Hotmail, etc.).';
    }
  }

  return null;
}