from rest_framework import serializers
from tarefas.models import ResolucaoTarefa

class ResolucaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResolucaoTarefa
        fields = ['id', 'coordenadas_submetidas', 'acertou', 'criado_em']
        read_only_fields = ['id', 'acertou', 'criado_em']