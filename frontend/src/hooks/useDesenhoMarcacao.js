import { useRef, useState } from 'react';

export default function useDesenhoMarcacao() {
  const imagemRef = useRef(null);
  const [marcacao, setMarcacao] = useState(null);
  const [inicio, setInicio] = useState(null);

  const ponto = (evento) => {
    const rect = imagemRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    return {
      x: Math.min(100, Math.max(0, ((evento.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((evento.clientY - rect.top) / rect.height) * 100))
    };
  };

  const iniciar = (evento) => {
    const novo = ponto(evento);
    if (!novo) return;
    
    setInicio(novo);
    setMarcacao({ 
      x: novo.x, 
      y: novo.y, 
      width: 0, 
      height: 0 
    });
  };

  const atualizar = (evento) => {
    if (!inicio) return;
    
    const novo = ponto(evento);
    if (!novo) return;
    
    setMarcacao({
      x: Math.min(inicio.x, novo.x),
      y: Math.min(inicio.y, novo.y),
      width: Math.abs(novo.x - inicio.x),
      height: Math.abs(novo.y - inicio.y)
    });
  };

  const limpar = () => {
    setInicio(null);
    setMarcacao(null);
  };

  return {
    imagemRef,
    marcacao,
    iniciar,
    atualizar,
    finalizar: () => setInicio(null),
    limpar
  };
}