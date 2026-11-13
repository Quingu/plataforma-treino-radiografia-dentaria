from django.conf import settings
from django.utils import timezone

from users.models import ConsentimentoTermos


def versoes_atuais():
    return {
        'termos': settings.VERSAO_TERMOS,
        'privacidade': settings.VERSAO_PRIVACIDADE,
    }


def consentimento_vigente(usuario):
    return (
        ConsentimentoTermos.objects.filter(usuario=usuario, revogado_em__isnull=True)
        .order_by('-aceito_em')
        .first()
    )


def aceite_pendente(usuario):
    atuais = versoes_atuais()
    consentimento = consentimento_vigente(usuario)

    if consentimento is None:
        return True

    return (
        consentimento.versao_termos != atuais['termos']
        or consentimento.versao_privacidade != atuais['privacidade']
    )


def registrar_aceite(usuario):
    atuais = versoes_atuais()

    ConsentimentoTermos.objects.filter(
        usuario=usuario, revogado_em__isnull=True
    ).update(revogado_em=timezone.now())

    return ConsentimentoTermos.objects.create(
        usuario=usuario,
        versao_termos=atuais['termos'],
        versao_privacidade=atuais['privacidade'],
    )
