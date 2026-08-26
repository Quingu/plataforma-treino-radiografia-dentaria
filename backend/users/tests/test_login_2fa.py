import pytest
from rest_framework.test import APIClient
from users.models.usuario import Usuario
import pyotp

@pytest.mark.django_db
class TesteLoginCom2FA:
    def setup_method(self):
        self.cliente = APIClient()
        self.url_login = '/api/auth/login/'

        self.usuario_com_2fa = Usuario.objects.create_user(
            email='com.2fa@email.com',
            password='SenhaSegura123',
            nome='Usuario Com 2FA',
            perfil='aluno'
        )
        self.usuario_com_2fa.gerar_chave_2fa()

        self.usuario_sem_2fa = Usuario.objects.create_user(
            email='sem.2fa@email.com',
            password='SenhaSegura123',
            nome='Usuario Sem 2FA',
            perfil='aluno'
        )

    def test_login_usuario_com_2fa_deve_exigir_segundo_fator(self):
        dados = {
            'email': 'com.2fa@email.com',
            'password': 'SenhaSegura123'
        }
        resposta = self.cliente.post(self.url_login, dados, format='json')

        assert resposta.status_code == 200
        assert resposta.data.get('requer_2fa') is True
        assert 'token_temporario' in resposta.data

    def test_login_usuario_sem_2fa_deve_retornar_tokens_jwt_normalmente(self):
        dados = {
            'email': 'sem.2fa@email.com',
            'password': 'SenhaSegura123'
        }
        resposta = self.cliente.post(self.url_login, dados, format='json')

        assert resposta.status_code == 200
        assert 'access' in resposta.data
        assert resposta.data.get('requer_2fa', False) is False


    def test_deve_concluir_login_com_sucesso_enviando_token_temporario_e_codigo_totp(self):
        
        dados_login = {
            'email': 'com.2fa@email.com',
            'password': 'SenhaSegura123'
        }
        resposta_login = self.cliente.post(self.url_login, dados_login, format='json')
        token_temporario = resposta_login.data.get('token_temporario')
        
        # gera um código TOTP válido
        totp = pyotp.TOTP(self.usuario_com_2fa.chave_secreta_2fa)
        codigo_valido = totp.now()

        url_concluir_login = '/api/auth/login/2fa/'
        
        self.cliente.credentials(HTTP_AUTHORIZATION=f'Bearer {token_temporario}')
        
        dados_verificacao = {'codigo': codigo_valido}
        resposta_final = self.cliente.post(url_concluir_login, dados_verificacao, format='json')

        assert resposta_final.status_code == 200
        assert 'access' in resposta_final.data
        assert 'refresh' in resposta_final.data