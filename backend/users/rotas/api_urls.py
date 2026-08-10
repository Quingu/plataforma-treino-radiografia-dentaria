from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views.registro_views import VisaoDeRegistroDeUsuario
from users.views.recuperacao_views import VisaoSolicitarRecuperacaoSenha, VisaoRedefinirSenha
from users.seguranca.limitadores import BloqueioDeForcaBruta

class VisaoLoginProtegido(TokenObtainPairView):
    classes_de_limitacao = [BloqueioDeForcaBruta]

    def get_throttles(self):
        return [limitador() for limitador in self.classes_de_limitacao]

urlpatterns = [
    # Rotas de Cadastro e Login Protegido
    path('registro/', VisaoDeRegistroDeUsuario.as_view(), name='registro-de-usuario'),
    path('login/', VisaoLoginProtegido.as_view(), name='obter-token-de-login'),
    path('token/atualizar/', TokenRefreshView.as_view(), name='atualizar-token'),
    
    # Rotas de Recuperação de Senha Protegidas
    path('recuperar-senha/solicitar/', VisaoSolicitarRecuperacaoSenha.as_view(), name='solicitar-recuperacao'),
    path('recuperar-senha/redefinir/', VisaoRedefinirSenha.as_view(), name='redefinir-senha'),
]