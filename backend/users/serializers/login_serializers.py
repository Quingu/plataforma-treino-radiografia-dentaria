from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class SerializadorLoginCom2FA(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        usuario = self.user
        dados_usuario = {
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'perfil': usuario.perfil,
        }
        
        if usuario.chave_secreta_2fa:
            refresh = RefreshToken.for_user(usuario)
            
            return {
                'requer_2fa': True,
                'token_temporario': str(refresh.access_token),
                'usuario': dados_usuario,
                'mensagem': 'Autenticação em duas etapas necessária. Insira o código do seu autenticador.'
            }
            
        data['requer_2fa'] = False
        data['usuario'] = dados_usuario
        return data
