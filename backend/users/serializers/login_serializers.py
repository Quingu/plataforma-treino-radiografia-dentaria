from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from users.seguranca.autenticacao import TokenTemporario2FA


class SerializadorLoginCom2FA(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        dados = super().validate(attrs)
        usuario = self.user

        foto_perfil_url = ''

        if usuario.foto_perfil:
            try:
                foto_perfil_url = usuario.foto_perfil.url
            except ValueError:
                foto_perfil_url = ''

        dados_usuario = {
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'perfil': usuario.perfil,
            'foto_perfil_url': foto_perfil_url,
        }

        if usuario.chave_secreta_2fa:
            token_temporario = TokenTemporario2FA.for_user(usuario)

            return {
                'requer_2fa': True,
                'token_temporario': str(token_temporario),
                'usuario': dados_usuario,
                'mensagem': (
                    'Autenticação em duas etapas necessária. '
                    'Insira o código do seu autenticador.'
                ),
            }

        dados['requer_2fa'] = False
        dados['usuario'] = dados_usuario
        return dados