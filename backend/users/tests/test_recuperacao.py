import pytest
from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework.test import APIClient
from django.core import mail
from users.models import Usuario, TokenDeRecuperacao

@pytest.mark.django_db
class TesteRecuperacaoDeSenha:
    
    def setup_method(self):
        self.cliente = APIClient()
        
        # Cria um usuário padrão para os testes
        self.usuario = Usuario.objects.create_user(
            email='aluno.esquecido@email.com',
            password='SenhaAntiga123!',
            nome='Aluno Esquecido',
            perfil='aluno'
        )
        
        # URLs baseadas nos nomes definidos no api_urls.py
        self.url_solicitar = reverse('solicitar-recuperacao')
        self.url_redefinir = reverse('redefinir-senha')

    def teste_solicitar_recuperacao_com_email_valido_gera_token_e_envia_email(self):
        resposta = self.cliente.post(self.url_solicitar, {'email': 'aluno.esquecido@email.com'})
        
        assert resposta.status_code == 200
        assert len(mail.outbox) == 1 
        assert 'Recuperação de Senha' in mail.outbox[0].subject
        
        # Garante que o token foi salvo no banco
        assert TokenDeRecuperacao.objects.filter(usuario=self.usuario).exists() is True

    def teste_solicitar_recuperacao_com_email_invalido_nao_envia_email_mas_retorna_200(self):
        resposta = self.cliente.post(self.url_solicitar, {'email': 'fantasma@email.com'})
        
        assert resposta.status_code == 200
        assert len(mail.outbox) == 0 # Nenhum e-mail deve ser enviado

    def teste_redefinir_senha_com_token_valido_e_senha_forte(self):
        token_obj = TokenDeRecuperacao.objects.create(usuario=self.usuario)
        
        dados = {
            'token': str(token_obj.token),
            'nova_password': 'NovaSenhaForte2026@'
        }
        
        resposta = self.cliente.post(self.url_redefinir, dados)
        assert resposta.status_code == 200
        
        # Verifica se a senha realmente mudou no banco de dados
        self.usuario.refresh_from_db()
        assert self.usuario.check_password('NovaSenhaForte2026@') is True
        
        # Verifica se o token foi marcado como utilizado
        token_obj.refresh_from_db()
        assert token_obj.utilizado is True

    def teste_redefinir_senha_falha_com_senha_fraca(self):
        token_obj = TokenDeRecuperacao.objects.create(usuario=self.usuario)
        
        dados = {
            'token': str(token_obj.token),
            'nova_password': 'senhafraca'
        }
        
        resposta = self.cliente.post(self.url_redefinir, dados)
        assert resposta.status_code == 400
        
        # A senha antiga deve continuar ativa
        self.usuario.refresh_from_db()
        assert self.usuario.check_password('SenhaAntiga123!') is True

    def teste_redefinir_senha_falha_com_token_expirado(self):
        token_obj = TokenDeRecuperacao.objects.create(usuario=self.usuario)
        
        token_obj.criado_em = timezone.now() - timedelta(minutes=20)
        token_obj.save()
        
        dados = {
            'token': str(token_obj.token),
            'nova_password': 'NovaSenhaForte2026@'
        }
        
        resposta = self.cliente.post(self.url_redefinir, dados)
        assert resposta.status_code == 400
        assert 'token' in resposta.data 