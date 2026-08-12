from django.urls import path
from radiografias.views.caso_clinico_views import VisaoListarCriarCasoClinico

urlpatterns = [
    path('casos-clinicos/', VisaoListarCriarCasoClinico.as_view(), name='listar-criar-casos'),
]