from datetime import timedelta

from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken


class VerificacaoCSRF(CsrfViewMiddleware):
    def _reject(self, request, reason):
        return reason


def exigir_csrf(requisicao):
    if settings.DEBUG:
        return
    verificador = VerificacaoCSRF(lambda request: None)
    verificador.process_request(requisicao)
    motivo = verificador.process_view(requisicao, None, (), {})
    if motivo:
        raise exceptions.PermissionDenied(f'Validacao CSRF falhou: {motivo}')


# faz a autentição apenas tokens de acesso mantidos fora do JS
class AutenticacaoJWTCookie(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('access_token')
        if not token:
            return None

        token_validado = self.get_validated_token(token)
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            exigir_csrf(request)
        return self.get_user(token_validado), token_validado



class TokenTemporario2FA(AccessToken):
    token_type = '2fa'
    lifetime = timedelta(minutes=5)



# aceita exclusivamente o token temporario usado para concluir o 2FA
class Autenticacao2FACookie(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('login_2fa_token')
        if not token:
            return None
        exigir_csrf(request)
        token_validado = TokenTemporario2FA(token)
        return self.get_user(token_validado), token_validado
