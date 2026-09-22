from django.conf import settings
from django.db import models


class AcessoRadiografia(models.Model):
    class Acao(models.TextChoices):
        CONSULTA = 'consulta', 'Consulta'
        INCLUSAO = 'inclusao', 'Inclusao'
        EXCLUSAO = 'exclusao', 'Exclusao'

    radiografia = models.ForeignKey(
        'radiografias.CasoClinico',
        on_delete=models.CASCADE,
        related_name='acessos_auditados',
    )
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    acao = models.CharField(max_length=12, choices=Acao.choices)
    origem = models.CharField(max_length=40, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-criado_em']
        indexes = [models.Index(fields=['radiografia', 'criado_em'])]
