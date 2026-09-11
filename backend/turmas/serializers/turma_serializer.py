from rest_framework import serializers
from turmas.models import Turma

class TurmaSerializer(serializers.ModelSerializer):
    professor_nome = serializers.CharField(source='professor.nome', read_only=True)
    total_alunos = serializers.SerializerMethodField()
    total_tarefas = serializers.SerializerMethodField()

    class Meta:
        model = Turma
        fields = ['id', 'nome', 'professor', 'professor_nome', 'codigo_convite', 'total_alunos', 'total_tarefas', 'criado_em']
        read_only_fields = ['id', 'professor', 'professor_nome', 'codigo_convite', 'criado_em']

    def get_total_alunos(self, obj):
        return obj.alunos.count()

    def get_total_tarefas(self, obj):
        return obj.tarefas.count()
