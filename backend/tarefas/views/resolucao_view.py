from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from tarefas.models.tarefa import Tarefa
from tarefas.serializers.resolucao_serializers import ResolucaoSerializer

class ResolverTarefaView(generics.CreateAPIView):
    serializer_class = ResolucaoSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        tarefa = get_object_or_404(Tarefa, pk=pk)

        if request.user.perfil != 'aluno' or not tarefa.turma.alunos.filter(id=request.user.id).exists():
            return Response(
                {'erro': 'Você não tem acesso a esta tarefa.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            resolucao = serializer.save(tarefa=tarefa, aluno=request.user)
            resolucao.avaliar_acerto()
            return Response(ResolucaoSerializer(resolucao).data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)