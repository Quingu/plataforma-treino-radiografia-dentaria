from datetime import date, datetime, time, timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from tarefas.models import ResolucaoTarefa, Tarefa
from tarefas.models.tarefa import TipoTarefa
from turmas.models import Turma
from users.models.usuario import Usuario


PERIODO_PADRAO_DIAS = 30
INTERVALO_MAXIMO_DIAS = 3660
LIMITE_RECENTES_PADRAO = 10
LIMITE_RECENTES_MAXIMO = 50
LIMITE_TAREFAS_GRAFICO = 8


class FiltroInvalido(ValueError):
    pass


def _taxa(acertos, total):
    if not total:
        return 0.0
    return round((acertos / total) * 100, 1)


def _ler_data(valor, campo, padrao=None):
    if valor in (None, ''):
        return padrao

    try:
        return date.fromisoformat(str(valor))
    except (TypeError, ValueError):
        raise FiltroInvalido(
            f'{campo}: use uma data válida no formato AAAA-MM-DD.'
        )


def _ler_id(valor, campo):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        raise FiltroInvalido(f'{campo}: identificador inválido.')

    if numero <= 0:
        raise FiltroInvalido(f'{campo}: identificador inválido.')

    return numero


def _ler_inteiro(valor, campo, padrao, minimo, maximo):
    if valor in (None, ''):
        return padrao

    try:
        numero = int(valor)
    except (TypeError, ValueError):
        raise FiltroInvalido(f'{campo}: informe um número inteiro.')

    if numero < minimo or numero > maximo:
        raise FiltroInvalido(
            f'{campo}: o valor deve estar entre {minimo} e {maximo}.'
        )

    return numero


def _inicio_do_periodo(data_referencia, granularidade):
    if granularidade == 'semana':
        return data_referencia - timedelta(days=data_referencia.weekday())
    if granularidade == 'mes':
        return data_referencia.replace(day=1)
    return data_referencia


def _proximo_periodo(data_referencia, granularidade):
    if granularidade == 'semana':
        return data_referencia + timedelta(days=7)
    if granularidade == 'mes':
        if data_referencia.month == 12:
            return data_referencia.replace(
                year=data_referencia.year + 1, month=1, day=1
            )
        return data_referencia.replace(month=data_referencia.month + 1, day=1)
    return data_referencia + timedelta(days=1)


def _granularidade(data_inicio, data_fim):
    dias = (data_fim - data_inicio).days + 1

    if dias <= 31:
        return 'dia', TruncDate
    if dias <= 120:
        return 'semana', TruncWeek
    return 'mes', TruncMonth


def _montar_atividade_por_periodo(resolucoes, data_inicio, data_fim):
    granularidade, truncar = _granularidade(data_inicio, data_fim)

    agregados = {
        linha['periodo']: linha
        for linha in resolucoes.annotate(periodo=truncar('criado_em'))
        .values('periodo')
        .annotate(
            total_resolucoes=Count('id'),
            total_acertos=Count('id', filter=Q(acertou=True)),
        )
        .order_by('periodo')
    }

    serie = []
    cursor = _inicio_do_periodo(data_inicio, granularidade)
    ultimo_periodo = _inicio_do_periodo(data_fim, granularidade)

    while cursor <= ultimo_periodo:
        linha = agregados.get(cursor, {})
        total = linha.get('total_resolucoes', 0)
        acertos = linha.get('total_acertos', 0)
        serie.append(
            {
                'periodo': cursor.isoformat(),
                'total_resolucoes': total,
                'total_acertos': acertos,
                'taxa_acerto': _taxa(acertos, total),
            }
        )
        cursor = _proximo_periodo(cursor, granularidade)

    return granularidade, serie


def _intervalo_resolucoes(data_inicio, data_fim):
    fuso = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(data_inicio, time.min), fuso)
    fim = timezone.make_aware(
        datetime.combine(data_fim + timedelta(days=1), time.min), fuso
    )
    return inicio, fim


