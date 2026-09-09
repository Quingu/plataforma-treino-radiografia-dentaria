from rest_framework import serializers
from radiografias.models import CasoClinico

class SerializadorCasoClinico(serializers.ModelSerializer):
    class Meta:
        model = CasoClinico
        fields = ['id', 'titulo', 'descricao', 'regiao_anatomica', 'imagem', 'professor', 'criado_em']
        read_only_fields = ['id', 'professor', 'criado_em']

    # Liga o caso ao professor logado
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['professor'] = request.user
        return super().create(validated_data)
