from rest_framework import serializers
from users.models import Usuario

class UsuarioSerializador(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nome', 'tipo', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, dados_validados):
        senha = dados_validados.pop('password', None)
        usuario = Usuario(**dados_validados)
        if senha:
            usuario.set_password(senha)
        usuario.save()
        return usuario