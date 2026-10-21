from django.urls import path
from tarefas.views.tarefa_views import CriarListaTarefaView
from tarefas.views.resolucao_view import ResolverTarefaView

urlpatterns = [
    # Rota canônica: /api/tarefas/
    path('', CriarListaTarefaView.as_view(), name='listar-criar-tarefas'),
    path('<uuid:pk>/resolver/', ResolverTarefaView.as_view(), name='resolver-tarefa'),

    # Mantém compatibilidade com o prefixo duplicado antigo: /api/tarefas/tarefas/
    path('tarefas/', CriarListaTarefaView.as_view(), name='listar-criar-tarefas-legado'),
    path('tarefas/<uuid:pk>/resolver/', ResolverTarefaView.as_view(), name='resolver-tarefa-legado'),
]
