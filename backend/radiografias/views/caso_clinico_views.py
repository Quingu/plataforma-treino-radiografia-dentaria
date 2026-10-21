from django.db.models import Q
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from radiografias.models import AcessoRadiografia, CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura
from radiografias.services.acesso_radiografia_service import registrar_acesso_radiografia


def _casos_visiveis_para(usuario):
    # Itens institucionais são visíveis a todos; uploads privados ficam com o autor
    # e com os alunos das turmas em que o caso foi atribuído.
    if usuario.perfil == 'professor':
        return Q(visibilidade=CasoClinico.Visibilidade.COMPARTILHADA) | Q(
            professor=usuario
        )

    return (
        Q(visibilidade=CasoClinico.Visibilidade.COMPARTILHADA)
        | Q(tarefas__turma__alunos=usuario)
    )


class ListarCriarCasoClinicoView(generics.ListCreateAPIView):
    queryset = CasoClinico.objects.all().order_by('-criado_em')
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset().filter(
            _casos_visiveis_para(self.request.user)
        ).distinct()

        regiao = self.request.query_params.get('regiao_anatomica')
        if regiao:
            queryset = queryset.filter(regiao_anatomica=regiao)

        tipo_midia = self.request.query_params.get('tipo_midia')
        if tipo_midia:
            queryset = queryset.filter(tipo_midia=tipo_midia)

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
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]
    lookup_field = 'pk'

    def get_queryset(self):
        return super().get_queryset().filter(
            _casos_visiveis_para(self.request.user)
        ).distinct()

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
        if caso.professor_id != request.user.id:
            return Response(
                {'erro': 'Você não pode excluir um caso de outro professor.'},
                status=status.HTTP_403_FORBIDDEN
            )
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
