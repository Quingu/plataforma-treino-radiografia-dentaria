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

    # Delega a comparação para o serviço, que escolhe a estratégia 2D ou 3D.
    def avaliar_acerto(self):
        from tarefas.services.avaliacao_tarefa_service import avaliar_resolucao

        resultado = avaliar_resolucao(
            tarefa=self.tarefa,
            submissao=self.coordenadas_submetidas or {},
        )
        self.acertou = resultado.acertou
        self.save(update_fields=['acertou'])
        return resultado
