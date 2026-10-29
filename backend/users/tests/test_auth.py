import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from users.models import Usuario

@pytest.mark.django_db
class TesteDeAutenticacaoJWT:
    def setup_method(self):
        self.cliente = APIClient()

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
        # Os tokens JWT são entregues em cookies httpOnly, não no corpo.
        assert 'access_token' in resposta.cookies
        assert 'refresh_token' in resposta.cookies
        assert resposta.data['usuario']['email'] == 'aluno.login@email.com'


@pytest.mark.django_db
class TesteDeCookieDeAcessoInvalido:
    """Cookie antigo/expirado não pode bloquear cadastro e login."""

    def setup_method(self):
        self.cliente = APIClient()
        self.cliente.cookies['access_token'] = 'token-antigo-invalido'
        self.url_registro = reverse('registro-de-usuario')

    def test_registro_funciona_mesmo_com_cookie_de_acesso_invalido(self):
        resposta = self.cliente.post(
            self.url_registro,
            {
                'email': 'novo.aluno@email.com',
                'nome': 'Novo Aluno',
                'password': 'SenhaSegura123@',
                'tipo': 'aluno',
                'aceitou_termos': True,
                'versao_termos': '1.0',
                'versao_privacidade': '1.0',
            },
            format='json',
        )

        assert resposta.status_code == 201
        assert Usuario.objects.filter(email='novo.aluno@email.com').exists()

    def test_rota_protegida_continua_retornando_401(self):
        resposta = self.cliente.get(reverse('perfil-usuario'))

        assert resposta.status_code == 401
     