from rest_framework import serializers
from tarefas.models import Tarefa

class TarefaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarefa
        fields = ['id', 'caso_clinico', 'turma', 'instrucoes', 'coordenadas_gabarito', 'criado_em', 'atualizado_em']
        read_only_fields = ['id', 'criado_em', 'atualizado_em']