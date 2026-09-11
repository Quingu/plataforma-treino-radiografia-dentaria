from rest_framework import serializers
from users.models import Usuario

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'perfil', 'foto_perfil', 'foto_perfil_url']
        read_only_fields = ['id', 'email', 'perfil', 'foto_perfil_url']

    def get_foto_perfil_url(self, obj):
        if not obj.foto_perfil:
            return ''

        try:
            url = obj.foto_perfil.url
        except ValueError:
            return ''

        request = self.context.get('request')
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url
