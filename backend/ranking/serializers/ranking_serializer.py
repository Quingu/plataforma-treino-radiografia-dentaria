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

class MeuPerfilGamificacaoSerializer(serializers.ModelSerializer):
    nivel = serializers.IntegerField(read_only=True)
    classe = serializers.CharField(read_only=True)
    progresso_nivel = serializers.SerializerMethodField()
    xp_para_proximo_nivel = serializers.SerializerMethodField()
    nivel_maximo = serializers.SerializerMethodField()

    class Meta:
        model = PerfilGamificacao
        fields = [
            'xp_total',
            'nivel',
            'classe',
            'progresso_nivel',
            'xp_para_proximo_nivel',
            'nivel_maximo',
        ]

    def get_progresso_nivel(self, perfil):
        if perfil.nivel >= 100:
            return PerfilGamificacao.XP_POR_NIVEL
        return perfil.xp_total % PerfilGamificacao.XP_POR_NIVEL

    def get_xp_para_proximo_nivel(self, perfil):
        if perfil.nivel >= 100:
            return 0
        return (
            PerfilGamificacao.XP_POR_NIVEL
            - (perfil.xp_total % PerfilGamificacao.XP_POR_NIVEL)
        )

    def get_nivel_maximo(self, perfil):
        return perfil.nivel >= 100