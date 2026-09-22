import hashlib

from django.conf import settings

from users.models import LogAcesso


def _obter_ip(requisicao):
    encaminhado = requisicao.META.get('HTTP_X_FORWARDED_FOR', '')
    if encaminhado:
        return encaminhado.split(',')[0].strip()
    return requisicao.META.get('REMOTE_ADDR', '')




def registrar_acesso(requisicao, evento, usuario=None, usuario_id=None, email='', recurso=''):
    ip = _obter_ip(requisicao)
    ip_hash = ''
    if ip:
        ip_hash = hashlib.sha256(
            f'{settings.SECRET_KEY}:{ip}'.encode('utf-8')
        ).hexdigest()

    return LogAcesso.objects.create(
        usuario=usuario,
        usuario_id=usuario_id,
        email_informado=email[:254],
        evento=evento,
        recurso=recurso[:120],
        ip_hash=ip_hash,
        user_agent=requisicao.META.get('HTTP_USER_AGENT', '')[:500],
    )
