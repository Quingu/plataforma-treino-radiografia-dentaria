from django.conf import settings
from django.db import models


class ConsentimentoTermos(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consentimentos',
    )
    versao_termos = models.CharField(max_length=20)
    versao_privacidade = models.CharField(max_length=20)
    aceito_em = models.DateTimeField(auto_now_add=True)
    revogado_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-aceito_em']
        indexes = [models.Index(fields=['usuario', 'aceito_em'])]

    def __str__(self):
        return f'{self.usuario.email} - Termos {self.versao_termos}'
