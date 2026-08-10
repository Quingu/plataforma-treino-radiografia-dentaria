import pytest
from users.serializers.registro_serializers import SerializadorDeUsuario

@pytest.mark.django_db
class TesteDoSerializadorDeUsuario:
    
    def teste_serializador_valida_dados_corretamente(self):
        dados = {
            'email': 'aluno.teste@email.com',
            'nome': 'Aluno Teste',
            'tipo': 'aluno',
            'password': 'SenhaSegura123'
        }
        serializador = SerializadorDeUsuario(data=dados)
        
        assert serializador.is_valid() is True
        
        usuario = serializador.save()
        
        assert usuario.email == dados['email']
        assert usuario.nome == dados['nome']
        assert usuario.perfil == dados['tipo'] 

    def teste_serializador_nao_retorna_senha_no_output(self):
        dados = {
            'email': 'aluno2.teste@email.com',
            'nome': 'Aluno Teste Dois',
            'tipo': 'aluno',
            'password': 'SenhaSegura123'
        }
        serializador = SerializadorDeUsuario(data=dados)
        
        assert serializador.is_valid() is True
        
        usuario = serializador.save()
        
        # Verifica se o campo 'password' foi omitido na serialização de saída
        saida_serializador = SerializadorDeUsuario(usuario)
        assert 'password' not in saida_serializador.data