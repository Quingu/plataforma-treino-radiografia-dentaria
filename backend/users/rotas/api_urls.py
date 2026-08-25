from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views.registro_views import VisaoDeRegistroDeUsuario
from users.views.recuperacao_views import VisaoSolicitarRecuperacaoSenha, VisaoRedefinirSenha
from users.seguranca.limitadores import BloqueioDeForcaBruta
from users.views.seguranca_2fa_views import VisaoConfigurar2FA, VisaoVerificar2FA, VisaoConcluirLogin2FA
from users.serializers.login_serializers import SerializadorLoginCom2FA

class VisaoLoginProtegido(TokenObtainPairView):
    serializer_class = SerializadorLoginCom2FA
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self):
        return [limitador() for limitador in self.classes_de_limitacao]

urlpatterns = [
    # Rotas de Cadastro e Login Protegido
    path('registro/', VisaoDeRegistroDeUsuario.as_view(), name='registro-de-usuario'),
    path('login/', VisaoLoginProtegido.as_view(), name='obter-token-de-login'),
    path('token/atualizar/', TokenRefreshView.as_view(), name='atualizar-token'),
    # Rotas do 2fa
    path('2fa/configurar/', VisaoConfigurar2FA.as_view(), name='configurar-2fa'),
    path('2fa/verificar/', VisaoVerificar2FA.as_view(), name='verificar-2fa'),
    path('login/2fa/', VisaoConcluirLogin2FA.as_view(), name='concluir-login-2fa'),
    # Rotas de Recuperação de Senha Protegidas
    path('recuperar-senha/solicitar/', VisaoSolicitarRecuperacaoSenha.as_view(), name='solicitar-recuperacao'),
    path('recuperar-senha/redefinir/', VisaoRedefinirSenha.as_view(), name='redefinir-senha'),
]