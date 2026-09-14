import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from ranking.models import PerfilGamificacao, RegistroXP
from tarefas.models import ResolucaoTarefa, Tarefa
from turmas.models import Turma
from radiografias.models import CasoClinico
from users.models import Usuario


@pytest.mark.django_db
class TestPerfilGamificacao:

    @pytest.mark.parametrize(
        'xp, nivel_esperado, classe_esperada',
        [
            (0, 1, 'Cobre'),
            (900, 10, 'Cobre'),
            (1000, 11, 'Ferro'),
            (2000, 21, 'Bronze'),
            (3000, 31, 'Prata'),
            (4000, 41, 'Ouro'),
            (5000, 51, 'Platina'),
            (6000, 61, 'Mestre'),
            (7000, 71, 'Grão-Mestre'),
            (8000, 81, 'Supremo'),
            (9000, 91, 'Imortal'),
            (99999, 100, 'Imortal'),
        ]
    )
    def test_calcula_nivel_e_classe(
        self,
        xp,
        nivel_esperado,
        classe_esperada
    ):
        aluno = Usuario.objects.create_user(
            email=f'aluno{xp}@teste.com',
            password='senha123'
        )

        perfil = PerfilGamificacao.objects.create(
            aluno=aluno,
            xp_total=xp
        )

        assert perfil.nivel == nivel_esperado
        assert perfil.classe == classe_esperada


@pytest.mark.django_db
class TestConcessaoXP:

    def setup_method(self):
        self.professor = Usuario.objects.create_user(
            email='professor@teste.com',
            password='senha123',
            perfil='professor'
        )

        self.aluno = Usuario.objects.create_user(
            email='aluno@teste.com',
            password='senha123',
            perfil='aluno'
        )

        self.turma = Turma.objects.create(
            nome='Turma de teste',
            professor=self.professor
        )
        self.turma.alunos.add(self.aluno)

        self.caso = CasoClinico.objects.create(
            titulo='Caso de teste',
            regiao_anatomica='dentes',
            professor=self.professor
        )

        self.tarefa = Tarefa.objects.create(
            caso_clinico=self.caso,
            turma=self.turma,
            instrucoes='Identifique a lesão.',
            coordenadas_gabarito={
                'x_min': 100,
                'y_min': 100,
                'x_max': 150,
                'y_max': 150,
            }
        )

    def test_acerto_concede_xp(self):
        resolucao = ResolucaoTarefa.objects.create(
            tarefa=self.tarefa,
            aluno=self.aluno,
            coordenadas_submetidas={
                'x_min': 110,
                'y_min': 105,
                'x_max': 140,
                'y_max': 145,
            },
            acertou=True
        )

        concedeu_xp = PerfilGamificacao.conceder_xp_por_resolucao(
            resolucao
        )

        perfil = PerfilGamificacao.objects.get(aluno=self.aluno)

        assert concedeu_xp is True
        assert perfil.xp_total == 10
        assert RegistroXP.objects.count() == 1

    def test_mesma_tarefa_nao_concede_xp_duas_vezes(self):
        primeira_resolucao = ResolucaoTarefa.objects.create(
            tarefa=self.tarefa,
            aluno=self.aluno,
            coordenadas_submetidas={'x_min': 100, 'y_min': 100},
            acertou=True
        )

        segunda_resolucao = ResolucaoTarefa.objects.create(
            tarefa=self.tarefa,
            aluno=self.aluno,
            coordenadas_submetidas={'x_min': 100, 'y_min': 100},
            acertou=True
        )

        PerfilGamificacao.conceder_xp_por_resolucao(primeira_resolucao)
        concedeu_xp = PerfilGamificacao.conceder_xp_por_resolucao(
            segunda_resolucao
        )

        perfil = PerfilGamificacao.objects.get(aluno=self.aluno)

        assert concedeu_xp is False
        assert perfil.xp_total == 10
        assert RegistroXP.objects.count() == 1


@pytest.mark.django_db
class TestRankingAlunosView:

    def setup_method(self):
        self.cliente = APIClient()

        self.aluno_1 = Usuario.objects.create_user(
            email='primeiro@teste.com',
            password='senha123',
            nome='Ana'
        )

        self.aluno_2 = Usuario.objects.create_user(
            email='segundo@teste.com',
            password='senha123',
            nome='Bruno'
        )

        PerfilGamificacao.objects.create(
            aluno=self.aluno_1,
            xp_total=300
        )

        PerfilGamificacao.objects.create(
            aluno=self.aluno_2,
            xp_total=500
        )

        self.url = reverse('ranking-alunos')

    def test_lista_ranking_ordenado_por_xp(self):
        self.cliente.force_authenticate(user=self.aluno_1)

        resposta = self.cliente.get(self.url)

        assert resposta.status_code == 200
        assert resposta.data[0]['nome_aluno'] == 'Bruno'
        assert resposta.data[0]['xp_total'] == 500
        assert resposta.data[0]['posicao'] == 1
        assert resposta.data[1]['nome_aluno'] == 'Ana'
        assert resposta.data[1]['posicao'] == 2