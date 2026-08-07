from django.urls import path
from users.views import UsuarioDeRegistroDaAPIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('registro/', UsuarioDeRegistroDaAPIView.as_view(), name='usuario-registro'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]