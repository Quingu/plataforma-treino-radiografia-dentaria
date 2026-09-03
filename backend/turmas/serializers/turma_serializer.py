from rest_framework import serializers
from turmas.models import Turma

class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome', 'professor', 'codigo_convite', 'criado_em']
        read_only_fields = ['id', 'professor', 'codigo_convite', 'criado_em']