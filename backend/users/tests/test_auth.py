import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from users.models import Usuario

@pytest.mark.django_db
class TesteDeAutenticacaoJWT:
    def setup_method(self):
        self.cliente = APIClient()
        
        # cria um usuario para testarmos a vallidação
        self.usuario = Usuario.objects.create_user(
            email='aluno.login@email.com',
            password='SenhaSegura123',
            nome='Aluno Login',
            perfil='aluno'
        )
        self.url_token = reverse('obter-token-de-login')

    def test_deve_gerar_tokens_jwt_com_credenciais_validas(self):
        dados = {
            'email': 'aluno.login@email.com',
            'password': 'SenhaSegura123'
        }
        resposta = self.cliente.post(self.url_token, dados, format='json')
        
        assert resposta.status_code == 200
        assert 'access' in resposta.data
        assert 'refresh' in resposta.data
     