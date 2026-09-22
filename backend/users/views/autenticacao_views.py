from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from users.models import LogAcesso
from users.seguranca.autenticacao import Autenticacao2FACookie, exigir_csrf
from users.seguranca.cookies import definir_cookie, definir_cookies_jwt, limpar_cookies_jwt
from users.seguranca.limitadores import BloqueioDeForcaBruta
from users.serializers.login_serializers import SerializadorLoginCom2FA
from users.services.auditoria_service import registrar_acesso


class VisaoLoginProtegido(TokenObtainPairView):
    serializer_class = SerializadorLoginCom2FA
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self):
        return [limitador() for limitador in self.classes_de_limitacao]

    def post(self, request, *args, **kwargs):
        exigir_csrf(request)
        email = request.data.get('email', '')

        try:
            resposta = super().post(request, *args, **kwargs)
        except AuthenticationFailed:
            registrar_acesso(request, LogAcesso.Evento.LOGIN_FALHOU, email=email)
            raise

        usuario = resposta.data.get('usuario', {})
        if resposta.data.get('requer_2fa'):
            token_temporario = resposta.data.pop('token_temporario')
            definir_cookie(resposta, 'login_2fa_token', token_temporario, 300)
            registrar_acesso(
                request,
                LogAcesso.Evento.LOGIN_2FA_PENDENTE,
                usuario_id=usuario.get('id'),
                email=usuario.get('email', email),
            )
            return resposta

        access = resposta.data.pop('access')
        refresh = resposta.data.pop('refresh')
        definir_cookies_jwt(resposta, access, refresh)
        registrar_acesso(
            request,
            LogAcesso.Evento.LOGIN_SUCESSO,
            usuario_id=usuario.get('id'),
            email=usuario.get('email', email),
        )
        return resposta


class ConcluirLogin2FAView(APIView):
    authentication_classes = [Autenticacao2FACookie]
    permission_classes = [IsAuthenticated]

    def post(self, requisicao):
        from users.serializers.seguranca_2fa_serializers import SerializadorVerificacao2FA
        import pyotp

        serializador = SerializadorVerificacao2FA(data=requisicao.data)
        serializador.is_valid(raise_exception=True)
        usuario = requisicao.user
        totp = pyotp.TOTP(usuario.obter_chave_2fa())

        if not usuario.chave_secreta_2fa or not totp.verify(
            serializador.validated_data['codigo'], valid_window=1
        ):
            registrar_acesso(
                requisicao,
                LogAcesso.Evento.LOGIN_2FA_FALHOU,
                usuario=usuario,
                email=usuario.email,
            )
            return Response(
                {'codigo': ['Codigo 2FA invalido ou expirado.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(usuario)
        resposta = Response({
            'usuario': {
                'id': usuario.id,
                'nome': usuario.nome,
                'email': usuario.email,
                'perfil': usuario.perfil,
                'foto_perfil_url': usuario.foto_perfil.url if usuario.foto_perfil else '',
            },
            'mensagem': 'Login realizado com sucesso.',
        })
        definir_cookies_jwt(resposta, str(refresh.access_token), str(refresh))
        resposta.delete_cookie('login_2fa_token', path='/')
        registrar_acesso(
            requisicao,
            LogAcesso.Evento.LOGIN_SUCESSO,
            usuario=usuario,
            email=usuario.email,
        )
        return resposta


class AtualizarTokenCookieView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        exigir_csrf(request)
        valor_refresh = request.COOKIES.get('refresh_token')
        if not valor_refresh:
            raise AuthenticationFailed('Sessao expirada.')

        refresh = RefreshToken(valor_refresh)
        resposta = Response({'mensagem': 'Sessao atualizada.'})
        definir_cookie(resposta, 'access_token', str(refresh.access_token), 900)
        return resposta


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        exigir_csrf(request)
        valor_refresh = request.COOKIES.get('refresh_token')
        if valor_refresh:
            try:
                RefreshToken(valor_refresh).blacklist()
            except AttributeError:
                pass
            except Exception:
                pass

        if request.user and request.user.is_authenticated:
            registrar_acesso(
                request, LogAcesso.Evento.LOGOUT, usuario=request.user, email=request.user.email
            )
        resposta = Response(status=status.HTTP_204_NO_CONTENT)
        return limpar_cookies_jwt(resposta)


class CSRFView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({'csrfToken': get_token(request)})
