from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string

def gerar_codigo_convite():
    return get_random_string(length=6).upper()

class Turma(models.Model):
    nome = models.CharField(max_length=255)
    professor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="turmas_lecionadas"
    )

    alunos = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="turmas_com_aluno", 
        blank=True
    )
    
    codigo_convite = models.CharField(
        max_length=6, 
        unique=True, 
        default=gerar_codigo_convite, 
        editable=False
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} ({self.codigo_convite})"