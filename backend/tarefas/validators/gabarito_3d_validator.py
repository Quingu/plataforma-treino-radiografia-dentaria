from rest_framework import serializers


EIXOS_PONTO_3D = ('x', 'y', 'z')
MODOS_3D_SUPORTADOS = {'ponto_3d'}


def _numero(valor, campo):
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        raise serializers.ValidationError(
            {campo: 'Informe um valor numérico.'}
        )
    return float(valor)


def _ponto_3d(ponto, campo):
    if not isinstance(ponto, dict):
        raise serializers.ValidationError(
            {campo: 'Informe um objeto com as coordenadas x, y e z.'}
        )

    return {
        eixo: _numero(ponto.get(eixo), f'{campo}.{eixo}')
        for eixo in EIXOS_PONTO_3D
    }


def _modo(gabarito):
    modo = gabarito.get('modo', 'ponto_3d')
    if modo not in MODOS_3D_SUPORTADOS:
        raise serializers.ValidationError(
            {'modo': 'O único modo 3D suportado é "ponto_3d".'}
        )
    return modo


def validar_gabarito_3d(gabarito):
    if not isinstance(gabarito, dict):
        raise serializers.ValidationError(
            {'gabarito': 'O gabarito 3D deve ser um objeto JSON.'}
        )

    modo = _modo(gabarito)
    ponto_local = _ponto_3d(gabarito.get('ponto_local'), 'ponto_local')
    tolerancia = _numero(gabarito.get('tolerancia'), 'tolerancia')

    if tolerancia <= 0:
        raise serializers.ValidationError(
            {'tolerancia': 'A tolerância deve ser maior que zero.'}
        )

    normalizado = {
        'versao': 1,
        'modo': modo,
        'ponto_local': ponto_local,
        'tolerancia': tolerancia,
        'revelar_estrutura': bool(gabarito.get('revelar_estrutura', True)),
    }

    if gabarito.get('nome_estrutura'):
        normalizado['nome_estrutura'] = str(gabarito['nome_estrutura'])[:255]

    if gabarito.get('malha'):
        normalizado['malha'] = str(gabarito['malha'])[:255]

    return normalizado


def validar_resposta_3d(resposta):
    if not isinstance(resposta, dict):
        raise serializers.ValidationError(
            {'resposta': 'A resposta 3D deve ser um objeto JSON.'}
        )

    modo = _modo(resposta)
    submissao = {
        'modo': modo,
        'ponto_local': _ponto_3d(resposta.get('ponto_local'), 'ponto_local'),
    }

    if resposta.get('malha'):
        submissao['malha'] = str(resposta['malha'])[:255]

    return submissao
