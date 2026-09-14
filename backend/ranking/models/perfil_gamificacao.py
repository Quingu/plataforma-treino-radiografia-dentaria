from django.conf import settings
from django.db import models, transaction


class PerfilGamificacao(models.Model):
    XP_POR_ACERTO = 10
    XP_POR_NIVEL = 100

    aluno = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='perfil_gamificacao'
    )

    xp_total = models.PositiveIntegerField(
        default=0,
        verbose_name='XP total'
    )

    CLASSES_POR_NIVEL = (
        (1, 10, 'Cobre'),
        (11, 20, 'Ferro'),
        (21, 30, 'Bronze'),
        (31, 40, 'Prata'),
        (41, 50, 'Ouro'),
        (51, 60, 'Platina'),
        (61, 70, 'Mestre'),
        (71, 80, 'Grão-Mestre'),
        (81, 90, 'Supremo'),
        (91, 100, 'Imortal'),
    )

    class Meta:
        verbose_name = 'Perfil de Gamificação'
        verbose_name_plural = 'Perfis de Gamificação'
        ordering = ['-xp_total']

    def __str__(self):
        return f'{self.aluno.nome} - {self.classe}'

    @property
    def nivel(self):
        return min(
            (self.xp_total // self.XP_POR_NIVEL) + 1,
            100
        )

    @property
    def classe(self):
        for nivel_minimo, nivel_maximo, classe in self.CLASSES_POR_NIVEL:
            if nivel_minimo <= self.nivel <= nivel_maximo:
                return classe

        return 'Imortal'

    @classmethod
    @transaction.atomic
    def conceder_xp_por_resolucao(cls, resolucao):
        if not resolucao.acertou:
            return False

        from ranking.models.registro_xp import RegistroXP

        perfil, _ = cls.objects.get_or_create(
            aluno=resolucao.aluno
        )

        registro, criado = RegistroXP.objects.get_or_create(
            aluno=resolucao.aluno,
            tarefa=resolucao.tarefa,
            defaults={
                'resolucao': resolucao,
                'xp_concedido': cls.XP_POR_ACERTO,
            }
        )

        if not criado:
            return False

        perfil.xp_total += registro.xp_concedido
        perfil.save(update_fields=['xp_total'])

        return True