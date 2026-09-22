from django.urls import path
from users.views.registro_views import RegistroDeUsuarioView
from users.views.recuperacao_views import SolicitarRecuperacaoSenhaView, RedefinirSenhaView
from users.views.seguranca_2fa_views import Configurar2FAView, Verificar2FAView
from users.views.perfil_views import PerfilUsuarioView
from users.views.autenticacao_views import (
    AtualizarTokenCookieView, ConcluirLogin2FAView, CSRFView, LogoutView, VisaoLoginProtegido,
)
from users.views.direitos_titular_views import ExportarMeusDadosView, SolicitarDireitoTitularView

urlpatterns = [
    path('registro/', RegistroDeUsuarioView.as_view(), name='registro-de-usuario'),
    path('login/', VisaoLoginProtegido.as_view(), name='obter-token-de-login'),
    path('csrf/', CSRFView.as_view(), name='csrf'),
    path('token/atualizar/', AtualizarTokenCookieView.as_view(), name='atualizar-token'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('2fa/configurar/', Configurar2FAView.as_view(), name='configurar-2fa'),
    path('2fa/verificar/', Verificar2FAView.as_view(), name='verificar-2fa'),
    path('login/2fa/', ConcluirLogin2FAView.as_view(), name='concluir-login-2fa'),
    path('recuperar-senha/solicitar/', SolicitarRecuperacaoSenhaView.as_view(), name='solicitar-recuperacao'),
    path('recuperar-senha/redefinir/', RedefinirSenhaView.as_view(), name='redefinir-senha'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil-usuario'),
    path('dados/exportar/', ExportarMeusDadosView.as_view(), name='exportar-meus-dados'),
    path('dados/solicitacoes/', SolicitarDireitoTitularView.as_view(), name='solicitar-direito-titular'),
]
