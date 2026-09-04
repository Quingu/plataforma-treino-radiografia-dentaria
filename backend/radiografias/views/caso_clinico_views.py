from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from radiografias.models import CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura

class ListarCriarCasoClinicoView(generics.ListCreateAPIView):
    queryset = CasoClinico.objects.all().order_by('-criado_em')
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated, EhProfessorOuSomenteLeitura]
    #para aceitar o upload de imagens
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = super().get_queryset()
        regiao = self.request.query_params.get('regiao_anatomica')
        if regiao:
            queryset = queryset.filter(regiao_anatomica=regiao)
        return queryset

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class DetalheCasoClinicoView(generics.RetrieveAPIView):
    queryset = CasoClinico.objects.all()
    serializer_class = SerializadorCasoClinico
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk' #pk se refere a chave primaria