from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import pyotp

from users.serializers.seguranca_2fa_serializers import SerializadorVerificacao2FA

class Configurar2FAView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, requisicao):
        usuario = requisicao.user

        if not usuario.chave_secreta_2fa:
            usuario.gerar_chave_2fa()
            
        # Gera a uri que o frontavi transformar em QR Code
        uri_qr_code = pyotp.totp.TOTP(usuario.chave_secreta_2fa).provisioning_uri(
            name=usuario.email, 
            issuer_name='RadioDent'
        )
        
        return Response({
            'chave_secreta': usuario.chave_secreta_2fa,
            'uri_qr_code': uri_qr_code,
            'mensagem': 'Leia o QR Code com seu aplicativo autenticador.'
        })


class Verificar2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, requisicao):
        serializador = SerializadorVerificacao2FA(data=requisicao.data)
        serializador.is_valid(raise_exception=True)
        
        codigo = serializador.validated_data['codigo']
        usuario = requisicao.user
        
        if not usuario.chave_secreta_2fa:
            return Response(
                {'erro': '2FA não configurado para este usuário.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        totp = pyotp.TOTP(usuario.chave_secreta_2fa)
        
       # verifica com uma margem de 30s
        if totp.verify(codigo):
            return Response(
                {'mensagem': 'Código 2FA verificado com sucesso.'}, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'codigo': ['Código inválido ou expirado.']}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class ConcluirLogin2FAView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, requisicao):
        serializador = SerializadorVerificacao2FA(data=requisicao.data)
        serializador.is_valid(raise_exception=True)
        
        codigo = serializador.validated_data['codigo']
        usuario = requisicao.user
        
        if not usuario.chave_secreta_2fa:
            return Response(
                {'erro': '2FA não configurado.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        totp = pyotp.TOTP(usuario.chave_secreta_2fa)
        
        if totp.verify(codigo, valid_window=1):
            refresh = RefreshToken.for_user(usuario)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'mensagem': 'Login realizado com sucesso.'
            }, status=status.HTTP_200_OK)
            
        return Response(
            {'codigo': ['Código 2FA inválido ou expirado.']}, 
            status=status.HTTP_400_BAD_REQUEST
        )