import uuid
from django.db import models
from tarefas.models.tarefa import Tarefa
from users.models.usuario import Usuario

class ResolucaoTarefa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tarefa = models.ForeignKey(Tarefa, on_delete=models.CASCADE, related_name='resolucoes')
    aluno = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='minhas_resolucoes')
    
    coordenadas_submetidas = models.JSONField()
    acertou = models.BooleanField(default=False)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Resolução de Tarefa'
        verbose_name_plural = 'Resoluções de Tarefas'

    def avaliar_acerto(self):
        gabarito = self.tarefa.coordenadas_gabarito or {}
        submissao = self.coordenadas_submetidas or {}
        margem = 8

        if 'x' in gabarito and 'y' in gabarito:
            acertou_x = abs(float(gabarito.get('x', 0)) - float(submissao.get('x', 0))) <= margem
            acertou_y = abs(float(gabarito.get('y', 0)) - float(submissao.get('y', 0))) <= margem
            self.acertou = acertou_x and acertou_y
            self.save()
            return

        acertou_x = abs(gabarito.get('x_min', 0) - submissao.get('x_min', 0)) <= 20
        acertou_y = abs(gabarito.get('y_min', 0) - submissao.get('y_min', 0)) <= 20
        self.acertou = acertou_x and acertou_y
        self.save()