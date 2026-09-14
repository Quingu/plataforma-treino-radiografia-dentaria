import { useState } from 'react';

export default function useBibliotecaRadiografias() {
  const [radiografias, setRadiografias] = useState([]);
  const [modalUpload, setModalUpload] = useState(false);
  const [busca, setBusca] = useState('');

  const carregarRadiografias = async () => {
    // Fetch da biblioteca
  };

  return { radiografias, carregarRadiografias, modalUpload, setModalUpload, busca, setBusca };
}