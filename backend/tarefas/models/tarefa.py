import uuid
from django.db import models
from turmas.models.turma import Turma
from radiografias.models import CasoClinico


class TipoTarefa(models.TextChoices):
    RADIOGRAFIA_2D = 'radiografia_2d', 'Radiografia 2D'
    MODELO_3D = 'modelo_3d', 'Modelo 3D'


class Tarefa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    caso_clinico = models.ForeignKey(
        CasoClinico, 
        on_delete=models.CASCADE, 
        related_name='tarefas'
    )
    turma = models.ForeignKey(
        Turma, 
        on_delete=models.CASCADE, 
        related_name='tarefas'
    )
    
    instrucoes = models.TextField(verbose_name='Instruções da Tarefa')

    tipo = models.CharField(
        max_length=20,
        choices=TipoTarefa.choices,
        default=TipoTarefa.RADIOGRAFIA_2D,
        db_index=True,
        verbose_name='Tipo da Tarefa',
    )

    # Gabarito unificado para marcações 2D e 3D.
    gabarito = models.JSONField(
        verbose_name='Gabarito',
        null=True,
        blank=True,
    )

    # Mantido por compatibilidade com tarefas 2D já existentes.
    coordenadas_gabarito = models.JSONField(
        verbose_name='Gabarito legado (Bounding Box)',
        null=True,
        blank=True,
    )
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tarefa'
        verbose_name_plural = 'Tarefas'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.caso_clinico.titulo} - {self.turma.nome}"

    @property
    def eh_modelo_3d(self):
        return self.tipo == TipoTarefa.MODELO_3D

    @property
    def gabarito_efetivo(self):
        return self.gabarito or self.coordenadas_gabarito or {}
