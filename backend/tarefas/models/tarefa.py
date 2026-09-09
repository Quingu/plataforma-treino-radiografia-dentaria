import uuid
from django.db import models
from turmas.models.turma import Turma
from radiografias.models import CasoClinico

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
    
    # Coordenadas usadas como gabarito da marcação
    coordenadas_gabarito = models.JSONField(verbose_name='Gabarito (Bounding Box)')
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tarefa'
        verbose_name_plural = 'Tarefas'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.caso_clinico.titulo} - {self.turma.nome}"
