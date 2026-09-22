from radiografias.models import AcessoRadiografia


#registra apenas o evento
def registrar_acesso_radiografia(*, radiografia, usuario, acao, origem=''):
    return AcessoRadiografia.objects.create(
        radiografia=radiografia,
        usuario=usuario,
        acao=acao,
        origem=origem[:40],
    )