def obter_dashboard_professor(professor, filtros):
    if not professor or not professor.is_authenticated:
        raise FiltroInvalido('Autenticação obrigatória.')

    if professor.perfil != 'professor':
        raise FiltroInvalido('A dashboard está disponível apenas para professores.')

    hoje = timezone.localdate()
    data_fim = _ler_data(filtros.get('data_fim'), 'data_fim', hoje)
    data_inicio = _ler_data(
        filtros.get('data_inicio'),
        'data_inicio',
        data_fim - timedelta(days=PERIODO_PADRAO_DIAS - 1),
    )

    if data_inicio > data_fim:
        raise FiltroInvalido('data_inicio não pode ser posterior a data_fim.')

    if (data_fim - data_inicio).days > INTERVALO_MAXIMO_DIAS:
        raise FiltroInvalido(
            'O intervalo máximo permitido é de 10 anos.'
        )

    limite_recentes = _ler_inteiro(
        filtros.get('limite'),
        'limite',
        LIMITE_RECENTES_PADRAO,
        1,
        LIMITE_RECENTES_MAXIMO,
    )

    turmas_do_professor = Turma.objects.filter(professor=professor)

    turma = None
    turma_id = filtros.get('turma_id')
    if turma_id not in (None, ''):
        turma_pk = _ler_id(turma_id, 'turma_id')
        turma = turmas_do_professor.filter(id=turma_pk).first()
        if not turma:
            raise FiltroInvalido('turma_id: turma não encontrada entre as suas turmas.')

    turmas_escopo = turmas_do_professor
    if turma:
        turmas_escopo = turmas_escopo.filter(id=turma.id)

    tipo = filtros.get('tipo')
    if tipo in (None, ''):
        tipo = None
    elif tipo not in TipoTarefa.values:
        raise FiltroInvalido(
            'tipo: use radiografia_2d ou modelo_3d.'
        )

    alunos_escopo = Usuario.objects.filter(
        turmas_com_aluno__in=turmas_escopo
    ).distinct()
    turmas_para_opcoes = turmas_escopo

    aluno = None
    aluno_id = filtros.get('aluno_id')
    if aluno_id not in (None, ''):
        aluno_pk = _ler_id(aluno_id, 'aluno_id')
        aluno = alunos_escopo.filter(id=aluno_pk).first()
        if not aluno:
            raise FiltroInvalido(
                'aluno_id: aluno não encontrado nas suas turmas.'
            )
        turmas_escopo = turmas_escopo.filter(alunos=aluno)
        alunos_escopo = alunos_escopo.filter(id=aluno.id)

    inicio, fim = _intervalo_resolucoes(data_inicio, data_fim)

    # Consulta base de resoluções sempre limitada às turmas do professor
    resolucoes = ResolucaoTarefa.objects.filter(
        tarefa__turma__professor=professor,
        criado_em__gte=inicio,
        criado_em__lt=fim,
    )
    if turma:
        resolucoes = resolucoes.filter(tarefa__turma=turma)
    if tipo:
        resolucoes = resolucoes.filter(tarefa__tipo=tipo)
    if aluno:
        resolucoes = resolucoes.filter(aluno=aluno)

    totais = resolucoes.aggregate(
        total_resolucoes=Count('id'),
        total_acertos=Count('id', filter=Q(acertou=True)),
        alunos_participantes=Count('aluno', distinct=True),
    )

    total_alunos = alunos_escopo.count()
    alunos_participantes = totais['alunos_participantes']
    total_resolucoes = totais['total_resolucoes']
    total_acertos = totais['total_acertos']

    # Tarefas criadas respeitando os filtros
    tarefas_no_periodo = Tarefa.objects.filter(
        turma__professor=professor,
        criado_em__gte=inicio,
        criado_em__lt=fim,
    )
    if turma:
        tarefas_no_periodo = tarefas_no_periodo.filter(turma=turma)
    if tipo:
        tarefas_no_periodo = tarefas_no_periodo.filter(tipo=tipo)
    if aluno:
        tarefas_no_periodo = tarefas_no_periodo.filter(
            id__in=ResolucaoTarefa.objects.filter(
                aluno=aluno,
                criado_em__gte=inicio,
                criado_em__lt=fim,
            ).values('tarefa_id')
        )

    # Desempenho por turma
    turmas_agregadas = {
        linha['tarefa__turma_id']: linha
        for linha in resolucoes.values('tarefa__turma_id').annotate(
            total_resolucoes=Count('id'),
            total_acertos=Count('id', filter=Q(acertou=True)),
            alunos_participantes=Count('aluno', distinct=True),
        )
    }

    desempenho_por_turma = []
    for item in turmas_escopo.annotate(
        total_alunos=Count('alunos', distinct=True)
    ).order_by('nome'):
        agregado = turmas_agregadas.get(item.id, {})
        total_turma = agregado.get('total_resolucoes', 0)
        acertos_turma = agregado.get('total_acertos', 0)
        participantes_turma = agregado.get('alunos_participantes', 0)
        matriculados = 1 if aluno else item.total_alunos

        desempenho_por_turma.append(
            {
                'turma_id': item.id,
                'turma_nome': item.nome,
                'total_alunos': matriculados,
                'alunos_participantes': participantes_turma,
                'total_resolucoes': total_turma,
                'total_acertos': acertos_turma,
                'taxa_acerto': _taxa(acertos_turma, total_turma),
                'taxa_participacao': _taxa(participantes_turma, matriculados),
            }
        )

    desempenho_por_turma.sort(
        key=lambda item: (
            item['total_resolucoes'] == 0,
            -item['taxa_acerto'],
            item['turma_nome'],
        )
    )

    # Desempenho por tarefa 
    tarefas_agregadas = list(
        resolucoes.values(
            'tarefa_id',
            'tarefa__caso_clinico__titulo',
            'tarefa__turma_id',
            'tarefa__turma__nome',
            'tarefa__tipo',
            'tarefa__criado_em',
        )
        .annotate(
            total_resolucoes=Count('id'),
            total_acertos=Count('id', filter=Q(acertou=True)),
            alunos_participantes=Count('aluno', distinct=True),
        )
        .order_by('-total_resolucoes', 'tarefa__caso_clinico__titulo')
    )

    total_tarefas_com_resolucao = len(tarefas_agregadas)

    desempenho_por_tarefa = [
        {
            'tarefa_id': str(linha['tarefa_id']),
            'caso_clinico_titulo': linha['tarefa__caso_clinico__titulo'],
            'turma_id': linha['tarefa__turma_id'],
            'turma_nome': linha['tarefa__turma__nome'],
            'tipo': linha['tarefa__tipo'],
            'criado_em': linha['tarefa__criado_em'].isoformat(),
            'total_resolucoes': linha['total_resolucoes'],
            'total_acertos': linha['total_acertos'],
            'alunos_participantes': linha['alunos_participantes'],
            'taxa_acerto': _taxa(
                linha['total_acertos'], linha['total_resolucoes']
            ),
        }
        for linha in tarefas_agregadas[:LIMITE_TAREFAS_GRAFICO]
    ]

    # Atividade ao longo do tempo
    granularidade, atividade_por_periodo = _montar_atividade_por_periodo(
        resolucoes, data_inicio, data_fim
    )

    # Tarefas recentes
    filtro_resolucoes = Q(
        resolucoes__criado_em__gte=inicio,
        resolucoes__criado_em__lt=fim,
    )
    if aluno:
        filtro_resolucoes &= Q(resolucoes__aluno=aluno)

    tarefas_recentes_qs = Tarefa.objects.filter(
        turma__professor=professor,
        criado_em__gte=inicio,
        criado_em__lt=fim,
    ).select_related('caso_clinico', 'turma')
    if turma:
        tarefas_recentes_qs = tarefas_recentes_qs.filter(turma=turma)
    if tipo:
        tarefas_recentes_qs = tarefas_recentes_qs.filter(tipo=tipo)
    if aluno:
        tarefas_recentes_qs = tarefas_recentes_qs.filter(
            id__in=ResolucaoTarefa.objects.filter(
                aluno=aluno,
                criado_em__gte=inicio,
                criado_em__lt=fim,
            ).values('tarefa_id')
        )

    tarefas_recentes_qs = tarefas_recentes_qs.annotate(
        total_resolucoes=Count(
            'resolucoes', filter=filtro_resolucoes, distinct=True
        ),
        total_acertos=Count(
            'resolucoes',
            filter=filtro_resolucoes & Q(resolucoes__acertou=True),
            distinct=True,
        ),
    ).order_by('-criado_em')[:limite_recentes]

    tarefas_recentes = [
        {
            'id': str(tarefa.id),
            'caso_clinico_titulo': tarefa.caso_clinico.titulo,
            'turma_id': tarefa.turma_id,
            'turma_nome': tarefa.turma.nome,
            'tipo': tarefa.tipo,
            'criado_em': tarefa.criado_em.isoformat(),
            'total_resolucoes': tarefa.total_resolucoes,
            'total_acertos': tarefa.total_acertos,
            'taxa_acerto': _taxa(tarefa.total_acertos, tarefa.total_resolucoes),
        }
        for tarefa in tarefas_recentes_qs
    ]

    # Opções para os filtros 
    alunos_opcoes = Usuario.objects.filter(
        turmas_com_aluno__in=turmas_para_opcoes
    ).distinct()

    opcoes_alunos = [
        {
            'id': item.id,
            'nome': item.nome or item.email,
            'email': item.email,
        }
        for item in alunos_opcoes.order_by('nome', 'email')
    ]

    return {
        'filtros_aplicados': {
            'data_inicio': data_inicio.isoformat(),
            'data_fim': data_fim.isoformat(),
            'turma_id': turma.id if turma else None,
            'turma_nome': turma.nome if turma else None,
            'tipo': tipo,
            'aluno_id': aluno.id if aluno else None,
            'aluno_nome': (aluno.nome or aluno.email) if aluno else None,
            'granularidade': granularidade,
            'limite_recentes': limite_recentes,
        },
        'metricas': {
            'total_turmas': turmas_escopo.count(),
            'total_alunos': total_alunos,
            'alunos_participantes': alunos_participantes,
            'total_resolucoes': total_resolucoes,
            'total_acertos': total_acertos,
            'taxa_acerto': _taxa(total_acertos, total_resolucoes),
            'taxa_participacao': _taxa(alunos_participantes, total_alunos),
            'total_tarefas': tarefas_no_periodo.count(),
            'total_tarefas_com_resolucao': total_tarefas_com_resolucao,
        },
        'atividade_por_periodo': atividade_por_periodo,
        'desempenho_por_turma': desempenho_por_turma,
        'desempenho_por_tarefa': desempenho_por_tarefa,
        'tarefas_recentes': tarefas_recentes,
        'opcoes': {
            'turmas': [
                {'id': item.id, 'nome': item.nome}
                for item in turmas_do_professor.order_by('nome')
            ],
            'alunos': opcoes_alunos,
        },
    }
