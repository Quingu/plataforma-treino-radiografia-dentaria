from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from radiografias.models import AcessoRadiografia, CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from users.seguranca.permissoes import EhProfessor
from radiografias.services.acesso_radiografia_service import registrar_acesso_radiografia

class ListarCriarCasoClinicoView(generics.ListCreateAPIView):
    queryset = CasoClinico.objects.all().order_by('-criado_em')
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessor]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset().filter(professor=self.request.user)
        regiao = self.request.query_params.get('regiao_anatomica')
        if regiao:
            queryset = queryset.filter(regiao_anatomica=regiao)
        return queryset

    def perform_create(self, serializer):
        caso = serializer.save(professor=self.request.user)
        registrar_acesso_radiografia(
            radiografia=caso,
            usuario=self.request.user,
            acao=AcessoRadiografia.Acao.INCLUSAO,
            origem='biblioteca_professor',
        )


class DetalheCasoClinicoView(generics.RetrieveDestroyAPIView):
    queryset = CasoClinico.objects.all()
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessor]
    lookup_field = 'pk'

    def get_queryset(self):
        return super().get_queryset().filter(professor=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        resposta = super().retrieve(request, *args, **kwargs)
        registrar_acesso_radiografia(
            radiografia=self.get_object(),
            usuario=request.user,
            acao=AcessoRadiografia.Acao.CONSULTA,
            origem='biblioteca_professor',
        )
        return resposta

    def destroy(self, request, *args, **kwargs):
        caso = self.get_object()
        if caso.tarefas.exists():
            return Response(
                {'erro': 'Não é possível excluir uma radiografia que já está vinculada a uma tarefa.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        registrar_acesso_radiografia(
            radiografia=caso,
            usuario=request.user,
            acao=AcessoRadiografia.Acao.EXCLUSAO,
            origem='biblioteca_professor',
        )
        return super().destroy(request, *args, **kwargs)
