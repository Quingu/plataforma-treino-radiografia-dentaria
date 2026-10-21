from pathlib import PurePosixPath
from urllib.parse import unquote, urlparse

from django.conf import settings
from django.core.files.storage import default_storage


EXTENSAO_MODELO_3D = '.glb'
MAGIC_GLB = b'glTF'
MIMES_ACEITOS = {
    '',
    'application/octet-stream',
    'application/gltf-binary',
    'model/gltf-binary',
    'model/gltf+json',
}
LIMITE_PADRAO_BYTES = 50 * 1024 * 1024


class Modelo3DInvalido(ValueError):
    pass


def limite_bytes():
    return int(getattr(settings, 'MODELO_3D_MAX_BYTES', LIMITE_PADRAO_BYTES))


def extensao_modelo_3d_valida(extensao):
    return str(extensao or '').lower() == EXTENSAO_MODELO_3D


# Guarda apenas a chave do objeto (ex.: modelos_3d/dente.glb)
def normalizar_chave_modelo_3d(valor):
    if not valor:
        return ''

    chave = str(getattr(valor, 'name', valor)).strip()

    if chave.startswith(('http://', 'https://')):
        chave = unquote(urlparse(chave).path)

    chave = chave.replace('\\', '/').lstrip('/')

    marcador = 'modelos_3d/'
    if marcador in chave and not chave.startswith(marcador):
        chave = chave[chave.index(marcador):]

    return chave


def gerar_url_assinada_modelo_3d(valor):
    chave = normalizar_chave_modelo_3d(valor)
    if not chave:
        return ''

    try:
        return default_storage.url(chave)
    except Exception:
        return ''


def validar_arquivo_modelo_3d(arquivo):
    nome = getattr(arquivo, 'name', '') or ''
    extensao = PurePosixPath(nome).suffix.lower()

    if extensao != EXTENSAO_MODELO_3D:
        raise Modelo3DInvalido('O arquivo deve ter extensão .glb.')

    tamanho = getattr(arquivo, 'size', None)
    if tamanho is not None and int(tamanho) > limite_bytes():
        limite_mb = limite_bytes() // (1024 * 1024)
        raise Modelo3DInvalido(f'O modelo 3D excede o limite de {limite_mb} MB.')

    content_type = (getattr(arquivo, 'content_type', '') or '').lower()
    if content_type not in MIMES_ACEITOS:
        raise Modelo3DInvalido('O tipo do arquivo enviado não é um GLB válido.')

    try:
        arquivo.seek(0)
        cabecalho = arquivo.read(len(MAGIC_GLB))
        arquivo.seek(0)
    except (AttributeError, OSError) as erro:
        raise Modelo3DInvalido('Não foi possível ler o arquivo enviado.') from erro

    if cabecalho != MAGIC_GLB:
        raise Modelo3DInvalido('O arquivo enviado não é um GLB válido.')
