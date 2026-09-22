from django.conf import settings


def definir_cookie(resposta, nome, valor, max_age):
    resposta.set_cookie(
        key=nome,
        value=valor,
        max_age=max_age,
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path='/',
    )
    return resposta


def definir_cookies_jwt(resposta, access, refresh):
    definir_cookie(resposta, 'access_token', access, settings.JWT_ACCESS_COOKIE_AGE)
    definir_cookie(resposta, 'refresh_token', refresh, settings.JWT_REFRESH_COOKIE_AGE)
    return resposta


def limpar_cookies_jwt(resposta):
    for nome in ('access_token', 'refresh_token', 'login_2fa_token'):
        resposta.delete_cookie(
            nome,
            path='/',
            samesite=settings.JWT_COOKIE_SAMESITE,
        )
    return resposta
