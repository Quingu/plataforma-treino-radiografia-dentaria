from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from radiografias.models import CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura

class ListarCriarCasoClinicoView(generics.ListCreateAPIView):
    queryset = CasoClinico.objects.all().order_by('-criado_em')
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset()
        regiao = self.request.query_params.get('regiao_anatomica')
        if regiao:
            queryset = queryset.filter(regiao_anatomica=regiao)
        return queryset

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class DetalheCasoClinicoView(generics.RetrieveDestroyAPIView):
    queryset = CasoClinico.objects.all()
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]
    lookup_field = 'pk'

    def destroy(self, request, *args, **kwargs):
        caso = self.get_object()
        if caso.tarefas.exists():
            return Response(
                {'erro': 'Não é possível excluir uma radiografia que já está vinculada a uma tarefa.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
