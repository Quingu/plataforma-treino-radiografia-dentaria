from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users.serializers.perfil_serializers import PerfilUsuarioSerializer

class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = PerfilUsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = PerfilUsuarioSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()

        nova_senha = request.data.get('nova_password')
        if nova_senha:
            if len(nova_senha) < 8:
                return Response({'erro': 'A senha deve ter pelo menos 8 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
            usuario.set_password(nova_senha)
            usuario.save()

        return Response(PerfilUsuarioSerializer(usuario, context={'request': request}).data)
