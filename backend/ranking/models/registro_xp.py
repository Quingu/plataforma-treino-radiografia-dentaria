from django.conf import settings
from django.db import models
from tarefas.models import ResolucaoTarefa, Tarefa


class RegistroXP(models.Model):
    aluno = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='registros_xp'
    )

    tarefa = models.ForeignKey(
        Tarefa,
        on_delete=models.CASCADE,
        related_name='registros_xp'
    )

    resolucao = models.OneToOneField(
        ResolucaoTarefa,
        on_delete=models.CASCADE,
        related_name='registro_xp'
    )

    xp_concedido = models.PositiveIntegerField(
        default=10,
        verbose_name='XP concedido'
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Registro de XP'
        verbose_name_plural = 'Registros de XP'
        constraints = [
            models.UniqueConstraint(
                fields=['aluno', 'tarefa'],
                name='um_registro_xp_por_aluno_e_tarefa'
            )
        ]

    def __str__(self):
        return f'{self.aluno.nome} ganhou {self.xp_concedido} XP'