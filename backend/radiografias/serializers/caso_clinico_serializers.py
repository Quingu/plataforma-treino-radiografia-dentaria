from rest_framework import serializers
from radiografias.models import CasoClinico

class SerializadorCasoClinico(serializers.ModelSerializer):
    imagem_url = serializers.SerializerMethodField()

    class Meta:
        model = CasoClinico
        fields = ['id', 'titulo', 'descricao', 'regiao_anatomica', 'imagem', 'imagem_url', 'professor', 'criado_em']
        read_only_fields = ['id', 'professor', 'criado_em']

    def get_imagem_url(self, obj):
        if not obj.imagem:
            return ''

        try:
            url = obj.imagem.url
        except ValueError:
            return ''

        request = self.context.get('request')
        if request and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['professor'] = request.user
        return super().create(validated_data)
