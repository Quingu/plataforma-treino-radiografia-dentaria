import React from 'react';
import logoRadiodent from '../assets/logo_radiodent.png';

export default function LogoMarca({ tamanho = 'md' }) {
  const medidas = tamanho === 'sm' ? 'w-16 h-16' : 'w-32 h-32';

  return (
    <div className="flex items-center justify-center -mr-13">
      <img
        src={logoRadiodent}
        alt="RadioDent"
        draggable="false"
        className={`${medidas} object-contain pointer-events-none scale-125 saturate-200`}
      />
    </div>
  );
}