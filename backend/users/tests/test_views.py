import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from users.models import Usuario

@pytest.mark.django_db
class TesteUsuarioAPIView:
    def setup_method(self):
        self.cliente = APIClient()

        # Definiremos a URL com o nome usuario-registro no arquivo de rotas
        self.url_registro = reverse('usuario-registro')

    def test_deve_cadastrar_novo_usuario_com_sucesso(self):
        dados = {
            'email': 'novo.usuario@email.com',
            'nome': 'Novo Usuário Teste',
            'tipo': 'aluno',
            'password': 'SenhaForte123'
        }
        resposta = self.cliente.post(self.url_registro, dados, format='json')
        
        assert resposta.status_code == 201
        assert Usuario.objects.count() == 1
        assert Usuario.objects.get().email == 'novo.usuario@email.com'