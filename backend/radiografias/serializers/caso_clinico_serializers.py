from rest_framework import serializers
from radiografias.models import CasoClinico

class SerializadorCasoClinico(serializers.ModelSerializer):
    class Meta:
        model = CasoClinico
        fields = ['id', 'titulo', 'descricao', 'regiao_anatomica', 'imagem', 'professor', 'criado_em']
        read_only_fields = ['id', 'criado_em', 'professor']