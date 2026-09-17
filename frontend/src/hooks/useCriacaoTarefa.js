import { useState } from 'react';
import useDesenhoMarcacao from './useDesenhoMarcacao';
import { criarTarefa } from '../services/api';

export default function useCriacaoTarefa(turmas = []) {
  const [radiografiaSelecionada, setRadiografiaSelecionada] = useState(null);
  const [detalhesTarefa, setDetalhesTarefa] = useState({
    titulo: '',
    instrucoes: '',
    turmaId: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const desenho = useDesenhoMarcacao();

  const iniciarCriacao = (radiografia) => {
    setRadiografiaSelecionada(radiografia);
    setMensagem(null);
    desenho.limpar();
  };

  const cancelarCriacao = () => {
    setRadiografiaSelecionada(null);
    setDetalhesTarefa({ titulo: '', instrucoes: '', turmaId: '' });
    setMensagem(null);
    desenho.limpar();
  };

  const salvarTarefa = async () => {
    if (
      !radiografiaSelecionada ||
      !desenho.marcacao?.width ||
      !detalhesTarefa.turmaId ||
      !detalhesTarefa.titulo.trim() ||
      !detalhesTarefa.instrucoes.trim()
    ) {
      setMensagem({
        tipo: 'erro',
        texto:
          'Informe a turma, as instruções e a marcação antes de salvar.',
      });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      await criarTarefa({
        casoClinico: radiografiaSelecionada.id,
        turma: detalhesTarefa.turmaId,
        instrucoes: `${detalhesTarefa.titulo.trim()}\n\n${detalhesTarefa.instrucoes.trim()}`,
        coordenadasGabarito: desenho.marcacao,
      });
      cancelarCriacao();
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível criar a tarefa.',
      });
    } finally {
      setSalvando(false);
    }
  };

  return {
    radiografiaSelecionada,
    iniciarCriacao,
    cancelarCriacao,
    detalhesTarefa,
    setDetalhesTarefa,
    desenho,
    turmas,
    salvando,
    mensagem,
    salvarTarefa,
  };
}