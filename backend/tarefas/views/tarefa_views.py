from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tarefas.models import Tarefa
from tarefas.serializers.tarefa_serializers import TarefaSerializer
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura

class CriarListaTarefaView(generics.ListCreateAPIView):
    serializer_class = TarefaSerializer
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]

    # Cada perfil recebe somente as tarefas que fazem sentido para ele.
    def get_queryset(self):
        user = self.request.user
        queryset = Tarefa.objects.select_related('caso_clinico', 'turma').order_by('-criado_em')

        if user.perfil == 'professor':
            return queryset.filter(turma__professor=user)

        return queryset.filter(turma__alunos=user)
