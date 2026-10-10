from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ranking.models import PerfilGamificacao
from ranking.serializers import MeuPerfilGamificacaoSerializer, RankingSerializer

class RankingAlunosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfis = PerfilGamificacao.objects.select_related(
            'aluno'
        ).filter(
            aluno__perfil='aluno'
        ).order_by(
            '-xp_total',
            'aluno__nome',
            'aluno__id'
        )

        ranking = RankingSerializer(perfis, many=True).data

        for posicao, aluno in enumerate(ranking, start=1):
            aluno['posicao'] = posicao

        return Response(ranking)


class MeuPerfilGamificacaoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfil, _ = PerfilGamificacao.objects.get_or_create(aluno=request.user)

        posicao = (
            PerfilGamificacao.objects.filter(
                aluno__perfil='aluno',
                xp_total__gt=perfil.xp_total,
            ).count()
            + 1
        )

        dados = MeuPerfilGamificacaoSerializer(perfil).data
        dados['posicao'] = posicao

        return Response(dados)