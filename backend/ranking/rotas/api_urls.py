from django.urls import path
from ranking.views import RankingAlunosView


urlpatterns = [
    path('', RankingAlunosView.as_view(), name='ranking-alunos'),
]