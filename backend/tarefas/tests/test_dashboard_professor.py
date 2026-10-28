import json
from datetime import datetime, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from radiografias.models import CasoClinico
from tarefas.models import ResolucaoTarefa, Tarefa
from turmas.models import Turma
from users.models.usuario import Usuario


@pytest.mark.django_db
class TesteDashboardProfessor:
    def setup_method(self):
        self.cliente = APIClient()
        self.url = reverse('dashboard-professor')

        self.professor = Usuario.objects.create_user(
            email='prof.dashboard@teste.com',
            password='123',
            perfil='professor',
            nome='Professor Dashboard',
        )
        self.outro_professor = Usuario.objects.create_user(
            email='prof.dashboard.outro@teste.com',
            password='123',
            perfil='professor',
            nome='Outro Professor',
        )

        self.aluno1 = Usuario.objects.create_user(
            email='aluno1.dashboard@teste.com',
            password='123',
            perfil='aluno',
            nome='Aluno Um',
        )
        self.aluno2 = Usuario.objects.create_user(
            email='aluno2.dashboard@teste.com',
            password='123',
            perfil='aluno',
            nome='Aluno Dois',
        )
        self.aluno3 = Usuario.objects.create_user(
            email='aluno3.dashboard@teste.com',
            password='123',
            perfil='aluno',
            nome='Aluno Três',
        )
        self.aluno_outro = Usuario.objects.create_user(
            email='aluno.dashboard.outro@teste.com',
            password='123',
            perfil='aluno',
            nome='Aluno de Outro Professor',
        )

        self.turma_a = Turma.objects.create(
            nome='Turma A', professor=self.professor
        )
        self.turma_a.alunos.add(self.aluno1, self.aluno2)

        self.turma_b = Turma.objects.create(
            nome='Turma B', professor=self.professor
        )
        self.turma_b.alunos.add(self.aluno2, self.aluno3)

        self.turma_outro = Turma.objects.create(
            nome='Turma de Outro', professor=self.outro_professor
        )
        self.turma_outro.alunos.add(self.aluno_outro)

        self.caso_2d = CasoClinico.objects.create(
            titulo='Caso 2D',
            descricao='Caso de teste.',
            regiao_anatomica='dentes',
            professor=self.professor,
        )
        self.caso_3d = CasoClinico.objects.create(
            titulo='Caso 3D',
            descricao='Caso de teste.',
            regiao_anatomica='dentes',
            tipo_midia='modelo_3d',
            modelo_3d='modelos_3d/teste.glb',
            professor=self.professor,
        )

        self.tarefa_a_2d = Tarefa.objects.create(
            caso_clinico=self.caso_2d,
            turma=self.turma_a,
            instrucoes='Tarefa A 2D',
            tipo='radiografia_2d',
            coordenadas_gabarito={'x': 10, 'y': 10},
        )
        self.tarefa_a_3d = Tarefa.objects.create(
            caso_clinico=self.caso_3d,
            turma=self.turma_a,
            instrucoes='Tarefa A 3D',
            tipo='modelo_3d',
            gabarito={
                'versao': 1,
                'modo': 'ponto_3d',
                'ponto_local': {'x': 0.1, 'y': 0.2, 'z': 0.3},
                'tolerancia': 0.05,
            },
        )
        self.tarefa_b_2d = Tarefa.objects.create(
            caso_clinico=self.caso_2d,
            turma=self.turma_b,
            instrucoes='Tarefa B 2D',
            tipo='radiografia_2d',
            coordenadas_gabarito={'x': 10, 'y': 10},
        )
        self.tarefa_outro = Tarefa.objects.create(
            caso_clinico=self.caso_2d,
            turma=self.turma_outro,
            instrucoes='Tarefa de outro professor',
            tipo='radiografia_2d',
            coordenadas_gabarito={'x': 10, 'y': 10},
        )

        dentro = timezone.now() - timedelta(days=2)
        fora = timezone.now() - timedelta(days=60)

        self.r1 = self._criar_resolucao(
            self.tarefa_a_2d, self.aluno1, True, dentro
        )
        self.r2 = self._criar_resolucao(
            self.tarefa_a_2d, self.aluno1, False, dentro
        )
        self.r3 = self._criar_resolucao(
            self.tarefa_a_2d, self.aluno2, True, dentro
        )
        self.r4 = self._criar_resolucao(
            self.tarefa_a_3d, self.aluno1, True, dentro
        )
        self.r5 = self._criar_resolucao(
            self.tarefa_b_2d, self.aluno3, False, dentro
        )
        self.r_outro = self._criar_resolucao(
            self.tarefa_outro, self.aluno_outro, True, dentro
        )
        self.r_fora = self._criar_resolucao(
            self.tarefa_a_2d, self.aluno2, True, fora
        )

    def _criar_resolucao(self, tarefa, aluno, acertou, criado_em):
        resolucao = ResolucaoTarefa.objects.create(
            tarefa=tarefa,
            aluno=aluno,
            coordenadas_submetidas={'x': 10, 'y': 10},
            acertou=acertou,
        )
        ResolucaoTarefa.objects.filter(pk=resolucao.pk).update(
            criado_em=criado_em
        )
        resolucao.refresh_from_db()
        return resolucao

    def _obter(self, **filtros):
        self.cliente.force_authenticate(user=self.professor)
        return self.cliente.get(self.url, filtros)

    def test_metricas_consolidadas_do_periodo(self):
        resposta = self._obter()

        assert resposta.status_code == 200
        metricas = resposta.data['metricas']

        assert metricas['total_turmas'] == 2
        assert metricas['total_alunos'] == 3
        assert metricas['alunos_participantes'] == 3
        assert metricas['total_resolucoes'] == 5
        assert metricas['total_acertos'] == 3
        assert metricas['taxa_acerto'] == 60.0
        assert metricas['taxa_participacao'] == 100.0
        assert metricas['total_tarefas'] == 3
        assert metricas['total_tarefas_com_resolucao'] == 3

        assert resposta.data['filtros_aplicados']['granularidade'] == 'dia'
        assert len(resposta.data['atividade_por_periodo']) == 30

        total_na_serie = sum(
            item['total_resolucoes']
            for item in resposta.data['atividade_por_periodo']
        )
        assert total_na_serie == 5

        recentes = {
            item['id']: item for item in resposta.data['tarefas_recentes']
        }
        recente_2d = recentes[str(self.tarefa_a_2d.id)]
        assert recente_2d['total_resolucoes'] == 3
        assert recente_2d['total_acertos'] == 2
        assert recente_2d['taxa_acerto'] == 66.7

    def test_desempenho_por_turma_e_por_tarefa(self):
        resposta = self._obter()

        por_turma = {
            item['turma_nome']: item
            for item in resposta.data['desempenho_por_turma']
        }

        assert por_turma['Turma A']['total_resolucoes'] == 4
        assert por_turma['Turma A']['total_acertos'] == 3
        assert por_turma['Turma A']['taxa_acerto'] == 75.0
        assert por_turma['Turma A']['alunos_participantes'] == 2
        assert por_turma['Turma A']['taxa_participacao'] == 100.0

        assert por_turma['Turma B']['total_resolucoes'] == 1
        assert por_turma['Turma B']['taxa_acerto'] == 0.0
        assert por_turma['Turma B']['taxa_participacao'] == 50.0

        # Turmas com resoluções aparecem antes das sem resoluções.
        assert resposta.data['desempenho_por_turma'][0]['turma_nome'] == 'Turma A'

        por_tarefa = {
            item['tarefa_id']: item
            for item in resposta.data['desempenho_por_tarefa']
        }

        tarefa_2d = por_tarefa[str(self.tarefa_a_2d.id)]
        assert tarefa_2d['total_resolucoes'] == 3
        assert tarefa_2d['total_acertos'] == 2
        assert tarefa_2d['alunos_participantes'] == 2
        assert tarefa_2d['taxa_acerto'] == 66.7

        tarefa_3d = por_tarefa[str(self.tarefa_a_3d.id)]
        assert tarefa_3d['total_resolucoes'] == 1
        assert tarefa_3d['taxa_acerto'] == 100.0

        # A tarefa do outro professor nunca entra no resultado.
        assert str(self.tarefa_outro.id) not in por_tarefa

    def test_filtro_por_turma(self):
        resposta = self._obter(turma_id=str(self.turma_a.id))

        assert resposta.status_code == 200, resposta.data
        metricas = resposta.data['metricas']

        assert metricas['total_turmas'] == 1
        assert metricas['total_alunos'] == 2
        assert metricas['total_resolucoes'] == 4
        assert metricas['taxa_acerto'] == 75.0
        assert len(resposta.data['desempenho_por_turma']) == 1
        assert resposta.data['filtros_aplicados']['turma_nome'] == 'Turma A'

    def test_filtro_por_tipo(self):
        resposta = self._obter(tipo='modelo_3d')

        assert resposta.status_code == 200
        metricas = resposta.data['metricas']

        assert metricas['total_resolucoes'] == 1
        assert metricas['taxa_acerto'] == 100.0
        assert metricas['total_tarefas'] == 1
        assert len(resposta.data['desempenho_por_tarefa']) == 1
        assert (
            resposta.data['desempenho_por_tarefa'][0]['tarefa_id']
            == str(self.tarefa_a_3d.id)
        )

    def test_filtro_por_aluno_detalha_participacao_individual(self):
        resposta = self._obter(aluno_id=str(self.aluno3.id))

        assert resposta.status_code == 200, resposta.data
        metricas = resposta.data['metricas']

        assert metricas['total_turmas'] == 1
        assert metricas['total_alunos'] == 1
        assert metricas['alunos_participantes'] == 1
        assert metricas['total_resolucoes'] == 1
        assert metricas['taxa_acerto'] == 0.0
        assert metricas['taxa_participacao'] == 100.0

        assert [item['turma_nome'] for item in resposta.data['desempenho_por_turma']] == [
            'Turma B'
        ]
        assert resposta.data['tarefas_recentes'][0]['id'] == str(
            self.tarefa_b_2d.id
        )

        # O seletor de alunos continua listando os demais alunos das turmas.
        nomes = {item['nome'] for item in resposta.data['opcoes']['alunos']}
        assert nomes == {'Aluno Um', 'Aluno Dois', 'Aluno Três'}

    def test_filtro_por_periodo_exclui_resolucoes_antigas(self):
        data_fim = (timezone.localdate() - timedelta(days=59)).isoformat()
        data_inicio = (timezone.localdate() - timedelta(days=61)).isoformat()

        resposta = self._obter(
            data_inicio=data_inicio, data_fim=data_fim
        )

        assert resposta.status_code == 200
        assert resposta.data['metricas']['total_resolucoes'] == 1
        assert resposta.data['metricas']['total_tarefas'] == 0
        assert resposta.data['tarefas_recentes'] == []

    def test_serie_muda_de_granularidade_conforme_intervalo(self):
        hoje = timezone.localdate()

        resposta = self._obter(
            data_inicio=(hoje - timedelta(days=89)).isoformat(),
            data_fim=hoje.isoformat(),
        )
        assert resposta.data['filtros_aplicados']['granularidade'] == 'semana'

        resposta = self._obter(
            data_inicio=(hoje - timedelta(days=400)).isoformat(),
            data_fim=hoje.isoformat(),
        )
        assert resposta.data['filtros_aplicados']['granularidade'] == 'mes'

    def test_limite_de_tarefas_recentes(self):
        resposta = self._obter(limite=2)

        assert resposta.status_code == 200
        assert len(resposta.data['tarefas_recentes']) == 2
        assert resposta.data['filtros_aplicados']['limite_recentes'] == 2

    def test_resposta_nao_expoe_gabarito_nem_coordenadas(self):
        resposta = self._obter()

        conteudo = json.dumps(resposta.data)
        assert 'gabarito' not in conteudo
        assert 'coordenadas' not in conteudo
        assert 'x_min' not in conteudo
        assert 'ponto_local' not in conteudo

        tarefa_recente = resposta.data['tarefas_recentes'][0]
        assert set(tarefa_recente) == {
            'id',
            'caso_clinico_titulo',
            'turma_id',
            'turma_nome',
            'tipo',
            'criado_em',
            'total_resolucoes',
            'total_acertos',
            'taxa_acerto',
        }

    def test_sem_resolucoes_retorna_zeros_sem_erro_de_divisao(self):
        resposta = self._obter(
            data_inicio=(timezone.localdate() - timedelta(days=400)).isoformat(),
            data_fim=(timezone.localdate() - timedelta(days=395)).isoformat(),
        )

        assert resposta.status_code == 200
        metricas = resposta.data['metricas']
        assert metricas['total_resolucoes'] == 0
        assert metricas['total_acertos'] == 0
        assert metricas['alunos_participantes'] == 0
        assert metricas['taxa_acerto'] == 0.0
        assert metricas['taxa_participacao'] == 0.0
        assert resposta.data['desempenho_por_tarefa'] == []
        assert resposta.data['tarefas_recentes'] == []

    def test_aluno_nao_acessa_dashboard_do_professor(self):
        self.cliente.force_authenticate(user=self.aluno1)
        resposta = self.cliente.get(self.url)

        assert resposta.status_code == 403

    def test_usuario_anonimo_nao_acessa(self):
        resposta = self.cliente.get(self.url)

        assert resposta.status_code in (401, 403)

    @pytest.mark.parametrize(
        'filtros',
        [
            {'turma_id': '00000000-0000-0000-0000-000000000000'},
            {'turma_id': 'nao-e-uuid'},
            {'aluno_id': '00000000-0000-0000-0000-000000000000'},
            {'aluno_id': 'nao-e-uuid'},
            {'tipo': 'tipo_invalido'},
            {'data_inicio': '2026-13-01'},
            {'data_inicio': '2026-10-10', 'data_fim': '2026-10-01'},
            {'limite': '0'},
            {'limite': 'abc'},
        ],
    )
    def test_filtros_invalidos_retornam_400(self, filtros):
        resposta = self._obter(**filtros)

        assert resposta.status_code == 400
        assert 'erro' in resposta.data

    def test_professor_nao_consulta_turma_de_outro(self):
        resposta = self._obter(turma_id=str(self.turma_outro.id))

        assert resposta.status_code == 400

        resposta = self._obter(aluno_id=str(self.aluno_outro.id))

        assert resposta.status_code == 400
