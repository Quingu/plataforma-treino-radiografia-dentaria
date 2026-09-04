from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurmaView

router = DefaultRouter()
router.register(r'', TurmaView, basename='turma')

urlpatterns = [
    path('', include(router.urls)),
]