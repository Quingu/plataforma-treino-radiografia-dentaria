import pytest
from django.core.management import call_command

from ranking.models import PerfilGamificacao, RegistroXP
from radiografias.models import CasoClinico
from tarefas.models import ResolucaoTarefa, Tarefa
from turmas.models import Turma
from users.management.commands.criar_alunos_demo import ALUNOS
from users.models import Usuario

CODIGO = 'DEMO42'
DOMINIO = 'demo.teste'


def _criar_turma_com_tarefas(quantidade):
    professor = Usuario.objects.create_user(
        email='professor.demo@teste.com',
        password='senha123',
        perfil='professor',
    )
    turma = Turma.objects.create(nome='Turma Demo', professor=professor)
    Turma.objects.filter(id=turma.id).update(codigo_convite=CODIGO)
    caso = CasoClinico.objects.create(
        titulo='Caso demo',
        descricao='Caso para o seed.',
        regiao_anatomica='dentes',
        professor=professor,
    )

    for indice in range(quantidade):
        Tarefa.objects.create(
            caso_clinico=caso,
            turma=turma,
            instrucoes=f'Tarefa {indice}',
            coordenadas_gabarito={'x': 10, 'y': 10},
        )

    return turma


@pytest.mark.django_db
def test_seed_cria_ao_menos_seis_resolucoes_por_aluno():
    turma = _criar_turma_com_tarefas(7)

    call_command('criar_alunos_demo', codigo=CODIGO, dominio=DOMINIO)

    alunos = Usuario.objects.filter(email__endswith=f'@{DOMINIO}')

    assert alunos.count() == len(ALUNOS)
    assert ResolucaoTarefa.objects.count() >= len(ALUNOS) * 6

    for aluno in alunos:
        assert aluno.minhas_resolucoes.count() >= 6
        assert aluno.turmas_com_aluno.filter(id=turma.id).exists()


@pytest.mark.django_db
def test_seed_e_idempotente_e_mantem_xp_coerente():
    _criar_turma_com_tarefas(7)

    call_command('criar_alunos_demo', codigo=CODIGO, dominio=DOMINIO)
    total_resolucoes = ResolucaoTarefa.objects.count()
    total_registros = RegistroXP.objects.count()

    call_command('criar_alunos_demo', codigo=CODIGO, dominio=DOMINIO)

    assert ResolucaoTarefa.objects.count() == total_resolucoes
    assert RegistroXP.objects.count() == total_registros
    assert ResolucaoTarefa.objects.filter(acertou=True).exists()
    assert ResolucaoTarefa.objects.filter(acertou=False).exists()

    for indice, (_, xp_base) in enumerate(ALUNOS, start=1):
        aluno = Usuario.objects.get(
            email=f'aluno.demo{indice:02d}@{DOMINIO}'
        )
        perfil = PerfilGamificacao.objects.get(aluno=aluno)
        bonus = sum(
            aluno.registros_xp.values_list('xp_concedido', flat=True)
        )

        assert perfil.xp_total == xp_base + bonus


@pytest.mark.django_db
def test_seed_funciona_com_menos_de_seis_tarefas():
    _criar_turma_com_tarefas(3)

    call_command('criar_alunos_demo', codigo=CODIGO, dominio=DOMINIO)

    for aluno in Usuario.objects.filter(email__endswith=f'@{DOMINIO}'):
        assert aluno.minhas_resolucoes.count() == 3
