import uuid
import random
import string
from django.db import models
from users.models.usuario import Usuario

#gera o codidin de convite com 6 letras
def gerar_codigo_convite():
    caracteres = string.ascii_uppercase + string.digits
    return ''.join(random.choices(caracteres, k=6))

class Turma(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=150, verbose_name='Nome da Turma')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    
    professor = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'perfil': 'professor'},
        related_name='turmas_administradas',
        verbose_name='Professor Responsável'
    )
    
    # O código que o Aluno vai digitar para entrar
    codigo_convite = models.CharField(
        max_length=10, 
        unique=True, 
        default=gerar_codigo_convite,
        verbose_name='Código de Convite'
    )
    
    
    alunos = models.ManyToManyField(
        Usuario,
        limit_choices_to={'perfil': 'aluno'},
        related_name='turmas_matriculadas',
        blank=True,
        verbose_name='Alunos Matriculados'
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    ativo = models.BooleanField(default=True, verbose_name='Turma Ativa')

    class Meta:
        verbose_name = 'Turma'
        verbose_name_plural = 'Turmas'
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.nome} (Código: {self.codigo_convite})"