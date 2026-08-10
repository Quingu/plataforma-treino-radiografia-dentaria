import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.cache import cache
from users.models.usuario import Usuario

@pytest.mark.django_db
class TesteProtecaoForcaBruta:
    
    def setup_method(self):
        # Limpa o cache de requisições antes de cada teste para evitar falsos positivos
        cache.clear()
        
        self.cliente = APIClient()
        self.usuario = Usuario.objects.create_user(
            email='alvo.teste@email.com',
            password='SenhaSegura123!',
            nome='Usuário Alvo',
            perfil='aluno'
        )
        self.url_login = reverse('obter-token-de-login')
        self.url_recuperacao = reverse('solicitar-recuperacao')

    def teste_bloqueio_de_forca_bruta_no_login(self):
        dados_atacante = {
            'email': 'alvo.teste@email.com',
            'password': 'SenhaIncorreta'
        }
        
        # As 3 primeiras tentativas de login devem falhar normalmente
        for _ in range(3):
            resposta = self.cliente.post(self.url_login, dados_atacante)
            assert resposta.status_code == 401

        # Na quarta tentativa, no mesmo minuto, ele aciona a proteção de borda (Erro 429)
        resposta_bloqueada = self.cliente.post(self.url_login, dados_atacante)
        
        assert resposta_bloqueada.status_code == 429
        assert resposta_bloqueada.data['detail'].code == 'throttled' # Valida o código interno do erro

    def teste_bloqueio_de_forca_bruta_na_recuperacao_de_senha(self):
        dados_atacante = {'email': 'alvo.teste@email.com'}
        
        # As 3 primeiras solicitações de e-mail devem passar
        for _ in range(3):
            resposta = self.cliente.post(self.url_recuperacao, dados_atacante)
            assert resposta.status_code == 200
            
        resposta_bloqueada = self.cliente.post(self.url_recuperacao, dados_atacante)
        
        assert resposta_bloqueada.status_code == 429