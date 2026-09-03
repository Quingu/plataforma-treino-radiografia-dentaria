from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TurmaViewSet

router = DefaultRouter()
router.register(r'', TurmaViewSet, basename='turma')

urlpatterns = [
    path('', include(router.urls)),
]