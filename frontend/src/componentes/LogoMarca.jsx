import React from 'react';
import logoRadiodent from '../assets/logo_radiodent.png';

export default function LogoMarca({ tamanho = 'md' }) {
  const medidas = tamanho === 'sm' ? 'w-16 h-16' : 'w-32 h-32';

  // A imagem tem bastante margem transparente. O recuo negativo aproxima o
  // texto da logo, mas precisa acompanhar o tamanho: com o valor grande no
  // tamanho pequeno (cabeçalho do aluno) o texto ficava sobre a imagem.
  const recuo = tamanho === 'sm' ? '-mr-7' : '-mr-13';

  return (
    <div className={`flex items-center justify-center ${recuo}`}>
      <img
        src={logoRadiodent}
        alt="RadioDent"
        draggable="false"
        className={`${medidas} object-contain pointer-events-none scale-125 saturate-200`}
      />
    </div>
  );
}