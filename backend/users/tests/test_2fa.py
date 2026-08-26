import pytest
from rest_framework.test import APIClient
from users.models import Usuario
import pyotp

@pytest.mark.django_db
class TesteDeConfiguracao2FA:
    def setup_method(self):
        self.cliente = APIClient()
        
        self.usuario = Usuario.objects.create_user(
            email='aluno.2fa@email.com',
            password='SenhaSegura123',
            nome='Aluno 2FA',
            perfil='aluno'
        )
        
        self.cliente.force_authenticate(user=self.usuario)
        
        # rota que iremos usar
        self.url_configurar_2fa = '/api/auth/2fa/configurar/'

    def test_deve_gerar_chave_secreta_e_uri_para_qr_code(self):
        resposta = self.cliente.post(self.url_configurar_2fa, format='json')

        assert resposta.status_code == 200
        assert 'chave_secreta' in resposta.data
        assert 'uri_qr_code' in resposta.data
        
        uri = resposta.data['uri_qr_code']
        assert uri.startswith('otpauth://totp/')
        assert 'RadioDent' in uri
        assert 'aluno.2fa%40email.com' in uri or self.usuario.email in uri.replace('%40', '@')

    def test_nao_deve_permitir_configuracao_sem_estar_logado(self):
        self.cliente.logout()
        resposta = self.cliente.post(self.url_configurar_2fa, format='json')
        assert resposta.status_code == 401


@pytest.mark.django_db
class TesteDeVerificacao2FA:
    def setup_method(self):
        self.cliente = APIClient()
        
        self.usuario = Usuario.objects.create_user(
            email='aluno.verificacao@email.com',
            password='SenhaSegura123',
            nome='Aluno Verificacao',
            perfil='aluno'
        )
        self.usuario.gerar_chave_2fa()
        self.cliente.force_authenticate(user=self.usuario)
        
        # Endpoint de verificação
        self.url_verificar_2fa = '/api/auth/2fa/verificar/'

    def test_deve_validar_codigo_totp_correto_com_sucesso(self):
        totp = pyotp.TOTP(self.usuario.chave_secreta_2fa)
        codigo_valido = totp.now()
        dados = {'codigo': codigo_valido}
        resposta = self.cliente.post(self.url_verificar_2fa, dados, format='json')

        assert resposta.status_code == 200
        assert resposta.data['mensagem'] == 'Código 2FA verificado com sucesso.'

    def test_deve_rejeitar_codigo_totp_invalido(self):
        dados = {'codigo': '000000'}
        resposta = self.cliente.post(self.url_verificar_2fa, dados, format='json')

        assert resposta.status_code == 400
        assert 'codigo' in resposta.data