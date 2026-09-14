from rest_framework import serializers
from ranking.models import PerfilGamificacao

class RankingSerializer(serializers.ModelSerializer):
    aluno_id = serializers.ReadOnlyField(source='aluno.id')
    nome_aluno = serializers.ReadOnlyField(source='aluno.nome')
    nivel = serializers.IntegerField(read_only=True)
    classe = serializers.CharField(read_only=True)

    class Meta:
        model = PerfilGamificacao
        fields = [
            'aluno_id',
            'nome_aluno',
            'xp_total',
            'nivel',
            'classe',
        ]