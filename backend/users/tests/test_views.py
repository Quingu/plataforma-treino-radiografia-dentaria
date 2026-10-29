import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from users.models import Usuario

@pytest.mark.django_db
class TesteUsuarioAPIView:
    def setup_method(self):
        self.cliente = APIClient()

        self.url_registro = reverse('registro-de-usuario')

    def test_deve_cadastrar_novo_usuario_com_sucesso(self):
        dados = {
            'email': 'novo.usuario@email.com',
            'nome': 'Novo Usuário Teste',
            'tipo': 'aluno',
            'password': 'SenhaForte123',
            'aceitou_termos': True,
            'versao_termos': '1.0',
            'versao_privacidade': '1.0',
        }
        resposta = self.cliente.post(self.url_registro, dados, format='json')
        
        assert resposta.status_code == 201
        assert Usuario.objects.count() == 1
        assert Usuario.objects.get().email == 'novo.usuario@email.com'

    def test_email_ja_cadastrado_nao_revela_que_a_conta_existe(self):
        Usuario.objects.create_user(
            email='existente@email.com',
            password='SenhaForte123',
            nome='Usuário Existente',
            perfil='aluno',
        )

        dados = {
            'email': 'existente@email.com',
            'nome': 'Tentativa Duplicada',
            'tipo': 'aluno',
            'password': 'SenhaForte123',
            'aceitou_termos': True,
            'versao_termos': '1.0',
            'versao_privacidade': '1.0',
        }
        resposta = self.cliente.post(self.url_registro, dados, format='json')

        assert resposta.status_code == 400
        # Nenhuma mensagem pode confirmar que o e-mail já está cadastrado.
        corpo = str(resposta.data).lower()
        assert 'já existe' not in corpo
        assert 'ja existe' not in corpo
        assert 'existente@email.com' not in corpo
        assert Usuario.objects.count() == 1