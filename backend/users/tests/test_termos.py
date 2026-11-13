import pytest
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import ConsentimentoTermos, Usuario


@pytest.mark.django_db
class TesteVersionamentoDosTermos:

    def setup_method(self):
        self.cliente = APIClient()
        self.url = reverse('termos-de-uso')
        self.usuario = Usuario.objects.create_user(
            email='aluno.termos@email.com',
            password='SenhaForte123!',
            nome='Aluno Termos',
        )

    def test_get_anonimo_retorna_apenas_as_versoes_atuais(self):
        resposta = self.cliente.get(self.url)

        assert resposta.status_code == 200
        assert resposta.data['versao_termos'] == '1.0'
        assert resposta.data['versao_privacidade'] == '1.0'
        assert 'aceite_pendente' not in resposta.data

    def test_get_autenticado_sem_consentimento_marca_pendente(self):
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.get(self.url)

        assert resposta.status_code == 200
        assert resposta.data['aceite_pendente'] is True
        assert resposta.data['aceito_em'] is None

    def test_get_autenticado_com_versao_atual_nao_marca_pendente(self):
        ConsentimentoTermos.objects.create(
            usuario=self.usuario,
            versao_termos='1.0',
            versao_privacidade='1.0',
        )
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.get(self.url)

        assert resposta.data['aceite_pendente'] is False
        assert resposta.data['versao_termos_aceita'] == '1.0'
        assert resposta.data['aceito_em'] is not None

    @override_settings(VERSAO_TERMOS='1.1')
    def test_nova_versao_exige_novo_aceite(self):
        ConsentimentoTermos.objects.create(
            usuario=self.usuario,
            versao_termos='1.0',
            versao_privacidade='1.0',
        )
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.get(self.url)

        assert resposta.data['versao_termos'] == '1.1'
        assert resposta.data['aceite_pendente'] is True

    def test_post_sem_autenticacao_e_recusado(self):
        resposta = self.cliente.post(self.url, {'aceitou_termos': True}, format='json')

        assert resposta.status_code in (401, 403)
        assert ConsentimentoTermos.objects.count() == 0

    def test_post_sem_aceite_e_recusado(self):
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.post(self.url, {'aceitou_termos': False}, format='json')

        assert resposta.status_code == 400
        assert ConsentimentoTermos.objects.count() == 0

    def test_post_registra_aceite_da_versao_atual(self):
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.post(self.url, {'aceitou_termos': True}, format='json')

        assert resposta.status_code == 200
        assert resposta.data['aceite_pendente'] is False

        consentimento = ConsentimentoTermos.objects.get(usuario=self.usuario)
        assert consentimento.versao_termos == '1.0'
        assert consentimento.versao_privacidade == '1.0'

    @override_settings(VERSAO_TERMOS='2.0', VERSAO_PRIVACIDADE='2.0')
    def test_post_revoga_consentimento_anterior(self):
        anterior = ConsentimentoTermos.objects.create(
            usuario=self.usuario,
            versao_termos='1.0',
            versao_privacidade='1.0',
        )
        self.cliente.force_authenticate(self.usuario)

        resposta = self.cliente.post(self.url, {'aceitou_termos': True}, format='json')

        assert resposta.status_code == 200
        anterior.refresh_from_db()
        assert anterior.revogado_em is not None

        vigente = ConsentimentoTermos.objects.get(
            usuario=self.usuario, revogado_em__isnull=True
        )
        assert vigente.versao_termos == '2.0'


@pytest.mark.django_db
class TesteRegistroGravaVersaoDoServidor:

    @override_settings(VERSAO_TERMOS='3.0', VERSAO_PRIVACIDADE='3.0')
    def test_registro_ignora_versao_enviada_pelo_cliente(self):
        resposta = APIClient().post(
            reverse('registro-de-usuario'),
            {
                'email': 'novo.termos@email.com',
                'nome': 'Novo Termos',
                'tipo': 'aluno',
                'password': 'SenhaForte123!',
                'aceitou_termos': True,
                'versao_termos': '0.1',
                'versao_privacidade': '0.1',
            },
            format='json',
        )

        assert resposta.status_code == 201
        consentimento = ConsentimentoTermos.objects.get()
        assert consentimento.versao_termos == '3.0'
        assert consentimento.versao_privacidade == '3.0'
