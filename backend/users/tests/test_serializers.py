import pytest
from users.serializers import UsuarioSerializador

@pytest.mark.django_db
class TesteUsuarioSerializador:
    def test_serializer_valida_dados_corretamente(self):
        dados = {
            'email': 'aluno.teste@email.com',
            'nome': 'Aluno Teste',
            'tipo': 'aluno',
            'password': 'SenhaSegura123'
        }
        serializador = UsuarioSerializador(data=dados)
        assert serializador.is_valid() is True
        usuario = serializador.save()
        assert usuario.email == dados['email']
        assert usuario.nome == dados['nome']
        assert usuario.tipo == dados['tipo']

    def test_serializer_nao_retorna_senha_no_output(self):
        dados = {
            'email': 'aluno2.teste@email.com',
            'nome': 'Aluno Teste Dois',
            'tipo': 'aluno',
            'password': 'SenhaSegura123'
        }
        serializador = UsuarioSerializador(data=dados)
        assert serializador.is_valid() is True
        usuario = serializador.save()
        
        # Verifica se o campo 'password' foi omitido na serialização de saída
        saida_serializador = UsuarioSerializador(usuario)
        assert 'password' not in saida_serializador.data