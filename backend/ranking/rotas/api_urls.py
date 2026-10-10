from django.urls import path
from ranking.views import MeuPerfilGamificacaoView, RankingAlunosView


urlpatterns = [
    path('', RankingAlunosView.as_view(), name='ranking-alunos'),
    path(
        'meu-perfil/',
        MeuPerfilGamificacaoView.as_view(),
        name='ranking-meu-perfil',
    ),
]