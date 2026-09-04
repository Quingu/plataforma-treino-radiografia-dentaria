from django.urls import path
from tarefas.views.tarefa_views import CriarListaTarefaView
from tarefas.views.resolucao_view import ResolverTarefaView

urlpatterns = [
    path('tarefas/', CriarListaTarefaView.as_view(), name='listar-criar-tarefas'),
    path('tarefas/<uuid:pk>/resolver/', ResolverTarefaView.as_view(), name='resolver-tarefa'),
]