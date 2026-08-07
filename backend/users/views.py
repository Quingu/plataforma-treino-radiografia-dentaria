from rest_framework import generics
from users.models import Usuario
from users.serializers import UsuarioSerializador

class UsuarioDeRegistroDaAPIView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializador