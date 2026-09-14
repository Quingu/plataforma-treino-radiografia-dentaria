import { useState } from 'react';

export default function useCriacaoTarefa() {
  const [radiografiaSelecionada, setRadiografiaSelecionada] = useState(null);
  const [detalhesTarefa, setDetalhesTarefa] = useState({ titulo: '', instrucoes: '', turmaId: '' });
  
  const iniciarCriacao = (radiografia) => {
    setRadiografiaSelecionada(radiografia);
  };

  const cancelarCriacao = () => {
    setRadiografiaSelecionada(null);
    setDetalhesTarefa({ titulo: '', instrucoes: '', turmaId: '' });
  };

  return { radiografiaSelecionada, iniciarCriacao, cancelarCriacao, detalhesTarefa, setDetalhesTarefa };
}