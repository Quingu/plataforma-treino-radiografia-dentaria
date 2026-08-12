from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from radiografias.models import CasoClinico
from radiografias.serializers.caso_clinico_serializers import SerializadorCasoClinico
from users.seguranca.permissoes import EhProfessorOuSomenteLeitura

class VisaoListarCriarCasoClinico(generics.ListCreateAPIView):
    queryset = CasoClinico.objects.all().order_by('-criado_em')
    serializer_class = SerializadorCasoClinico
    permission_classes = [EhProfessorOuSomenteLeitura]
    #para aceitar o upload de imagens
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)