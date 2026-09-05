import React from 'react';
import logoRadiodent from '../assets/logo_radiodent.jpeg';

export default function LogoMarca({ tamanho = 'md' }) {
  const medidas = tamanho === 'sm' ? 'w-9 h-9 rounded-xl' : 'w-12 h-12 rounded-2xl';

  return (
    <div className={`${medidas} bg-black border border-blue-500/30 flex items-center justify-center overflow-hidden`}>
      <img
        src={logoRadiodent}
        alt="RadioDent"
        draggable="false"
        className="w-full h-full object-contain p-1 pointer-events-none"
      />
    </div>
  );
}
