import pytest
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import TokenDeRecuperacao, Usuario


@pytest.fixture(autouse=True)
def limpar_throttle():
    # O bloqueio de força bruta usa o cache compartilhado entre os testes.
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
class TesteEmailMinusculo:

    def test_create_user_grava_email_em_minusculo(self):
        usuario = Usuario.objects.create_user(
            email='  Aluno.Teste@Email.COM  ',
            password='SenhaForte123!',
        )

        assert usuario.email == 'aluno.teste@email.com'

        usuario.refresh_from_db()
        assert usuario.email == 'aluno.teste@email.com'

    def test_save_normaliza_email_atribuido_direto(self):
        usuario = Usuario.objects.create_user(
            email='professor@email.com',
            password='SenhaForte123!',
            perfil='professor',
        )

        usuario.email = 'Professor.Maiusculo@Email.com'
        usuario.save()

        usuario.refresh_from_db()
        assert usuario.email == 'professor.maiusculo@email.com'

    def test_natural_key_e_authenticate_ignoram_caixa(self):
        Usuario.objects.create_user(
            email='aluno.natural@email.com',
            password='SenhaForte123!',
        )

        encontrado = Usuario.objects.get_by_natural_key('ALUNO.NATURAL@EMAIL.COM')
        assert encontrado.email == 'aluno.natural@email.com'

        assert authenticate(
            email='Aluno.Natural@Email.com',
            password='SenhaForte123!',
        ) is not None

    def test_login_aceita_email_com_maiusculas(self):
        Usuario.objects.create_user(
            email='aluno.login@email.com',
            password='SenhaForte123!',
        )

        resposta = APIClient().post(
            reverse('obter-token-de-login'),
            {
                'email': 'Aluno.Login@EMAIL.com',
                'password': 'SenhaForte123!',
            },
            format='json',
        )

        assert resposta.status_code == 200
        assert resposta.data['usuario']['email'] == 'aluno.login@email.com'

    def test_registro_grava_email_em_minusculo(self):
        resposta = APIClient().post(
            reverse('registro-de-usuario'),
            {
                'email': 'Novo.Aluno@Email.COM',
                'nome': 'Novo Aluno',
                'tipo': 'aluno',
                'password': 'SenhaForte123!',
                'aceitou_termos': True,
                'versao_termos': '1.0',
                'versao_privacidade': '1.0',
            },
            format='json',
        )

        assert resposta.status_code == 201
        assert Usuario.objects.get().email == 'novo.aluno@email.com'

    def test_registro_recusa_duplicado_so_com_caixa_diferente(self):
        Usuario.objects.create_user(
            email='existente@email.com',
            password='SenhaForte123!',
        )

        resposta = APIClient().post(
            reverse('registro-de-usuario'),
            {
                'email': 'EXISTENTE@EMAIL.COM',
                'nome': 'Tentativa Duplicada',
                'tipo': 'aluno',
                'password': 'SenhaForte123!',
                'aceitou_termos': True,
                'versao_termos': '1.0',
                'versao_privacidade': '1.0',
            },
            format='json',
        )

        assert resposta.status_code == 400
        assert Usuario.objects.count() == 1

    def test_recuperacao_encontra_email_com_maiusculas(self, monkeypatch):
        usuario = Usuario.objects.create_user(
            email='aluno.esquecido@email.com',
            password='SenhaForte123!',
            nome='Aluno Esquecido',
        )

        monkeypatch.setattr(
            'users.views.recuperacao_views.enviar_email_brevo',
            lambda *args, **kwargs: (True, {}),
        )

        resposta = APIClient().post(
            reverse('solicitar-recuperacao'),
            {'email': 'Aluno.Esquecido@Email.COM'},
            format='json',
        )

        assert resposta.status_code == 200
        assert TokenDeRecuperacao.objects.filter(usuario=usuario).exists()
