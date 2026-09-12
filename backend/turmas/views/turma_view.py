from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from turmas.models import Turma
from turmas.serializers import TurmaSerializer

class TurmaView(viewsets.ModelViewSet):
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Professor vê as próprias turmas; aluno vê só as turmas em que entrou.
    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'professor':
            return Turma.objects.filter(professor=user)
        return Turma.objects.filter(alunos=user)

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

    @action(detail=True, methods=['post'], url_path='enrollments')
    def matricular_aluno(self, request, pk=None):
        try:
            turma = Turma.objects.get(pk=pk)
        except Turma.DoesNotExist:
            return Response({"erro": "Turma não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        codigo_informado = request.data.get('codigo_convite')

        if not codigo_informado:
            return Response({"erro": "O código de convite é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        if turma.codigo_convite != codigo_informado:
            return Response({"erro": "Código de convite inválido."}, status=status.HTTP_400_BAD_REQUEST)

        turma.alunos.add(request.user)
        return Response({"mensagem": "Matrícula realizada com sucesso!"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='entrar')
    # Entrada do aluno usando o código que o professor compartilhou.
    def entrar_por_codigo(self, request):
        codigo_informado = request.data.get('codigo_convite')

        if not codigo_informado:
            return Response({"erro": "O código da turma é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            turma = Turma.objects.get(codigo_convite=codigo_informado.strip().upper())
        except Turma.DoesNotExist:
            return Response({"erro": "Código de turma inválido."}, status=status.HTTP_400_BAD_REQUEST)

        turma.alunos.add(request.user)
        return Response(TurmaSerializer(turma, context={'request': request}).data, status=status.HTTP_200_OK)
