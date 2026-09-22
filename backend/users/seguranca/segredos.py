from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def _fernet():
    chave = settings.TWO_FACTOR_ENCRYPTION_KEY.encode('utf-8')
    return Fernet(chave)


def criptografar_segredo(valor):
    return _fernet().encrypt(valor.encode('utf-8')).decode('utf-8')


def descriptografar_segredo(valor):
    if not valor:
        return ''
    try:
        return _fernet().decrypt(valor.encode('utf-8')).decode('utf-8')
    except InvalidToken:
        return valor
