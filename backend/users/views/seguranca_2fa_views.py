from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import pyotp

from users.serializers.seguranca_2fa_serializers import SerializadorVerificacao2FA

class Configurar2FAView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, requisicao):
        usuario = requisicao.user

        # A chave fica criptografada no banco. O QR Code e a chave
        # exibida ao usuário precisam usar o valor descriptografado.
        chave_secreta = usuario.gerar_chave_2fa()

        uri_qr_code = pyotp.totp.TOTP(chave_secreta).provisioning_uri(
            name=usuario.email, 
            issuer_name='RadioDent'
        )
        
        return Response({
            'chave_secreta': chave_secreta,
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
            
        totp = pyotp.TOTP(usuario.obter_chave_2fa())
        
        # Pequena margem para diferença de horário no autenticador
        if totp.verify(codigo, valid_window=1):
            return Response(
                {'mensagem': 'Código 2FA verificado com sucesso.'}, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'codigo': ['Código inválido ou expirado.']}, 
            status=status.HTTP_400_BAD_REQUEST
        )

