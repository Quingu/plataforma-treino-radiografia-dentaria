from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from tarefas.models import Tarefa
from tarefas.serializers.tarefa_serializers import TarefaSerializer
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura

class CriarListaTarefaView(generics.ListCreateAPIView):
    queryset = Tarefa.objects.all().order_by('-criado_em')
    serializer_class = TarefaSerializer
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]