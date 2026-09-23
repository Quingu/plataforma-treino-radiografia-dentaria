import uuid
from django.db import models
from users.models.usuario import Usuario
from django.core.validators import FileExtensionValidator

class RegiaoAnatomica(models.TextChoices):
    MAXILA = 'maxila', 'Maxila'
    MANDIBULA = 'mandibula', 'Mandíbula'
    ATM = 'atm', 'Articulação Temporomandibular (ATM)'
    DENTES = 'dentes', 'Dentes Específicos'
    GERAL = 'geral', 'Panorâmica Geral'

class CasoClinico(models.Model):
    class Visibilidade(models.TextChoices):
        PRIVADA = 'privada', 'Privada do professor'
        COMPARTILHADA = 'compartilhada', 'Biblioteca compartilhada'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    titulo = models.CharField(max_length=255, verbose_name='Título do Caso Clínico')
    descricao = models.TextField(verbose_name='Descrição / Observações', help_text="Diretriz clínica ou descrição do que o aluno deve analisar.")
    
    regiao_anatomica = models.CharField(
        max_length=50, 
        choices=RegiaoAnatomica.choices, 
        default=RegiaoAnatomica.GERAL,
        verbose_name='Região Anatômica'
    )


    modelo_3d = models.FileField(
            upload_to='modelos_3d/',
            validators=[FileExtensionValidator(allowed_extensions=['glb'])],
            null=True,
            blank=True
        )
    
    # Uploads de professores são separados dos itens institucionais compartilhados.
    imagem = models.ImageField(upload_to='uploads-professores/%Y/%m/', verbose_name='Arquivo de Imagem')

    visibilidade = models.CharField(
        max_length=16,
        choices=Visibilidade.choices,
        default=Visibilidade.PRIVADA,
        db_index=True,
    )
    
    professor = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE,
        limit_choices_to={'perfil': 'Professor'},
        related_name='casos_enviados',
        verbose_name='Professor Responsável',
        null=True,
        blank=True,
    )
    
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Última Atualização')

    class Meta:
        verbose_name = 'Caso Clínico'
        verbose_name_plural = 'Casos Clínicos'
        ordering = ['-criado_em'] 

    def __str__(self):
        return f"{self.titulo} - {self.get_regiao_anatomica_display()}"
