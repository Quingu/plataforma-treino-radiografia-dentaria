from rest_framework import generics
from users.models import Usuario
from users.serializers.registro_serializers import SerializadorDeUsuario

class RegistroDeUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = SerializadorDeUsuario