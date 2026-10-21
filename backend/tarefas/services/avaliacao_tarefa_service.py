import math
from dataclasses import dataclass

from tarefas.models.tarefa import TipoTarefa


MARGEM_PONTO_2D = 8
MARGEM_BOX_2D = 20

FEEDBACK_ACERTO = 'Você identificou corretamente a estrutura.'
FEEDBACK_ERRO = 'Sua marcação ficou fora da área esperada.'
FEEDBACK_INVALIDO = 'Não foi possível avaliar a sua resposta.'


@dataclass(frozen=True)
class ResultadoAvaliacao:
    acertou: bool
    feedback: str
    nome_estrutura: str = ''


def _numero(valor):
    if isinstance(valor, bool):
        return None
    try:
        return float(valor)
    except (TypeError, ValueError):
        return None


def _resultado(acertou, gabarito):
    nome_estrutura = ''
    if acertou and gabarito.get('revelar_estrutura', True):
        nome_estrutura = str(gabarito.get('nome_estrutura') or '')

    return ResultadoAvaliacao(
        acertou=acertou,
        feedback=FEEDBACK_ACERTO if acertou else FEEDBACK_ERRO,
        nome_estrutura=nome_estrutura,
    )


def _avaliar_2d(gabarito, submissao):
    gabarito = gabarito if isinstance(gabarito, dict) else {}
    submissao = submissao if isinstance(submissao, dict) else {}

    if 'x' in gabarito and 'y' in gabarito:
        gabarito_x = _numero(gabarito.get('x'))
        gabarito_y = _numero(gabarito.get('y'))
        submissao_x = _numero(submissao.get('x'))
        submissao_y = _numero(submissao.get('y'))

        if None in (gabarito_x, gabarito_y, submissao_x, submissao_y):
            return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)

        acertou = (
            abs(gabarito_x - submissao_x) <= MARGEM_PONTO_2D
            and abs(gabarito_y - submissao_y) <= MARGEM_PONTO_2D
        )
        return _resultado(acertou, gabarito)

    campos = ('x_min', 'y_min', 'x_max', 'y_max')
    if all(campo in gabarito for campo in campos):
        valores_gabarito = [_numero(gabarito.get(campo)) for campo in campos]
        submissao_x_min = _numero(submissao.get('x_min'))
        submissao_y_min = _numero(submissao.get('y_min'))

        if None in valores_gabarito[:2] or None in (submissao_x_min, submissao_y_min):
            return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)

        acertou = (
            abs(valores_gabarito[0] - submissao_x_min) <= MARGEM_BOX_2D
            and abs(valores_gabarito[1] - submissao_y_min) <= MARGEM_BOX_2D
        )
        return _resultado(acertou, gabarito)

    return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)


def _avaliar_3d(gabarito, submissao):
    gabarito = gabarito if isinstance(gabarito, dict) else {}
    submissao = submissao if isinstance(submissao, dict) else {}

    ponto_gabarito = gabarito.get('ponto_local')
    ponto_submissao = submissao.get('ponto_local', submissao)
    tolerancia = _numero(gabarito.get('tolerancia'))

    if not isinstance(ponto_gabarito, dict) or not isinstance(ponto_submissao, dict):
        return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)

    eixos = ('x', 'y', 'z')
    try:
        distancia = math.dist(
            [float(ponto_gabarito[eixo]) for eixo in eixos],
            [float(ponto_submissao[eixo]) for eixo in eixos],
        )
    except (KeyError, TypeError, ValueError):
        return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)

    if tolerancia is None or tolerancia <= 0:
        return ResultadoAvaliacao(False, FEEDBACK_INVALIDO)

    return _resultado(distancia <= tolerancia, gabarito)


def avaliar_resolucao(*, tarefa, submissao):
    gabarito = tarefa.gabarito_efetivo

    if tarefa.tipo == TipoTarefa.MODELO_3D:
        return _avaliar_3d(gabarito, submissao)

    return _avaliar_2d(gabarito, submissao)
