from rest_framework import serializers
from users.models import Usuario

class SerializadorDeUsuario(serializers.ModelSerializer):
    tipo = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nome', 'tipo', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, dados_validados):
        perfil_selecionado = dados_validados.pop('tipo', 'aluno')
        
        novo_usuario = Usuario.objects.create_user(
            email=dados_validados['email'],
            password=dados_validados['password'],
            nome=dados_validados.get('nome', ''),
            perfil=perfil_selecionado
        )
        return novo_usuario