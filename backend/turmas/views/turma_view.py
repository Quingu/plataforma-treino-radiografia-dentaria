from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from turmas.models import Turma
from turmas.serializers import TurmaSerializer

class TurmaViewSet(viewsets.ModelViewSet):
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'Professor':
            return Turma.objects.filter(professor=user)
        return Turma.objects.all()

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

    @action(detail=True, methods=['post'], url_path='enrollments')
    def matricular_aluno(self, request, pk=None):
        turma = self.get_object()
        codigo_informado = request.data.get('codigo_convite')

        if not codigo_informado:
            return Response({"erro": "O código de convite é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        if turma.codigo_convite != codigo_informado:
            return Response({"erro": "Código de convite inválido."}, status=status.HTTP_400_BAD_REQUEST)

        turma.alunos.add(request.user)
        return Response({"mensagem": "Matrícula realizada com sucesso!"}, status=status.HTTP_200_OK)