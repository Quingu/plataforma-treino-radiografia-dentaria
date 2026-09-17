import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  criarCasoClinico,
  excluirCasoClinico,
  listarCasosClinicos,
  resolverUrlImagem,
} from '../services/api';

export default function useBibliotecaRadiografias() {
  const [radiografias, setRadiografias] = useState([]);
  const [modalUpload, setModalUpload] = useState(false);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const carregarRadiografias = useCallback(async () => {
    try {
      const dados = await listarCasosClinicos();
      const lista = Array.isArray(dados) ? dados : [];
      
      setRadiografias(
        lista.map((caso) => ({
          ...caso,
          url: resolverUrlImagem(caso.imagem_url || caso.imagem),
        }))
      );
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível carregar a biblioteca.',
      });
      setRadiografias([]);
    }
  }, []);

  useEffect(() => {
    carregarRadiografias();
  }, [carregarRadiografias]);

  const realizarUpload = async ({ titulo, arquivo }) => {
    setSalvando(true);
    setMensagem(null);
    try {
      const novoCaso = await criarCasoClinico({
        titulo: titulo.trim(),
        descricao: titulo.trim(),
        regiaoAnatomica: 'geral',
        imagem: arquivo,
      });

      setRadiografias((atuais) => [
        {
          ...novoCaso,
          url: resolverUrlImagem(novoCaso.imagem_url || novoCaso.imagem),
        },
        ...atuais,
      ]);

      setModalUpload(false);
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível enviar a radiografia.',
      });
    } finally {
      setSalvando(false);
    }
  };

  const removerRadiografia = async (id) => {
    try {
      await excluirCasoClinico(id);
      setRadiografias((atuais) =>
        atuais.filter((radiografia) => radiografia.id !== id)
      );
    } catch (erro) {
      setMensagem({
        tipo: 'erro',
        texto: erro.message || 'Não foi possível excluir a radiografia.',
      });
    }
  };

  const filtradas = useMemo(() => {
    const listaSegura = Array.isArray(radiografias) ? radiografias : [];
    const termo = busca.trim().toLocaleLowerCase();
    
    if (!termo) return listaSegura;

    return listaSegura.filter((radiografia) =>
      [radiografia.titulo, radiografia.descricao, radiografia.regiao_anatomica]
        .filter(Boolean)
        .some((valor) => valor.toLocaleLowerCase().includes(termo))
    );
  }, [busca, radiografias]);

  return {
    radiografias,
    filtradas,
    carregarRadiografias,
    modalUpload,
    setModalUpload,
    busca,
    setBusca,
    salvando,
    mensagem,
    realizarUpload,
    excluirRadiografia: removerRadiografia,
  };
}