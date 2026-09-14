import { useRef, useState } from 'react';
import { atualizarPerfil, salvarUsuario } from '../services/api';

export default function usePerfilUsuario(usuario) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState('perfil');
  const [dados, setDados] = useState({
    nome: usuario?.nome || usuario?.nomeCompleto || 'Aluno',
    email: usuario?.email || '',
    fotoUrl: usuario?.foto_perfil_url || usuario?.fotoUrl || '',
    novaSenha: '',
    confirmarSenha: '',
    fotoArquivo: null
  });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [salvando, setSalvando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  
  const fotoInputRef = useRef(null);

  const abrir = (novoModo) => {
    setModo(novoModo);
    setMensagem({ tipo: '', texto: '' });
    setAberto(true);
  };

  const alterar = (novos) => 
    setDados(anterior => ({ ...anterior, ...novos }));

  const escolherFoto = (e) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      alterar({
        fotoArquivo: arquivo,
        fotoUrl: URL.createObjectURL(arquivo)
      });
    }
  };

  const solicitar = (e) => {
    e.preventDefault();
    if (modo === 'senha' && dados.novaSenha !== dados.confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não conferem.' });
      return;
    }
    setConfirmar(true);
  };

  const salvar = async () => {
    setConfirmar(false);
    setSalvando(true);
    try {
      const perfil = await atualizarPerfil({
        nome: dados.nome,
        novaPassword: modo === 'senha' ? dados.novaSenha : '',
        fotoPerfil: dados.fotoArquivo
      });
      
      salvarUsuario({
        ...usuario,
        nome: perfil.nome,
        email: perfil.email,
        perfil: perfil.perfil,
        foto_perfil_url: perfil.foto_perfil_url
      });
      
      alterar({
        nome: perfil.nome || dados.nome,
        email: perfil.email || dados.email,
        fotoUrl: perfil.foto_perfil_url || dados.fotoUrl,
        novaSenha: '',
        confirmarSenha: '',
        fotoArquivo: null
      });
      
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso.' });
    } catch (e) {
      setMensagem({ 
        tipo: 'erro', 
        texto: e.message || 'Não foi possível atualizar o perfil.' 
      });
    } finally {
      setSalvando(false);
    }
  };

  return {
    aberto,
    setAberto,
    modo,
    dados,
    mensagem,
    salvando,
    confirmar,
    setConfirmar,
    fotoInputRef,
    abrir,
    alterar,
    escolherFoto,
    solicitar,
    salvar
  };
}