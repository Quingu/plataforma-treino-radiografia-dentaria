from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# import para o Swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="API da Plataforma de Treino de Radiografia Dentária",
        default_version='v1',
        description="Documentação oficial dos endpoints de Autenticação, 2FA e Gestão de Casos Clínicos.",
        contact=openapi.Contact(email="contato@radiodent.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.rotas.api_urls')),
    path('api/radiografias/', include('radiografias.rotas.api_urls')),
    path('api/turmas/', include('turmas.urls')),

    # rotas do Swagger e Redoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)