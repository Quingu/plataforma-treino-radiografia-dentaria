from django.urls import path
from radiografias.views.caso_clinico_views import ListarCriarCasoClinicoView, DetalheCasoClinicoView

urlpatterns = [
    path('casos-clinicos/', ListarCriarCasoClinicoView.as_view(), name='listar-criar-casos'),
    path('radiografias/<uuid:pk>/', DetalheCasoClinicoView.as_view(), name='detalhe-radiografia'),
]