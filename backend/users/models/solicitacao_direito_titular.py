from django.conf import settings
from django.db import models


class SolicitacaoDireitoTitular(models.Model):
    class Tipo(models.TextChoices):
        ACESSO = 'acesso', 'Acesso aos dados'
        CORRECAO = 'correcao', 'Correcao de dados'
        EXCLUSAO = 'exclusao', 'Exclusao de dados'
        RESTRICAO = 'restricao', 'Restricao de tratamento'
        REVOGACAO = 'revogacao', 'Revogacao de consentimento'

    class Status(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        EM_ATENDIMENTO = 'em_atendimento', 'Em atendimento'
        CONCLUIDA = 'concluida', 'Concluida'
        RECUSADA = 'recusada', 'Recusada'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    descricao = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDENTE)
    criado_em = models.DateTimeField(auto_now_add=True)
    concluido_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.usuario.email}'
