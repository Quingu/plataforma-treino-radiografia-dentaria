import uuid
from django.core.exceptions import ValidationError
from django.db import models
from users.models.usuario import Usuario
from django.core.validators import FileExtensionValidator

class TipoMidia(models.TextChoices):
    RADIOGRAFIA_2D = 'radiografia_2d', 'Radiografia 2D'
    MODELO_3D = 'modelo_3d', 'Modelo 3D'

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


    tipo_midia = models.CharField(
        max_length=20,
        choices=TipoMidia.choices,
        default=TipoMidia.RADIOGRAFIA_2D,
        db_index=True,
        verbose_name='Tipo de Mídia',
    )

    modelo_3d = models.FileField(
            upload_to='modelos_3d/',
            validators=[FileExtensionValidator(allowed_extensions=['glb'])],
            null=True,
            blank=True
        )
    
    # Uploads de professores são separados dos itens institucionais compartilhados.
    imagem = models.ImageField(
        upload_to='uploads-professores/%Y/%m/',
        verbose_name='Arquivo de Imagem',
        null=True,
        blank=True,
    )

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

    @property
    def eh_modelo_3d(self):
        return self.tipo_midia == TipoMidia.MODELO_3D

    def validar_midia(self):
        erros = {}

        if self.tipo_midia == TipoMidia.MODELO_3D:
            if not self.modelo_3d:
                erros['modelo_3d'] = 'Informe o arquivo .glb do modelo 3D.'
            if self.imagem:
                erros['imagem'] = 'Um caso de modelo 3D não deve possuir imagem 2D.'
        else:
            if not self.imagem:
                erros['imagem'] = 'Informe a imagem da radiografia.'
            if self.modelo_3d:
                erros['modelo_3d'] = 'Um caso de radiografia 2D não deve possuir modelo 3D.'

        if erros:
            raise ValidationError(erros)

    def clean(self):
        super().clean()
        self.validar_midia()
